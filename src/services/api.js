// All API functions are here. Uses session storage to persist mock changes.
// When a real backend is connected, only this file needs changes.

import {
  properties as initialProperties,
  rooms as initialRooms,
  evidence as initialEvidence,
  maintenanceIssues as initialMaintenance,
  disputes as initialDisputes,
  notifications as initialNotifications,
  documents as initialDocuments,
  depositSummary as initialDepositSummary,
  users as initialUsers,
} from "../data/mockData";
import { storage } from "./storage";

const STORAGE_KEYS = {
  PROPERTIES: "rentguard_properties",
  ROOMS: "rentguard_rooms",
  EVIDENCE: "rentguard_evidence",
  MAINTENANCE: "rentguard_maintenance",
  DISPUTES: "rentguard_disputes",
  NOTIFICATIONS: "rentguard_notifications",
  DOCUMENTS: "rentguard_documents",
  USERS: "rentguard_users",
};

// Initialize session store if not set
function getStored(key, defaultVal) {
  let val = storage.get(key);
  if (!val) {
    val = defaultVal;
    storage.set(key, val);
  }
  return val;
}

export function resetApiStore() {
  storage.set(STORAGE_KEYS.PROPERTIES, initialProperties);
  storage.set(STORAGE_KEYS.ROOMS, initialRooms);
  storage.set(STORAGE_KEYS.EVIDENCE, initialEvidence);
  storage.set(STORAGE_KEYS.MAINTENANCE, initialMaintenance);
  storage.set(STORAGE_KEYS.DISPUTES, initialDisputes);
  storage.set(STORAGE_KEYS.NOTIFICATIONS, initialNotifications);
  storage.set(STORAGE_KEYS.DOCUMENTS, initialDocuments);
  storage.set(STORAGE_KEYS.USERS, initialUsers);
}

// Simulate async API delay (instant in test environment)
const isTest = typeof process !== "undefined" && (process.env.NODE_ENV === "test" || process.env.VITEST);
const delay = (ms = isTest ? 0 : 150) => new Promise((res) => setTimeout(res, ms));

// --- Users ---
export async function getUsers() {
  await delay();
  return getStored(STORAGE_KEYS.USERS, initialUsers);
}

export async function findUserByEmail(email) {
  await delay();
  const users = getStored(STORAGE_KEYS.USERS, initialUsers);
  return users.find((u) => u.email.toLowerCase() === email.toLowerCase()) || null;
}

export async function createUser(userData) {
  await delay();
  const users = getStored(STORAGE_KEYS.USERS, initialUsers);
  const newUser = {
    id: Date.now(),
    avatar: null,
    ...userData,
  };
  storage.set(STORAGE_KEYS.USERS, [...users, newUser]);
  return newUser;
}

// --- Properties ---
export async function getProperties() {
  await delay();
  return getStored(STORAGE_KEYS.PROPERTIES, initialProperties);
}

export async function getProperty(id) {
  await delay();
  const list = getStored(STORAGE_KEYS.PROPERTIES, initialProperties);
  return list.find((p) => p.id === id) || null;
}

// --- Rooms ---
export async function getRoomsByProperty(propertyId) {
  await delay();
  const list = getStored(STORAGE_KEYS.ROOMS, initialRooms);
  return list.filter((r) => r.propertyId === propertyId);
}

// --- Evidence ---
export async function getEvidence(propertyId) {
  await delay();
  const list = getStored(STORAGE_KEYS.EVIDENCE, initialEvidence);
  return list.filter((e) => e.propertyId === propertyId);
}

export async function getEvidenceByRoom(propertyId, roomId) {
  await delay();
  const list = getStored(STORAGE_KEYS.EVIDENCE, initialEvidence);
  return list.filter((e) => e.propertyId === propertyId && e.roomId === roomId);
}

