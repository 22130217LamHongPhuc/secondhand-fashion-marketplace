import ProductDetailPage from "./DetailProductPage/DetailProduct";
import ProductListPage from "./ProductListPage/ProductListPage";
import ShopPage from "./ShopPage/ShopPage";

export const customerRoutes = [
  {
    path: "product/:id",
    element: <ProductDetailPage />,
  },
  {
    path: "products",
    element: <ProductListPage />,
  },
  {
    path: "shop/:id",
    element: <ShopPage />,
  },
];
