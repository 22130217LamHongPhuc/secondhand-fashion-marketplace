import { useState, useEffect } from "react";
import { Bell, ImageUp, MessageCircle, ReceiptText, Search, ShoppingCart, User, LogOut, X } from "lucide-react";
import { Outlet, useNavigate } from "react-router-dom";
import AuthModal from "./AuthModal";
import CustomerChatWidget from "./CustomerChatWidget";
import { toastService } from "@/services/toastService";
import { cartService } from "@/services/cartService";
import { userService } from "@/services/user";
import { chatMockService } from "@/services/chatMockService";
import { useSseSubscription } from "@/hooks";

function formatChatTime(value) {
  if (!value) return "";
  return new Intl.DateTimeFormat("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
  }).format(new Date(value));
}

function getChatInitials(name) {
  if (!name) return "SH";
  const parts = String(name).trim().split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] || "";
  const last = parts.length > 1 ? parts[parts.length - 1]?.[0] || "" : "";
  return `${first}${last}`.toUpperCase() || "SH";
}

export default function CustomerLayout() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);
  const [chatConversations, setChatConversations] = useState([]);

  const totalUnreadCount = chatConversations.reduce((sum, conv) => sum + (conv.customerUnreadCount || 0), 0);

  // Subscribe to real-time chat updates via SSE
  useSseSubscription("chat", user?.userId, {
    "chat-message": (data) => {
      console.log("[SSE Chat Customer] Received chat-message:", data);
      window.dispatchEvent(new CustomEvent("secondhand-chat-updated"));
    },
    "chat-updated": (data) => {
      console.log("[SSE Chat Customer] Received chat-updated:", data);
      window.dispatchEvent(new CustomEvent("secondhand-chat-updated"));
    }
  });

  useEffect(() => {
    if (!isDropdownOpen) return;
    const closeDropdown = (e) => {
      if (!e.target.closest("#user-dropdown-container")) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("click", closeDropdown);
    return () => document.removeEventListener("click", closeDropdown);
  }, [isDropdownOpen]);

  useEffect(() => {
    setCartCount(cartService.getCart().reduce((sum, item) => sum + (item.quantity || 1), 0));

    const unsubscribe = cartService.subscribe((cart) => {
      setCartCount(cart.reduce((sum, item) => sum + (item.quantity || 1), 0));
    });

    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    let isMounted = true;
    chatMockService.getConversations("CUSTOMER")
      .then((conversations) => {
        if (isMounted) setChatConversations(conversations);
      })
      .catch(() => {
        if (isMounted) setChatConversations([]);
      });

    const unsubscribe = chatMockService.subscribe((conversations) => {
      setChatConversations(conversations);
    }, "CUSTOMER");

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    const loadUser = async () => {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);

          // Fetch latest profile to sync avatar and other details
          if (parsedUser.userId) {
            const res = await userService.getProfile(parsedUser.userId);
            const profileData = res?.data || res;
            if (profileData) {
              const updatedUser = {
                ...parsedUser,
                avatarUrl: profileData.avatarUrl,
                fullName: profileData.fullName || parsedUser.fullName
              };
              setUser(updatedUser);
              localStorage.setItem("user", JSON.stringify(updatedUser));
            }
          }
        } catch (e) {
          if (e instanceof SyntaxError) {
            localStorage.removeItem("user");
            setUser(null);
          }
        }
      } else {
        setUser(null);
      }
    };

    loadUser();

    window.addEventListener("storage", loadUser);
    return () => {
      window.removeEventListener("storage", loadUser);
    };
  }, []);

  const handleSearch = () => {
    console.log(
      "Tính năng tìm kiếm đang được phát triển. Vui lòng quay lại sau!",
    );
    navigate("/products");
  };

  const handleAuthSuccess = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    toastService.info("Đã đăng xuất tài khoản.");
    navigate("/");
  };

  const handleOpenChatList = async () => {
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }
    setChatConversations(await chatMockService.getConversations("CUSTOMER"));
    setIsChatModalOpen(true);
  };

  const handleSelectConversation = (conversationId) => {
    window.dispatchEvent(
      new CustomEvent("open-customer-chat", {
        detail: { conversationId },
      }),
    );
    setIsChatModalOpen(false);
  };

  const getInitials = (name) => {
    if (!name) return "U";
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return "U";
    const first = parts[0]?.[0] ?? "";
    const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? "") : "";
    return (first + last).toUpperCase();
  };

  return (
    <div
      className="min-h-screen bg-[#f6f4dd] text-[#3f3b2f]"
      style={{ height: "100vh", overflowY: "auto" }}
    >

      {/* <Toaster {...toasterProps} /> */}

      <header className="sticky top-0 z-40 border-b border-[#e7dfbd] bg-[#f6f4dd]/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="text-xl font-bold italic text-[#b84a25]"
          >
            Tủ cũ chill
          </button>

          <nav className="hidden items-center gap-8 text-sm font-medium text-[#706b5c] md:flex">
            <button
              type="button"
              onClick={() => navigate("/products")}
              className="hover:text-[#b84a25]"
            >
              Khám Phá
            </button>

            <button
              type="button"
              onClick={() => navigate("/shops")}
              className="hover:text-[#b84a25]"
            >
              Cửa Hàng
            </button>

            <button type="button" className="hover:text-[#b84a25]">
              Xu Hướng
            </button>
            <button
              type="button"
              onClick={() => navigate("/orders")}
              className="hover:text-[#b84a25]"
            >
              Đơn hàng
            </button>
          </nav>

          <div className="flex items-center gap-4 text-[#b84a25]">
            <button type="button" onClick={handleSearch}>
              <Search size={18} />
            </button>

            <button
              type="button"
              onClick={() => navigate("/image-search")}
              aria-label="Tìm kiếm bằng hình ảnh"
              title="Tìm kiếm bằng hình ảnh"
            >
              <ImageUp size={18} />
            </button>

            <button
              type="button"
              className="relative cursor-pointer hover:opacity-80 transition-opacity"
              aria-label="Thông báo"
              title="Thông báo"
            >
              <Bell size={18} />
              {user && totalUnreadCount > 0 && (
                <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-[#c04f25]" />
              )}
            </button>

            <div className="relative">
              <button
                type="button"
                onClick={handleOpenChatList}
                className="relative cursor-pointer hover:opacity-80 transition-opacity"
                aria-label="Tin nhắn với shop"
                title="Tin nhắn với shop"
              >
                <MessageCircle size={18} />
                {user && totalUnreadCount > 0 && (
                  <span className="absolute -top-2 -right-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#c04f25] px-1 text-[9px] font-extrabold text-white">
                    {Math.min(totalUnreadCount, 9)}
                  </span>
                )}
              </button>

              {isChatModalOpen && (
                <section className="absolute right-0 top-8 z-[60] w-[360px] overflow-hidden rounded-2xl border border-[#e7dfbd] bg-white text-[#3f3b2f] shadow-2xl">
                  <div className="absolute -top-2 right-3 h-4 w-4 rotate-45 border-l border-t border-[#e7dfbd] bg-[#faf7e7]" />
                  <header className="relative flex items-center justify-between border-b border-[#efe8cf] bg-[#faf7e7] px-4 py-3">
                    <div>
                      <h2 className="text-base font-extrabold text-[#3f3b2f]">Tin nhắn với shop</h2>
                      <p className="mt-0.5 text-xs font-semibold text-[#7c7565]">
                        Các shop bạn đã từng nhắn tin
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsChatModalOpen(false)}
                      className="flex h-8 w-8 items-center justify-center rounded-full text-[#7c7565] transition hover:bg-[#efe8cf] hover:text-[#b84a25]"
                      aria-label="Đóng danh sách tin nhắn"
                    >
                      <X size={17} />
                    </button>
                  </header>

                  <div className="max-h-[420px] overflow-y-auto p-2">
                    {chatConversations.length === 0 ? (
                      <div className="flex flex-col items-center justify-center px-6 py-10 text-center">
                        <MessageCircle size={34} className="mb-3 text-[#c04f25]" />
                        <p className="text-sm font-extrabold text-[#3f3b2f]">Chưa có shop nào</p>
                        <p className="mt-1 text-xs font-semibold text-[#7c7565]">
                          Khi bạn bấm nhắn tin ở trang sản phẩm, shop sẽ xuất hiện tại đây.
                        </p>
                      </div>
                    ) : (
                      chatConversations.map((conversation) => {
                        return (
                          <button
                            type="button"
                            key={conversation.id}
                            onClick={() => handleSelectConversation(conversation.id)}
                            className="flex w-full items-start gap-3 rounded-xl p-3 text-left transition hover:bg-[#faf7e7]"
                          >
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#d9efc4] text-sm font-extrabold text-[#4c7d38]">
                              {conversation.shopAvatarUrl ? (
                                <img
                                  src={conversation.shopAvatarUrl}
                                  alt=""
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                getChatInitials(conversation.shopName)
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-start justify-between gap-3">
                                <p className="truncate text-sm font-extrabold text-[#3f3b2f]">
                                  {conversation.shopName}
                                </p>
                                <div className="flex flex-col items-end gap-1 shrink-0">
                                  <span className="text-[10px] font-bold text-[#9c927b]">
                                    {formatChatTime(conversation.updatedAt)}
                                  </span>
                                </div>
                              </div>
                              {conversation.productName && (
                                <p className="mt-0.5 truncate text-xs font-semibold text-[#7c7565]">
                                  {conversation.productName}
                                </p>
                              )}
                              <p className={`mt-1 truncate text-xs ${
                                conversation.customerUnreadCount > 0
                                  ? "font-bold text-[#3f3b2f]"
                                  : "font-normal text-[#9c927b]"
                              }`}>
                                {conversation.lastMessagePreview || "Chưa có tin nhắn"}
                              </p>
                            </div>
                          </button>
                        );
                      })
                    )}
                  </div>
                </section>
              )}
            </div>

            <button
              type="button"
              onClick={() => navigate("/orders")}
              aria-label="Lịch sử đơn hàng"
              title="Lịch sử đơn hàng"
            >
              <ReceiptText size={18} />
            </button>

            <button
              type="button"
              onClick={() => navigate("/cart")}
              className="relative cursor-pointer hover:opacity-80 transition-opacity"
              aria-label="Giỏ hàng"
              title="Giỏ hàng"
            >
              <ShoppingCart size={18} />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-[#c04f25] text-[9px] font-extrabold text-white">
                  {cartCount}
                </span>
              )}
            </button>

            {user ? (
              <div className="relative" id="user-dropdown-container">
                <button
                  type="button"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-[#b84a25] bg-white overflow-hidden hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer shadow-xs"
                  title={`Tài khoản: ${user.fullName}`}
                >
                  {user.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt={user.fullName}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-sm font-bold text-[#b84a25]">{getInitials(user.fullName)}</span>
                  )}
                </button>

                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2.5 w-52 origin-top-right rounded-2xl border border-[#e7dfbd] bg-white p-2 shadow-xl z-50">
                    {/* Header info */}
                    <div className="px-3 py-2">
                      <p className="text-[10px] uppercase font-bold tracking-wider text-[#8a8370]">Tài khoản</p>
                      <p className="font-extrabold text-sm text-[#3f3b2f] truncate mt-0.5">
                        {user.fullName}
                      </p>
                      {user.email && (
                        <p className="text-xs text-[#8a8370] truncate mt-0.5">
                          {user.email}
                        </p>
                      )}
                    </div>
                    
                    <hr className="my-1.5 border-[#faf7e7]" />
                    
                    {/* Menu items */}
                    <button
                      onClick={() => {
                        setIsDropdownOpen(false);
                        navigate("/profile");
                      }}
                      className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-xs font-bold text-[#706b5c] hover:bg-[#faf7e7] hover:text-[#b84a25] transition cursor-pointer"
                    >
                      <User size={15} />
                      Xem hồ sơ
                    </button>
                    
                    <button
                      onClick={() => {
                        setIsDropdownOpen(false);
                        handleLogout();
                      }}
                      className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-xs font-bold text-red-600 hover:bg-red-50 transition cursor-pointer"
                    >
                      <LogOut size={15} />
                      Đăng xuất
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsAuthModalOpen(true)}
                className="rounded-xl bg-[#b84a25] px-4 py-2 text-xs font-extrabold text-white transition-opacity hover:opacity-90 cursor-pointer"
              >
                Đăng nhập
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        <Outlet />
      </main>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
      />

      {user ? <CustomerChatWidget /> : null}
    </div>
  );
}
