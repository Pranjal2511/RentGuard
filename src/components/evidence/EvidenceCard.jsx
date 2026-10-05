import { ImageIcon } from "lucide-react";
import StatusBadge from "../common/StatusBadge";
import "./EvidenceCard.css";

export default function EvidenceCard({ evidence, onClick }) {
  const photoCount = evidence?.photos?.length ?? 0;

  return (
    <div className="evidence-card" onClick={onClick} role="button" tabIndex={0}>
      <div className="evidence-card__photo-strip">
        {photoCount > 0 ? (
          <div className="evidence-card__photo-count">
            <ImageIcon size={14} />
            <span>{photoCount} photo{photoCount !== 1 ? "s" : ""}</span>
          </div>
        ) : (
          <div className="evidence-card__no-photo">
            <ImageIcon size={22} strokeWidth={1.5} />
            <span>No photos</span>
          </div>
        )}
      </div>
      <div className="evidence-card__body">
        <div className="evidence-card__row">
          <span className="evidence-card__label">Condition</span>
          <StatusBadge status={evidence.condition} />
        </div>
        {evidence.notes && (
          <p className="evidence-card__notes">{evidence.notes}</p>
        )}
      </div>
    </div>
  );
}
