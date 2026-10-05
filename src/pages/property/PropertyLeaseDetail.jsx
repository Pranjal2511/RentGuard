import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Building2 } from "lucide-react";
import { getProperty, getDocuments, getDepositSummary } from "../../services/api";
import StatusBadge from "../../components/common/StatusBadge";
import LoadingState from "../../components/common/LoadingState";
import EmptyState from "../../components/common/EmptyState";
import DocumentItem from "../../components/documents/DocumentItem";
import { formatDate, formatCurrency } from "../../utils/formatters";
import "./PropertyLeaseDetail.css";

export default function PropertyLeaseDetail() {
  const { propertyId } = useParams();
  const [property, setProperty] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [deposit, setDeposit] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [prop, docs, dep] = await Promise.all([
        getProperty(propertyId),
        getDocuments(propertyId),
        getDepositSummary(propertyId),
      ]);
      setProperty(prop);
      setDocuments(docs);
      setDeposit(dep);
      setLoading(false);
    }
    load();
  }, [propertyId]);

  if (loading) return <LoadingState />;

  if (!property) {
    return (
      <div className="property-detail">
        <EmptyState
          icon={Building2}
          title="Property not found"
          description="This property does not exist."
          action={<Link to="/" className="property-back-link">← Go back</Link>}
        />
      </div>
    );
  }

  return (
    <div className="property-detail">
      <Link to="/tenant/dashboard" className="property-back-link" id="property-back">
        <ArrowLeft size={15} /> Back to dashboard
      </Link>

      <div className="property-detail__header">
        <div>
          <span className="property-detail__type">{property.type}</span>
          <h1 className="property-detail__address">{property.address}</h1>
          <div className="property-detail__badges">
            <StatusBadge status={property.status} />
            {property.floor && <span className="property-detail__floor">{property.floor}</span>}
          </div>
        </div>
      </div>

      <div className="property-detail__layout">
        {/* Lease info */}
        <div className="property-detail__main">
          <section className="property-section">
            <h2 className="property-section__title">Lease Details</h2>
            <div className="lease-details">
              <div className="lease-detail-item">
                <span className="lease-detail-item__label">Monthly Rent</span>
                <span className="lease-detail-item__value">{formatCurrency(property.monthlyRent)}</span>
              </div>
              <div className="lease-detail-item">
                <span className="lease-detail-item__label">Security Deposit</span>
                <span className="lease-detail-item__value">{formatCurrency(property.deposit)}</span>
              </div>
              <div className="lease-detail-item">
                <span className="lease-detail-item__label">Lease Start</span>
                <span className="lease-detail-item__value">{formatDate(property.leaseStart)}</span>
              </div>
              <div className="lease-detail-item">
                <span className="lease-detail-item__label">Lease End</span>
                <span className="lease-detail-item__value">{formatDate(property.leaseEnd)}</span>
              </div>
            </div>
          </section>

          {/* Deposit breakdown */}
          {deposit && (
            <section className="property-section">
              <h2 className="property-section__title">Deposit Breakdown</h2>
              <div className="deposit-detail">
                <div className="deposit-detail-row">
                  <span>Total Deposit Paid</span>
                  <span>{formatCurrency(deposit.totalDeposit)}</span>
                </div>
                {deposit.deductions.map((d) => (
                  <div key={d.id} className="deposit-detail-row deposit-detail-row--deduction">
                    <span>{d.reason}</span>
                    <span className="deposit-deduction">
                      − {formatCurrency(d.amount)}
                      <StatusBadge status={d.status} />
                    </span>
                  </div>
                ))}
                <div className="deposit-detail-divider" />
                <div className="deposit-detail-row deposit-detail-row--total">
                  <span>Estimated Refund</span>
                  <span>{formatCurrency(deposit.refundAmount)}</span>
                </div>
              </div>
            </section>
          )}
        </div>

        {/* Documents sidebar */}
        <div className="property-detail__sidebar">
          <section className="property-section">
            <div className="property-section__head">
              <h2 className="property-section__title">Documents</h2>
              <Link to="/documents" className="property-section__link">View all</Link>
            </div>
            {documents.length === 0 ? (
              <p className="property-section__empty">No documents shared yet.</p>
            ) : (
              <div className="property-docs-list">
                {documents.map((doc) => (
                  <DocumentItem key={doc.id} document={doc} />
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
