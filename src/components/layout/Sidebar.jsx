import { NavLink, useNavigate } from "react-router-dom";
import {
  Home,
  ClipboardList,
  ArrowLeftRight,
  Wrench,
  Scale,
  Bell,
  FileText,
  Building2,
  LogOut,
  ShieldCheck,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import "./Sidebar.css";

const tenantNav = [
  { to: "/tenant/dashboard", icon: Home, label: "Dashboard" },
  { to: "/tenant/move-in", icon: ClipboardList, label: "Move-In Report" },
  { to: "/tenant/move-out", icon: ArrowLeftRight, label: "Move-Out" },
  { to: "/tenant/maintenance", icon: Wrench, label: "Maintenance" },
  { to: "/tenant/disputes/disp-001", icon: Scale, label: "Disputes" },
  { to: "/notifications", icon: Bell, label: "Notifications" },
  { to: "/documents", icon: FileText, label: "Documents" },
];

const landlordNav = [
  { to: "/landlord/dashboard", icon: Home, label: "Dashboard" },
  { to: "/landlord/confirmations", icon: ClipboardList, label: "Confirmations" },
  { to: "/property/prop-001", icon: Building2, label: "Properties" },
  { to: "/notifications", icon: Bell, label: "Notifications" },
  { to: "/documents", icon: FileText, label: "Documents" },
];

export default function Sidebar({ mobileOpen, onClose }) {
  const { user, logout, switchRole } = useAuth();
  const navigate = useNavigate();
  const navItems = user?.role === "landlord" ? landlordNav : tenantNav;

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <>
      {mobileOpen && <div className="sidebar-overlay" onClick={onClose} />}
      <aside className={`sidebar ${mobileOpen ? "sidebar--open" : ""}`}>
        {/* Brand */}
        <div className="sidebar__brand">
          <ShieldCheck size={22} className="sidebar__brand-icon" />
          <span className="sidebar__brand-name">RentGuard</span>
        </div>

        {/* User info */}
        <div className="sidebar__user">
          <div className="sidebar__avatar">
            {user?.name?.[0] ?? "?"}
          </div>
          <div className="sidebar__user-info">
            <span className="sidebar__user-name">{user?.name}</span>
            <span className="sidebar__user-role">{user?.role}</span>
          </div>
        </div>

        <div className="sidebar__divider" />

        {/* Navigation */}
        <nav className="sidebar__nav">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `sidebar__nav-item ${isActive ? "sidebar__nav-item--active" : ""}`
              }
              onClick={onClose}
            >
              <Icon size={17} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar__spacer" />

        {/* Role switcher for prototype demo */}
        <div className="sidebar__role-switcher">
          <span className="sidebar__role-label">Demo: Switch role</span>
          <div className="sidebar__role-buttons">
            <button
              className={`sidebar__role-btn ${user?.role === "tenant" ? "sidebar__role-btn--active" : ""}`}
              onClick={() => { switchRole("tenant"); navigate("/tenant/dashboard"); }}
            >
              Tenant
            </button>
            <button
              className={`sidebar__role-btn ${user?.role === "landlord" ? "sidebar__role-btn--active" : ""}`}
              onClick={() => { switchRole("landlord"); navigate("/landlord/dashboard"); }}
            >
              Landlord
            </button>
          </div>
        </div>

        <div className="sidebar__divider" />

        {/* Logout */}
        <button className="sidebar__logout" onClick={handleLogout}>
          <LogOut size={16} />
          <span>Log Out</span>
        </button>
      </aside>
    </>
  );
}
