import { useEffect, useMemo, useRef, useState } from "react";
import { MessageCircle, Search, Send, Image, Loader2 } from "lucide-react";
import { chatMockService } from "@/services/chatMockService";
import { toastService } from "@/services/toastService";
import imageApi from "@/pages/seller/api/imageApi";

function getInitials(name) {
  if (!name) return "KH";
  const parts = String(name).trim().split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] || "";
  const last = parts.length > 1 ? parts[parts.length - 1]?.[0] || "" : "";
  return `${first}${last}`.toUpperCase() || "KH";
}

function formatTime(value) {
  if (!value) return "";
  return new Intl.DateTimeFormat("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
  }).format(new Date(value));
}

export default function MessagesPage() {
  const [conversations, setConversations] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [query, setQuery] = useState("");
  const [reply, setReply] = useState("");
  const [imageUploading, setImageUploading] = useState(false);
  const messagesEndRef = useRef(null);
  const activeIdRef = useRef(activeId);

  useEffect(() => {
    activeIdRef.current = activeId;
  }, [activeId]);

  const handleImageUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toastService.error("Ảnh không được vượt quá 5MB.");
      return;
    }

    try {
      setImageUploading(true);
      const imageUrl = await imageApi.upload(file);
      if (imageUrl) {
        await chatMockService.sendMessage(activeId, imageUrl, "IMAGE");
        
        // Refresh conversations and active details
        const [nextConversations, detail] = await Promise.all([
          chatMockService.getConversations("SELLER"),
          chatMockService.getConversation(activeId),
        ]);
        setConversations(
          nextConversations.map((item) => (item.id === detail.id ? detail : item)),
        );
        window.dispatchEvent(new CustomEvent("secondhand-chat-updated"));
      }
    } catch (error) {
      toastService.error(error?.message || "Không upload được ảnh.");
    } finally {
      setImageUploading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const initData = async () => {
      try {
        const nextConversations = await chatMockService.getConversations("SELLER");
        if (!isMounted) return;

        const currentActiveId = activeIdRef.current || nextConversations[0]?.id || null;
        if (currentActiveId) {
          try {
            const detail = await chatMockService.getConversation(currentActiveId);
            if (isMounted) {
              setConversations(
                nextConversations.map((item) => (item.id === detail.id ? detail : item))
              );
              setActiveId(currentActiveId);
              window.dispatchEvent(new CustomEvent("secondhand-chat-updated"));
            }
          } catch (err) {
            if (isMounted) {
              setConversations(nextConversations);
              setActiveId(currentActiveId);
            }
          }
        } else {
          setConversations(nextConversations);
          setActiveId(null);
        }
      } catch (err) {
        if (isMounted) setConversations([]);
      }
    };

    initData();

    const unsubscribe = chatMockService.subscribe(async (nextConversations) => {
      if (!isMounted) return;
      const currentActiveId = activeIdRef.current || nextConversations[0]?.id || null;

      if (currentActiveId) {
        try {
          const detail = await chatMockService.getConversation(currentActiveId);
          if (isMounted) {
            setConversations(
              nextConversations.map((item) => (item.id === detail.id ? detail : item))
            );
            setActiveId(currentActiveId);
          }
        } catch (err) {
          if (isMounted) {
            setConversations(nextConversations);
            setActiveId(currentActiveId);
          }
        }
      } else {
        if (isMounted) {
          setConversations(nextConversations);
          setActiveId(null);
        }
      }
    }, "SELLER");

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  const filteredConversations = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    if (!keyword) return conversations;

    return conversations.filter((conversation) => {
      return [
        conversation.customerName,
        conversation.productName,
        conversation.messages?.at(-1)?.content,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(keyword));
    });
  }, [conversations, query]);

  const activeConversation = useMemo(() => {
    return conversations.find((conversation) => conversation.id === activeId) || null;
  }, [activeId, conversations]);

  useEffect(() => {
    if (!activeId) return;
    let isMounted = true;

    chatMockService.getConversation(activeId)
      .then((conversation) => {
        if (!isMounted) return;
        setConversations((current) =>
          current.map((item) => (item.id === conversation.id ? conversation : item)),
        );
        window.dispatchEvent(new CustomEvent("secondhand-chat-updated"));
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, [activeId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeConversation?.messages?.length]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!activeConversation || !reply.trim()) return;

    await chatMockService.sendMessage(activeConversation.id, reply);
    setReply("");
    const [nextConversations, detail] = await Promise.all([
      chatMockService.getConversations("SELLER"),
      chatMockService.getConversation(activeConversation.id),
    ]);
    setConversations(
      nextConversations.map((item) => (item.id === detail.id ? detail : item)),
    );
  };

  return (
    <div className="flex h-[calc(100vh-116px)] min-h-[620px] flex-col gap-5">
      <div>
        <h1 className="font-heading text-2xl font-bold text-neutral-900">Tin nhắn khách hàng</h1>
      </div>

      <section className="grid min-h-0 flex-1 grid-cols-[320px_minmax(0,1fr)] overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
        <aside className="flex min-h-0 flex-col border-r border-neutral-200 bg-neutral-50">
          <div className="border-b border-neutral-200 p-4">
            <div className="flex h-11 items-center gap-2 rounded-xl border border-neutral-200 bg-white px-3">
              <Search size={17} className="text-neutral-400" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Tìm khách hàng..."
                className="min-w-0 flex-1 bg-transparent text-sm font-medium text-neutral-700 outline-none placeholder:text-neutral-400"
              />
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto p-2">
            {filteredConversations.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center px-6 text-center">
                <MessageCircle size={32} className="mb-3 text-neutral-300" />
                <p className="text-sm font-semibold text-neutral-500">Chưa có hội thoại nào</p>
              </div>
            ) : (
              filteredConversations.map((conversation) => {
                const isActive = conversation.id === activeConversation?.id;

                return (
                  <button
                    type="button"
                    key={conversation.id}
                    onClick={() => setActiveId(conversation.id)}
                    className={`mb-1 flex w-full items-start gap-3 rounded-xl p-3 text-left transition ${
                      isActive
                        ? "bg-brand-primary/10 text-brand-primary"
                        : "text-neutral-600 hover:bg-white"
                    }`}
                  >
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-brand-primary/15 text-sm font-bold text-brand-primary">
                      {conversation.customerAvatarUrl ? (
                        <img
                          src={conversation.customerAvatarUrl}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        getInitials(conversation.customerName)
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <p className="truncate text-sm font-bold">{conversation.customerName}</p>
                        <div className="flex flex-col items-end gap-1 shrink-0">
                          <span className="text-[10px] font-semibold text-neutral-400">
                            {formatTime(conversation.updatedAt)}
                          </span>
                          {conversation.sellerUnreadCount > 0 && (
                            <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-primary px-1 text-[9px] font-extrabold text-white">
                              {conversation.sellerUnreadCount}
                            </span>
                          )}
                        </div>
                      </div>
                      {conversation.productName && (
                        <p className="mt-0.5 truncate text-xs font-semibold text-neutral-500">
                          {conversation.productName}
                        </p>
                      )}
                      <p className="mt-1 truncate text-xs text-neutral-400">
                        {conversation.lastMessagePreview || "Chưa có tin nhắn"}
                      </p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </aside>

        <main className="flex min-h-0 flex-col bg-white">
          {activeConversation ? (
            <>
              <header className="flex items-center justify-between border-b border-neutral-200 px-5 py-4">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-brand-primary/15 text-sm font-bold text-brand-primary">
                    {activeConversation.customerAvatarUrl ? (
                      <img
                        src={activeConversation.customerAvatarUrl}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      getInitials(activeConversation.customerName)
                    )}
                  </div>
                  <div className="min-w-0">
                    <h2 className="truncate text-base font-bold text-neutral-900">
                      {activeConversation.customerName}
                    </h2>
                    {activeConversation.productName && (
                      <p className="truncate text-sm text-neutral-500">
                        Đang hỏi về: {activeConversation.productName}
                      </p>
                    )}
                  </div>
                </div>
              </header>

              <div className="min-h-0 flex-1 overflow-y-auto bg-neutral-50 px-5 py-5">
                <div className="mx-auto max-w-3xl space-y-4">
                  {activeConversation.productName ? (
                    <div className="rounded-xl border border-neutral-200 bg-white p-3">
                      <p className="text-xs font-bold uppercase tracking-wide text-neutral-400">
                        Sản phẩm liên quan
                      </p>
                      <div className="mt-2 flex items-center gap-3">
                        {activeConversation.productImageUrl ? (
                          <img
                            src={activeConversation.productImageUrl}
                            alt=""
                            className="h-14 w-14 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="h-14 w-14 rounded-lg bg-neutral-200" />
                        )}
                        <p className="line-clamp-2 text-sm font-bold text-neutral-800">
                          {activeConversation.productName}
                        </p>
                      </div>
                    </div>
                  ) : null}

                  {(activeConversation.messages || []).map((message) => {
                    const isSeller = message.senderRole === "seller";
                    const isImage = String(message.messageType).toUpperCase() === "IMAGE" || !!message.imageUrl;

                    return (
                      <div
                        key={message.id}
                        className={`flex ${isSeller ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[70%] rounded-2xl px-4 py-2.5 text-sm shadow-sm ${
                            isSeller && !isImage
                              ? "rounded-br-md bg-brand-primary text-white"
                              : !isSeller && !isImage
                              ? "rounded-bl-md bg-white text-neutral-700"
                              : ""
                          } ${isImage ? "p-1 bg-transparent shadow-none" : ""}`}
                        >
                          {isImage ? (
                            <img
                              src={message.imageUrl}
                              alt="Ảnh đính kèm"
                              className="max-w-[280px] rounded-xl object-cover border border-neutral-200"
                            />
                          ) : (
                            <p className="whitespace-pre-wrap break-words">{message.content}</p>
                          )}
                          <p className={`mt-1 text-[10px] ${
                            isImage 
                              ? "text-neutral-500 font-semibold" 
                              : isSeller ? "text-white/75" : "text-neutral-400"
                          }`}>
                            {formatTime(message.createdAt)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>
              </div>

              <form onSubmit={handleSubmit} className="flex items-center gap-3 border-t border-neutral-200 bg-white p-4">
                <label className="flex h-12 w-12 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-neutral-200 bg-neutral-50 transition hover:bg-neutral-100">
                  {imageUploading ? (
                    <Loader2 size={18} className="animate-spin text-neutral-500" />
                  ) : (
                    <Image size={18} className="text-neutral-500 hover:text-[#c75c2e]" />
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    disabled={imageUploading}
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                </label>
                <input
                  value={reply}
                  onChange={(event) => setReply(event.target.value)}
                  placeholder="Nhập phản hồi cho khách..."
                  className="h-12 min-w-0 flex-1 rounded-xl border border-neutral-200 px-4 text-sm font-medium text-neutral-700 outline-none transition focus:border-brand-primary"
                />
                <button
                  type="submit"
                  className="flex h-12 shrink-0 items-center justify-center rounded-xl bg-[#c75c2e] px-6 text-sm font-bold text-white hover:bg-[#8b3a1a] cursor-pointer"
                >
                  Gửi
                </button>
              </form>
            </>
          ) : (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <MessageCircle size={42} className="mb-3 text-neutral-300" />
              <p className="text-base font-bold text-neutral-600">Chọn một hội thoại để bắt đầu</p>
              <p className="mt-1 text-sm text-neutral-400">
                Khi khách bấm nhắn tin trên sản phẩm, hội thoại sẽ xuất hiện tại đây.
              </p>
            </div>
          )}
        </main>
      </section>
    </div>
  );
}
