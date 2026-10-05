import StatusBadge from "../common/StatusBadge";
import { formatDate, formatRelativeDate } from "../../utils/formatters";
import { MessageCircle } from "lucide-react";
import "./MaintenanceItem.css";

export default function MaintenanceItem({ issue, onClick }) {
  function handleKeyDown(e) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onClick?.();
    }
  }

  return (
    <div
      className="maintenance-item"
      onClick={onClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      id={`maint-${issue.id}`}
      aria-label={`View details for ${issue.title}`}
    >
      <div className="maintenance-item__header">
        <div className="maintenance-item__title-row">
          <span className="maintenance-item__title">{issue.title}</span>
          <div className="maintenance-item__badges">
            <StatusBadge status={issue.priority} />
            <StatusBadge status={issue.status} />
          </div>
        </div>
        <span className="maintenance-item__category">{issue.category}</span>
      </div>

      <p className="maintenance-item__desc">{issue.description}</p>

      <div className="maintenance-item__footer">
        <span className="maintenance-item__date">Reported {formatRelativeDate(issue.reportedAt)}</span>
        {issue.comments?.length > 0 && (
          <span className="maintenance-item__comments">
            <MessageCircle size={13} />
            {issue.comments.length} comment{issue.comments.length !== 1 ? "s" : ""}
          </span>
        )}
        {issue.status === "resolved" && issue.resolvedAt && (
          <span className="maintenance-item__resolved">Resolved {formatDate(issue.resolvedAt)}</span>
        )}
      </div>
    </div>
  );
}
