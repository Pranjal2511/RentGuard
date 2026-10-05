import { useState, useEffect } from "react";
import { Wrench, Plus } from "lucide-react";
import { useProperty } from "../../context/PropertyContext";
import { useAuth } from "../../context/AuthContext";
import { getMaintenanceIssues, createMaintenanceIssue, addMaintenanceComment } from "../../services/api";
import MaintenanceItem from "../../components/maintenance/MaintenanceItem";
import MaintenanceFilters from "../../components/maintenance/MaintenanceFilters";
import Modal from "../../components/common/Modal";
import Button from "../../components/common/Button";
import LoadingState from "../../components/common/LoadingState";
import EmptyState from "../../components/common/EmptyState";
import StatusBadge from "../../components/common/StatusBadge";
import { formatDate } from "../../utils/formatters";
import "./MaintenanceIssues.css";

const CATEGORIES = ["plumbing", "electrical", "structural", "appliances", "pest", "general"];
const PRIORITIES = ["high", "medium", "low"];

export default function MaintenanceIssues() {
  const { activeProperty } = useProperty();
  const { user } = useAuth();
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filters
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");

  // Detail modal
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [commentText, setCommentText] = useState("");
  const [commenting, setCommenting] = useState(false);

  // New issue modal
  const [showNewModal, setShowNewModal] = useState(false);
  const [newForm, setNewForm] = useState({ title: "", description: "", category: "general", priority: "medium" });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const propertyId = activeProperty?.id || "prop-001";

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError("");
      try {
        const data = await getMaintenanceIssues(propertyId);
        setIssues(data);
      } catch (err) {
        console.error("Failed to load maintenance issues:", err);
        setError("Unable to load maintenance issues. Please try again.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [propertyId]);

  const filtered = issues.filter((i) => {
    const matchStatus = statusFilter === "all" || i.status === statusFilter;
    const matchPriority = priorityFilter === "all" || i.priority === priorityFilter;
    return matchStatus && matchPriority;
  });

  async function handleCreate(e) {
    e?.preventDefault();
    if (!newForm.title.trim()) {
      setFormError("Please enter an issue title.");
      return;
    }
    setSaving(true);
    setFormError("");
    try {
      const res = await createMaintenanceIssue({
        ...newForm,
        propertyId,
        reportedBy: user?.id || 1,
      });

      if (res.issue) {
        setIssues((prev) => [res.issue, ...prev]);
      }
      setShowNewModal(false);
      setNewForm({ title: "", description: "", category: "general", priority: "medium" });
    } catch (err) {
      console.error("Failed to create maintenance issue:", err);
      setFormError("Unable to report maintenance issue. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function handleComment() {
    if (!commentText.trim() || !selectedIssue) return;
    setCommenting(true);
    try {
      const commentPayload = {
        userId: user?.id || 1,
        userName: user?.name || "You",
        text: commentText.trim(),
      };
      const res = await addMaintenanceComment(selectedIssue.id, commentPayload);
      const newComment = res.comment;

      setIssues((prev) =>
        prev.map((i) =>
          i.id === selectedIssue.id ? { ...i, comments: [...(i.comments || []), newComment] } : i
        )
      );
      setSelectedIssue((prev) => ({
        ...prev,
        comments: [...(prev.comments || []), newComment],
      }));
      setCommentText("");
    } catch (err) {
      console.error("Failed to add comment:", err);
    } finally {
      setCommenting(false);
    }
  }

  if (loading) return <LoadingState message="Loading maintenance issues…" />;

  return (
    <div className="maintenance-issues">
      <div className="maintenance-issues__header">
        <div>
          <h1 className="maintenance-issues__title">Maintenance</h1>
          <p className="maintenance-issues__sub">
            Track and report maintenance issues for your property.
          </p>
        </div>
        <Button
          variant="primary"
          onClick={() => {
            setFormError("");
            setShowNewModal(true);
          }}
          id="report-issue-btn"
        >
          <Plus size={16} /> Report Issue
        </Button>
      </div>

      {error && <div className="maintenance-error-banner">{error}</div>}

      <MaintenanceFilters
        status={statusFilter}
        priority={priorityFilter}
        onStatusChange={setStatusFilter}
        onPriorityChange={setPriorityFilter}
      />

      {filtered.length === 0 ? (
        <EmptyState
          icon={Wrench}
          title="No issues found"
          description={
            statusFilter !== "all" || priorityFilter !== "all"
              ? "No maintenance issues match the selected filters."
              : "No maintenance issues have been reported for this tenancy."
          }
        />
      ) : (
        <div className="maintenance-issues__list">
          {filtered.map((issue) => (
            <MaintenanceItem
              key={issue.id}
              issue={issue}
              onClick={() => {
                setSelectedIssue(issue);
                setCommentText("");
              }}
            />
          ))}
        </div>
      )}

      {/* Issue detail modal */}
      {selectedIssue && (
        <Modal title={selectedIssue.title} onClose={() => setSelectedIssue(null)}>
          <div className="issue-detail">
            <div className="issue-detail__badges">
              <StatusBadge status={selectedIssue.priority} />
              <StatusBadge status={selectedIssue.status} />
              <span className="issue-detail__category">{selectedIssue.category}</span>
            </div>
            <p className="issue-detail__desc">{selectedIssue.description}</p>
            <p className="issue-detail__date">Reported {formatDate(selectedIssue.reportedAt)}</p>

            <div className="issue-detail__divider" />

            {/* Comments */}
            <h3 className="issue-detail__section-title">Comments</h3>
            {(selectedIssue.comments || []).length === 0 ? (
              <p className="issue-detail__no-comments">No comments yet.</p>
            ) : (
              <div className="comment-list">
                {selectedIssue.comments.map((c) => (
                  <div key={c.id} className="comment">
                    <span className="comment__author">{c.userName}</span>
                    <span className="comment__date">{formatDate(c.createdAt)}</span>
                    <p className="comment__text">{c.text}</p>
                  </div>
                ))}
              </div>
            )}

            <div className="comment-compose">
              <textarea
                className="comment-compose__input"
                rows={2}
                placeholder="Add a comment or follow-up note…"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                id="maintenance-comment-input"
              />
              <Button
                variant="primary"
                size="sm"
                onClick={handleComment}
                disabled={commenting || !commentText.trim()}
                id="submit-comment"
              >
                {commenting ? "Sending…" : "Send"}
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* New issue modal */}
      {showNewModal && (
        <Modal
          title="Report Maintenance Issue"
          onClose={() => setShowNewModal(false)}
          footer={
            <>
              <Button variant="secondary" onClick={() => setShowNewModal(false)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleCreate}
                disabled={saving || !newForm.title.trim()}
                id="create-issue-submit"
              >
                {saving ? "Submitting…" : "Submit Issue"}
              </Button>
            </>
          }
        >
          <form className="new-issue-form" onSubmit={handleCreate}>
            {formError && <p className="form-error-msg">{formError}</p>}
            <div className="form-group">
              <label htmlFor="issue-title" className="form-label">
                Title
              </label>
              <input
                id="issue-title"
                type="text"
                className="form-input"
                placeholder="Brief description of the issue"
                value={newForm.title}
                onChange={(e) => setNewForm((p) => ({ ...p, title: e.target.value }))}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="issue-desc" className="form-label">
                Description
              </label>
              <textarea
                id="issue-desc"
                className="form-input form-input--textarea"
                rows={3}
                placeholder="Detailed description of the issue..."
                value={newForm.description}
                onChange={(e) => setNewForm((p) => ({ ...p, description: e.target.value }))}
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="issue-category" className="form-label">
                  Category
                </label>
                <select
                  id="issue-category"
                  className="form-input"
                  value={newForm.category}
                  onChange={(e) => setNewForm((p) => ({ ...p, category: e.target.value }))}
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c.charAt(0).toUpperCase() + c.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="issue-priority" className="form-label">
                  Priority
                </label>
                <select
                  id="issue-priority"
                  className="form-input"
                  value={newForm.priority}
                  onChange={(e) => setNewForm((p) => ({ ...p, priority: e.target.value }))}
                >
                  {PRIORITIES.map((p) => (
                    <option key={p} value={p}>
                      {p.charAt(0).toUpperCase() + p.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
