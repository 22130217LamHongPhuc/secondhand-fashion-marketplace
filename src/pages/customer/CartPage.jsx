import { useState, useEffect, useMemo } from "react";
import { Trash2, ShoppingBag, Plus, Minus, Check, MapPin, ChevronDown, Tag, TicketPercent, Loader2 } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { cartService } from "@/services/cartService";
import { toastService } from "@/services/toastService";
import { userService } from "@/services/user";
import { couponService } from "@/services/couponService";
import { customerPromotionService } from "@/services/promotionService";
import { shippingService } from "@/services/shippingService";

const areFeeMapsEqual = (current, next) => {
  const currentKeys = Object.keys(current);
  const nextKeys = Object.keys(next);

  if (currentKeys.length !== nextKeys.length) {
    return false;
  }

  return nextKeys.every((key) => current[key] === next[key]);
};

const fetchGhnProvinces = () => shippingService.getProvinces();
const fetchGhnDistricts = (provinceId) => shippingService.getDistricts(provinceId);
const fetchGhnWards = (districtId) => shippingService.getWards(districtId);

export default function CartPage() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [cart, setCart] = useState([]);
  const [user, setUser] = useState(null);
  const [selectedItemIds, setSelectedItemIds] = useState([]);
  const [hasInitializedSelection, setHasInitializedSelection] = useState(false);
  const [ownedCoupons, setOwnedCoupons] = useState([]);
  const [walletVouchers, setWalletVouchers] = useState([]);
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [couponLoading, setCouponLoading] = useState(false);
  const [shopPromotions, setShopPromotions] = useState([]);
  const [claimingPromoId, setClaimingPromoId] = useState(null);

  // Address states
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addressForm, setAddressForm] = useState({
    fullName: "",
    phone: "",
    province: "",
    provinceId: null,
    district: "",
    districtId: null,
    ward: "",
    wardCode: "",
    addressDetail: "",
    isDefault: false
  });
  const [savingAddress, setSavingAddress] = useState(false);

  // GHN Address & Dynamic Shipping Fee States
  const [shippingFee, setShippingFee] = useState(0);
  const [calculatingShip, setCalculatingShip] = useState(false);
  const [individualShippingFees, setIndividualShippingFees] = useState({});

  // GHN master-data states for dynamic Vietnam provinces/districts/wards selection
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const [selectedProvinceId, setSelectedProvinceId] = useState("");
  const [selectedDistrictId, setSelectedDistrictId] = useState("");

  useEffect(() => {
    // Load initial cart
    setCart(cartService.getCart());

    // Subscribe to cart changes
    const unsubscribe = cartService.subscribe((updatedCart) => {
      setCart(updatedCart);
    });

    // Check logged in user
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
        fetchAddresses(userData.userId);
      } catch (e) {
        console.error("Error parsing user data", e);
      }
    }

    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    const loadOwnedCoupons = async () => {
      try {
        const available = await couponService.getAvailable();
        setOwnedCoupons(
          available.filter((coupon) => coupon.createdBy === "ADMIN" || !coupon.shopId),
        );

        if (localStorage.getItem("token")) {
          const walletData = await customerPromotionService.getMyWallet(0, 100);
          setWalletVouchers(walletData.content || walletData.items || []);
        }
      } catch (error) {
        console.error("Không thể tải ví mã giảm giá", error);
      }
    };
    loadOwnedCoupons();
  }, [user]);

  // Initialize selected items based on 'Buy Now' navigation state or select all by default
  useEffect(() => {
    if (cart.length > 0 && !hasInitializedSelection) {
      const buyNowProductId = location.state?.buyNowProductId;
      if (buyNowProductId && cart.some(item => item.id === buyNowProductId)) {
        setSelectedItemIds([buyNowProductId]);
      } else {
        setSelectedItemIds(cart.map(item => item.id));
      }
      setHasInitializedSelection(true);
      // Clean up the location state in history so that refreshes/back navigations do not restrict selection again
      window.history.replaceState({}, document.title);
    }
  }, [cart, location.state, hasInitializedSelection]);

  // Keep selectedItemIds in sync if items are removed from the cart
  useEffect(() => {
    if (cart.length > 0 && hasInitializedSelection) {
      setSelectedItemIds(prev => prev.filter(id => cart.some(item => item.id === id)));
    }
  }, [cart, hasInitializedSelection]);

  useEffect(() => {
    if (showAddressForm) {
      fetchProvinces();
    }
  }, [showAddressForm]);

  const fetchProvinces = async () => {
    try {
      const data = await fetchGhnProvinces();
      setProvinces(data || []);
    } catch (e) {
      console.error("Error fetching GHN provinces", e);
    }
  };

  const handleProvinceChange = async (e) => {
    const provinceId = e.target.value;
    setSelectedProvinceId(provinceId);
    setSelectedDistrictId("");
    setDistricts([]);
    setWards([]);
    
    const prov = provinces.find(p => String(p.ProvinceID) === String(provinceId));
    setAddressForm(prev => ({
      ...prev,
      province: prov ? prov.ProvinceName : "",
      provinceId: prov ? prov.ProvinceID : null,
      district: "",
      districtId: null,
      ward: "",
      wardCode: "",
    }));

    if (provinceId) {
      try {
        const data = await fetchGhnDistricts(provinceId);
        setDistricts(data || []);
      } catch (err) {
        console.error("Error fetching GHN districts", err);
      }
    }
  };

  const handleDistrictChange = async (e) => {
    const districtId = e.target.value;
    setSelectedDistrictId(districtId);
    setWards([]);

    const dist = districts.find(d => String(d.DistrictID) === String(districtId));
    setAddressForm(prev => ({
      ...prev,
      district: dist ? dist.DistrictName : "",
      districtId: dist ? dist.DistrictID : null,
      ward: "",
      wardCode: "",
    }));

    if (districtId) {
      try {
        const data = await fetchGhnWards(districtId);
        setWards(data || []);
      } catch (err) {
        console.error("Error fetching GHN wards", err);
      }
    }
  };

  const handleWardChange = (e) => {
    const wardCode = e.target.value;
    const wrd = wards.find(w => String(w.WardCode) === String(wardCode));
    setAddressForm(prev => ({
      ...prev,
      ward: wrd ? wrd.WardName : "",
      wardCode: wrd ? wrd.WardCode : "",
    }));
  };

  const fetchAddresses = async (userId) => {
    try {
      const response = await userService.getAddresses(userId);
      const data = response?.data || response || [];
      setAddresses(data);
      if (data.length > 0) {
        const defaultAddr = data.find(addr => addr.isDefault) || data[0];
        setSelectedAddressId(defaultAddr.id);
      }
    } catch (e) {
      console.error("Error fetching addresses", e);
    }
  };

  const handleAddressInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    let finalValue = type === "checkbox" ? checked : value;
    if (name === "phone") {
      finalValue = value.replace(/[^\d]/g, "");
    }
    setAddressForm(prev => ({
      ...prev,
      [name]: finalValue
    }));
  };

  const handleSaveAddress = async (e) => {
    e.preventDefault();
    if (!user) return;
    
    // Validations
    if (!addressForm.fullName.trim() || !addressForm.phone.trim() || !addressForm.province.trim() || !addressForm.district.trim() || !addressForm.ward.trim() || !addressForm.addressDetail.trim()) {
      toastService.warning("Vui lòng nhập đầy đủ thông tin địa chỉ.");
      return;
    }

    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(addressForm.phone.trim())) {
      toastService.warning("Số điện thoại phải bao gồm đúng 10 chữ số.");
      return;
    }

    setSavingAddress(true);
    try {
      const res = await userService.createAddress(user.userId, addressForm);
      if (res?.data || res) {
        toastService.success("Thêm địa chỉ giao hàng thành công!");
        setAddressForm({
          fullName: "",
          phone: "",
          province: "",
          provinceId: null,
          district: "",
          districtId: null,
          ward: "",
          wardCode: "",
          addressDetail: "",
          isDefault: false
        });
        setSelectedProvinceId("");
        setSelectedDistrictId("");
        setDistricts([]);
        setWards([]);
        setShowAddressForm(false);
        await fetchAddresses(user.userId);
      }
    } catch (err) {
      toastService.error("Không thể thêm địa chỉ mới. Vui lòng thử lại.");
    } finally {
      setSavingAddress(false);
    }
  };

  const handleRemoveItem = (productId) => {
    cartService.removeFromCart(productId);
    toastService.info("Đã xóa sản phẩm khỏi giỏ hàng.");
  };

  const handleUpdateQuantity = (productId, newQuantity) => {
    cartService.updateQuantity(productId, newQuantity);
  };

  const handleToggleSelectItem = (id) => {
    setSelectedItemIds(prev =>
      prev.includes(id) ? prev.filter(itemId => itemId !== id) : [...prev, id]
    );
  };

  const handleToggleSelectAll = () => {
    if (selectedItemIds.length === cart.length) {
      setSelectedItemIds([]);
    } else {
      setSelectedItemIds(cart.map(item => item.id));
    }
  };

  const handleToggleSelectShop = (shopItems) => {
    const shopItemIds = shopItems.map(item => item.id);
    const allSelected = shopItemIds.every(id => selectedItemIds.includes(id));
    if (allSelected) {
      setSelectedItemIds(prev => prev.filter(id => !shopItemIds.includes(id)));
    } else {
      setSelectedItemIds(prev => {
        const otherIds = prev.filter(id => !shopItemIds.includes(id));
        return [...otherIds, ...shopItemIds];
      });
    }
  };

  // Group items by shop
  const groupedCart = useMemo(() => cart.reduce((groups, item) => {
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
  }, {}), [cart]);

  // Derive selected items
  const selectedItems = useMemo(
    () => cart.filter(item => selectedItemIds.includes(item.id)),
    [cart, selectedItemIds],
  );

  // Group selected items by shop
  const groupedSelectedCart = useMemo(() => selectedItems.reduce((groups, item) => {
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
  }, {}), [selectedItems]);

  const selectedShopIds = useMemo(() => Object.keys(groupedSelectedCart), [groupedSelectedCart]);
  const selectedShopsCount = selectedShopIds.length;
  
  // Calculate dynamic shipping fee through backend GHN integration
  useEffect(() => {
    if (selectedItems.length === 0) {
      setShippingFee(0);
      setIndividualShippingFees({});
      return;
    }

    const currentAddress = addresses.find(addr => addr.id === selectedAddressId);
    if (!currentAddress) {
      const fallbackShippingFee = selectedShopsCount * 30000;
      const fallbackFees = {};
      selectedShopIds.forEach(shopId => {
        fallbackFees[shopId] = 30000;
      });
      setShippingFee(prev => (prev === fallbackShippingFee ? prev : fallbackShippingFee));
      setIndividualShippingFees(prev => (areFeeMapsEqual(prev, fallbackFees) ? prev : fallbackFees));
      return;
    }

    let cancelled = false;

    const calculateTotalShippingFee = async () => {
      setCalculatingShip(true);
      try {
        const quote = await shippingService.quoteFee({
          customerId: user?.userId,
          shippingAddressId: selectedAddressId,
          items: selectedItems.map(item => ({
            productId: item.id,
            quantity: item.quantity || 1,
          })),
        });

        if (cancelled) {
          return;
        }

        const totalFee = Number(quote?.totalFee) || selectedShopsCount * 30000;
        const shopFees = quote?.shopFees || {};
        const newIndividualFees = {};
        selectedShopIds.forEach(shopId => {
          newIndividualFees[shopId] = Number(shopFees[shopId]) || 30000;
        });

        if (quote?.fallbackUsed) {
          console.warn(quote.message || "Một số phí vận chuyển đang dùng phí mặc định.");
        }

        setShippingFee(prev => (prev === totalFee ? prev : totalFee));
        setIndividualShippingFees(prev => (
          areFeeMapsEqual(prev, newIndividualFees) ? prev : newIndividualFees
        ));
      } catch (err) {
        console.error("Error calculating total shipping fee", err);
        const fallbackShippingFee = selectedShopsCount * 30000;
        const fallbackFees = {};
        selectedShopIds.forEach(shopId => {
          fallbackFees[shopId] = 30000;
        });
        if (!cancelled) {
          setShippingFee(prev => (prev === fallbackShippingFee ? prev : fallbackShippingFee));
          setIndividualShippingFees(prev => (areFeeMapsEqual(prev, fallbackFees) ? prev : fallbackFees));
        }
      } finally {
        if (!cancelled) {
          setCalculatingShip(false);
        }
      }
    };

    calculateTotalShippingFee();

    return () => {
      cancelled = true;
    };
  }, [selectedAddressId, addresses, selectedItems, selectedShopIds, selectedShopsCount, user?.userId]);

  // Fetch shop promotions for selected shop ids
  useEffect(() => {
    if (selectedShopIds.length === 0) {
      setShopPromotions([]);
      return;
    }

    const fetchShopPromos = async () => {
      try {
        const promosPromises = selectedShopIds.map(shopId =>
          customerPromotionService.getShopPromotions(shopId, 0, 50)
        );
        const results = await Promise.all(promosPromises);
        const allPromos = results.flatMap(res => res.content || res.items || []);
        // filter out duplicate promotions by id
        const uniquePromos = Array.from(new Map(allPromos.map(p => [p.id, p])).values());
        setShopPromotions(uniquePromos);
      } catch (err) {
        console.error("Error fetching shop promotions", err);
      }
    };

    fetchShopPromos();
  }, [selectedShopIds, walletVouchers]);

  // Calculate subtotal for selected items only
  const subtotal = selectedItems.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);
  
  // Total payment
  const total = Math.max(0, subtotal + shippingFee - discountAmount);

  const usableWalletVouchers = useMemo(() => {
    const selectedShopSet = new Set(selectedShopIds.map(String));
    const now = Date.now();

    return walletVouchers.filter((item) => {
      const promotion = item?.promotion;
      if (!promotion) return false;

      const promotionShopId = promotion.shopId || promotion.shop?.id;
      if (!promotionShopId || !selectedShopSet.has(String(promotionShopId))) {
        return false;
      }

      if (item.usageCount >= 1) {
        return false;
      }

      if (promotion.status && promotion.status !== "ACTIVE") {
        return false;
      }

      if (promotion.startDate && now < new Date(promotion.startDate).getTime()) {
        return false;
      }

      if (promotion.endDate && now > new Date(promotion.endDate).getTime()) {
        return false;
      }

      if (
        promotion.quantity != null
        && promotion.usedQuantity != null
        && Number(promotion.usedQuantity) >= Number(promotion.quantity)
      ) {
        return false;
      }

      return true;
    });
  }, [walletVouchers, selectedShopIds]);

  useEffect(() => {
    if (!appliedCoupon) return;
    
    const promoShopId = appliedCoupon.shopId || appliedCoupon.shop?.id;
    const eligibleSubtotal = promoShopId
      ? selectedItems
          .filter((item) => String(item.shopId) === String(promoShopId))
          .reduce((sum, item) => sum + item.price * (item.quantity || 1), 0)
      : subtotal;
      
    if (eligibleSubtotal <= 0 || (appliedCoupon.minOrderValue && eligibleSubtotal < appliedCoupon.minOrderValue)) {
      setAppliedCoupon(null);
      setDiscountAmount(0);
      toastService.info("Mã giảm giá đã bị hủy do thay đổi giỏ hàng không còn đủ điều kiện tối thiểu.");
    }
  }, [selectedItems, subtotal, appliedCoupon]);

  // Format currency
  const formatPrice = (value) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND"
    }).format(value);
  };

  const handleApplyCoupon = async (rawCode = couponCode, couponHint = null) => {
    const normalizedCode = rawCode.trim().toUpperCase();
    if (!normalizedCode) {
      toastService.warning("Vui lòng nhập mã giảm giá.");
      return;
    }
    if (subtotal <= 0) {
      toastService.warning("Vui lòng chọn sản phẩm trước khi áp dụng mã.");
      return;
    }

    const coupon = couponHint 
      || ownedCoupons.find((item) => item.code === normalizedCode)
      || usableWalletVouchers.map(v => v.promotion).find((item) => item?.code === normalizedCode)
      || shopPromotions.find((item) => item.code === normalizedCode);
      
    const promoShopId = coupon?.shopId || coupon?.shop?.id;
    const eligibleSubtotal = promoShopId
      ? selectedItems
          .filter((item) => String(item.shopId) === String(promoShopId))
          .reduce((sum, item) => sum + item.price * (item.quantity || 1), 0)
      : subtotal;

    if (promoShopId && eligibleSubtotal <= 0) {
      toastService.warning("Mã này không áp dụng cho các sản phẩm đã chọn.");
      return;
    }

    setCouponLoading(true);
    try {
      if (promoShopId && coupon?.id) {
        const isClaimed = walletVouchers.some(item => item.promotion?.id === coupon.id);
        if (!isClaimed && user) {
          try {
            await customerPromotionService.claimPromotion(coupon.id);
            const walletData = await customerPromotionService.getMyWallet(0, 100);
            setWalletVouchers(walletData.content || walletData.items || []);
          } catch (claimErr) {
            console.warn("Tự động lưu mã giảm giá tiệm thất bại", claimErr);
          }
        }
      }

      const validation = await couponService.validate(normalizedCode, eligibleSubtotal);
      if (!validation?.isValid) {
        throw new Error(validation?.message || "Mã giảm giá không hợp lệ");
      }
      setCouponCode(normalizedCode);
      setAppliedCoupon(coupon || { code: normalizedCode });
      setDiscountAmount(Number(validation.discountAmount) || 0);
      toastService.success(validation.message || "Áp dụng mã giảm giá thành công.");
    } catch (error) {
      setAppliedCoupon(null);
      setDiscountAmount(0);
      toastService.error(error.message || "Không thể áp dụng mã giảm giá.");
    } finally {
      setCouponLoading(false);
    }
  };

  const handleClaimPromotion = async (promotionId) => {
    if (!user) {
      toastService.warning("Vui lòng đăng nhập để lưu mã giảm giá.");
      return;
    }
    setClaimingPromoId(promotionId);
    try {
      await customerPromotionService.claimPromotion(promotionId);
      toastService.success("Lưu mã giảm giá thành công!");
      // Reload wallet to refresh claimed status
      const walletData = await customerPromotionService.getMyWallet(0, 100);
      setWalletVouchers(walletData.content || walletData.items || []);
    } catch (err) {
      toastService.error(err.message || "Không thể lưu mã giảm giá.");
    } finally {
      setClaimingPromoId(null);
    }
  };

  const handleProceedToCheckout = async () => {
    if (!user) {
      toastService.warning("Vui lòng đăng nhập để tiến hành thanh toán.");
      return;
    }
    
    if (selectedItems.length === 0) {
      toastService.warning("Vui lòng chọn ít nhất một sản phẩm để thanh toán.");
      return;
    }

    if (!selectedAddressId) {
      toastService.warning("Vui lòng chọn hoặc thêm địa chỉ giao hàng.");
      return;
    }

    if (appliedCoupon) {
      const promoShopId = appliedCoupon.shopId || appliedCoupon.shop?.id;
      const eligibleSubtotal = promoShopId
        ? selectedItems
            .filter((item) => String(item.shopId) === String(promoShopId))
            .reduce((sum, item) => sum + item.price * (item.quantity || 1), 0)
        : subtotal;

      if (promoShopId && eligibleSubtotal <= 0) {
        toastService.warning("Mã giảm giá đang dùng không áp dụng cho các sản phẩm đã chọn.");
        return;
      }

      setCouponLoading(true);
      try {
        const validation = await couponService.validate(appliedCoupon.code, eligibleSubtotal);
        if (!validation?.isValid) {
          toastService.error(`Mã giảm giá không còn hợp lệ: ${validation?.message || "Không hợp lệ"}`);
          setAppliedCoupon(null);
          setDiscountAmount(0);
          setCouponLoading(false);
          return;
        }
      } catch (error) {
        toastService.error(`Mã giảm giá không hợp lệ: ${error.message}`);
        setAppliedCoupon(null);
        setDiscountAmount(0);
        setCouponLoading(false);
        return;
      } finally {
        setCouponLoading(false);
      }
    }

    const selectedAddress = addresses.find(addr => addr.id === selectedAddressId);

    navigate("/checkout", {
      state: {
        selectedItems,
        selectedAddress,
        couponCode: appliedCoupon?.code || null,
        discountAmount,
      },
    });
  };

  if (cart.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
        <div className="mb-6 rounded-full bg-[#f4d8bd]/40 p-6 text-[#b84a25]">
          <ShoppingBag size={48} className="animate-bounce" />
        </div>
        <h2 className="text-2xl font-bold text-[#3d3a2c] mb-2">Giỏ hàng của bạn đang trống</h2>
        <p className="text-[#7c7565] max-w-md mb-8">
          Hãy dạo quanh một vòng và tìm kiếm cho mình những bộ cánh secondhand cực "chill" và cá tính nhé!
        </p>
        <button
          onClick={() => navigate("/products")}
          className="rounded-xl bg-[#c04f25] px-8 py-3.5 font-extrabold text-white shadow-sm hover:bg-[#a9411d] transition-all hover:scale-[1.02] cursor-pointer"
        >
          Tiếp tục mua sắm
        </button>
      </div>
    );
  }

  return (
    <div className="py-2">
      {/* Title */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between border-b border-[#e7dfbd] pb-4 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-[#3d3a2c]">Giỏ hàng</h1>
          <p className="mt-1 text-sm text-[#7c7565]">
            Bạn đang có <span className="font-bold text-[#b84a25]">{cart.length}</span> sản phẩm trong giỏ hàng
          </p>
          {cart.length > 0 && (
            <div 
              onClick={handleToggleSelectAll}
              className="flex items-center gap-2.5 mt-3 bg-[#faf7e7] border border-[#ebe2c8] px-3.5 py-1.5 rounded-xl w-fit hover:bg-[#f5eed2] transition-colors cursor-pointer"
            >
              <input
                type="checkbox"
                id="selectAll"
                checked={cart.length > 0 && selectedItemIds.length === cart.length}
                onChange={(e) => {
                  e.stopPropagation();
                  handleToggleSelectAll();
                }}
                className="h-5 w-5 rounded border-[#d8d0ba] accent-[#b84a25] cursor-pointer transition-all"
              />
              <label 
                htmlFor="selectAll" 
                onClick={(e) => e.preventDefault()}
                className="text-xs font-extrabold text-[#7c7565] cursor-pointer select-none"
              >
                Chọn tất cả ({selectedItemIds.length}/{cart.length})
              </label>
            </div>
          )}
        </div>
        <button
          onClick={() => navigate("/products")}
          className="flex items-center gap-2 text-sm font-bold text-[#b84a25] hover:underline"
        >
          Tiếp tục mua sắm &rarr;
        </button>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Left Column - List of Items grouped by Shop */}
        <div className="space-y-6 lg:col-span-7">
          {Object.entries(groupedCart).map(([shopId, group]) => (
            <div 
              key={shopId} 
              className="overflow-hidden rounded-2xl border border-[#ebe2c8] bg-white shadow-sm hover:shadow-md transition-shadow duration-300"
            >
              {/* Shop Header */}
              <div className="bg-[#faf7e7] px-6 py-4 border-b border-[#ebe2c8] flex items-center justify-between gap-4">
                <div className="flex min-w-0 items-center gap-3">
                  <div 
                    onClick={() => handleToggleSelectShop(group.items)}
                    className="flex items-center gap-2 cursor-pointer group/shop"
                  >
                    <input
                      type="checkbox"
                      checked={group.items.every(item => selectedItemIds.includes(item.id))}
                      onChange={(e) => {
                        e.stopPropagation();
                        handleToggleSelectShop(group.items);
                      }}
                      className="h-5 w-5 rounded border-[#d8d0ba] accent-[#b84a25] cursor-pointer transition-all group-hover/shop:scale-105"
                    />
                    <span className="rounded bg-[#ffc28f] px-2 py-0.5 text-xs font-bold text-[#6c331b]">Shop</span>
                  </div>
                  <h3 className="truncate font-extrabold text-[#3d3a2c] hover:underline cursor-pointer" onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/shop/${shopId}`);
                  }}>
                    {group.shopName}
                  </h3>
                </div>
                <span className="flex shrink-0 items-center justify-end gap-1 text-right text-xs text-[#7c7565]">
                  <span>Phí vận chuyển tiệm này:</span>
                  <span className="inline-flex min-w-[92px] justify-end font-bold text-[#b84a25]">
                    {calculatingShip && selectedItemIds.some(itemId => group.items.some(item => item.id === itemId)) ? (
                      <span className="inline-flex items-center gap-1 text-xs font-normal text-[#9c927b]">
                        <Loader2 className="animate-spin" size={10} /> Đang tính...
                      </span>
                    ) : individualShippingFees[shopId] ? (
                      formatPrice(individualShippingFees[shopId])
                    ) : (
                      <span className="text-xs font-normal text-[#9c927b]">Chưa tính</span>
                    )}
                  </span>
                </span>
              </div>

              {/* Items List */}
              <div className="divide-y divide-[#faf7e7]">
                {group.items.map((item) => (
                  <div key={item.id} className="p-6 flex items-start gap-4 hover:bg-[#fffdf6] transition-colors duration-200">
                    <div 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleSelectItem(item.id);
                      }}
                      className="p-2 -m-2 mt-[22px] flex items-center justify-center cursor-pointer group/cb"
                    >
                      <input
                        type="checkbox"
                        checked={selectedItemIds.includes(item.id)}
                        onChange={(e) => {
                          e.stopPropagation();
                          handleToggleSelectItem(item.id);
                        }}
                        className="h-5 w-5 rounded border-[#d8d0ba] accent-[#b84a25] cursor-pointer transition-all duration-200 group-hover/cb:scale-110"
                      />
                    </div>
                    <div className="h-20 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-[#faf7e7] border border-[#ebe2c8]">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-full w-full object-cover"
                      />
                    </div>

                    <div className="flex flex-1 flex-col">
                      <div className="flex justify-between">
                        <h4 
                          className="font-bold text-[#3d3a2c] hover:text-[#b84a25] cursor-pointer line-clamp-1"
                          onClick={() => navigate(`/product/${item.id}`)}
                        >
                          {item.name}
                        </h4>
                        <button
                          onClick={() => handleRemoveItem(item.id)}
                          className="text-[#b84a25] hover:text-red-700 transition-colors p-1"
                          title="Xóa khỏi giỏ"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                      <div className="mt-3 flex items-center justify-between">
                        {/* Quantity controls */}
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1 border border-[#ebe2c8] rounded-xl p-1 bg-[#faf7e7]/60">
                            <button
                              onClick={() => handleUpdateQuantity(item.id, (item.quantity || 1) - 1)}
                              disabled={(item.quantity || 1) <= 1}
                              className="p-1 rounded-lg bg-white text-[#7c7565] hover:bg-[#ffc28f] hover:text-[#6c331b] transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-xs disabled:shadow-none"
                              title="Giảm số lượng"
                            >
                              <Minus size={14} />
                            </button>
                            
                            <span className="w-8 text-center text-xs font-extrabold text-[#3d3a2c] select-none">
                              {item.quantity || 1}
                            </span>
                            
                            <button
                              onClick={() => handleUpdateQuantity(item.id, (item.quantity || 1) + 1)}
                              disabled={(item.quantity || 1) >= (item.stockQuantity || 1)}
                              className="p-1 rounded-lg bg-white text-[#7c7565] hover:bg-[#ffc28f] hover:text-[#6c331b] transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-xs disabled:shadow-none"
                              title={(item.quantity || 1) >= (item.stockQuantity || 1) ? "Đạt giới hạn tồn kho" : "Tăng số lượng"}
                            >
                              <Plus size={14} />
                            </button>
                          </div>
                          
                          <span className="text-xs text-[#9c927b]">
                            {(item.stockQuantity || 1) <= 1 ? "Hàng độc bản" : `Còn lại: ${item.stockQuantity}`}
                          </span>
                        </div>

                        {/* Price information */}
                        <div className="text-right">
                          <span className="text-base font-black text-[#b84a25] block">
                            {formatPrice(item.price * (item.quantity || 1))}
                          </span>
                          {(item.quantity || 1) > 1 && (
                            <span className="text-[10px] text-[#9c927b] block">
                              Đơn giá: {formatPrice(item.price)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Right Column - Shipping Address Selector + Summary Order */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Section 1: Shipping Address */}
          <div className="rounded-2xl border border-[#ebe2c8] bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-lg font-bold text-[#3d3a2c]">
                <MapPin size={18} className="text-[#b84a25]" />
                Địa Chỉ Giao Hàng
              </h3>
              {user && (
                <button
                  onClick={() => setShowAddressForm(!showAddressForm)}
                  className="text-xs font-bold text-[#b84a25] hover:underline"
                >
                  {showAddressForm ? "Hủy bỏ" : "+ Thêm mới"}
                </button>
              )}
            </div>

            {!user ? (
              <div className="text-center py-4 rounded-xl bg-[#faf7e7] border border-dashed border-[#d8d0ba]">
                <p className="text-sm text-[#7c7565] mb-3">Vui lòng đăng nhập để chọn địa chỉ giao hàng.</p>
                <button
                  onClick={() => {
                    const storedHeader = document.querySelector("header");
                    if (storedHeader) {
                      const loginBtn = storedHeader.querySelector("button:last-child");
                      if (loginBtn && loginBtn.textContent === "Đăng nhập") {
                        loginBtn.click();
                      } else {
                        toastService.info("Vui lòng click Đăng nhập ở góc trên bên phải.");
                      }
                    }
                  }}
                  className="rounded-lg bg-[#b84a25] px-4 py-1.5 text-xs font-extrabold text-white hover:opacity-90 transition"
                >
                  Đăng nhập ngay
                </button>
              </div>
            ) : showAddressForm ? (
              // Add New Address Form
              <form onSubmit={handleSaveAddress} className="space-y-3 bg-[#faf7e7] p-4 rounded-xl border border-[#ebe2c8]">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-[#7c7565] mb-1">Họ và tên</label>
                    <input
                      type="text"
                      name="fullName"
                      value={addressForm.fullName}
                      onChange={handleAddressInputChange}
                      required
                      placeholder="Nguyễn Văn A"
                      className="w-full rounded-lg border border-[#ebe2c8] bg-white px-3 py-1.5 text-sm text-[#3d3a2c] focus:border-[#b84a25] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#7c7565] mb-1">Số điện thoại</label>
                    <input
                      type="text"
                      name="phone"
                      value={addressForm.phone}
                      onChange={handleAddressInputChange}
                      required
                      maxLength={10}
                      placeholder="0901234567"
                      className="w-full rounded-lg border border-[#ebe2c8] bg-white px-3 py-1.5 text-sm text-[#3d3a2c] focus:border-[#b84a25] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-xs font-bold text-[#7c7565] mb-1">Tỉnh/TP</label>
                    <div className="relative">
                      <select
                        value={selectedProvinceId}
                        onChange={handleProvinceChange}
                        required
                        className="w-full rounded-lg border border-[#ebe2c8] bg-white pl-3 pr-8 py-1.5 text-sm text-[#3d3a2c] focus:border-[#b84a25] focus:outline-none cursor-pointer appearance-none hover:border-[#b84a25]/40 transition duration-200"
                      >
                        <option value="">-- Chọn Tỉnh --</option>
                        {provinces.map(p => (
                          <option key={p.ProvinceID} value={p.ProvinceID}>
                            {p.ProvinceName}
                          </option>
                        ))}
                      </select>
                      <ChevronDown
                        size={14}
                        className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[#b84a25]"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#7c7565] mb-1">Quận/Huyện</label>
                    <div className="relative">
                      <select
                        value={selectedDistrictId}
                        onChange={handleDistrictChange}
                        disabled={!selectedProvinceId}
                        required
                        className="w-full rounded-lg border border-[#ebe2c8] bg-white pl-3 pr-8 py-1.5 text-sm text-[#3d3a2c] focus:border-[#b84a25] focus:outline-none cursor-pointer appearance-none hover:border-[#b84a25]/40 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <option value="">-- Chọn Huyện --</option>
                        {districts.map(d => (
                          <option key={d.DistrictID} value={d.DistrictID}>
                            {d.DistrictName}
                          </option>
                        ))}
                      </select>
                      <ChevronDown
                        size={14}
                        className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[#b84a25]"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#7c7565] mb-1">Phường/Xã</label>
                    <div className="relative">
                      <select
                        value={addressForm.wardCode || ""}
                        onChange={handleWardChange}
                        disabled={!selectedDistrictId}
                        required
                        className="w-full rounded-lg border border-[#ebe2c8] bg-white pl-3 pr-8 py-1.5 text-sm text-[#3d3a2c] focus:border-[#b84a25] focus:outline-none cursor-pointer appearance-none hover:border-[#b84a25]/40 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <option value="">-- Chọn Xã --</option>
                        {wards.map(w => (
                          <option key={w.WardCode} value={w.WardCode}>
                            {w.WardName}
                          </option>
                        ))}
                      </select>
                      <ChevronDown
                        size={14}
                        className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[#b84a25]"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#7c7565] mb-1">Địa chỉ chi tiết (Số nhà, đường...)</label>
                  <input
                    type="text"
                    name="addressDetail"
                    value={addressForm.addressDetail}
                    onChange={handleAddressInputChange}
                    required
                    placeholder="123 Lê Lợi"
                    className="w-full rounded-lg border border-[#ebe2c8] bg-white px-3 py-1.5 text-sm text-[#3d3a2c] focus:border-[#b84a25] focus:outline-none"
                  />
                </div>

                <div className="flex items-center gap-2.5">
                  <input
                    type="checkbox"
                    id="isDefault"
                    name="isDefault"
                    checked={addressForm.isDefault}
                    onChange={handleAddressInputChange}
                    className="h-5 w-5 rounded border-[#d8d0ba] accent-[#b84a25] cursor-pointer"
                  />
                  <label htmlFor="isDefault" className="text-xs text-[#7c7565] font-bold select-none cursor-pointer">Đặt làm mặc định</label>
                </div>

                <button
                  type="submit"
                  disabled={savingAddress}
                  className="w-full rounded-lg bg-[#b84a25] py-2 text-sm font-bold text-white hover:bg-[#a03e1e] transition disabled:opacity-50"
                >
                  {savingAddress ? "Đang lưu..." : "Lưu địa chỉ"}
                </button>
              </form>
            ) : addresses.length === 0 ? (
              <div className="text-center py-6 rounded-xl bg-[#faf7e7] border border-[#ebe2c8]">
                <p className="text-sm text-[#7c7565] mb-3">Bạn chưa có địa chỉ giao hàng nào.</p>
                <button
                  onClick={() => setShowAddressForm(true)}
                  className="rounded-lg bg-[#b84a25] px-4 py-1.5 text-xs font-extrabold text-white hover:opacity-90 transition"
                >
                  Tạo địa chỉ đầu tiên
                </button>
              </div>
            ) : (
              // Address Selector
              <div className="space-y-3">
                {addresses.map((addr) => (
                  <div
                    key={addr.id}
                    onClick={() => setSelectedAddressId(addr.id)}
                    className={`relative cursor-pointer rounded-xl border p-4 transition-all duration-200 ${
                      selectedAddressId === addr.id
                        ? "border-[#b84a25] bg-[#fffaf5] ring-1 ring-[#b84a25]"
                        : "border-[#ebe2c8] bg-white hover:bg-[#fffdfb]"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-[#3d3a2c]">{addr.fullName}</span>
                          <span className="text-xs text-[#7c7565]">| {addr.phone}</span>
                          {addr.isDefault && (
                            <span className="rounded-full bg-[#d9efc4] px-2 py-0.5 text-[10px] font-bold text-[#4c7d38]">
                              Mặc định
                            </span>
                          )}
                        </div>
                        <p className="mt-1 text-xs text-[#7c7565] leading-relaxed">
                          {addr.addressDetail}, {addr.ward}, {addr.district}, {addr.province}
                        </p>
                      </div>
                      
                      {selectedAddressId === addr.id && (
                        <div className="rounded-full bg-[#b84a25] p-0.5 text-white">
                          <Check size={12} />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section 2: Coupon wallet */}
          <div className="rounded-2xl border border-[#ebe2c8] bg-white p-5 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-[#3d3a2c]">
              <TicketPercent size={18} className="text-[#b84a25]" />
              <h3 className="font-bold">Mã giảm giá</h3>
            </div>

            <div className="flex gap-2">
              <div className="relative flex-1">
                <Tag size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9c927b]" />
                <input
                  value={couponCode}
                  onChange={(event) => setCouponCode(event.target.value.toUpperCase())}
                  onKeyDown={(event) => event.key === "Enter" && handleApplyCoupon()}
                  placeholder="Nhập mã giảm giá"
                  className="h-10 w-full rounded-xl border border-[#ded5bd] pl-9 pr-3 text-sm uppercase outline-none focus:border-[#b84a25]"
                />
              </div>
              <button
                type="button"
                onClick={() => handleApplyCoupon()}
                disabled={couponLoading}
                className="rounded-xl bg-[#3d3a2c] px-4 text-xs font-bold text-white disabled:opacity-50"
              >
                {couponLoading ? "Đang kiểm tra" : "Áp dụng"}
              </button>
            </div>

            {ownedCoupons.length > 0 && (
              <div>
                <p className="mb-2 text-xs font-semibold text-[#7c7565]">Mã hệ thống</p>
                <div className="max-h-44 space-y-2 overflow-y-auto pr-1">
                  {ownedCoupons.map((coupon) => (
                    <button
                      key={coupon.id}
                      type="button"
                      onClick={() => handleApplyCoupon(coupon.code, coupon)}
                      className={`flex w-full items-center justify-between rounded-xl border p-3 text-left transition ${
                        appliedCoupon?.code === coupon.code
                          ? "border-[#b84a25] bg-[#fff7ef]"
                          : "border-[#eee6d2] hover:border-[#d5b18e]"
                      }`}
                    >
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-[#b84a25]">{coupon.code}</p>
                        <p className="truncate text-xs text-[#7c7565]">{coupon.name}</p>
                      </div>
                      <span className="ml-3 shrink-0 text-[11px] font-semibold text-[#3d3a2c]">
                        {coupon.discountType === "PERCENTAGE"
                          ? `-${Number(coupon.discountValue)}%`
                          : `-${formatPrice(coupon.discountValue)}`}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {shopPromotions.length > 0 && (
              <div className="mt-4">
                <p className="mb-2 text-xs font-semibold text-[#7c7565]">Voucher từ tiệm</p>
                <div className="max-h-56 space-y-2 overflow-y-auto pr-1">
                  {shopPromotions.map((coupon) => {
                    const claimedItem = walletVouchers.find(item => item.promotion?.id === coupon.id);
                    const isClaimed = !!claimedItem;
                    
                    return (
                      <div
                        key={coupon.id}
                        className={`flex items-center justify-between rounded-xl border p-3 transition ${
                          appliedCoupon?.code === coupon.code
                            ? "border-[#b84a25] bg-[#fff7ef]"
                            : "border-[#eee6d2]"
                        }`}
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <p className="text-xs font-bold text-[#b84a25]">{coupon.code}</p>
                            <span className="text-[9px] px-1 bg-[#ffc28f]/30 text-[#6c331b] rounded-sm font-bold">
                              {coupon.shop?.name || "Tiệm"}
                            </span>
                          </div>
                          <p className="truncate text-xs text-[#7c7565] mt-0.5">{coupon.name}</p>
                          {coupon.minOrderValue > 0 && (
                            <p className="text-[10px] text-[#9c927b] mt-0.5">
                              Đơn tối thiểu: {formatPrice(coupon.minOrderValue)}
                            </p>
                          )}
                        </div>
                        
                        <div className="ml-3 flex shrink-0 items-center gap-3">
                          <span className="text-[11px] font-semibold text-[#3d3a2c]">
                            {coupon.discountType === "PERCENTAGE"
                              ? `-${Number(coupon.discountValue)}%`
                              : `-${formatPrice(coupon.discountValue)}`}
                          </span>
                          
                          {isClaimed ? (
                            <button
                              type="button"
                              onClick={() => handleApplyCoupon(coupon.code, coupon)}
                              className={`rounded-lg px-3 py-1.5 text-xs font-extrabold transition cursor-pointer ${
                                appliedCoupon?.code === coupon.code
                                  ? "bg-[#b84a25] text-white"
                                  : "bg-[#3d3a2c] text-white hover:opacity-95"
                              }`}
                            >
                              {appliedCoupon?.code === coupon.code ? "Đã dùng" : "Áp dụng"}
                            </button>
                          ) : (
                            <button
                              type="button"
                              disabled={claimingPromoId === coupon.id}
                              onClick={() => handleClaimPromotion(coupon.id)}
                              className="rounded-lg bg-[#ffc28f] px-3 py-1.5 text-xs font-extrabold text-[#6c331b] hover:bg-[#ffa960] transition cursor-pointer disabled:opacity-50"
                            >
                              Lưu mã
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Section 3: Summary Order */}
          <div className="rounded-2xl border border-[#ebe2c8] bg-white p-6 shadow-sm space-y-4">
            <h3 className="text-lg font-bold text-[#3d3a2c] border-b border-[#faf7e7] pb-2">
              Tổng kết đơn hàng
            </h3>

            <div className="space-y-2 text-sm text-[#7c7565]">
              <div className="flex justify-between">
                <span>Tạm tính:</span>
                <span className="font-semibold text-[#3d3a2c]">{formatPrice(subtotal)}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-[#2f7d32]">
                  <span>Giảm giá ({appliedCoupon?.code}):</span>
                  <span className="font-semibold">-{formatPrice(discountAmount)}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>Phí vận chuyển:</span>
                <span className="min-w-[92px] text-right font-semibold text-[#3d3a2c]">
                  {calculatingShip ? "Đang tính..." : formatPrice(shippingFee)}
                </span>
              </div>

              <div className="border-t border-[#faf7e7] pt-3">
                <div className="flex items-center justify-between text-base">
                  <span className="font-bold text-[#3d3a2c]">Tổng thanh toán:</span>
                  <span className="text-xl font-black text-[#b84a25]">{formatPrice(total)}</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleProceedToCheckout}
              disabled={selectedItems.length === 0 || calculatingShip}
              className="w-full rounded-xl bg-[#b84a25] py-3.5 text-sm font-extrabold text-white shadow-sm transition hover:bg-[#a03e1e] disabled:cursor-not-allowed disabled:opacity-50"
            >
              Thanh toán ({selectedItems.length})
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
