import { Menu, Bell } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./Topbar.css";

export default function Topbar({ onMenuClick, title }) {
  const { user } = useAuth();

  return (
    <header className="topbar">
      <button className="topbar__menu-btn" onClick={onMenuClick} aria-label="Open menu">
        <Menu size={20} />
      </button>

      <div className="topbar__title">{title}</div>

      <div className="topbar__actions">
        <Link to="/notifications" className="topbar__icon-btn" aria-label="Notifications">
          <Bell size={18} />
        </Link>
        <div className="topbar__avatar">
          {user?.name?.[0] ?? "?"}
        </div>
      </div>
    </header>
  );
}
