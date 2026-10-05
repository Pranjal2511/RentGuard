import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Layouts
import DashboardLayout from "../layouts/DashboardLayout";
import AuthLayout from "../layouts/AuthLayout";

// Auth Pages
import Login from "../pages/auth/Login";
import Signup from "../pages/auth/Signup";

// Tenant Pages
import TenantDashboard from "../pages/tenant/TenantDashboard";
import MoveInReport from "../pages/tenant/MoveInReport";
import MoveOutComparison from "../pages/tenant/MoveOutComparison";
import MaintenanceIssues from "../pages/tenant/MaintenanceIssues";
import DisputeDetail from "../pages/tenant/DisputeDetail";

// Landlord Pages
import LandlordDashboard from "../pages/landlord/LandlordDashboard";
import LandlordConfirmation from "../pages/landlord/LandlordConfirmation";

// Shared Pages
import PropertyLeaseDetail from "../pages/property/PropertyLeaseDetail";
import Notifications from "../pages/notifications/Notifications";
import Documents from "../pages/documents/Documents";
import NotFound from "../pages/NotFound";

function HomeRedirect() {
  const { user } = useAuth();
  if (user?.role === "landlord") {
    return <Navigate to="/landlord/dashboard" replace />;
  }
  return <Navigate to="/tenant/dashboard" replace />;
}

export default function AppRoutes() {
  return (
    <Routes>
      {/* Auth Routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
      </Route>

      {/* Main App Routes (Dashboard Layout) */}
      <Route element={<DashboardLayout />}>
        <Route path="/" element={<HomeRedirect />} />

        {/* Tenant Routes */}
        <Route path="/tenant/dashboard" element={<TenantDashboard />} />
        <Route path="/tenant/move-in" element={<MoveInReport />} />
        <Route path="/tenant/move-out" element={<MoveOutComparison />} />
        <Route path="/tenant/maintenance" element={<MaintenanceIssues />} />
        <Route path="/tenant/disputes/:disputeId" element={<DisputeDetail />} />

        {/* Landlord Routes */}
        <Route path="/landlord/dashboard" element={<LandlordDashboard />} />
        <Route path="/landlord/confirmations" element={<LandlordConfirmation />} />

        {/* Property & Shared Details */}
        <Route path="/property/:propertyId" element={<PropertyLeaseDetail />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/documents" element={<Documents />} />

        {/* 404 Route */}
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
