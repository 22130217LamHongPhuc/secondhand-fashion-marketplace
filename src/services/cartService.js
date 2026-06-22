const CART_KEY = "tucuchill_cart";
let listeners = [];

function emitChange() {
  const cart = cartService.getCart();
  listeners.forEach((listener) => {
    try {
      listener(cart);
    } catch (e) {
      console.error("Listener error", e);
    }
  });
}

export const cartService = {
  getCart() {
    try {
      const data = localStorage.getItem(CART_KEY);
      let cart = data ? JSON.parse(data) : [];
      let changed = false;
      cart = cart.map((item) => {
        if (item.price && item.price < 1000) {
          item.price = item.price * 1000;
          changed = true;
        }
        return item;
      });
      if (changed) {
        localStorage.setItem(CART_KEY, JSON.stringify(cart));
      }
      return cart;
    } catch (e) {
      console.error("Error reading cart", e);
      return [];
    }
  },

  saveCart(cart) {
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(cart));
      emitChange();
    } catch (e) {
      console.error("Error saving cart", e);
    }
  },

  addToCart(product) {
    // Check if it's their own product
    const userStr = localStorage.getItem("user");
    if (userStr) {
      const user = JSON.parse(userStr);
      const isOwnSeller = product.shop?.sellerId && user.userId && product.shop.sellerId === user.userId;
      const isOwnShop = product.shopId && user.shopId && product.shopId === user.shopId;
      if (isOwnSeller || isOwnShop) {
        return { success: false, message: "Bạn không thể mua sản phẩm của chính mình!" };
      }
    }

    const cart = this.getCart();
    
    // Check if product already exists in cart
    const existingIndex = cart.findIndex((item) => item.id === product.id);
    if (existingIndex !== -1) {
      const existingItem = cart[existingIndex];
      const maxQty = existingItem.stockQuantity ?? 1;
      if (existingItem.quantity < maxQty) {
        existingItem.quantity += 1;
        this.saveCart(cart);
        return { success: true, message: "Đã tăng số lượng sản phẩm trong giỏ hàng!" };
      } else {
        return { 
          success: false, 
          message: maxQty <= 1 
            ? "Sản phẩm độc bản này đã có trong giỏ hàng!" 
            : "Sản phẩm đã đạt số lượng tối đa trong kho!" 
        };
      }
    }

    // Resolve price
    const priceStr = product.salePrice || product.basePrice || product.price;
    let price = 0;
    if (typeof priceStr === "number") {
      price = priceStr;
    } else if (typeof priceStr === "string") {
      price = parseFloat(priceStr.replace(/[^0-9]/g, ""));
    }

    const image = product.images?.[0]?.url || product.imageUrl || product.image || "https://placehold.co/400x500?text=Product";

    const cartItem = {
      id: product.id,
      name: product.name || product.title,
      price: price,
      image: image,
      shopId: product.shop?.id || product.shopId,
      shopName: product.shop?.name || product.shopName || "Tiệm cũ",
      quantity: 1,
      stockQuantity: product.stockQuantity ?? 1,
    };

    cart.push(cartItem);
    this.saveCart(cart);
    return { success: true, message: "Đã thêm vào giỏ hàng!" };
  },

  removeFromCart(productId) {
    let cart = this.getCart();
    cart = cart.filter((item) => item.id !== productId);
    this.saveCart(cart);
  },

  updateQuantity(productId, quantity) {
    const cart = this.getCart();
    const item = cart.find((item) => item.id === productId);
    if (item) {
      const maxQty = item.stockQuantity ?? 1;
      item.quantity = Math.max(1, Math.min(quantity, maxQty));
      this.saveCart(cart);
    }
  },

  clearCart() {
    this.saveCart([]);
  },

  subscribe(listener) {
    listeners.push(listener);
    return () => {
      listeners = listeners.filter((l) => l !== listener);
    };
  },
};
