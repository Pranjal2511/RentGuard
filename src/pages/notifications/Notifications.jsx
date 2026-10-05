import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Bell,
  Scale,
  Wrench,
  Building2,
  FileText,
  CheckCheck,
  ArrowRight,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { getNotifications, markNotificationRead, markAllNotificationsRead } from "../../services/api";
import { formatRelativeDate } from "../../utils/formatters";
import LoadingState from "../../components/common/LoadingState";
import EmptyState from "../../components/common/EmptyState";
import Button from "../../components/common/Button";
import "./Notifications.css";

const NOTIF_ICONS = {
  dispute: Scale,
  maintenance: Wrench,
  lease: Building2,
  document: FileText,
};

export default function Notifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // "all" | "unread"
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError("");
      try {
        const data = await getNotifications();
        setNotifications(data || []);
      } catch (err) {
        console.error("Failed to load notifications:", err);
        setError("Unable to load notifications. Please try again.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function handleMarkRead(id) {
    try {
      await markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
    } catch (err) {
      console.error("Failed to mark notification read:", err);
    }
  }

  async function handleMarkAllRead() {
    try {
      await markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (err) {
      console.error("Failed to mark all notifications read:", err);
    }
  }

  const unreadCount = notifications.filter((n) => !n.read).length;

  const filteredNotifications = notifications.filter((n) => {
    if (filter === "unread") return !n.read;
    return true;
  });

  // Resolve valid role-aware destination link
  function resolveNotifLink(link) {
    if (!link) return null;
    if (user?.role === "landlord") {
      if (link.startsWith("/tenant/disputes")) {
        return "/landlord/confirmations";
      }
      if (link.startsWith("/tenant/maintenance")) {
        return "/landlord/dashboard";
      }
    }
    return link;
  }

  if (loading) return <LoadingState message="Loading notifications…" />;

  return (
    <div className="notifications-page">
      {/* Header */}
      <div className="notifications-header">
        <div>
          <div className="notifications-header__title-row">
            <h1 className="notifications-title">Notifications</h1>
            {unreadCount > 0 && (
              <span className="notifications-count-badge">
                {unreadCount} unread
              </span>
            )}
          </div>
          <p className="notifications-subtitle">
            Stay updated with disputes, maintenance milestones, and lease notices.
          </p>
        </div>

        {unreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleMarkAllRead}
            className="notifications-mark-all"
            id="mark-all-read-btn"
          >
            <CheckCheck size={16} />
            Mark all as read
          </Button>
        )}
      </div>

      {error && <div className="notifications-error-banner">{error}</div>}

      {/* Filter Tabs */}
      <div className="notifications-tabs">
        <button
          className={`notif-tab ${filter === "all" ? "notif-tab--active" : ""}`}
          onClick={() => setFilter("all")}
          id="notif-tab-all"
        >
          All Activity ({notifications.length})
        </button>
        <button
          className={`notif-tab ${filter === "unread" ? "notif-tab--active" : ""}`}
          onClick={() => setFilter("unread")}
          id="notif-tab-unread"
        >
          Unread ({unreadCount})
        </button>
      </div>

      {/* List */}
      <div className="notifications-list">
        {filteredNotifications.length === 0 ? (
          <EmptyState
            icon={Bell}
            title={filter === "unread" ? "No unread notifications" : "No notifications yet"}
            description={
              filter === "unread"
                ? "You're all caught up with your tenancy updates!"
                : "You will receive updates here whenever there is activity on your property."
            }
          />
        ) : (
          filteredNotifications.map((notif) => {
            const Icon = NOTIF_ICONS[notif.type] || Bell;
            const validLink = resolveNotifLink(notif.link);

            return (
              <div
                key={notif.id}
                className={`notif-card ${!notif.read ? "notif-card--unread" : ""}`}
                id={`notif-${notif.id}`}
              >
                <div className={`notif-card__icon notif-card__icon--${notif.type}`}>
                  <Icon size={18} />
                </div>

                <div className="notif-card__body">
                  <div className="notif-card__header">
                    <span className="notif-card__title">{notif.title}</span>
                    <span className="notif-card__time">
                      {formatRelativeDate(notif.createdAt)}
                    </span>
                  </div>
                  <p className="notif-card__text">{notif.body}</p>

                  <div className="notif-card__footer">
                    {validLink && (
                      <Link
                        to={validLink}
                        className="notif-card__action"
                        onClick={() => handleMarkRead(notif.id)}
                      >
                        <span>View details</span>
                        <ArrowRight size={13} />
                      </Link>
                    )}
                    {!notif.read && (
                      <button
                        type="button"
                        className="notif-card__mark-btn"
                        onClick={() => handleMarkRead(notif.id)}
                        aria-label="Mark notification as read"
                      >
                        Mark as read
                      </button>
                    )}
                  </div>
                </div>

                {!notif.read && (
                  <div className="notif-card__unread-dot" title="Unread notification" />
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
