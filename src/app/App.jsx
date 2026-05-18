import { useRoutes } from "react-router-dom";
import { routes } from "@/routes";
import SellerRoutes from "@/modules/seller/routes/SellerRoutes";
import "./App.css";
import { Navigate } from "react-router-dom";
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