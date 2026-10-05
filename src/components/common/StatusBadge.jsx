import "./StatusBadge.css";

const statusConfig = {
  // Dispute / deduction statuses
  disputed: { label: "Disputed", className: "badge--disputed" },
  pending: { label: "Pending", className: "badge--pending" },
  confirmed: { label: "Confirmed", className: "badge--confirmed" },
  resolved: { label: "Resolved", className: "badge--confirmed" },

  // Maintenance statuses
  open: { label: "Open", className: "badge--disputed" },
  in_progress: { label: "In Progress", className: "badge--pending" },

  // Condition (consistent 3 states)
  good: { label: "Good", className: "badge--confirmed" },
  fair: { label: "Fair", className: "badge--pending" },
  damaged: { label: "Damaged", className: "badge--disputed" },

  // Lease
  active: { label: "Active", className: "badge--confirmed" },
  vacant: { label: "Vacant", className: "badge--pending" },
  expired: { label: "Expired", className: "badge--disputed" },

  // Priority
  high: { label: "High", className: "badge--disputed" },
  medium: { label: "Medium", className: "badge--pending" },
  low: { label: "Low", className: "badge--muted" },
};

export default function StatusBadge({ status }) {
  const config = statusConfig[status] || { label: status, className: "badge--muted" };
  return <span className={`badge ${config.className}`}>{config.label}</span>;
}
