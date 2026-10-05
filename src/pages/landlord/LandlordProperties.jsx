import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Building2, ArrowRight } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { getProperties } from "../../services/api";
import StatusBadge from "../../components/common/StatusBadge";
import LoadingState from "../../components/common/LoadingState";
import EmptyState from "../../components/common/EmptyState";
import { formatCurrency, formatDate } from "../../utils/formatters";
import "./LandlordProperties.css";

export default function LandlordProperties() {
  const { user } = useAuth();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError("");
      try {
        const allProps = await getProperties();
        const landlordProps = allProps.filter((p) => p.landlordId === user?.id);
        setProperties(landlordProps.length > 0 ? landlordProps : allProps);
      } catch (err) {
        console.error("Failed to load landlord properties:", err);
        setError("Unable to load properties. Please try again.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user?.id]);

  if (loading) return <LoadingState message="Loading properties…" />;

  return (
    <div className="landlord-properties-page">
      <div className="landlord-properties-header">
        <div>
          <h1 className="landlord-properties-title">Managed Properties</h1>
          <p className="landlord-properties-subtitle">
            View lease statuses, active tenancies, and property records.
          </p>
        </div>
      </div>

      {error && <div className="landlord-properties-error">{error}</div>}

      {properties.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="No properties found"
          description="You currently have no properties assigned to your account."
        />
      ) : (
        <div className="landlord-properties-grid">
          {properties.map((prop) => (
            <Link
              key={prop.id}
              to={`/landlord/properties/${prop.id}`}
              className="landlord-property-card"
              id={`prop-card-${prop.id}`}
            >
              <div className="landlord-property-card__header">
                <span className="landlord-property-card__type">{prop.type}</span>
                <StatusBadge status={prop.status} />
              </div>

              <h2 className="landlord-property-card__address">{prop.address}</h2>

              <div className="landlord-property-card__specs">
                {prop.floor && <span>{prop.floor}</span>}
                {prop.leaseEnd && (
                  <span>Lease ends {formatDate(prop.leaseEnd)}</span>
                )}
              </div>

              <div className="landlord-property-card__footer">
                <div className="landlord-property-card__rent">
                  <span className="rent-amount">{formatCurrency(prop.monthlyRent)}</span>
                  <span className="rent-period">/month</span>
                </div>
                <div className="landlord-property-card__link">
                  <span>View Details</span>
                  <ArrowRight size={15} />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
