import { useState, useEffect } from "react";
import { FileText, Plus, Search, Filter, UploadCloud, CheckCircle2 } from "lucide-react";
import { getDocuments } from "../../services/api";
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
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  // Form state
  const [docName, setDocName] = useState("");
  const [docType, setDocType] = useState("lease");
  const [fileName, setFileName] = useState("");

  useEffect(() => {
    async function load() {
      // Load documents for current active property
      const docs = await getDocuments("prop-001");
      setDocuments(docs);
      setLoading(false);
    }
    load();
  }, []);

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
      setFileName(file.name);
      if (!docName) {
        // Auto-fill friendly name
        setDocName(file.name.replace(/\.[^/.]+$/, ""));
      }
    }
  }

  function handleUploadSubmit(e) {
    e.preventDefault();
    if (!docName) return;

    const newDoc = {
      id: "doc-new-" + Date.now(),
      propertyId: "prop-001",
      name: docName,
      type: docType,
      fileType: "pdf",
      size: fileName ? "1.8 MB" : "0.9 MB",
      uploadedAt: new Date().toISOString(),
      uploadedBy: 1,
      url: null,
    };

    setDocuments((prev) => [newDoc, ...prev]);
    setShowUploadModal(false);
    setDocName("");
    setDocType("lease");
    setFileName("");
    setUploadSuccess(true);
    setTimeout(() => setUploadSuccess(false), 4000);
  }

  if (loading) return <LoadingState />;

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
          onClick={() => setShowUploadModal(true)}
          className="documents-upload-btn"
          id="upload-doc-btn"
        >
          <Plus size={16} />
          Upload Document
        </Button>
      </div>

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
            placeholder="Search documents by name or type..."
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
              <Button variant="primary" onClick={handleUploadSubmit} disabled={!docName}>
                Save Document
              </Button>
            </>
          }
        >
          <form className="doc-upload-form" onSubmit={handleUploadSubmit}>
            <div className="doc-dropzone">
              <UploadCloud size={32} className="doc-dropzone-icon" />
              <p className="doc-dropzone-title">
                {fileName ? fileName : "Click to select or drag and drop file"}
              </p>
              <p className="doc-dropzone-hint">PDF, PNG, JPG, or DOC up to 15MB</p>
              <input
                type="file"
                className="doc-dropzone-input"
                onChange={handleFileSelect}
                id="doc-file-input"
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
                placeholder="e.g. Signed Lease Agreement 2024"
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
