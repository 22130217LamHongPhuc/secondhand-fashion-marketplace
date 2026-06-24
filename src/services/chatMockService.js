import axiosInstance from "@/config/axios";

const CHAT_EVENT = "secondhand-chat-updated";

function emitChatUpdated() {
  window.dispatchEvent(new CustomEvent(CHAT_EVENT));
}

function getStoredUser() {
  try {
    return JSON.parse(localStorage.getItem("user") || "null");
  } catch (error) {
    return null;
  }
}

function getShopId(shop = {}) {
  return shop.id || shop.shopId || null;
}

function normalizeConversation(conversation = {}) {
  return {
    ...conversation,
    id: conversation.id,
    updatedAt: conversation.lastMessageAt || conversation.updatedAt || conversation.createdAt,
    messages: Array.isArray(conversation.messages)
      ? conversation.messages.map(normalizeMessage)
      : [],
  };
}

function normalizeMessage(message = {}) {
  return {
    ...message,
    senderRole: String(message.senderRole || "").toLowerCase(),
  };
}

async function unwrap(request) {
  const response = await request;
  return response?.data?.data ?? response?.data ?? response;
}

async function fetchConversations(scope = "CUSTOMER") {
  const data = await unwrap(axiosInstance.get("/api/chat/conversations", { params: { scope } }));
  return Array.isArray(data) ? data.map(normalizeConversation) : [];
}

export const chatMockService = {
  eventName: CHAT_EVENT,

  getCurrentUser() {
    return getStoredUser();
  },

  async getConversations(scope = "CUSTOMER") {
    const conversations = await fetchConversations(scope);
    return conversations.sort((a, b) => {
      return new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime();
    });
  },

  async getConversation(id) {
    const conversation = await unwrap(axiosInstance.get(`/api/chat/conversations/${id}`));
    return normalizeConversation(conversation);
  },

  async openConversation({ shop, initialMessage } = {}) {
    const shopId = getShopId(shop);
    if (!shopId) {
      throw new Error("Không tìm thấy thông tin shop.");
    }

    let conversation = normalizeConversation(
      await unwrap(axiosInstance.post("/api/chat/conversations", { shopId })),
    );

    if (initialMessage?.trim() && !conversation.lastMessagePreview) {
      await this.sendMessage(conversation.id, initialMessage);
      conversation = await this.getConversation(conversation.id);
    }

    emitChatUpdated();
    return conversation;
  },

  async sendMessage(conversationId, content, type = "TEXT") {
    const value = content?.trim();
    if (!value) return null;

    const payload = { messageType: type };
    if (type === "IMAGE") {
      payload.imageUrl = value;
    } else {
      payload.content = value;
    }

    const message = normalizeMessage(
      await unwrap(axiosInstance.post(`/api/chat/conversations/${conversationId}/messages`, payload)),
    );
    emitChatUpdated();
    return message;
  },

  subscribe(callback, scope = "CUSTOMER") {
    const handler = async () => callback(await this.getConversations(scope));
    window.addEventListener(CHAT_EVENT, handler);
    return () => {
      window.removeEventListener(CHAT_EVENT, handler);
    };
  },
};
