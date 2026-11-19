import { createContext, useContext } from 'react';

export const PropertyContext = createContext(null);

export function useProperty() {
  const ctx = useContext(PropertyContext);
  if (!ctx) {
    throw new Error("useProperty must be used within a PropertyProvider");
  }
  return ctx;
}
