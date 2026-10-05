// All API functions are here. Currently using mock data.
// When a real backend is connected, only this file needs significant changes.

import {
  properties,
  rooms,
  evidence,
  maintenanceIssues,
  disputes,
  notifications,
  documents,
  depositSummary,
} from "../data/mockData";

// Simulate async API delay
const delay = (ms = 300) => new Promise((res) => setTimeout(res, ms));

// --- Properties ---
export async function getProperties() {
  await delay();
  return properties;
}

export async function getProperty(id) {
  await delay();
  return properties.find((p) => p.id === id) || null;
}

// --- Rooms ---
export async function getRoomsByProperty(propertyId) {
  await delay();
  return rooms.filter((r) => r.propertyId === propertyId);
}

// --- Evidence ---
export async function getEvidence(propertyId) {
  await delay();
  return evidence.filter((e) => e.propertyId === propertyId);
}

export async function getEvidenceByRoom(propertyId, roomId) {
  await delay();
  return evidence.filter((e) => e.propertyId === propertyId && e.roomId === roomId);
}

export async function uploadEvidence(payload) {
  await delay(500);
  // Mock: In real implementation, POST to /api/evidence
  console.log("Uploading evidence:", payload);
  return { success: true, id: "ev-new-" + Date.now() };
}

// --- Maintenance ---
export async function getMaintenanceIssues(propertyId) {
  await delay();
  return maintenanceIssues.filter((m) => m.propertyId === propertyId);
}

export async function createMaintenanceIssue(payload) {
  await delay(500);
  console.log("Creating maintenance issue:", payload);
  return { success: true, id: "maint-new-" + Date.now() };
}

export async function addMaintenanceComment(issueId, comment) {
  await delay(300);
  console.log("Adding comment to", issueId, ":", comment);
  return { success: true };
}

// --- Disputes ---
export async function getDisputes(propertyId) {
  await delay();
  return disputes.filter((d) => d.propertyId === propertyId);
}

export async function getDispute(id) {
  await delay();
  return disputes.find((d) => d.id === id) || null;
}

export async function createDispute(payload) {
  await delay(500);
  console.log("Creating dispute:", payload);
  return { success: true, id: "disp-new-" + Date.now() };
}

export async function addComment(disputeId, comment) {
  await delay(300);
  console.log("Adding comment to dispute", disputeId, ":", comment);
  return { success: true };
}

// --- Notifications ---
export async function getNotifications() {
  await delay();
  return notifications;
}

export async function markNotificationRead(id) {
  await delay(200);
  console.log("Marking notification read:", id);
  return { success: true };
}

// --- Documents ---
export async function getDocuments(propertyId) {
  await delay();
  return documents.filter((d) => d.propertyId === propertyId);
}

// --- Deposit ---
export async function getDepositSummary(propertyId) {
  await delay();
  return depositSummary.propertyId === propertyId ? depositSummary : null;
}
