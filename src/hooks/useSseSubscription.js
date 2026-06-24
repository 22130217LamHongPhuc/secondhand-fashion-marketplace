import { useEffect, useRef } from 'react';
import { env } from '@/config/env';

/**
 * Custom hook generic để đăng ký nhận Server-Sent Events (SSE).
 *
 * Sử dụng SharedWorker để chia sẻ kết nối SSE duy nhất giữa nhiều tab.
 * Nếu browser không hỗ trợ SharedWorker, hook sẽ tự động fallback về EventSource trực tiếp.
 *
 * @param {string} channel Tên kênh cần đăng ký (vd: 'seller-orders')
 * @param {string|number} subscriberId ID của subscriber (thường là userId)
 * @param {Object} eventHandlers Object định nghĩa handlers cho mỗi eventName.
 *                               Ví dụ: {
 *                                 'new-order': (data) => console.log(data),
 *                                 'order-updated': (data) => console.log(data)
 *                               }
 */
export const useSseSubscription = (channel, subscriberId, eventHandlers) => {
  // Dùng ref để giữ các callback luôn mới nhất mà không kích hoạt chạy lại useEffect khi callback thay đổi
  const handlersRef = useRef(eventHandlers);

  useEffect(() => {
    handlersRef.current = eventHandlers;
  }, [eventHandlers]);

  useEffect(() => {
    if (!channel || !subscriberId) return;

    const subIdStr = String(subscriberId);
    const eventNames = Object.keys(eventHandlers);

    let sharedWorker = null;
    let directEventSource = null;

    // Kiểm tra xem browser có hỗ trợ SharedWorker hay không
    const isSharedWorkerSupported = typeof SharedWorker !== 'undefined';

    if (isSharedWorkerSupported) {
      try {
        console.log('[SSE Hook] Initializing SharedWorker subscription for channel:', channel);

        // Khởi tạo SharedWorker với file sseWorker.js
        sharedWorker = new SharedWorker(
          new URL('../workers/sseWorker.js', import.meta.url),
          { type: 'module' }
        );

        sharedWorker.port.start();

        // 1. Gửi thông điệp subscribe tới SharedWorker
        sharedWorker.port.postMessage({
          type: 'subscribe',
          channel,
          subscriberId: subIdStr,
          eventNames,
          apiBaseUrl: env.apiBaseUrl,
        });

        // 2. Nhận thông điệp từ SharedWorker và định tuyến tới đúng handler
        sharedWorker.port.onmessage = (event) => {
          const msg = event.data;
          if (!msg) return;

          if (msg.type === 'sse-event') {
            const { eventName, data } = msg;
            const handler = handlersRef.current[eventName];
            if (handler) {
              try {
                // Thử parse data nếu là JSON string, nếu không giữ nguyên string
                let parsedData = data;
                try {
                  if (data && typeof data === 'string') {
                    parsedData = JSON.parse(data);
                  }
                } catch (e) {
                  // data không phải là JSON, giữ nguyên
                }
                handler(parsedData);
              } catch (err) {
                console.error(`[SSE Hook] Error executing handler for event '${eventName}':`, err);
              }
            }
          } else if (msg.type === 'sse-status') {
            console.log(`[SSE Hook] [Status Change] channel=${channel}, status=${msg.status}:`, msg.message);
          }
        };

        // 3. Tự động gửi tín hiệu unsubscribe khi tab unload/close
        const handleBeforeUnload = () => {
          if (sharedWorker) {
            sharedWorker.port.postMessage({
              type: 'unsubscribe',
              channel,
              subscriberId: subIdStr,
            });
          }
        };
        window.addEventListener('beforeunload', handleBeforeUnload);

        // Cleanup function khi component unmount
        return () => {
          window.removeEventListener('beforeunload', handleBeforeUnload);
          if (sharedWorker) {
            console.log('[SSE Hook] Cleanup SharedWorker subscription for channel:', channel);
            sharedWorker.port.postMessage({
              type: 'unsubscribe',
              channel,
              subscriberId: subIdStr,
            });
            sharedWorker.port.close();
          }
        };
      } catch (err) {
        console.warn('[SSE Hook] SharedWorker failed to initialize. Falling back to direct EventSource.', err);
        // Nếu SharedWorker khởi tạo lỗi (VD do sandbox, CORS,...), tiếp tục chạy fallback bên dưới
      }
    }

    // --- FALLBACK: Dùng EventSource trực tiếp nếu browser không hỗ trợ SharedWorker ---
    console.log('[SSE Hook] Falling back to direct EventSource subscription for channel:', channel);

    const base = env.apiBaseUrl || window.location.origin;
    const sseUrl = `${base}/api/sse/subscribe?channel=${encodeURIComponent(channel)}&subscriberId=${encodeURIComponent(subIdStr)}`;

    directEventSource = new EventSource(sseUrl);

    // Gắn listeners cho các sự kiện
    directEventSource.onopen = () => {
      console.log(`[SSE Hook] [Direct Connection] Opened for channel: ${channel}`);
    };

    directEventSource.onerror = (err) => {
      console.error(`[SSE Hook] [Direct Connection] Error on channel ${channel}:`, err);
    };

    // Đăng ký event listeners cho các sự kiện mong muốn
    eventNames.forEach(eventName => {
      directEventSource.addEventListener(eventName, (e) => {
        const handler = handlersRef.current[eventName];
        if (handler) {
          try {
            let parsedData = e.data;
            try {
              if (e.data && typeof e.data === 'string') {
                parsedData = JSON.parse(e.data);
              }
            } catch (err) {
              // Not JSON
            }
            handler(parsedData);
          } catch (err) {
            console.error(`[SSE Hook] Error executing direct handler for event '${eventName}':`, err);
          }
        }
      });
    });

    // Lắng nghe event "connected" từ backend
    directEventSource.addEventListener('connected', (e) => {
      console.log('[SSE Hook] [Direct Connection] Received connected event:', e.data);
    });

    // Cleanup function khi component unmount
    return () => {
      if (directEventSource) {
        console.log('[SSE Hook] Closing direct EventSource for channel:', channel);
        directEventSource.close();
      }
    };
  }, [channel, subscriberId]);
};
