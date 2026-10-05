import { useState } from "react";
import { User, Bell, Shield, Check } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import Button from "../../components/common/Button";
import "./Settings.css";

export default function Settings() {
  const { user } = useAuth();
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [disputeNotifs, setDisputeNotifs] = useState(true);
  const [maintenanceNotifs, setMaintenanceNotifs] = useState(true);
  const [saved, setSaved] = useState(false);

  function handleSave(e) {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <div className="settings-page">
      <div className="settings-header">
        <h1 className="settings-title">Account & Preferences</h1>
        <p className="settings-subtitle">
          Manage your personal information, notification settings, and security preferences.
        </p>
      </div>

      {saved && (
        <div className="settings-alert">
          <Check size={16} />
          <span>Preferences updated successfully.</span>
        </div>
      )}

      <div className="settings-grid">
        {/* Profile Info */}
        <section className="settings-card">
          <div className="settings-card__header">
            <User size={20} className="settings-card__icon" />
            <div>
              <h2 className="settings-card__title">Profile Information</h2>
              <p className="settings-card__desc">Your personal account details</p>
            </div>
          </div>

          <div className="settings-form">
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                className="form-input"
                defaultValue={user?.name || ""}
                disabled
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                className="form-input"
                defaultValue={user?.email || ""}
                disabled
              />
            </div>

            <div className="form-group">
              <label className="form-label">Active Role</label>
              <input
                type="text"
                className="form-input"
                defaultValue={user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : ""}
                disabled
              />
            </div>
          </div>
        </section>

        {/* Notifications Settings */}
        <section className="settings-card">
          <div className="settings-card__header">
            <Bell size={20} className="settings-card__icon" />
            <div>
              <h2 className="settings-card__title">Notification Preferences</h2>
              <p className="settings-card__desc">Choose what updates you receive</p>
            </div>
          </div>

          <form onSubmit={handleSave} className="settings-toggles">
            <label className="settings-toggle-row">
              <div>
                <span className="toggle-title">Email Notifications</span>
                <p className="toggle-desc">Receive critical tenancy updates in your inbox</p>
              </div>
              <input
                type="checkbox"
                checked={emailAlerts}
                onChange={(e) => setEmailAlerts(e.target.checked)}
                className="toggle-checkbox"
              />
            </label>

            <label className="settings-toggle-row">
              <div>
                <span className="toggle-title">Dispute Updates</span>
                <p className="toggle-desc">Immediate alerts when a dispute response or deduction is filed</p>
              </div>
              <input
                type="checkbox"
                checked={disputeNotifs}
                onChange={(e) => setDisputeNotifs(e.target.checked)}
                className="toggle-checkbox"
              />
            </label>

            <label className="settings-toggle-row">
              <div>
                <span className="toggle-title">Maintenance Milestones</span>
                <p className="toggle-desc">Progress updates when maintenance issues change status</p>
              </div>
              <input
                type="checkbox"
                checked={maintenanceNotifs}
                onChange={(e) => setMaintenanceNotifs(e.target.checked)}
                className="toggle-checkbox"
              />
            </label>

            <div className="settings-actions">
              <Button type="submit" variant="primary">
                Save Preferences
              </Button>
            </div>
          </form>
        </section>

        {/* Security Info */}
        <section className="settings-card">
          <div className="settings-card__header">
            <Shield size={20} className="settings-card__icon" />
            <div>
              <h2 className="settings-card__title">Security & Verification</h2>
              <p className="settings-card__desc">Evidence verification cryptographic status</p>
            </div>
          </div>

          <p className="settings-security-text">
            All photos and reports submitted to RentGuard are stamped with tamper-evident metadata and stored securely.
          </p>
        </section>
      </div>
    </div>
  );
}
