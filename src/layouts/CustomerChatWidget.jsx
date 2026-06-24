import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MessageCircle, Send, X } from "lucide-react";
import { chatMockService } from "@/services/chatMockService";
import { toastService } from "@/services/toastService";

function getInitials(name) {
  if (!name) return "CH";
  const parts = String(name).trim().split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] || "";
  const last = parts.length > 1 ? parts[parts.length - 1]?.[0] || "" : "";
  return `${first}${last}`.toUpperCase() || "CH";
}

function formatTime(value) {
  if (!value) return "";
  return new Intl.DateTimeFormat("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export default function CustomerChatWidget() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [message, setMessage] = useState("");
  const messagesEndRef = useRef(null);
  const conversationIdRef = useRef(conversationId);

  useEffect(() => {
    conversationIdRef.current = conversationId;
  }, [conversationId]);

  const activeConversation = useMemo(() => {
    return conversations.find((item) => item.id === conversationId) || conversations[0] || null;
  }, [conversationId, conversations]);

  const totalUnreadCount = useMemo(() => {
    return conversations.reduce((sum, item) => sum + (item.customerUnreadCount || 0), 0);
  }, [conversations]);

  useEffect(() => {
    let isMounted = true;

    const fetchConversationsAndDetail = async () => {
      try {
        const nextConversations = await chatMockService.getConversations("CUSTOMER");
        if (!isMounted) return;

        const activeId = conversationIdRef.current;
        if (activeId) {
          try {
            const detail = await chatMockService.getConversation(activeId);
            if (isMounted) {
              setConversations(
                nextConversations.map((item) => (item.id === detail.id ? detail : item))
              );
            }
          } catch (err) {
            if (isMounted) setConversations(nextConversations);
          }
        } else {
          setConversations(nextConversations);
        }
      } catch (err) {
        if (isMounted) setConversations([]);
      }
    };

    fetchConversationsAndDetail();

    const unsubscribe = chatMockService.subscribe(async (nextConversations) => {
      const activeId = conversationIdRef.current;
      if (activeId) {
        try {
          const detail = await chatMockService.getConversation(activeId);
          if (isMounted) {
            setConversations(
              nextConversations.map((item) => (item.id === detail.id ? detail : item))
            );
          }
        } catch (err) {
          if (isMounted) setConversations(nextConversations);
        }
      } else {
        if (isMounted) setConversations(nextConversations);
      }
    }, "CUSTOMER");

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!conversationId) return;
    let isMounted = true;

    chatMockService.getConversation(conversationId)
      .then((detail) => {
        if (!isMounted) return;
        setConversations((current) => {
          const exists = current.some((item) => item.id === detail.id);
          if (exists) {
            return current.map((item) => (item.id === detail.id ? detail : item));
          }
          return [detail, ...current];
        });
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, [conversationId]);

  useEffect(() => {
    const handleOpenChat = async (event) => {
      try {
        const { conversationId: nextConversationId, shop, product, initialMessage } = event.detail || {};
        const conversation = nextConversationId
          ? await chatMockService.getConversation(nextConversationId)
          : await chatMockService.openConversation({ shop, product, initialMessage });
        if (!conversation) return;

        const list = await chatMockService.getConversations("CUSTOMER");
        setConversations(
          list.map((item) => (item.id === conversation.id ? conversation : item))
        );
        setConversationId(conversation.id);
        setIsOpen(true);
      } catch (error) {
        toastService.error(error?.message || "Không mở được cuộc trò chuyện.");
      }
    };

    window.addEventListener("open-customer-chat", handleOpenChat);
    return () => window.removeEventListener("open-customer-chat", handleOpenChat);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeConversation?.messages?.length, isOpen]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!activeConversation) return;

    let sent = null;
    try {
      sent = await chatMockService.sendMessage(activeConversation.id, message);
      if (!sent) return;
    } catch (error) {
      toastService.error(error?.message || "Không gửi được tin nhắn.");
      return;
    }

    setMessage("");
    const [nextConversations, detail] = await Promise.all([
      chatMockService.getConversations("CUSTOMER"),
      chatMockService.getConversation(activeConversation.id),
    ]);
    setConversations(
      nextConversations.map((item) => (item.id === detail.id ? detail : item)),
    );
  };

  const handleQuickOpen = () => {
    if (!localStorage.getItem("token")) {
      toastService.info("Đăng nhập để nhắn tin với shop.");
      return;
    }
    setIsOpen(true);
    if (!conversationId && conversations[0]) {
      setConversationId(conversations[0].id);
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {isOpen ? (
        <section className="flex h-[min(620px,calc(100vh-110px))] w-[min(390px,calc(100vw-28px))] flex-col overflow-hidden rounded-2xl border border-[#e7dfbd] bg-white shadow-2xl">
          <header className="flex items-center justify-between border-b border-[#efe8cf] bg-[#faf7e7] px-4 py-3">
            <div
              onClick={() => {
                if (activeConversation?.shopId) {
                  navigate(`/shop/${activeConversation.shopId}`);
                  setIsOpen(false);
                }
              }}
              className="flex min-w-0 items-center gap-3 cursor-pointer hover:opacity-85 transition-opacity"
              title="Xem cửa hàng"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#d9efc4] text-sm font-extrabold text-[#4c7d38]">
                {activeConversation?.shopAvatarUrl ? (
                  <img
                    src={activeConversation.shopAvatarUrl}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  getInitials(activeConversation?.shopName)
                )}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-extrabold text-[#3f3b2f]">
                  {activeConversation?.shopName || "Tin nhắn với shop"}
                </p>
                <p className="truncate text-xs font-semibold text-[#7c7565]">
                  {activeConversation?.productName || "Hỏi đáp trước khi mua"}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="flex h-9 w-9 items-center justify-center rounded-full text-[#7c7565] transition hover:bg-[#efe8cf] hover:text-[#b84a25]"
              aria-label="Đóng chat"
            >
              <X size={18} />
            </button>
          </header>

          <div className="min-h-0 flex-1 overflow-y-auto bg-[#fbfae6] px-4 py-4">
            {!activeConversation ? (
              <div className="flex h-full flex-col items-center justify-center text-center">
                <MessageCircle size={34} className="mb-3 text-[#b84a25]" />
                <p className="text-sm font-bold text-[#3f3b2f]">Chưa có cuộc trò chuyện</p>
                <p className="mt-1 text-xs font-semibold text-[#7c7565]">
                  Bấm nút nhắn tin trong trang sản phẩm để bắt đầu.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {activeConversation.productName ? (
                  <div className="rounded-xl border border-[#efe8cf] bg-white p-3">
                    <p className="text-[11px] font-bold uppercase text-[#9c927b]">Sản phẩm đang hỏi</p>
                    <div className="mt-2 flex items-center gap-3">
                      {activeConversation.productImageUrl ? (
                        <img
                          src={activeConversation.productImageUrl}
                          alt=""
                          className="h-12 w-12 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="h-12 w-12 rounded-lg bg-[#e8e2c6]" />
                      )}
                      <p className="line-clamp-2 text-sm font-bold text-[#3f3b2f]">
                        {activeConversation.productName}
                      </p>
                    </div>
                  </div>
                ) : null}

                {(activeConversation.messages || []).map((item) => {
                  const isMine = item.senderRole === "customer";
                  return (
                    <div
                      key={item.id}
                      className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[78%] rounded-2xl px-3 py-2 text-sm shadow-sm ${
                          isMine
                            ? "rounded-br-md bg-[#c04f25] text-white"
                            : "rounded-bl-md bg-white text-[#3f3b2f]"
                        }`}
                      >
                        <p className="whitespace-pre-wrap break-words">{item.content}</p>
                        <p className={`mt-1 text-[10px] ${isMine ? "text-white/75" : "text-[#9c927b]"}`}>
                          {formatTime(item.createdAt)}
                        </p>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="flex gap-2 border-t border-[#efe8cf] bg-white p-3">
            <input
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              disabled={!activeConversation}
              placeholder="Nhập tin nhắn..."
              className="h-11 min-w-0 flex-1 rounded-xl border border-[#e7dfbd] px-3 text-sm font-semibold text-[#3f3b2f] outline-none transition placeholder:text-[#aaa28e] focus:border-[#c04f25]"
            />
            <button
              type="submit"
              disabled={!activeConversation || !message.trim()}
              className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#c04f25] text-white transition hover:bg-[#a9411d] disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Gửi tin nhắn"
            >
              <Send size={18} />
            </button>
          </form>
        </section>
      ) : (
        <button
          type="button"
          onClick={handleQuickOpen}
          className="relative flex h-14 w-14 items-center justify-center rounded-full bg-[#c04f25] text-white shadow-xl transition hover:bg-[#a9411d]"
          aria-label="Mở chat"
        >
          <MessageCircle size={23} />
          {totalUnreadCount > 0 ? (
            <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#ffc28f] px-1 text-[10px] font-extrabold text-[#6c331b]">
              {Math.min(totalUnreadCount, 9)}
            </span>
          ) : null}
        </button>
      )}
    </div>
  );
}
