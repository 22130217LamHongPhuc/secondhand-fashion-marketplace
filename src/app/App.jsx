import { useRoutes } from "react-router-dom";
import { routes } from "@/routes";
import "./App.css";
import SellerRoutes from "@/pages/seller/routes/SellerRoutes";
import { Toaster } from "react-hot-toast";
import { toasterProps } from "@/services/toastService";

function App() {
  const element = useRoutes([
    ...routes,
    {
      path: "/seller/*",
      element: <SellerRoutes />
    }
  ]);

  return (
    <>
      {element}
      <Toaster {...toasterProps} />
    </>
  );
}

export default App;