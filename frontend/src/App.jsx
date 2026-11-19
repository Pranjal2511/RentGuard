import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { PropertyProvider } from "./context/PropertyContext";
import AppRoutes from "./routes/AppRoutes";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <PropertyProvider>
          <AppRoutes />
        </PropertyProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
