import ProductDetailPage from "./DetailProductPage/DetailProduct";
import ProductListPage from "./ProductListPage/ProductListPage";
import ShopPage from "./ShopPage/ShopPage";
import ShopsPage from "./ShopsPage/ShopsPage";
import HomePage from "./HomePage/HomePage";
import ImageSearchPage from "./ImageSearchPage/ImageSearchPage";
export const customerRoutes = [
  {
    index: true,
    element: <HomePage />,
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
