import { useRoutes } from "react-router-dom";
import { routes } from "@/routes";
import "./App.css";
import SellerRoutes from "@/pages/seller/routes/SellerRoutes";
function App() {
  const element = useRoutes([
    ...routes,
    {
      path: "/seller/*",
      element: <SellerRoutes />
    }
  ]);

  return element;
}

export default App;