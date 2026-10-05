import { useState, useEffect } from "react";
import { CheckCircle2, XCircle, ClipboardList, MessageSquare } from "lucide-react";
import { useProperty } from "../../context/PropertyContext";
import { useAuth } from "../../context/AuthContext";
import { getEvidence, getDisputes, updateEvidenceStatus, respondToDispute } from "../../services/api";
import StatusBadge from "../../components/common/StatusBadge";
import LoadingState from "../../components/common/LoadingState";
import EmptyState from "../../components/common/EmptyState";
import Modal from "../../components/common/Modal";
import Button from "../../components/common/Button";
import { formatDate } from "../../utils/formatters";
import "./LandlordConfirmation.css";

export default function LandlordConfirmation() {
  const { activeProperty } = useProperty();
  const { user } = useAuth();
  const [pendingEvidence, setPendingEvidence] = useState([]);
  const [pendingDisputes, setPendingDisputes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [confirmations, setConfirmations] = useState({}); // evidenceId -> "confirmed" | "rejected"

  // Response modal state
  const [selectedDispute, setSelectedDispute] = useState(null);
  const [responseText, setResponseText] = useState("");
  const [submittingResponse, setSubmittingResponse] = useState(false);

  const propertyId = activeProperty?.id || "prop-001";

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError("");
      try {
        const [ev, d] = await Promise.all([
          getEvidence(propertyId),
          getDisputes(propertyId),
        ]);
        setPendingEvidence(ev || []);
        // Disputes needing response
        setPendingDisputes((d || []).filter((disp) => disp.status === "pending"));
      } catch (err) {
        console.error("Failed to load confirmations:", err);
        setError("Unable to load confirmation records. Please try again.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [propertyId]);

  async function handleConfirm(id) {
    try {
      await updateEvidenceStatus(id, "confirmed");
      setConfirmations((prev) => ({ ...prev, [id]: "confirmed" }));
    } catch (err) {
      console.error("Failed to confirm evidence:", err);
    }
  }

  async function handleReject(id) {
    try {
      await updateEvidenceStatus(id, "rejected");
      setConfirmations((prev) => ({ ...prev, [id]: "rejected" }));
    } catch (err) {
      console.error("Failed to dispute evidence:", err);
    }
  }

  async function handleSubmitDisputeResponse(e) {
    e.preventDefault();
    if (!responseText.trim() || !selectedDispute) return;

    setSubmittingResponse(true);
    try {
      await respondToDispute(
        selectedDispute.id,
        responseText.trim(),
        user?.name || "Rajan Mehta",
        user?.id || 2
      );

      // Remove from pending disputes list
      setPendingDisputes((prev) => prev.filter((d) => d.id !== selectedDispute.id));
      setSelectedDispute(null);
      setResponseText("");
    } catch (err) {
      console.error("Failed to respond to dispute:", err);
    } finally {
      setSubmittingResponse(false);
    }
  }

  if (loading) return <LoadingState message="Loading pending confirmations…" />;

  return (
    <div className="landlord-confirmation">
      <div className="landlord-confirmation__header">
        <h1 className="landlord-confirmation__title">Confirmations & Approvals</h1>
        <p className="landlord-confirmation__sub">
          Review condition reports submitted by tenants and formulate responses to active claims.
        </p>
      </div>

      {error && <div className="confirmation-error-banner">{error}</div>}

      {/* Evidence reviews */}
      <section className="confirmation-section">
        <h2 className="confirmation-section__title">Condition Reports to Review</h2>
        {pendingEvidence.length === 0 ? (
          <EmptyState
            icon={ClipboardList}
            title="Nothing to review"
            description="All condition reports have been reviewed for this property."
          />
        ) : (
          <div className="confirmation-list">
            {pendingEvidence.map((ev) => {
              const status = confirmations[ev.id] || ev.confirmationStatus;
              return (
                <div
                  key={ev.id}
                  className={`confirmation-item ${status ? `confirmation-item--${status}` : ""}`}
                  id={`confirm-${ev.id}`}
                >
                  <div className="confirmation-item__info">
                    <div className="confirmation-item__row">
                      <span className="confirmation-item__type">
                        {ev.type === "move-in" ? "Move-In" : "Move-Out"} Report
                      </span>
                      <StatusBadge status={ev.condition} />
                    </div>
                    <p className="confirmation-item__room">Room ID: {ev.roomId}</p>
                    {ev.notes && <p className="confirmation-item__notes">{ev.notes}</p>}
                    <span className="confirmation-item__date">Submitted {formatDate(ev.createdAt)}</span>
                  </div>

                  {!status ? (
                    <div className="confirmation-item__actions">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleConfirm(ev.id)}
                        id={`confirm-btn-${ev.id}`}
                      >
                        <CheckCircle2 size={14} /> Confirm
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleReject(ev.id)}
                        id={`reject-btn-${ev.id}`}
                      >
                        <XCircle size={14} /> Dispute
                      </Button>
                    </div>
                  ) : (
                    <div className="confirmation-item__status">
                      {status === "confirmed" ? (
                        <span className="confirmation-done confirmation-done--confirmed">
                          <CheckCircle2 size={15} /> Confirmed
                        </span>
                      ) : (
                        <span className="confirmation-done confirmation-done--rejected">
                          <XCircle size={15} /> Disputed
                        </span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Pending disputes */}
      {pendingDisputes.length > 0 && (
        <section className="confirmation-section">
          <h2 className="confirmation-section__title">Disputes Awaiting Response</h2>
          <div className="confirmation-list">
            {pendingDisputes.map((d) => (
              <div key={d.id} className="confirmation-item" id={`dispute-confirm-${d.id}`}>
                <div className="confirmation-item__info">
                  <div className="confirmation-item__row">
                    <span className="confirmation-item__type">{d.title}</span>
                    <StatusBadge status={d.status} />
                  </div>
                  <p className="confirmation-item__notes">{d.description}</p>
                  <span className="confirmation-item__date">Raised {formatDate(d.raisedAt)}</span>
                </div>
                <div className="confirmation-item__actions">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      setSelectedDispute(d);
                      setResponseText("");
                    }}
                    id={`respond-dispute-${d.id}`}
                  >
                    <MessageSquare size={14} /> Respond
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Dispute response modal */}
      {selectedDispute && (
        <Modal
          title={`Respond to Dispute: ${selectedDispute.title}`}
          onClose={() => setSelectedDispute(null)}
          footer={
            <>
              <Button variant="secondary" onClick={() => setSelectedDispute(null)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleSubmitDisputeResponse}
                disabled={submittingResponse || !responseText.trim()}
                id="submit-dispute-response"
              >
                {submittingResponse ? "Submitting…" : "Send Response"}
              </Button>
            </>
          }
        >
          <form onSubmit={handleSubmitDisputeResponse}>
            <p className="modal-dispute-desc">
              <strong>Claimant:</strong> Tenant &nbsp;|&nbsp; <strong>Claim:</strong> ₹{selectedDispute.amount}
            </p>
            <p className="modal-dispute-text">{selectedDispute.description}</p>
            <div className="form-group">
              <label htmlFor="response-text" className="form-label">
                Landlord Official Response
              </label>
              <textarea
                id="response-text"
                className="form-input form-input--textarea"
                rows={4}
                placeholder="State your justification regarding this deduction or proposed resolution..."
                value={responseText}
                onChange={(e) => setResponseText(e.target.value)}
                required
              />
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
