import ProductDetailPage from "./DetailProductPage/DetailProduct";
import ProductListPage from "./ProductListPage/ProductListPage";
import ShopPage from "./ShopPage/ShopPage";
import HomePage from "./HomePage/HomePage";
export const customerRoutes = [
  {
    index: true,
    element: <HomePage />,
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
];