export async function uploadEvidence(payload) {
  await delay(200);
  const list = getStored(STORAGE_KEYS.EVIDENCE, initialEvidence);
  const newEvidence = {
    id: "ev-" + Date.now(),
    propertyId: payload.propertyId,
    roomId: payload.roomId,
    type: payload.type || "move-in",
    condition: payload.condition || "good",
    notes: payload.notes || "",
    photos: (payload.photos || []).map((p, idx) => ({
      id: `ph-new-${Date.now()}-${idx}`,
      url: p.url || null,
      caption: p.caption || p.name || `Photo ${idx + 1}`,
      takenAt: new Date().toISOString(),
      uploadedBy: payload.createdBy || 1,
    })),
    createdAt: new Date().toISOString(),
    createdBy: payload.createdBy || 1,
  };

  const updated = [...list, newEvidence];
  storage.set(STORAGE_KEYS.EVIDENCE, updated);
  return { success: true, evidence: newEvidence };
}

export async function updateEvidenceStatus(evidenceId, status) {
  await delay(150);
  const list = getStored(STORAGE_KEYS.EVIDENCE, initialEvidence);
  const updated = list.map((ev) =>
    ev.id === evidenceId ? { ...ev, confirmationStatus: status } : ev
  );
  storage.set(STORAGE_KEYS.EVIDENCE, updated);
  return { success: true };
}

// --- Maintenance ---
export async function getMaintenanceIssues(propertyId) {
  await delay();
  const list = getStored(STORAGE_KEYS.MAINTENANCE, initialMaintenance);
  return list.filter((m) => m.propertyId === propertyId);
}

export async function createMaintenanceIssue(payload) {
  await delay(200);
  const list = getStored(STORAGE_KEYS.MAINTENANCE, initialMaintenance);
  const newIssue = {
    id: "maint-" + Date.now(),
    propertyId: payload.propertyId,
    title: payload.title,
    description: payload.description,
    category: payload.category || "general",
    priority: payload.priority || "medium",
    status: "open",
    reportedAt: new Date().toISOString(),
    reportedBy: payload.reportedBy || 1,
    assignedTo: null,
    resolvedAt: null,
    comments: [],
  };

  const updated = [newIssue, ...list];
  storage.set(STORAGE_KEYS.MAINTENANCE, updated);
  return { success: true, issue: newIssue };
}

export async function addMaintenanceComment(issueId, comment) {
  await delay(150);
  const list = getStored(STORAGE_KEYS.MAINTENANCE, initialMaintenance);
  const commentObj = typeof comment === "string" ? {
    id: "c-" + Date.now(),
    userId: 1,
    userName: "You",
    text: comment,
    createdAt: new Date().toISOString(),
  } : {
    id: "c-" + Date.now(),
    createdAt: new Date().toISOString(),
    ...comment,
  };

  const updated = list.map((issue) => {
    if (issue.id === issueId) {
      return {
        ...issue,
        comments: [...(issue.comments || []), commentObj],
      };
    }
    return issue;
  });

  storage.set(STORAGE_KEYS.MAINTENANCE, updated);
  return { success: true, comment: commentObj };
}

// --- Disputes ---
export async function getDisputes(propertyId) {
  await delay();
  const list = getStored(STORAGE_KEYS.DISPUTES, initialDisputes);
  if (!propertyId) return list;
  return list.filter((d) => d.propertyId === propertyId);
}

export async function getDispute(id) {
  await delay();
  const list = getStored(STORAGE_KEYS.DISPUTES, initialDisputes);
  return list.find((d) => d.id === id) || null;
}

export async function createDispute(payload) {
  await delay(200);
  const list = getStored(STORAGE_KEYS.DISPUTES, initialDisputes);
  const newDispute = {
    id: "disp-" + Date.now(),
    propertyId: payload.propertyId,
    title: payload.title,
    description: payload.description,
    amount: Number(payload.amount) || 0,
    status: "pending",
    raisedBy: payload.raisedBy || 1,
    raisedAt: new Date().toISOString(),
    resolvedAt: null,
    timeline: [
      {
        id: "t-" + Date.now(),
        event: "Dispute raised by tenant",
        date: new Date().toISOString(),
        userId: payload.raisedBy || 1,
      },
    ],
    comments: [],
  };

  const updated = [newDispute, ...list];
  storage.set(STORAGE_KEYS.DISPUTES, updated);
  return { success: true, dispute: newDispute };
}

