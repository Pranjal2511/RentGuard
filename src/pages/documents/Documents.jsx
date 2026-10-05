import { useState, useEffect } from "react";
import { FileText, Plus, Search, Filter, UploadCloud, CheckCircle2 } from "lucide-react";
import { useProperty } from "../../context/PropertyContext";
import { useAuth } from "../../context/AuthContext";
import { getDocuments, uploadDocument } from "../../services/api";
import DocumentItem from "../../components/documents/DocumentItem";
import LoadingState from "../../components/common/LoadingState";
import EmptyState from "../../components/common/EmptyState";
import Modal from "../../components/common/Modal";
import Button from "../../components/common/Button";
import "./Documents.css";

const CATEGORIES = [
  { id: "all", label: "All Documents" },
  { id: "lease", label: "Lease Agreements" },
  { id: "condition_report", label: "Condition Reports" },
  { id: "receipt", label: "Rent Receipts" },
  { id: "invoice", label: "Invoices & Repairs" },
];

export default function Documents() {
  const { activeProperty } = useProperty();
  const { user } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [category, setCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Form state
  const [docName, setDocName] = useState("");
  const [docType, setDocType] = useState("lease");
  const [selectedFile, setSelectedFile] = useState(null);
  const [formError, setFormError] = useState("");

  const propertyId = activeProperty?.id || "prop-001";

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError("");
      try {
        const docs = await getDocuments(propertyId);
        setDocuments(docs);
      } catch (err) {
        console.error("Failed to load documents:", err);
        setError("Unable to load documents. Please try again.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [propertyId]);

  const filteredDocs = documents.filter((doc) => {
    const matchesCategory = category === "all" || doc.type === category;
    const matchesQuery =
      doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (doc.type && doc.type.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesQuery;
  });

  function handleFileSelect(e) {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 15 * 1024 * 1024) {
        setFormError("File exceeds 15MB limit.");
        return;
      }
      setFormError("");
      setSelectedFile(file);
      if (!docName.trim()) {
        const baseName = file.name.replace(/\.[^/.]+$/, "");
        setDocName(baseName.replace(/[_-]/g, " "));
      }
    }
  }

  async function handleUploadSubmit(e) {
    e.preventDefault();
    if (!docName.trim()) {
      setFormError("Please enter a document title.");
      return;
    }

    setUploading(true);
    setFormError("");
    try {
      const ext = selectedFile?.name ? selectedFile.name.split(".").pop().toLowerCase() : "pdf";
      const sizeStr = selectedFile?.size
        ? `${(selectedFile.size / (1024 * 1024)).toFixed(1)} MB`
        : "1.2 MB";

      const res = await uploadDocument({
        propertyId,
        name: docName.trim(),
        type: docType,
        fileType: ext,
        size: sizeStr,
        uploadedBy: user?.id || 1,
      });

      if (res.document) {
        setDocuments((prev) => [res.document, ...prev]);
      }

      setShowUploadModal(false);
      setDocName("");
      setDocType("lease");
      setSelectedFile(null);
      setUploadSuccess(true);
      setTimeout(() => setUploadSuccess(false), 4000);
    } catch (err) {
      console.error("Failed to upload document:", err);
      setFormError("Failed to upload document. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  if (loading) return <LoadingState message="Loading documents vault…" />;

  return (
    <div className="documents-page">
      {/* Page Header */}
      <div className="documents-header">
        <div>
          <h1 className="documents-title">Documents Vault</h1>
          <p className="documents-subtitle">
            Securely store, organize, and access all lease agreements, condition reports, and receipts.
          </p>
        </div>
        <Button
          variant="primary"
          onClick={() => {
            setFormError("");
            setShowUploadModal(true);
          }}
          className="documents-upload-btn"
          id="upload-doc-btn"
        >
          <Plus size={16} />
          Upload Document
        </Button>
      </div>

      {error && <div className="documents-error-banner">{error}</div>}

      {uploadSuccess && (
        <div className="documents-banner documents-banner--success">
          <CheckCircle2 size={18} />
          <span>Document uploaded and securely archived to property vault!</span>
        </div>
      )}

      {/* Toolbar: Search and Filter Pills */}
      <div className="documents-toolbar">
        <div className="documents-search">
          <Search size={16} className="documents-search-icon" />
          <input
            type="text"
            placeholder="Search documents by name or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="documents-search-input"
            id="doc-search-input"
          />
        </div>

        <div className="documents-filters">
          <Filter size={15} className="documents-filter-icon" />
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              className={`doc-filter-pill ${category === cat.id ? "doc-filter-pill--active" : ""}`}
              onClick={() => setCategory(cat.id)}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Documents List */}
      <div className="documents-content">
        {filteredDocs.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="No documents found"
            description={
              searchQuery || category !== "all"
                ? "Try clearing filters or search terms to see all files."
                : "No documents have been uploaded for this property yet."
            }
            action={
              (searchQuery || category !== "all") && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setCategory("all");
                    setSearchQuery("");
                  }}
                >
                  Clear Filters
                </Button>
              )
            }
          />
        ) : (
          <div className="documents-grid">
            {filteredDocs.map((doc) => (
              <DocumentItem key={doc.id} document={doc} />
            ))}
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <Modal
          title="Upload New Document"
          onClose={() => setShowUploadModal(false)}
          footer={
            <>
              <Button variant="ghost" onClick={() => setShowUploadModal(false)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleUploadSubmit}
                disabled={!docName.trim() || uploading}
                id="submit-doc-upload"
              >
                {uploading ? "Saving…" : "Save Document"}
              </Button>
            </>
          }
        >
          <form className="doc-upload-form" onSubmit={handleUploadSubmit}>
            {formError && <p className="doc-form-error">{formError}</p>}
            <div className="doc-dropzone">
              <UploadCloud size={32} className="doc-dropzone-icon" />
              <p className="doc-dropzone-title">
                {selectedFile ? selectedFile.name : "Click to select or drag and drop file"}
              </p>
              <p className="doc-dropzone-hint">PDF, PNG, JPG, or DOC up to 15MB</p>
              <input
                type="file"
                className="doc-dropzone-input"
                onChange={handleFileSelect}
                id="doc-file-input"
                accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
              />
            </div>

            <div className="form-group">
              <label htmlFor="doc-name-input" className="form-label">
                Document Title
              </label>
              <input
                type="text"
                id="doc-name-input"
                className="form-input"
                placeholder="e.g. Signed Lease Agreement 2026"
                value={docName}
                onChange={(e) => setDocName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="doc-type-select" className="form-label">
                Document Category
              </label>
              <select
                id="doc-type-select"
                className="form-select"
                value={docType}
                onChange={(e) => setDocType(e.target.value)}
              >
                <option value="lease">Lease Agreement</option>
                <option value="condition_report">Condition Report</option>
                <option value="receipt">Rent Receipt</option>
                <option value="invoice">Invoice / Repair Receipt</option>
              </select>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
