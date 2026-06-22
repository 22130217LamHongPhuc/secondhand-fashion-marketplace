import { useState, useEffect } from "react";
import { Trash2, ShoppingBag, Plus, Minus, Check, MapPin, ChevronDown } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { cartService } from "@/services/cartService";
import { toastService } from "@/services/toastService";
import { userService } from "@/services/user";

export default function CartPage() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [cart, setCart] = useState([]);
  const [user, setUser] = useState(null);
  const [selectedItemIds, setSelectedItemIds] = useState([]);
  const [hasInitializedSelection, setHasInitializedSelection] = useState(false);

  // Address states
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addressForm, setAddressForm] = useState({
    fullName: "",
    phone: "",
    province: "",
    district: "",
    ward: "",
    addressDetail: "",
    isDefault: false
  });
  const [savingAddress, setSavingAddress] = useState(false);

  // vAPI states for dynamic Vietnam provinces/districts/wards selection
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
      const res = await fetch("https://provinces.open-api.vn/api/p/");
      const data = await res.json();
      setProvinces(data || []);
    } catch (e) {
      console.error("Error fetching provinces", e);
    }
  };

  const handleProvinceChange = async (e) => {
    const provinceId = e.target.value;
    setSelectedProvinceId(provinceId);
    setSelectedDistrictId("");
    setDistricts([]);
    setWards([]);
    
    const prov = provinces.find(p => String(p.code) === String(provinceId));
    setAddressForm(prev => ({
      ...prev,
      province: prov ? prov.name : "",
      district: "",
      ward: ""
    }));

    if (provinceId) {
      try {
        const res = await fetch(`https://provinces.open-api.vn/api/p/${provinceId}?depth=2`);
        const data = await res.json();
        setDistricts(data.districts || []);
      } catch (err) {
        console.error("Error fetching districts", err);
      }
    }
  };

  const handleDistrictChange = async (e) => {
    const districtId = e.target.value;
    setSelectedDistrictId(districtId);
    setWards([]);

    const dist = districts.find(d => String(d.code) === String(districtId));
    setAddressForm(prev => ({
      ...prev,
      district: dist ? dist.name : "",
      ward: ""
    }));

    if (districtId) {
      try {
        const res = await fetch(`https://provinces.open-api.vn/api/d/${districtId}?depth=2`);
        const data = await res.json();
        setWards(data.wards || []);
      } catch (err) {
        console.error("Error fetching wards", err);
      }
    }
  };

  const handleWardChange = (e) => {
    const wardId = e.target.value;
    const wrd = wards.find(w => String(w.code) === String(wardId));
    setAddressForm(prev => ({
      ...prev,
      ward: wrd ? wrd.name : ""
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
          district: "",
          ward: "",
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
  const groupedCart = cart.reduce((groups, item) => {
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

  // Derive selected items
  const selectedItems = cart.filter(item => selectedItemIds.includes(item.id));

  // Group selected items by shop
  const groupedSelectedCart = selectedItems.reduce((groups, item) => {
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

  const selectedShopsCount = Object.keys(groupedSelectedCart).length;
  
  // Calculate subtotal for selected items only
  const subtotal = selectedItems.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);
  
  // Phí vận chuyển: 30.000đ per shop that has selected items
  const shippingFee = selectedShopsCount * 30000;
  
  // Total payment
  const total = subtotal + shippingFee;

  // Format currency
  const formatPrice = (value) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND"
    }).format(value);
  };

  const handleProceedToCheckout = () => {
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

    const selectedAddress = addresses.find(addr => addr.id === selectedAddressId);

    navigate("/checkout", { state: { selectedItems, selectedAddress } });
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
              <div className="bg-[#faf7e7] px-6 py-4 border-b border-[#ebe2c8] flex items-center justify-between">
                <div className="flex items-center gap-3">
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
                  <h3 className="font-extrabold text-[#3d3a2c] hover:underline cursor-pointer" onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/shop/${shopId}`);
                  }}>
                    {group.shopName}
                  </h3>
                </div>
                <span className="text-xs text-[#7c7565]">
                  Phí vận chuyển tiệm này: <span className="font-bold text-[#b84a25]">30.000 đ</span>
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
                          <option key={p.code} value={p.code}>
                            {p.name}
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
                          <option key={d.code} value={d.code}>
                            {d.name}
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
                        value={wards.find(w => w.name === addressForm.ward)?.code || ""}
                        onChange={handleWardChange}
                        disabled={!selectedDistrictId}
                        required
                        className="w-full rounded-lg border border-[#ebe2c8] bg-white pl-3 pr-8 py-1.5 text-sm text-[#3d3a2c] focus:border-[#b84a25] focus:outline-none cursor-pointer appearance-none hover:border-[#b84a25]/40 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <option value="">-- Chọn Xã --</option>
                        {wards.map(w => (
                          <option key={w.code} value={w.code}>
                            {w.name}
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

          {/* Section 2: Summary Order */}
          <div className="rounded-2xl border border-[#ebe2c8] bg-white p-6 shadow-sm space-y-4">
            <h3 className="text-lg font-bold text-[#3d3a2c] border-b border-[#faf7e7] pb-2">
              Tổng kết đơn hàng
            </h3>

            <div className="space-y-2 text-sm text-[#7c7565]">
              <div className="flex justify-between">
                <span>Tạm tính:</span>
                <span className="font-semibold text-[#3d3a2c]">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>
                  Phí vận chuyển ({selectedShopsCount} Tiệm):
                </span>
                <span className="font-semibold text-[#3d3a2c]">{formatPrice(shippingFee)}</span>
              </div>
              
              <div className="border-t border-[#faf7e7] pt-3 flex justify-between items-end">
                <span className="font-extrabold text-base text-[#3d3a2c]">Tổng cộng:</span>
                <div className="text-right">
                  <span className="text-xl font-black text-[#b84a25] block">
                    {formatPrice(total)}
                  </span>
                  <span className="text-[10px] text-[#9c927b] block">(Đã bao gồm VAT và phí ship)</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleProceedToCheckout}
              disabled={selectedItems.length === 0 || !selectedAddressId}
              className="w-full flex items-center justify-center gap-2 h-14 rounded-xl bg-[#c04f25] font-extrabold text-white shadow-sm transition hover:bg-[#a9411d] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              Thanh toán
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
