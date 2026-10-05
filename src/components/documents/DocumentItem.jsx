import { FileText, Download } from "lucide-react";
import { formatDate } from "../../utils/formatters";
import "./DocumentItem.css";

const TYPE_LABELS = {
  lease: "Lease Agreement",
  condition_report: "Condition Report",
  receipt: "Rent Receipt",
  invoice: "Invoice",
};

export default function DocumentItem({ document }) {
  return (
    <div className="document-item" id={`doc-${document.id}`}>
      <div className="document-item__icon">
        <FileText size={18} />
      </div>
      <div className="document-item__info">
        <span className="document-item__name">{document.name}</span>
        <div className="document-item__meta">
          <span className="document-item__type">{TYPE_LABELS[document.type] || document.type}</span>
          <span className="document-item__separator">·</span>
          <span className="document-item__date">{formatDate(document.uploadedAt)}</span>
          <span className="document-item__separator">·</span>
          <span className="document-item__size">{document.size}</span>
        </div>
      </div>
      <button
        className="document-item__download"
        onClick={() => console.log("Download", document.id)}
        aria-label={`Download ${document.name}`}
        id={`download-${document.id}`}
      >
        <Download size={15} />
      </button>
    </div>
  );
}