export async function addComment(disputeId, comment) {
  await delay(150);
  const list = getStored(STORAGE_KEYS.DISPUTES, initialDisputes);
  const commentObj = typeof comment === "string" ? {
    id: "dc-" + Date.now(),
    userId: 1,
    userName: "You",
    text: comment,
    createdAt: new Date().toISOString(),
  } : {
    id: "dc-" + Date.now(),
    createdAt: new Date().toISOString(),
    ...comment,
  };

  const updated = list.map((d) => {
    if (d.id === disputeId) {
      return {
        ...d,
        comments: [...(d.comments || []), commentObj],
      };
    }
    return d;
  });

  storage.set(STORAGE_KEYS.DISPUTES, updated);
  return { success: true, comment: commentObj };
}

export async function respondToDispute(disputeId, responseText, authorName = "Rajan Mehta", authorId = 2) {
  await delay(200);
  const list = getStored(STORAGE_KEYS.DISPUTES, initialDisputes);
  const now = new Date().toISOString();

  const updated = list.map((d) => {
    if (d.id === disputeId) {
      const timelineEvent = {
        id: "t-" + Date.now(),
        event: `Landlord responded: ${responseText.slice(0, 60)}${responseText.length > 60 ? "..." : ""}`,
        date: now,
        userId: authorId,
      };
      const comment = {
        id: "dc-" + Date.now(),
        userId: authorId,
        userName: authorName,
        text: responseText,
        createdAt: now,
      };
      return {
        ...d,
        status: "disputed",
        timeline: [...(d.timeline || []), timelineEvent],
        comments: [...(d.comments || []), comment],
      };
    }
    return d;
  });

  storage.set(STORAGE_KEYS.DISPUTES, updated);
  return { success: true };
}

// --- Notifications ---
export async function getNotifications() {
  await delay();
  return getStored(STORAGE_KEYS.NOTIFICATIONS, initialNotifications);
}

export async function markNotificationRead(id) {
  await delay(100);
  const list = getStored(STORAGE_KEYS.NOTIFICATIONS, initialNotifications);
  const updated = list.map((n) => (n.id === id ? { ...n, read: true } : n));
  storage.set(STORAGE_KEYS.NOTIFICATIONS, updated);
  return { success: true };
}

export async function markAllNotificationsRead() {
  await delay(150);
  const list = getStored(STORAGE_KEYS.NOTIFICATIONS, initialNotifications);
  const updated = list.map((n) => ({ ...n, read: true }));
  storage.set(STORAGE_KEYS.NOTIFICATIONS, updated);
  return { success: true };
}

// --- Documents ---
export async function getDocuments(propertyId) {
  await delay();
  const list = getStored(STORAGE_KEYS.DOCUMENTS, initialDocuments);
  if (!propertyId) return list;
  return list.filter((d) => d.propertyId === propertyId);
}

export async function uploadDocument(payload) {
  await delay(200);
  const list = getStored(STORAGE_KEYS.DOCUMENTS, initialDocuments);
  const newDoc = {
    id: "doc-" + Date.now(),
    propertyId: payload.propertyId,
    name: payload.name,
    type: payload.type || "lease",
    fileType: payload.fileType || "pdf",
    size: payload.size || "1.0 MB",
    uploadedAt: new Date().toISOString(),
    uploadedBy: payload.uploadedBy || 1,
    url: payload.url || null,
  };

  const updated = [newDoc, ...list];
  storage.set(STORAGE_KEYS.DOCUMENTS, updated);
  return { success: true, document: newDoc };
}

// --- Deposit ---
export async function getDepositSummary(propertyId) {
  await delay();
  return initialDepositSummary.propertyId === propertyId ? initialDepositSummary : null;
}
