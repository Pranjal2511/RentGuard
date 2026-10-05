import { Outlet } from "react-router-dom";
import { ShieldCheck } from "lucide-react";
import "./AuthLayout.css";

export default function AuthLayout() {
  return (
    <div className="auth-layout">
      <div className="auth-layout__panel">
        <div className="auth-layout__brand">
          <ShieldCheck size={28} />
          <span>RentGuard</span>
        </div>
        <Outlet />
      </div>
      <div className="auth-layout__visual">
        <div className="auth-layout__visual-content">
          <h2>Protect your rental,<br />every step of the way.</h2>
          <p>Document your home from day one. Resolve disputes fairly.</p>
        </div>
      </div>
    </div>
  );
}
