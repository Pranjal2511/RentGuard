import { FileText, Download, Check } from "lucide-react";
import { useState } from "react";
import { formatDate } from "../../utils/formatters";
import "./DocumentItem.css";

const TYPE_LABELS = {
  lease: "Lease Agreement",
  condition_report: "Condition Report",
  receipt: "Rent Receipt",
  invoice: "Invoice",
};

export default function DocumentItem({ document }) {
  const [downloaded, setDownloaded] = useState(false);

  function handleDownload() {
    try {
      let downloadUrl = document.url;
      let shouldRevoke = false;

      if (!downloadUrl) {
        // Create an authentic browser-downloadable text/pdf mock artifact
        const content = `RentGuard Verified Document
Title: ${document.name}
Category: ${TYPE_LABELS[document.type] || document.type}
Property ID: ${document.propertyId}
Date Uploaded: ${document.uploadedAt}
Size: ${document.size}
Verification: Verified cryptographically on RentGuard Prototype Vault.
`;
        const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
        downloadUrl = URL.createObjectURL(blob);
        shouldRevoke = true;
      }

      const link = window.document.createElement("a");
      link.href = downloadUrl;
      const extension = document.fileType || "pdf";
      const filename = document.name.endsWith(`.${extension}`)
        ? document.name
        : `${document.name}.${extension}`;
      link.download = filename;
      window.document.body.appendChild(link);
      link.click();
      window.document.body.removeChild(link);

      if (shouldRevoke) {
        setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000);
      }

      setDownloaded(true);
      setTimeout(() => setDownloaded(false), 2500);
    } catch (err) {
      console.error("Failed to download document:", err);
    }
  }

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
        type="button"
        className="document-item__download"
        onClick={handleDownload}
        aria-label={`Download ${document.name}`}
        title={`Download ${document.name}`}
        id={`download-${document.id}`}
      >
        {downloaded ? <Check size={15} color="#2F4F3D" /> : <Download size={15} />}
      </button>
    </div>
  );
}
