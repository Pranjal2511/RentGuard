import { Link } from "react-router-dom";
import { Compass, Home } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import Button from "../components/common/Button";
import "./NotFound.css";

export default function NotFound() {
  const { user } = useAuth();
  const dashboardPath = user?.role === "landlord" ? "/landlord/dashboard" : "/tenant/dashboard";

  return (
    <div className="not-found-page">
      <div className="not-found-card">
        <div className="not-found-icon-wrap">
          <Compass size={48} className="not-found-icon" />
        </div>

        <span className="not-found-code">404 Error</span>
        <h1 className="not-found-title">Page Not Found</h1>
        <p className="not-found-desc">
          The requested page does not exist or has been relocated. Let's get you back to your property dashboard.
        </p>

        <div className="not-found-actions">
          <Link to={dashboardPath}>
            <Button variant="primary">
              <Home size={16} />
              Return to Dashboard
            </Button>
          </Link>
          <Link to="/documents">
            <Button variant="outline">
              Browse Documents
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
