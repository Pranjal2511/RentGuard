import { useState, useEffect } from "react";
import { CheckCircle2, XCircle, ClipboardList } from "lucide-react";
import { getEvidence, getDisputes } from "../../services/api";
import StatusBadge from "../../components/common/StatusBadge";
import LoadingState from "../../components/common/LoadingState";
import EmptyState from "../../components/common/EmptyState";
import Button from "../../components/common/Button";
import { formatDate } from "../../utils/formatters";
import "./LandlordConfirmation.css";

const PROPERTY_ID = "prop-001";

export default function LandlordConfirmation() {
  const [pendingEvidence, setPendingEvidence] = useState([]);
  const [pendingDisputes, setPendingDisputes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmations, setConfirmations] = useState({}); // evidenceId -> "confirmed" | "rejected"

  useEffect(() => {
    async function load() {
      const [ev, d] = await Promise.all([
        getEvidence(PROPERTY_ID),
        getDisputes(PROPERTY_ID),
      ]);
      // Landlord needs to review move-in/out evidence
      setPendingEvidence(ev);
      // Disputes needing response
      setPendingDisputes(d.filter((d) => d.status === "pending"));
      setLoading(false);
    }
    load();
  }, []);

  function handleConfirm(id) {
    setConfirmations((prev) => ({ ...prev, [id]: "confirmed" }));
  }

  function handleReject(id) {
    setConfirmations((prev) => ({ ...prev, [id]: "rejected" }));
  }

  if (loading) return <LoadingState />;

  return (
    <div className="landlord-confirmation">
      <div className="landlord-confirmation__header">
        <h1 className="landlord-confirmation__title">Confirmations</h1>
        <p className="landlord-confirmation__sub">
          Review and confirm condition reports and respond to tenant disputes.
        </p>
      </div>

      {/* Evidence reviews */}
      <section className="confirmation-section">
        <h2 className="confirmation-section__title">Condition Reports to Review</h2>
        {pendingEvidence.length === 0 ? (
          <EmptyState icon={ClipboardList} title="Nothing to review" description="All condition reports have been reviewed." />
        ) : (
          <div className="confirmation-list">
            {pendingEvidence.map((ev) => {
              const status = confirmations[ev.id];
              return (
                <div key={ev.id} className={`confirmation-item ${status ? `confirmation-item--${status}` : ""}`} id={`confirm-${ev.id}`}>
                  <div className="confirmation-item__info">
                    <div className="confirmation-item__row">
                      <span className="confirmation-item__type">
                        {ev.type === "move-in" ? "Move-In" : "Move-Out"} Report
                      </span>
                      <StatusBadge status={ev.condition} />
                    </div>
                    <p className="confirmation-item__room">Room: {ev.roomId}</p>
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
                  <Button variant="primary" size="sm" onClick={() => console.log("Respond to", d.id)}>
                    Respond
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
