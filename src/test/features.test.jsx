import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { AuthProvider } from "../context/AuthContext";
import { PropertyProvider } from "../context/PropertyContext";
import AppRoutes from "../routes/AppRoutes";
import { resetApiStore } from "../services/api";
import { storage } from "../services/storage";

function renderApp(initialPath = "/") {
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

describe("RentGuard Core Workflows", () => {
  beforeEach(() => {
    storage.clear();
    resetApiStore();
    // Default authenticated tenant for tests
    storage.set("rentguard_active_user", {
      id: 1,
      name: "Priya Sharma",
      email: "priya@example.com",
      role: "tenant",
    });
  });

  describe("Maintenance", () => {
    it("13. creates a new maintenance issue", async () => {
      renderApp("/tenant/maintenance");

      const reportBtn = await screen.findByRole("button", { name: /report issue/i });
      fireEvent.click(reportBtn);

      const titleInput = await screen.findByLabelText(/title/i);
      const descInput = screen.getByLabelText(/description/i);
      fireEvent.change(titleInput, { target: { value: "Kitchen sink clogged" } });
      fireEvent.change(descInput, { target: { value: "Water draining very slowly since morning." } });

      const submitBtn = screen.getByRole("button", { name: /submit issue/i });
      fireEvent.click(submitBtn);

      expect(await screen.findByText("Kitchen sink clogged")).toBeInTheDocument();
    });

    it("14. filters maintenance issues by status", async () => {
      renderApp("/tenant/maintenance");

      expect(await screen.findByText(/bathroom tap dripping constantly/i)).toBeInTheDocument();

      // Click "Resolved" filter
      const resolvedFilter = screen.getByRole("button", { name: /resolved/i });
      fireEvent.click(resolvedFilter);

      expect(await screen.findByText(/main door lock stiff/i)).toBeInTheDocument();
      expect(screen.queryByText(/bathroom tap dripping constantly/i)).not.toBeInTheDocument();
    });

    it("15. adds a comment to a maintenance issue", async () => {
      renderApp("/tenant/maintenance");

      const issueItem = await screen.findByText(/bathroom tap dripping constantly/i);
      fireEvent.click(issueItem);

      const commentInput = await screen.findByPlaceholderText(/add a comment/i);
      fireEvent.change(commentInput, { target: { value: "Plumber visited and fixed washer." } });

      const sendBtn = screen.getByRole("button", { name: /send/i });
      fireEvent.click(sendBtn);

      expect(await screen.findByText("Plumber visited and fixed washer.")).toBeInTheDocument();
    });
  });

  describe("Disputes", () => {
    it("16. opens a valid dispute detail", async () => {
      renderApp("/tenant/disputes/disp-001");
      expect(await screen.findByRole("heading", { name: /deduction for nail holes claimed excessive/i })).toBeInTheDocument();
      expect(screen.getByText(/amount at stake/i)).toBeInTheDocument();
    });

    it("17. invalid dispute shows proper empty state", async () => {
      renderApp("/tenant/disputes/disp-non-existent");
      expect(await screen.findByText(/dispute not found/i)).toBeInTheDocument();
      expect(screen.getByRole("link", { name: /back to disputes/i })).toBeInTheDocument();
    });

    it("18. adds comment to dispute thread", async () => {
      renderApp("/tenant/disputes/disp-001");

      const commentInput = await screen.findByPlaceholderText(/write a comment/i);
      fireEvent.change(commentInput, { target: { value: "I have receipts from previous painter." } });

      const sendBtn = screen.getByRole("button", { name: /send/i });
      fireEvent.click(sendBtn);

      expect(await screen.findByText("I have receipts from previous painter.")).toBeInTheDocument();
    });
  });

  describe("Notifications", () => {
    it("19. marks single notification as read", async () => {
      renderApp("/notifications");

      const unreadTab = await screen.findByRole("button", { name: /unread/i });
      expect(unreadTab).toBeInTheDocument();

      const markBtns = screen.getAllByRole("button", { name: /mark notification as read/i });
      fireEvent.click(markBtns[0]);

      // State is updated
      await waitFor(() => {
        expect(markBtns[0]).not.toBeInTheDocument();
      });
    });

    it("20. marks all notifications as read", async () => {
      renderApp("/notifications");

      const markAllBtn = await screen.findByRole("button", { name: /mark all as read/i });
      fireEvent.click(markAllBtn);

      await waitFor(() => {
        expect(screen.queryByRole("button", { name: /mark all as read/i })).not.toBeInTheDocument();
      });
    });
  });

  describe("Documents", () => {
    it("21. uploads mock document and it appears in list", async () => {
      renderApp("/documents");

      const uploadBtn = await screen.findByRole("button", { name: /upload document/i });
      fireEvent.click(uploadBtn);

      const titleInput = await screen.findByLabelText(/document title/i);
      fireEvent.change(titleInput, { target: { value: "Parking Agreement 2026" } });

      const submitBtn = screen.getByRole("button", { name: /save document/i });
      fireEvent.click(submitBtn);

      expect(await screen.findByText("Parking Agreement 2026")).toBeInTheDocument();
    });
  });

  describe("Evidence", () => {
    it("23. records move-in room evidence and updates room status", async () => {
      renderApp("/tenant/move-in");

      // Find first room update button
      const updateButtons = await screen.findAllByRole("button", { name: /update/i });
      fireEvent.click(updateButtons[0]);

      const notesInput = await screen.findByLabelText(/notes/i);
      fireEvent.change(notesInput, { target: { value: "Balcony door latch oiled and smooth." } });

      const saveBtn = screen.getByRole("button", { name: /save report/i });
      fireEvent.click(saveBtn);

      expect(await screen.findByText("Balcony door latch oiled and smooth.")).toBeInTheDocument();
    });
  });
});
