import { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { getProperties } from "../services/api";

export const PropertyContext = createContext(null);

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
        if (user.role === "landlord") {
          accessible = allProps.filter((p) => p.landlordId === user.id);
        } else {
          accessible = allProps.filter((p) => p.tenantId === user.id);
        }

        if (accessible.length === 0 && allProps.length > 0) {
          accessible = allProps;
        }

        setProperties(accessible);
        setActiveProperty((prev) => {
          if (prev && accessible.some((p) => p.id === prev.id)) {
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

export function useProperty() {
  const ctx = useContext(PropertyContext);
  if (!ctx) {
    throw new Error("useProperty must be used within a PropertyProvider");
  }
  return ctx;
}
