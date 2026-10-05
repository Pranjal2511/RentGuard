import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  ClipboardList,
  Wrench,
  Scale,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { getProperties, getMaintenanceIssues, getDisputes, getDepositSummary } from "../../services/api";
import StatusBadge from "../../components/common/StatusBadge";
import LoadingState from "../../components/common/LoadingState";
import { formatDate, formatCurrency } from "../../utils/formatters";
import "./TenantDashboard.css";

export default function TenantDashboard() {
  const { user } = useAuth();
  const [property, setProperty] = useState(null);
  const [maintenance, setMaintenance] = useState([]);
  const [disputes, setDisputes] = useState([]);
  const [deposit, setDeposit] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const props = await getProperties();
      const prop = props.find((p) => p.status === "active") || props[0];
      setProperty(prop);

      if (prop) {
        const [m, d, dep] = await Promise.all([
          getMaintenanceIssues(prop.id),
          getDisputes(prop.id),
          getDepositSummary(prop.id),
        ]);
        setMaintenance(m);
        setDisputes(d);
        setDeposit(dep);
      }
      setLoading(false);
    }
    loadData();
  }, []);

  if (loading) return <LoadingState />;

  const openMaintenance = maintenance.filter((m) => m.status !== "resolved");
  const activeDisputes = disputes.filter((d) => d.status !== "resolved");
  const leaseMonthsLeft = property
    ? Math.max(0, Math.ceil((new Date(property.leaseEnd) - new Date()) / (1000 * 60 * 60 * 24 * 30)))
    : 0;

  return (
    <div className="tenant-dashboard">
      {/* Page header */}
      <div className="tenant-dashboard__header">
        <div>
          <h1 className="tenant-dashboard__greeting">Good day, {user?.name?.split(" ")[0]}.</h1>
          <p className="tenant-dashboard__address">{property?.address}</p>
        </div>
        <Link to="/property/prop-001" className="tenant-dashboard__property-link">
          View Property <ArrowRight size={15} />
        </Link>
      </div>

      {/* Lease status bar */}
      {property && (
        <div className="tenant-dashboard__lease-bar">
          <div className="lease-stat">
            <span className="lease-stat__label">Monthly Rent</span>
            <span className="lease-stat__value">{formatCurrency(property.monthlyRent)}</span>
          </div>
          <div className="lease-stat">
            <span className="lease-stat__label">Lease Ends</span>
            <span className="lease-stat__value">{formatDate(property.leaseEnd)}</span>
          </div>
          <div className="lease-stat">
            <span className="lease-stat__label">Months Remaining</span>
            <span className="lease-stat__value">{leaseMonthsLeft}</span>
          </div>
          <div className="lease-stat">
            <span className="lease-stat__label">Status</span>
            <StatusBadge status={property.status} />
          </div>
        </div>
      )}

      <div className="tenant-dashboard__grid">
        {/* Quick actions */}
        <section className="dashboard-card dashboard-card--actions">
          <h2 className="dashboard-card__title">Quick Actions</h2>
          <div className="quick-actions">
            <Link to="/tenant/move-in" id="quick-move-in" className="quick-action">
              <ClipboardList size={20} />
              <div>
                <div className="quick-action__title">Move-In Report</div>
                <div className="quick-action__desc">Document room conditions</div>
              </div>
              <ArrowRight size={15} className="quick-action__arrow" />
            </Link>
            <Link to="/tenant/move-out" id="quick-move-out" className="quick-action">
              <ClipboardList size={20} />
              <div>
                <div className="quick-action__title">Move-Out Comparison</div>
                <div className="quick-action__desc">Compare before and after</div>
              </div>
              <ArrowRight size={15} className="quick-action__arrow" />
            </Link>
            <Link to="/tenant/maintenance" id="quick-maintenance" className="quick-action">
              <Wrench size={20} />
              <div>
                <div className="quick-action__title">Maintenance</div>
                <div className="quick-action__desc">Report an issue</div>
              </div>
              <ArrowRight size={15} className="quick-action__arrow" />
            </Link>
            <Link to="/tenant/disputes/disp-001" id="quick-disputes" className="quick-action">
              <Scale size={20} />
              <div>
                <div className="quick-action__title">Disputes</div>
                <div className="quick-action__desc">View active disputes</div>
              </div>
              <ArrowRight size={15} className="quick-action__arrow" />
            </Link>
          </div>
        </section>

        {/* Deposit summary */}
        {deposit && (
          <section className="dashboard-card dashboard-card--deposit">
            <h2 className="dashboard-card__title">Security Deposit</h2>
            <div className="deposit-summary">
              <div className="deposit-row">
                <span>Total Deposit</span>
                <span className="deposit-row__amount">{formatCurrency(deposit.totalDeposit)}</span>
              </div>
              <div className="deposit-divider" />
              {deposit.deductions.map((d) => (
                <div key={d.id} className="deposit-row deposit-row--deduction">
                  <span>{d.reason}</span>
                  <span className="deposit-row__amount--deduction">
                    − {formatCurrency(d.amount)} <StatusBadge status={d.status} />
                  </span>
                </div>
              ))}
              <div className="deposit-divider" />
              <div className="deposit-row deposit-row--total">
                <span>Estimated Refund</span>
                <span className="deposit-row__amount--total">{formatCurrency(deposit.refundAmount)}</span>
              </div>
            </div>
          </section>
        )}

        {/* Open maintenance */}
        <section className="dashboard-card">
          <div className="dashboard-card__head">
            <h2 className="dashboard-card__title">Open Maintenance</h2>
            <Link to="/tenant/maintenance" className="dashboard-card__link">View all</Link>
          </div>
          {openMaintenance.length === 0 ? (
            <div className="dashboard-card__empty">
              <CheckCircle2 size={20} className="text-confirmed" />
              <span>No open issues</span>
            </div>
          ) : (
            <ul className="issue-list">
              {openMaintenance.map((issue) => (
                <li key={issue.id} className="issue-item">
                  <div className="issue-item__row">
                    <span className="issue-item__title">{issue.title}</span>
                    <StatusBadge status={issue.priority} />
                  </div>
                  <div className="issue-item__meta">
                    <StatusBadge status={issue.status} />
                    <span className="issue-item__date">{formatDate(issue.reportedAt)}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Active disputes */}
        <section className="dashboard-card">
          <div className="dashboard-card__head">
            <h2 className="dashboard-card__title">Active Disputes</h2>
          </div>
          {activeDisputes.length === 0 ? (
            <div className="dashboard-card__empty">
              <CheckCircle2 size={20} className="text-confirmed" />
              <span>No active disputes</span>
            </div>
          ) : (
            <ul className="issue-list">
              {activeDisputes.map((d) => (
                <li key={d.id} className="issue-item">
                  <div className="issue-item__row">
                    <Link to={`/tenant/disputes/${d.id}`} className="issue-item__link">
                      {d.title}
                    </Link>
                    <StatusBadge status={d.status} />
                  </div>
                  <div className="issue-item__meta">
                    <AlertCircle size={13} />
                    <span>{formatCurrency(d.amount)} at stake</span>
                    <span className="issue-item__date">{formatDate(d.raisedAt)}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
