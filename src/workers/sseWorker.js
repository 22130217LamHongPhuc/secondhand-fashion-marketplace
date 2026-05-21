/**
 * SharedWorker quản lý kết nối Server-Sent Events (SSE) duy nhất cho toàn bộ các tab trình duyệt.
 *
 * Nhiệm vụ:
 * 1. Nhận yêu cầu subscribe/unsubscribe từ các tab khác nhau.
 * 2. Chỉ tạo duy nhất 1 EventSource cho mỗi cặp (channel + subscriberId).
 * 3. Lắng nghe các event từ server và broadcast tới tất cả các tab đã đăng ký kênh đó.
 * 4. Khi tất cả các tab đăng ký kênh đó bị đóng, tự động hủy bỏ kết nối EventSource tương ứng để giải phóng tài nguyên server.
 */

const connections = {};   // Map<key, EventSource> - Lưu các kết nối SSE đang hoạt động
const subscriptions = {}; // Map<key, Set<MessagePort>> - Lưu danh sách port (tab) đang lắng nghe mỗi key
const registeredEvents = {}; // Map<key, Set<string>> - Lưu danh sách eventName đã được gán event listener
const activePorts = new Set(); // Tập hợp tất cả các port đang kết nối tới Worker

// Tạo key kết hợp từ channel và subscriberId
const buildKey = (channel, subscriberId) => `${channel}::${subscriberId}`;

self.onconnect = function (e) {
  const port = e.ports[0];
  activePorts.add(port);

  console.log('[SSE SharedWorker] Tab connected. Total active ports:', activePorts.size);

  port.onmessage = function (event) {
    const msg = event.data;
    if (!msg) return;

    const { type, channel, subscriberId, eventNames, apiBaseUrl } = msg;

    if (type === 'subscribe') {
      const key = buildKey(channel, subscriberId);
      
      console.log(`[SSE SharedWorker] Tab subscribed to key: ${key}`);

      // 1. Lưu thông tin port của tab vào danh sách subscription
      if (!subscriptions[key]) {
        subscriptions[key] = new Set();
      }
      subscriptions[key].add(port);

      // 2. Khởi tạo EventSource nếu chưa tồn tại cho key này
      if (!connections[key]) {
        // Xây dựng URL hoàn chỉnh
        const base = apiBaseUrl || self.location.origin;
        const sseUrl = `${base}/api/sse/subscribe?channel=${encodeURIComponent(channel)}&subscriberId=${encodeURIComponent(subscriberId)}`;
        
        console.log(`[SSE SharedWorker] Creating new EventSource connection: ${sseUrl}`);
        
        const eventSource = new EventSource(sseUrl);
        connections[key] = eventSource;
        registeredEvents[key] = new Set();

        // Lắng nghe các sự kiện mặc định
        eventSource.onopen = () => {
          broadcastStatus(key, 'connected', 'SSE connection opened.');
        };

        eventSource.onerror = (err) => {
          console.error(`[SSE SharedWorker] EventSource error for key: ${key}`, err);
          broadcastStatus(key, 'error', 'SSE connection encountered an error.');
        };

        // Lắng nghe event "connected" từ backend gửi ngay sau khi kết nối thành công
        eventSource.addEventListener('connected', (e) => {
          console.log(`[SSE SharedWorker] Received 'connected' event for key: ${key}, data:`, e.data);
          broadcastToKey(key, 'connected', e.data);
        });
      }

      // 3. Đăng ký các custom event listeners được gửi từ client (nếu có)
      if (eventNames && Array.isArray(eventNames)) {
        const eventSource = connections[key];
        const eventsSet = registeredEvents[key];

        eventNames.forEach(eventName => {
          // Chỉ thêm listener nếu chưa từng được thêm trước đó
          if (eventName && !eventsSet.has(eventName)) {
            eventsSet.add(eventName);
            console.log(`[SSE SharedWorker] Adding event listener for '${eventName}' on key: ${key}`);
            
            eventSource.addEventListener(eventName, (e) => {
              console.log(`[SSE SharedWorker] Event received: key=${key}, event=${eventName}`);
              broadcastToKey(key, eventName, e.data);
            });
          }
        });
      }
    }

    if (type === 'unsubscribe') {
      const key = buildKey(channel, subscriberId);
      cleanupSubscription(key, port);
    }
  };

  port.onmessageerror = function () {
    console.warn('[SSE SharedWorker] Port encountered a message error. Cleaning up.');
    cleanupPort(port);
  };
};

/**
 * Broadcast dữ liệu nhận được từ SSE tới tất cả các tab đang subscribe key tương ứng.
 */
function broadcastToKey(key, eventName, data) {
  const subscriberPorts = subscriptions[key];
  if (!subscriberPorts || subscriberPorts.size === 0) return;

  const [channel, subscriberId] = key.split('::');
  const msgPayload = {
    type: 'sse-event',
    channel,
    subscriberId,
    eventName,
    data
  };

  subscriberPorts.forEach(port => {
    try {
      port.postMessage(msgPayload);
    } catch (err) {
      console.warn(`[SSE SharedWorker] Failed to send message to a port on key: ${key}. Cleaning up that port.`);
      cleanupPortOfKey(key, port);
    }
  });
}

/**
 * Gửi thông báo trạng thái kết nối tới các tab.
 */
function broadcastStatus(key, status, message) {
  const subscriberPorts = subscriptions[key];
  if (!subscriberPorts || subscriberPorts.size === 0) return;

  const [channel, subscriberId] = key.split('::');
  const msgPayload = {
    type: 'sse-status',
    channel,
    subscriberId,
    status,
    message
  };

  subscriberPorts.forEach(port => {
    try {
      port.postMessage(msgPayload);
    } catch (err) {
      // Ignored here, will be cleaned up in custom data broadcast
    }
  });
}

/**
 * Xóa một port khỏi một subscription key cụ thể.
 * Nếu không còn tab nào subscribe key này, đóng EventSource.
 */
function cleanupSubscription(key, port) {
  const subscriberPorts = subscriptions[key];
  if (subscriberPorts) {
    subscriberPorts.delete(port);
    console.log(`[SSE SharedWorker] Port unsubscribed from key: ${key}. Remaining subscribers for this key:`, subscriberPorts.size);

    if (subscriberPorts.size === 0) {
      delete subscriptions[key];
      
      const eventSource = connections[key];
      if (eventSource) {
        console.log(`[SSE SharedWorker] No active subscribers for key: ${key}. Closing EventSource.`);
        eventSource.close();
        delete connections[key];
      }
      delete registeredEvents[key];
    }
  }
}

/**
 * Xóa một port cụ thể khỏi danh sách activePorts và toàn bộ subscriptions của nó (khi tab bị tắt đột ngột).
 */
function cleanupPort(port) {
  activePorts.delete(port);
  console.log('[SSE SharedWorker] Port removed. Remaining active ports:', activePorts.size);

  Object.keys(subscriptions).forEach(key => {
    cleanupSubscription(key, port);
  });
}

/**
 * Dọn dẹp port bị hỏng khỏi 1 key cụ thể.
 */
function cleanupPortOfKey(key, port) {
  cleanupSubscription(key, port);
  // Nếu port đó không còn bất cứ subscription nào, có thể dọn dẹp khỏi activePorts
  let hasOtherSubscription = false;
  Object.values(subscriptions).forEach(set => {
    if (set.has(port)) hasOtherSubscription = true;
  });
  if (!hasOtherSubscription) {
    activePorts.delete(port);
  }
}
