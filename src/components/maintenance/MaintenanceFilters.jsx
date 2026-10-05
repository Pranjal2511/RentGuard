import "./MaintenanceFilters.css";

const STATUS_FILTERS = ["all", "open", "in_progress", "resolved"];
const PRIORITY_FILTERS = ["all", "high", "medium", "low"];

export default function MaintenanceFilters({ status, priority, onStatusChange, onPriorityChange }) {
  return (
    <div className="maintenance-filters">
      <div className="filter-group">
        <span className="filter-group__label">Status</span>
        <div className="filter-pills">
          {STATUS_FILTERS.map((s) => (
            <button
              key={s}
              className={`filter-pill ${status === s ? "filter-pill--active" : ""}`}
              onClick={() => onStatusChange(s)}
              id={`filter-status-${s}`}
            >
              {s === "all" ? "All" : s === "in_progress" ? "In Progress" : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="filter-group">
        <span className="filter-group__label">Priority</span>
        <div className="filter-pills">
          {PRIORITY_FILTERS.map((p) => (
            <button
              key={p}
              className={`filter-pill ${priority === p ? "filter-pill--active" : ""}`}
              onClick={() => onPriorityChange(p)}
              id={`filter-priority-${p}`}
            >
              {p === "all" ? "All" : p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
