import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { AuthProvider } from "../context/AuthContext";
import { PropertyProvider } from "../context/PropertyContext";
import AppRoutes from "../routes/AppRoutes";
import { resetApiStore } from "../services/api";
import { storage } from "../services/storage";

function renderWithProviders(initialPath = "/") {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <AuthProvider>
        <PropertyProvider>
          <AppRoutes />
        </PropertyProvider>
      </AuthProvider>
    </MemoryRouter>
  );
}

describe("Authentication & Routing", () => {
  beforeEach(() => {
    storage.clear();
    resetApiStore();
  });

  it("1. unauthenticated user redirected to login", async () => {
    renderWithProviders("/tenant/dashboard");
    expect(await screen.findByRole("heading", { name: /sign in/i })).toBeInTheDocument();
  });

  it("2. tenant can access tenant dashboard", async () => {
    // Authenticate as tenant in session storage
    storage.set("rentguard_active_user", {
      id: 1,
      name: "Priya Sharma",
      email: "priya@example.com",
      role: "tenant",
    });

    renderWithProviders("/tenant/dashboard");
    expect(await screen.findByRole("heading", { name: /good day, priya/i }, { timeout: 5000 })).toBeInTheDocument();
  });

  it("3. tenant cannot access landlord dashboard", async () => {
    storage.set("rentguard_active_user", {
      id: 1,
      name: "Priya Sharma",
      email: "priya@example.com",
      role: "tenant",
    });

    renderWithProviders("/landlord/dashboard");
    expect(screen.queryByText(/here's an overview of your managed properties/i)).not.toBeInTheDocument();
    expect(await screen.findByRole("heading", { name: /good day, priya/i }, { timeout: 3000 })).toBeInTheDocument();
  });

  it("4. landlord can access landlord dashboard", async () => {
    storage.set("rentguard_active_user", {
      id: 2,
      name: "Rajan Mehta",
      email: "rajan@example.com",
      role: "landlord",
    });

    renderWithProviders("/landlord/dashboard");
    expect(await screen.findByRole("heading", { name: /good day, rajan/i })).toBeInTheDocument();
  });

  it("5. /tenant/move-in route renders Move-In Report", async () => {
    storage.set("rentguard_active_user", {
      id: 1,
      name: "Priya Sharma",
      email: "priya@example.com",
      role: "tenant",
    });

    renderWithProviders("/tenant/move-in");
    expect(await screen.findByRole("heading", { name: /move-in report/i })).toBeInTheDocument();
  });

  it("6. /tenant/move-out route renders Move-Out Comparison", async () => {
    storage.set("rentguard_active_user", {
      id: 1,
      name: "Priya Sharma",
      email: "priya@example.com",
      role: "tenant",
    });

    renderWithProviders("/tenant/move-out");
    expect(await screen.findByRole("heading", { name: /move-out comparison/i })).toBeInTheDocument();
  });

  it("7. /tenant/maintenance route renders Maintenance page", async () => {
    storage.set("rentguard_active_user", {
      id: 1,
      name: "Priya Sharma",
      email: "priya@example.com",
      role: "tenant",
    });

    renderWithProviders("/tenant/maintenance");
    expect(await screen.findByRole("heading", { name: /^maintenance$/i })).toBeInTheDocument();
  });

  it("8. /tenant/disputes route renders Disputes List", async () => {
    storage.set("rentguard_active_user", {
      id: 1,
      name: "Priya Sharma",
      email: "priya@example.com",
      role: "tenant",
    });

    renderWithProviders("/tenant/disputes");
    expect(await screen.findByRole("heading", { name: /disputes & claims/i })).toBeInTheDocument();
  });

  it("9. /tenant/disputes/:id route renders Dispute Detail", async () => {
    storage.set("rentguard_active_user", {
      id: 1,
      name: "Priya Sharma",
      email: "priya@example.com",
      role: "tenant",
    });

    renderWithProviders("/tenant/disputes/disp-001");
    expect(await screen.findByRole("heading", { name: /deduction for nail holes claimed excessive/i })).toBeInTheDocument();
  });

  it("10. invalid route shows real 404 page", async () => {
    renderWithProviders("/non-existent-page");
    expect(await screen.findByText(/404 error/i)).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /page not found/i })).toBeInTheDocument();
  });
});
