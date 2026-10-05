import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import ProtectedRoute from "./ProtectedRoute";

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
import DisputesList from "../pages/tenant/DisputesList";
import DisputeDetail from "../pages/tenant/DisputeDetail";

// Landlord Pages
import LandlordDashboard from "../pages/landlord/LandlordDashboard";
import LandlordConfirmation from "../pages/landlord/LandlordConfirmation";
import LandlordProperties from "../pages/landlord/LandlordProperties";

// Shared Pages
import PropertyLeaseDetail from "../pages/property/PropertyLeaseDetail";
import Notifications from "../pages/notifications/Notifications";
import Documents from "../pages/documents/Documents";
import Settings from "../pages/settings/Settings";
import NotFound from "../pages/NotFound";

function HomeRedirect() {
  const { user, isAuthenticated } = useAuth();
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }
  if (user.role === "landlord") {
    return <Navigate to="/landlord/dashboard" replace />;
  }
  return <Navigate to="/tenant/dashboard" replace />;
}

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public Auth Routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
      </Route>

      {/* Main Authenticated Dashboard Layout */}
      <Route element={<DashboardLayout />}>
        {/* General Authenticated Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<HomeRedirect />} />
          <Route path="/property/:propertyId" element={<PropertyLeaseDetail />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/documents" element={<Documents />} />
          <Route path="/settings" element={<Settings />} />
        </Route>

        {/* Tenant-Only Routes */}
        <Route element={<ProtectedRoute allowedRoles={["tenant"]} />}>
          <Route path="/tenant/dashboard" element={<TenantDashboard />} />
          <Route path="/tenant/move-in" element={<MoveInReport />} />
          <Route path="/tenant/move-out" element={<MoveOutComparison />} />
          <Route path="/tenant/maintenance" element={<MaintenanceIssues />} />
          <Route path="/tenant/disputes" element={<DisputesList />} />
          <Route path="/tenant/disputes/:disputeId" element={<DisputeDetail />} />
        </Route>

        {/* Landlord-Only Routes */}
        <Route element={<ProtectedRoute allowedRoles={["landlord"]} />}>
          <Route path="/landlord/dashboard" element={<LandlordDashboard />} />
          <Route path="/landlord/confirmations" element={<LandlordConfirmation />} />
          <Route path="/landlord/properties" element={<LandlordProperties />} />
          <Route path="/landlord/properties/:propertyId" element={<PropertyLeaseDetail />} />
        </Route>

        {/* 404 Route */}
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
