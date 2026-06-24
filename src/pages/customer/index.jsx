import ProductDetailPage from "./DetailProductPage/DetailProduct";
import ProductListPage from "./ProductListPage/ProductListPage";
import ShopPage from "./ShopPage/ShopPage";
import ShopsPage from "./ShopsPage/ShopsPage";
import HomePage from "./HomePage/HomePage";
import ImageSearchPage from "./ImageSearchPage/ImageSearchPage";
import OrderDetailPage from "./OrderHistoryPage/OrderDetailPage";
import OrderHistoryPage from "./OrderHistoryPage/OrderHistoryPage";
import CreateStorePage from "../seller/pages/Store/CreateStorePage";
import { Profile } from "../user/pages/Profile";
import CartPage from "./CartPage";
import CheckoutPage from "./CheckoutPage";

export const customerRoutes = [
  {
    index: true,
    element: <HomePage />,
  },
  {
    path: "profile",
    element: <Profile />,
  },
  {
    path: "shops",
    element: <ShopsPage />,
  },
  {
    path: "image-search",
    element: <ImageSearchPage />,
  },
  {
    path: "orders",
    element: <OrderHistoryPage />,
  },
  {
    path: "orders/:orderId",
    element: <OrderDetailPage />,
  },
  {
    path: "products",
    element: <ProductListPage />,
  },
  {
    path: "product/:id",
    element: <ProductDetailPage />,
  },
  {
    path: "shop/:id",
    element: <ShopPage />,
  },
  {
    path: "regis-shop",
    element: <CreateStorePage />,
  },
  {
    path: "cart",
    element: <CartPage />,
  },
  {
    path: "checkout",
    element: <CheckoutPage />,
  },
];
