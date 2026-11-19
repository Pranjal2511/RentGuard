export function formatDate(dateStr, options = {}) {
  if (!dateStr) return "—";
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
    ...options,
  });
}

export function formatCurrency(amount) {
  if (amount == null) return "—";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatRelativeDate(dateStr) {
  if (!dateStr) return "—";
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now - date;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
  return `${Math.floor(diffDays / 365)} years ago`;
}

export const CONDITIONS = ["good", "fair", "damaged"];

export function conditionLabel(condition) {
  const labels = {
    good: "Good",
    fair: "Fair",
    damaged: "Damaged",
  };
  return labels[condition] || condition;
}

export function priorityLabel(priority) {
  const labels = { high: "High", medium: "Medium", low: "Low" };
  return labels[priority] || priority;
}
