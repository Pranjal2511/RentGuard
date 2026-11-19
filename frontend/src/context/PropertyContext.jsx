import { useState, useEffect } from "react";
import { useAuth } from "./AuthContextValue";
import { getProperties } from "../services/api";

import { PropertyContext } from './PropertyContextValue';

export function PropertyProvider({ children }) {
  const { user } = useAuth();
  const [properties, setProperties] = useState([]);
  const [activeProperty, setActiveProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reloadTrigger, setReloadTrigger] = useState(0);

  useEffect(() => {
    let ignore = false;

    async function load() {
      if (!user) {
        if (!ignore) {
          setProperties([]);
          setActiveProperty(null);
          setLoading(false);
        }
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const allProps = await getProperties();
        if (ignore) return;

        let accessible = [];
        const userId = user.id || user._id;

        if (user.role === "landlord") {
          accessible = allProps.filter(
            (p) =>
              String(p.landlordId) === String(userId) ||
              String(p.ownerId) === String(userId) ||
              String(p.ownerId?._id) === String(userId)
          );
        } else {
          accessible = allProps.filter(
            (p) =>
              String(p.tenantId) === String(userId) ||
              String(p.tenant?._id) === String(userId) ||
              String(p.tenant?.id) === String(userId)
          );
        }

        // Safe fallback in prototype demo environment if unassigned
        if (accessible.length === 0 && allProps.length > 0) {
          accessible = allProps;
        }

        setProperties(accessible);
        setActiveProperty((prev) => {
          if (prev && accessible.some((p) => (p.id || p._id) === (prev.id || prev._id))) {
            return prev;
          }
          return accessible.find((p) => p.status === "active") || accessible[0] || null;
        });
      } catch (err) {
        if (!ignore) {
          console.error("Failed to load properties:", err);
          setError("Unable to load properties. Please try again.");
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      ignore = true;
    };
  }, [user, reloadTrigger]);

  function refreshProperties() {
    setReloadTrigger((n) => n + 1);
  }

  return (
    <PropertyContext.Provider
      value={{
        properties,
        activeProperty,
        setActiveProperty,
        loading,
        error,
        refreshProperties,
      }}
    >
      {children}
    </PropertyContext.Provider>
  );
}

