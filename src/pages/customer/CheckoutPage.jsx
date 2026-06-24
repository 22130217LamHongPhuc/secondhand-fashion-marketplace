import { useState, useEffect } from "react";
import { MapPin, CreditCard, Wallet, ShoppingBag, Check, Home, ShieldCheck, Truck, RotateCcw, ArrowLeft, Loader2 } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { cartService } from "@/services/cartService";
import { customerOrderService } from "@/services/customerOrder";
import { userService } from "@/services/user";
import { customerShopService } from "@/services/customerShop";
import { toastService } from "@/services/toastService";
import { env } from "@/config/env";

const ghnFetch = async (path, options = {}) => {
  const response = await fetch(`${env.ghnBaseUrl}${path}`, {
    ...options,
    headers: {
      Token: env.ghnToken,
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  const payload = await response.json();

  if (!response.ok || payload.code !== 200) {
    throw new Error(payload.message || "GHN API error");
  }

  return payload.data;
};

let effectiveGhnShopIdPromise;

const getEffectiveGhnShopId = async () => {
  if (!effectiveGhnShopIdPromise) {
    effectiveGhnShopIdPromise = ghnFetch("/v2/shop/all", {
      method: "POST",
      body: JSON.stringify({
        offset: 0,
        limit: 50,
        client_phone: "",
      }),
    }).then((data) => {
      const shops = data?.shops || [];
      const configuredShop = shops.find(
        (shop) => String(shop._id) === String(env.ghnShopId),
      );

      if (configuredShop) {
        return String(configuredShop._id);
      }

      const firstActiveShop = shops.find((shop) => shop.status === 1) || shops[0];

      if (!firstActiveShop?._id) {
        throw new Error("GHN token không có shop/store hợp lệ.");
      }

      console.warn(
        "VITE_GHN_SHOP_ID không nằm trong danh sách shop của token. Tạm dùng GHN shop đầu tiên.",
        {
          configuredShopId: env.ghnShopId,
          effectiveShopId: firstActiveShop._id,
          shops,
        },
      );

      return String(firstActiveShop._id);
    });
  }

  return effectiveGhnShopIdPromise;
};

export default function CheckoutPage() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [itemsToBuy, setItemsToBuy] = useState([]);
  const [user, setUser] = useState(null);
  const [shippingAddress, setShippingAddress] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [walletBalance, setWalletBalance] = useState(0);
  const [loading, setLoading] = useState(false);

  // GHN Address & Dynamic Shipping Fee States
  const [shippingFee, setShippingFee] = useState(0);
  const [calculatingShip, setCalculatingShip] = useState(false);
  const [shopAddresses, setShopAddresses] = useState({});

  // Initialize checkout items based on state, or fallback to full cart, or redirect
  useEffect(() => {
    // Parse user
    const storedUser = localStorage.getItem("user");
    let userData = null;
    if (storedUser) {
      try {
        userData = JSON.parse(storedUser);
        setUser(userData);
        fetchWalletBalance(userData.userId);
      } catch (e) {
        console.error("Error parsing user data", e);
      }
    } else {
      toastService.warning("Vui lòng đăng nhập để thực hiện thanh toán.");
      navigate("/cart");
      return;
    }

    // Determine items to buy
    if (location.state?.selectedItems && location.state.selectedItems.length > 0) {
      setItemsToBuy(location.state.selectedItems);
    } else {
      const currentCart = cartService.getCart();
      if (currentCart.length > 0) {
        setItemsToBuy(currentCart);
      } else {
        toastService.warning("Không tìm thấy sản phẩm nào cần thanh toán.");
        navigate("/cart");
        return;
      }
    }

    // Determine address
    if (location.state?.selectedAddress) {
      setShippingAddress(location.state.selectedAddress);
    } else if (userData) {
      fetchFallbackAddress(userData.userId);
    }
  }, [location.state]);

  const fetchFallbackAddress = async (userId) => {
    try {
      const response = await userService.getAddresses(userId);
      const data = response?.data || response || [];
      if (data.length > 0) {
        const defaultAddr = data.find(addr => addr.isDefault) || data[0];
        setShippingAddress(defaultAddr);
      }
    } catch (e) {
      console.error("Error fetching fallback address", e);
    }
  };

  const fetchWalletBalance = async (userId) => {
    try {
      const response = await userService.getProfile(userId);
      const data = response?.data || response;
      if (data && data.walletBalance !== undefined) {
        setWalletBalance(data.walletBalance);
      }
    } catch (e) {
      console.error("Error fetching profile for wallet balance", e);
    }
  };

  // Group items by shop
  const groupedItems = itemsToBuy.reduce((groups, item) => {
    const shopId = item.shopId || "unknown";
    const shopName = item.shopName || "Tiệm Cũ";
    if (!groups[shopId]) {
      groups[shopId] = {
        shopName,
        items: []
      };
    }
    groups[shopId].items.push(item);
    return groups;
  }, {});

  const shopsCount = Object.keys(groupedItems).length;

  // Load shop addresses (province_id, district_id, ward_code) for shipping calculation
  useEffect(() => {
    if (itemsToBuy.length === 0) return;

    const fetchShopAddresses = async () => {
      const uniqueShopIds = [...new Set(itemsToBuy.map(item => item.shopId).filter(Boolean))];
      const newAddresses = { ...shopAddresses };
      let updated = false;

      for (const shopId of uniqueShopIds) {
        if (!newAddresses[shopId]) {
          try {
            const shopData = await customerShopService.getById(shopId);
            const shopInfo = shopData?.shop || shopData;
            if (shopInfo) {
              newAddresses[shopId] = {
                provinceId: shopInfo.provinceId,
                districtId: shopInfo.districtId,
                wardCode: shopInfo.wardCode,
              };
              updated = true;
            }
          } catch (e) {
            console.error("Error fetching shop address for shop " + shopId, e);
          }
        }
      }

      if (updated) {
        setShopAddresses(newAddresses);
      }
    };

    fetchShopAddresses();
  }, [itemsToBuy]);

  // Calculate dynamic shipping fee using GHN API
  useEffect(() => {
    if (itemsToBuy.length === 0) return;

    if (!shippingAddress) {
      setShippingFee(shopsCount * 30000); // Fallback
      return;
    }

    const calculateTotalShippingFee = async () => {
      setCalculatingShip(true);
      try {
        const toDistrictId = Number(shippingAddress.districtId);
        const toWardCode = shippingAddress.wardCode ? String(shippingAddress.wardCode) : "";

        if (!toDistrictId || !toWardCode) {
          console.warn("Thiếu districtId/wardCode của địa chỉ giao hàng, dùng phí fallback.", shippingAddress);
          setShippingFee(shopsCount * 30000);
          return;
        }

        let totalFee = 0;
        const effectiveGhnShopId = await getEffectiveGhnShopId();
        
        for (const [shopId, group] of Object.entries(groupedItems)) {
          const shopAddr = shopAddresses[shopId];
          const fromDistrictId = Number(shopAddr?.districtId);
          const fromWardCode = shopAddr?.wardCode ? String(shopAddr.wardCode) : "";

          if (!fromDistrictId || !fromWardCode) {
            console.warn("Thiếu districtId/wardCode của shop, dùng phí fallback.", {
              shopId,
              shopAddr,
            });
            totalFee += 30000;
            continue;
          }
          
          let totalWeight = 0;
          let totalHeight = 0;
          let shopSubtotal = 0;

          group.items.forEach(item => {
            const qty = item.quantity || 1;
            totalWeight += (item.weight || 500) * qty;
            totalHeight += (item.height || 5) * qty;
            shopSubtotal += item.price * qty;
          });

          try {
            const response = await fetch(`${env.ghnBaseUrl}/v2/shipping-order/fee`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Token": env.ghnToken,
                "ShopId": effectiveGhnShopId
              },
              body: JSON.stringify({
                from_district_id: fromDistrictId,
                from_ward_code: fromWardCode,
                service_id: null,
                service_type_id: 2, // Standard Shipping
                to_district_id: toDistrictId,
                to_ward_code: toWardCode,
                height: totalHeight,
                length: 20,
                weight: totalWeight,
                width: 15,
                insurance_value: shopSubtotal,
                cod_failed_amount: 0
              })
            });

            const resData = await response.json();
            if (resData.code === 200 && resData.data?.total) {
              totalFee += resData.data.total;
            } else {
              console.warn("GHN fee API fallback at checkout", {
                marketplaceShopId: shopId,
                ghnShopId: effectiveGhnShopId,
                fromDistrictId,
                fromWardCode,
                toDistrictId,
                toWardCode,
                resData,
              });
              totalFee += 30000; // Fallback per shop
            }
          } catch (e) {
            console.error("Error calling GHN shipping API", e);
            totalFee += 30000;
          }
        }
        
        setShippingFee(totalFee);
      } catch (err) {
        console.error("Error calculating total shipping fee", err);
      } finally {
        setCalculatingShip(false);
      }
    };

    calculateTotalShippingFee();
  }, [shippingAddress, shopAddresses, itemsToBuy]);

  const handleCheckout = async () => {
    if (!user) {
      toastService.warning("Vui lòng đăng nhập để tiến hành đặt hàng.");
      return;
    }
    
    if (itemsToBuy.length === 0) {
      toastService.warning("Không có sản phẩm nào để đặt hàng.");
      return;
    }

    if (!shippingAddress) {
      toastService.warning("Vui lòng thiết lập địa chỉ giao hàng trước khi đặt hàng.");
      return;
    }

    setLoading(true);
    try {
      const itemsPayload = itemsToBuy.map(item => ({
        productId: item.id,
        quantity: item.quantity || 1
      }));

      const payload = {
        customerId: user.userId,
        shippingAddressId: shippingAddress.id,
        paymentMethod,
        items: itemsPayload,
        couponCode: location.state?.couponCode || null,
      };

      const result = await customerOrderService.checkout(payload);
      const data = result?.data || result;
      
      // Clear purchased items from cart
      itemsToBuy.forEach(item => {
        cartService.removeFromCart(item.id);
      });
      
      if (data?.paymentUrl) {
        toastService.success("Đang chuyển hướng sang cổng thanh toán VNPay...");
        setTimeout(() => {
          window.location.href = data.paymentUrl;
        }, 1000);
      } else {
        toastService.success("Đặt hàng thành công! Đang chuyển hướng sang lịch sử đơn hàng...");
        setTimeout(() => {
          navigate("/orders");
        }, 1500);
      }
    } catch (err) {
      const errorMsg = err?.response?.data?.message || err?.message || "Đặt hàng thất bại. Vui lòng thử lại.";
      toastService.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Calculate subtotal
  const subtotal = itemsToBuy.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);
  
  // Total payment
  const discountAmount = Number(location.state?.discountAmount) || 0;
  const total = Math.max(0, subtotal + shippingFee - discountAmount);

  // Format currency
  const formatPrice = (value) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND"
    }).format(value);
  };

  return (
    <div className="py-2 max-w-5xl mx-auto">
      {/* Title */}
      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={() => navigate("/cart")}
          className="flex items-center gap-1.5 text-sm font-bold text-[#7c7565] hover:text-[#b84a25] transition-colors"
        >
          <ArrowLeft size={16} /> Quay lại giỏ hàng
        </button>
      </div>

      {/* Step Progress Bar */}
      <div className="mb-8 flex items-center justify-center gap-4 bg-[#faf7e7] border border-[#ebe2c8] px-6 py-4 rounded-2xl shadow-xs">
        <div className="flex items-center gap-2 text-xs md:text-sm font-semibold text-[#7c7565]">
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#d9efc4] text-[10px] font-bold text-[#4c7d38]"><Check size={12} /></span>
          <span>Giỏ hàng</span>
        </div>
        <div className="h-[1px] w-8 md:w-16 bg-[#d8d0ba]" />
        <div className="flex items-center gap-2 text-xs md:text-sm font-extrabold text-[#b84a25]">
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#b84a25] text-[10px] font-bold text-white">2</span>
          <span>Thanh toán</span>
        </div>
        <div className="h-[1px] w-8 md:w-16 bg-[#d8d0ba]" />
        <div className="flex items-center gap-2 text-xs md:text-sm font-semibold text-[#7c7565]">
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#d8d0ba] text-[10px] font-bold text-white">3</span>
          <span>Hoàn tất đơn</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Left Column - Steps Recap (Address -> Payment -> Products) */}
        <div className="space-y-6 lg:col-span-8">
          
          {/* Step 1: Shipping Address */}
          <div className="rounded-2xl border border-[#ebe2c8] bg-white p-6 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-base font-extrabold uppercase tracking-wider text-[#3d3a2c]">
                <span className="bg-[#b84a25]/10 text-[#b84a25] rounded-lg px-2 py-0.5 text-sm font-black mr-1">1</span>
                Địa Chỉ Giao Hàng
              </h3>
              <button
                onClick={() => navigate("/cart")}
                className="text-xs font-bold text-[#b84a25] hover:underline"
              >
                Thay đổi
              </button>
            </div>

            {!shippingAddress ? (
              <div className="text-center py-4 rounded-xl bg-[#faf7e7] border border-dashed border-[#d8d0ba]">
                <p className="text-xs text-[#7c7565]">Chưa chọn địa chỉ giao hàng.</p>
                <button
                  onClick={() => navigate("/cart")}
                  className="mt-2 text-xs font-bold text-[#b84a25] hover:underline"
                >
                  Quay lại giỏ hàng để chọn &rarr;
                </button>
              </div>
            ) : (
              <div className="rounded-xl border border-[#ebe2c8] bg-[#faf7e7]/40 p-4">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-[#3d3a2c]">{shippingAddress.fullName}</span>
                  <span className="text-xs text-[#7c7565]">| {shippingAddress.phone}</span>
                </div>
                <p className="mt-1 text-xs text-[#7c7565] leading-relaxed">
                  {shippingAddress.addressDetail}, {shippingAddress.ward}, {shippingAddress.district}, {shippingAddress.province}
                </p>
              </div>
            )}
          </div>

          {/* Step 2: Payment Method */}
          <div className="rounded-2xl border border-[#ebe2c8] bg-white p-6 shadow-sm">
            <h3 className="flex items-center gap-2 text-base font-extrabold uppercase tracking-wider text-[#3d3a2c] mb-4">
              <span className="bg-[#b84a25]/10 text-[#b84a25] rounded-lg px-2 py-0.5 text-sm font-black mr-1">2</span>
              Phương Thức Thanh Toán
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div
                onClick={() => setPaymentMethod("COD")}
                className={`flex flex-col items-center justify-center cursor-pointer rounded-xl border p-4 transition-all ${
                  paymentMethod === "COD"
                    ? "border-[#b84a25] bg-[#fffaf5] ring-1 ring-[#b84a25]"
                    : "border-[#ebe2c8] bg-white hover:bg-[#fffdfb]"
                }`}
              >
                <div className="mb-2 text-[#7c7565]">
                  <Home size={22} className={paymentMethod === "COD" ? "text-[#b84a25]" : ""} />
                </div>
                <span className="font-bold text-xs text-[#3d3a2c]">Thanh toán COD</span>
                <span className="text-[10px] text-[#7c7565] mt-0.5 text-center">Thanh toán khi nhận hàng</span>
              </div>

              <div
                onClick={() => setPaymentMethod("WALLET")}
                className={`flex flex-col items-center justify-center cursor-pointer rounded-xl border p-4 transition-all ${
                  paymentMethod === "WALLET"
                    ? "border-[#b84a25] bg-[#fffaf5] ring-1 ring-[#b84a25]"
                    : "border-[#ebe2c8] bg-white hover:bg-[#fffdfb]"
                }`}
              >
                <div className="mb-2 text-[#7c7565]">
                  <Wallet size={22} className={paymentMethod === "WALLET" ? "text-[#b84a25]" : ""} />
                </div>
                <span className="font-bold text-xs text-[#3d3a2c]">Cổng VNPay</span>
                <span className="text-[10px] text-[#7c7565] mt-0.5 text-center">Thẻ ATM / QR / Mobile Banking</span>
              </div>
            </div>
          </div>

          {/* Step 3: Product Summary list */}
          <div className="rounded-2xl border border-[#ebe2c8] bg-white p-6 shadow-sm space-y-4">
            <h3 className="flex items-center gap-2 text-base font-extrabold uppercase tracking-wider text-[#3d3a2c]">
              <span className="bg-[#b84a25]/10 text-[#b84a25] rounded-lg px-2 py-0.5 text-sm font-black mr-1">3</span>
              Kiểm Tra Đơn Hàng ({itemsToBuy.length} sản phẩm)
            </h3>
            
            <div className="divide-y divide-[#ebe2c8] border border-[#ebe2c8] rounded-xl overflow-hidden">
              {Object.entries(groupedItems).map(([shopId, group]) => (
                <div key={shopId} className="bg-white">
                  {/* Shop label row */}
                  <div className="bg-[#faf7e7]/60 px-4 py-2 text-xs font-bold text-[#7c7565] border-b border-[#ebe2c8] flex items-center gap-2">
                    <span className="rounded bg-[#ffc28f] px-1.5 py-0.5 text-[10px] font-black text-[#6c331b]">Shop</span>
                    <span>{group.shopName}</span>
                  </div>

                  <div className="divide-y divide-[#faf7e7]">
                    {group.items.map((item) => (
                      <div key={item.id} className="p-4 flex items-center gap-4 hover:bg-[#fffdf6] transition-colors duration-150">
                        <div className="h-14 w-11 flex-shrink-0 overflow-hidden rounded-md bg-[#faf7e7] border border-[#ebe2c8]">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-sm text-[#3d3a2c] line-clamp-1">
                            {item.name}
                          </h4>
                          <span className="text-[11px] text-[#9c927b]">Đơn giá: {formatPrice(item.price)}</span>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <span className="text-sm font-bold text-[#b84a25] block">
                            {formatPrice(item.price * (item.quantity || 1))}
                          </span>
                          <span className="text-[10px] text-[#7c7565] block">Số lượng: {item.quantity || 1}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Sticky Final Totals & Submit */}
        <div className="lg:col-span-4">
          <div className="sticky top-6 space-y-4">
            <div className="rounded-2xl border border-[#ebe2c8] bg-white p-6 shadow-sm space-y-4">
              <h3 className="text-lg font-bold text-[#3d3a2c] border-b border-[#faf7e7] pb-2">
                Tóm tắt thanh toán
              </h3>

              <div className="space-y-2 text-sm text-[#7c7565]">
                <div className="flex justify-between">
                  <span>Tạm tính ({itemsToBuy.length} món):</span>
                  <span className="font-semibold text-[#3d3a2c]">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>
                    Phí vận chuyển ({shopsCount} Tiệm):
                  </span>
                  <span className="font-semibold text-[#3d3a2c] flex items-center gap-1">
                    {calculatingShip ? (
                      <span className="text-xs text-[#9c927b] flex items-center gap-1.5 font-normal">
                        <Loader2 className="animate-spin" size={12} /> Đang tính...
                      </span>
                    ) : (
                      formatPrice(shippingFee)
                    )}
                  </span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-[#2f7d32]">
                    <span>Giảm giá ({location.state?.couponCode}):</span>
                    <span className="font-semibold">-{formatPrice(discountAmount)}</span>
                  </div>
                )}
                
                <div className="border-t border-[#faf7e7] pt-3 flex justify-between items-end">
                  <span className="font-extrabold text-base text-[#3d3a2c]">Tổng thanh toán:</span>
                  <div className="text-right">
                    <span className="text-xl font-black text-[#b84a25] block">
                      {formatPrice(total)}
                    </span>
                    <span className="text-[10px] text-[#9c927b] block">(Đã gồm VAT và phí ship)</span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                disabled={loading || calculatingShip || itemsToBuy.length === 0 || !shippingAddress}
                className="w-full flex items-center justify-center gap-2 h-14 rounded-xl bg-[#c04f25] font-extrabold text-white shadow-sm transition hover:bg-[#a9411d] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {loading ? "Đang xử lý đặt hàng..." : calculatingShip ? "Đang tính phí vận chuyển..." : "Đặt hàng ngay"}
              </button>

              <p className="text-[10px] text-[#9c927b] text-center leading-relaxed">
                Bằng cách nhấp vào "Đặt hàng ngay", bạn đồng ý chấp nhận Điều khoản và chính sách mua sắm của chúng tôi.
              </p>
            </div>

            {/* Trust Badges */}
            <div className="rounded-2xl border border-[#ebe2c8] bg-[#faf7e7]/30 p-4 space-y-3">
              <div className="flex items-center gap-2.5 text-xs text-[#7b705f]">
                <ShieldCheck size={16} className="text-[#4c7d38] flex-shrink-0" />
                <span>Bảo mật thông tin thanh toán 100%</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-[#7b705f]">
                <RotateCcw size={16} className="text-[#b84a25] flex-shrink-0" />
                <span>7 ngày hoàn trả nếu có lỗi mô tả sản phẩm</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-[#7b705f]">
                <Truck size={16} className="text-[#b84a25] flex-shrink-0" />
                <span>Đóng gói &amp; giao hàng cẩn thận toàn quốc</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
