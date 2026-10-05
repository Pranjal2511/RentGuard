import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Scale, Plus, AlertCircle, MessageCircle, ArrowRight } from "lucide-react";
import { useProperty } from "../../context/PropertyContext";
import { useAuth } from "../../context/AuthContext";
import { getDisputes, createDispute } from "../../services/api";
import StatusBadge from "../../components/common/StatusBadge";
import LoadingState from "../../components/common/LoadingState";
import EmptyState from "../../components/common/EmptyState";
import Modal from "../../components/common/Modal";
import Button from "../../components/common/Button";
import { formatCurrency, formatDate } from "../../utils/formatters";
import "./DisputesList.css";

const STATUS_FILTERS = ["all", "pending", "disputed", "resolved"];

export default function DisputesList() {
  const { activeProperty } = useProperty();
  const { user } = useAuth();
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Create dispute modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    async function load() {
      if (!activeProperty?.id) {
        setLoading(false);
        return;
      }
      setLoading(true);
      setError("");
      try {
        const data = await getDisputes(activeProperty.id);
        setDisputes(data);
      } catch (err) {
        console.error("Failed to load disputes:", err);
        setError("Unable to load disputes. Please try again.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [activeProperty?.id]);

  const filteredDisputes = disputes.filter((d) => {
    if (statusFilter === "all") return true;
    return d.status === statusFilter;
  });

  async function handleCreateDispute(e) {
    e.preventDefault();
    if (!title.trim()) {
      setFormError("Please enter a dispute title.");
      return;
    }
    if (!description.trim()) {
      setFormError("Please provide a description of the dispute.");
      return;
    }
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      setFormError("Please enter a valid disputed amount.");
      return;
    }

    setSubmitting(true);
    setFormError("");
    try {
      const res = await createDispute({
        propertyId: activeProperty.id,
        title: title.trim(),
        description: description.trim(),
        amount: Number(amount),
        raisedBy: user?.id || 1,
      });

      if (res.dispute) {
        setDisputes((prev) => [res.dispute, ...prev]);
      }
      setShowCreateModal(false);
      setTitle("");
      setDescription("");
      setAmount("");
    } catch (err) {
      console.error("Failed to create dispute:", err);
      setFormError("Failed to submit dispute. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <LoadingState message="Loading disputes…" />;

  return (
    <div className="disputes-list-page">
      <div className="disputes-list-header">
        <div>
          <h1 className="disputes-list-title">Disputes & Claims</h1>
          <p className="disputes-list-subtitle">
            Resolve security deposit deductions and tenancy disagreements with transparent evidence records.
          </p>
        </div>
        <Button
          variant="primary"
          onClick={() => {
            setFormError("");
            setShowCreateModal(true);
          }}
          id="raise-dispute-btn"
        >
          <Plus size={16} /> Raise Dispute
        </Button>
      </div>

      {error && <div className="disputes-error-banner">{error}</div>}

      {/* Filter Tabs */}
      <div className="disputes-filter-pills">
        {STATUS_FILTERS.map((s) => (
          <button
            key={s}
            className={`dispute-filter-pill ${statusFilter === s ? "dispute-filter-pill--active" : ""}`}
            onClick={() => setStatusFilter(s)}
            id={`filter-dispute-${s}`}
          >
            {s === "all" ? "All Disputes" : s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {/* Disputes List */}
      <div className="disputes-container">
        {filteredDisputes.length === 0 ? (
          <EmptyState
            icon={Scale}
            title={statusFilter === "all" ? "No active disputes" : `No ${statusFilter} disputes found`}
            description={
              statusFilter === "all"
                ? "You have not raised any disputes for this tenancy."
                : "Try selecting a different status filter."
            }
          />
        ) : (
          <div className="disputes-cards">
            {filteredDisputes.map((d) => (
              <Link
                key={d.id}
                to={`/tenant/disputes/${d.id}`}
                className="dispute-item-card"
                id={`dispute-card-${d.id}`}
              >
                <div className="dispute-item-card__main">
                  <div className="dispute-item-card__top">
                    <span className="dispute-item-card__title">{d.title}</span>
                    <StatusBadge status={d.status} />
                  </div>
                  <p className="dispute-item-card__desc">{d.description}</p>
                  <div className="dispute-item-card__meta">
                    <span className="dispute-item-card__amount">
                      <AlertCircle size={14} />
                      {formatCurrency(d.amount)} at stake
                    </span>
                    <span className="dispute-item-card__date">Raised {formatDate(d.raisedAt)}</span>
                    {d.comments?.length > 0 && (
                      <span className="dispute-item-card__comments">
                        <MessageCircle size={13} />
                        {d.comments.length} comment{d.comments.length !== 1 ? "s" : ""}
                      </span>
                    )}
                  </div>
                </div>
                <div className="dispute-item-card__arrow">
                  <ArrowRight size={18} />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Raise Dispute Modal */}
      {showCreateModal && (
        <Modal
          title="Raise a Tenancy Dispute"
          onClose={() => setShowCreateModal(false)}
          footer={
            <>
              <Button variant="secondary" onClick={() => setShowCreateModal(false)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleCreateDispute}
                disabled={submitting}
                id="submit-dispute-btn"
              >
                {submitting ? "Submitting…" : "Submit Dispute"}
              </Button>
            </>
          }
        >
          <form onSubmit={handleCreateDispute} className="dispute-create-form">
            {formError && <p className="dispute-form-error">{formError}</p>}
            <div className="form-group">
              <label htmlFor="dispute-title" className="form-label">
                Dispute Reason / Title
              </label>
              <input
                id="dispute-title"
                type="text"
                className="form-input"
                placeholder="e.g. Unfair painting deduction"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="dispute-amount" className="form-label">
                Disputed Amount (₹)
              </label>
              <input
                id="dispute-amount"
                type="number"
                min="0"
                step="100"
                className="form-input"
                placeholder="e.g. 5000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="dispute-description" className="form-label">
                Detailed Explanation
              </label>
              <textarea
                id="dispute-description"
                className="form-input form-input--textarea"
                rows={4}
                placeholder="Explain why you disagree with this deduction and refer to move-in condition evidence..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
