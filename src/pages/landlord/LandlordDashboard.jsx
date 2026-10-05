import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Building2, Users, Wrench, Scale, ArrowRight } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { getProperties, getMaintenanceIssues, getDisputes } from "../../services/api";
import StatusBadge from "../../components/common/StatusBadge";
import LoadingState from "../../components/common/LoadingState";
import { formatCurrency, formatDate } from "../../utils/formatters";
import "./LandlordDashboard.css";

export default function LandlordDashboard() {
  const { user } = useAuth();
  const [properties, setProperties] = useState([]);
  const [maintenance, setMaintenance] = useState([]);
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError("");
      try {
        const allProps = await getProperties();
        // Landlord dashboard derives properties from landlordId
        const landlordProps = allProps.filter((p) => p.landlordId === user?.id);
        const activeList = landlordProps.length > 0 ? landlordProps : allProps;
        setProperties(activeList);

        const activeProperty = activeList.find((p) => p.status === "active") || activeList[0];
        if (activeProperty) {
          const [m, d] = await Promise.all([
            getMaintenanceIssues(activeProperty.id),
            getDisputes(activeProperty.id),
          ]);
          setMaintenance(m || []);
          setDisputes(d || []);
        }
      } catch (err) {
        console.error("Failed to load landlord dashboard data:", err);
        setError("Unable to load landlord dashboard data. Please try again.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user?.id]);

  if (loading) return <LoadingState message="Loading landlord dashboard…" />;

  const activeProps = properties.filter((p) => p.status === "active");
  const openMaintenance = maintenance.filter((m) => m.status !== "resolved");
  const activeDisputes = disputes.filter((d) => d.status !== "resolved");

  return (
    <div className="landlord-dashboard">
      <div className="landlord-dashboard__header">
        <h1 className="landlord-dashboard__greeting">
          Good day, {user?.name?.split(" ")[0]}.
        </h1>
        <p className="landlord-dashboard__sub">Here's an overview of your managed properties.</p>
      </div>

      {error && <div className="landlord-error-banner">{error}</div>}

      {/* Stats bar */}
      <div className="landlord-stats-bar">
        <div className="landlord-stat">
          <Building2 size={20} className="landlord-stat__icon" />
          <div>
            <div className="landlord-stat__value">{properties.length}</div>
            <div className="landlord-stat__label">Total Properties</div>
          </div>
        </div>
        <div className="landlord-stat">
          <Users size={20} className="landlord-stat__icon" />
          <div>
            <div className="landlord-stat__value">{activeProps.length}</div>
            <div className="landlord-stat__label">Active Tenancies</div>
          </div>
        </div>
        <div className="landlord-stat">
          <Wrench size={20} className="landlord-stat__icon" />
          <div>
            <div className="landlord-stat__value">{openMaintenance.length}</div>
            <div className="landlord-stat__label">Open Issues</div>
          </div>
        </div>
        <div className="landlord-stat">
          <Scale size={20} className="landlord-stat__icon" />
          <div>
            <div className="landlord-stat__value">{activeDisputes.length}</div>
            <div className="landlord-stat__label">Active Disputes</div>
          </div>
        </div>
      </div>

      <div className="landlord-dashboard__grid">
        {/* Properties */}
        <section className="landlord-card landlord-card--full">
          <div className="landlord-card__head">
            <h2 className="landlord-card__title">Your Properties</h2>
            <Link to="/landlord/confirmations" className="landlord-card__link">
              Pending confirmations <ArrowRight size={14} />
            </Link>
          </div>
          <div className="property-list">
            {properties.map((prop) => (
              <Link
                key={prop.id}
                to={`/landlord/properties/${prop.id}`}
                className="property-list-item"
                id={`property-${prop.id}`}
              >
                <div className="property-list-item__info">
                  <span className="property-list-item__type">{prop.type}</span>
                  <span className="property-list-item__address">{prop.address}</span>
                  <div className="property-list-item__meta">
                    <StatusBadge status={prop.status} />
                    {prop.leaseEnd && (
                      <span className="property-list-item__lease">
                        Lease ends {formatDate(prop.leaseEnd)}
                      </span>
                    )}
                  </div>
                </div>
                <div className="property-list-item__rent">
                  {prop.monthlyRent && (
                    <>
                      <span className="property-list-item__rent-amount">{formatCurrency(prop.monthlyRent)}</span>
                      <span className="property-list-item__rent-label">/month</span>
                    </>
                  )}
                  <ArrowRight size={16} className="property-list-item__arrow" />
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Maintenance pending */}
        <section className="landlord-card">
          <div className="landlord-card__head">
            <h2 className="landlord-card__title">Maintenance Requests</h2>
          </div>
          {openMaintenance.length === 0 ? (
            <p className="landlord-card__empty">No open maintenance issues.</p>
          ) : (
            <ul className="landlord-issue-list">
              {openMaintenance.map((issue) => (
                <li key={issue.id} className="landlord-issue-item">
                  <div className="landlord-issue-item__row">
                    <span className="landlord-issue-item__title">{issue.title}</span>
                    <StatusBadge status={issue.priority} />
                  </div>
                  <StatusBadge status={issue.status} />
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Active disputes */}
        <section className="landlord-card">
          <div className="landlord-card__head">
            <h2 className="landlord-card__title">Active Disputes</h2>
          </div>
          {activeDisputes.length === 0 ? (
            <p className="landlord-card__empty">No active disputes.</p>
          ) : (
            <ul className="landlord-issue-list">
              {activeDisputes.map((d) => (
                <li key={d.id} className="landlord-issue-item">
                  <div className="landlord-issue-item__row">
                    <span className="landlord-issue-item__title">{d.title}</span>
                    <StatusBadge status={d.status} />
                  </div>
                  <span className="landlord-issue-item__amount">{formatCurrency(d.amount)}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
