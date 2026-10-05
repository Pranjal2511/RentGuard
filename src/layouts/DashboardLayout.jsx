import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "../components/layout/Sidebar";
import Topbar from "../components/layout/Topbar";
import "./DashboardLayout.css";

// Map routes to readable titles for topbar
function getPageTitle(pathname) {
  if (pathname.includes("/tenant/dashboard")) return "Dashboard";
  if (pathname.includes("/tenant/move-in")) return "Move-In Report";
  if (pathname.includes("/tenant/move-out")) return "Move-Out";
  if (pathname.includes("/tenant/maintenance")) return "Maintenance";
  if (pathname.includes("/tenant/disputes")) return "Dispute Detail";
  if (pathname.includes("/landlord/dashboard")) return "Dashboard";
  if (pathname.includes("/landlord/confirmations")) return "Confirmations";
  if (pathname.includes("/property")) return "Property";
  if (pathname.includes("/notifications")) return "Notifications";
  if (pathname.includes("/documents")) return "Documents";
  return "RentGuard";
}

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const title = getPageTitle(location.pathname);

  return (
    <div className="dashboard-layout">
      <Sidebar mobileOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="dashboard-layout__main">
        <Topbar title={title} onMenuClick={() => setSidebarOpen(true)} />
        <main className="dashboard-layout__content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
