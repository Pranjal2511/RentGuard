// RentGuard Client Data Service Layer
// Communicates with backend REST API at /api/v1 with transparent fallback to local store for tests
import axios from "axios";
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

const API_BASE = import.meta.env.VITE_API_URL || "/api/v1";

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

const isTest = typeof process !== "undefined" && (process.env.NODE_ENV === "test" || process.env.VITEST);
const delay = (ms = isTest ? 0 : 50) => new Promise((res) => setTimeout(res, ms));

// --- Users ---
export async function getUsers() {
  try {
    const res = await axios.get(`${API_BASE}/users`);
    if (res.data?.success) return res.data.data;
  } catch {
    // Fallback
  }
  await delay();
  return getStored(STORAGE_KEYS.USERS, initialUsers);
}

export async function findUserByEmail(email) {
  try {
    const res = await axios.get(`${API_BASE}/users/search?email=${encodeURIComponent(email)}`);
    if (res.data?.success) return res.data.data;
  } catch {
    // Fallback
  }
  await delay();
  const usersList = getStored(STORAGE_KEYS.USERS, initialUsers);
  return usersList.find((u) => u.email.toLowerCase() === email.toLowerCase()) || null;
}

export async function createUser(userData) {
  try {
    const res = await axios.post(`${API_BASE}/auth/register`, userData);
    if (res.data?.success) return res.data.data.user;
  } catch {
    // Fallback
  }
  await delay();
  const usersList = getStored(STORAGE_KEYS.USERS, initialUsers);
  const newUser = {
    id: Date.now(),
    avatar: null,
    ...userData,
  };
  storage.set(STORAGE_KEYS.USERS, [...usersList, newUser]);
  return newUser;
}

// --- Properties ---
export async function getProperties() {
  try {
    const res = await axios.get(`${API_BASE}/properties`);
    if (res.data?.success && Array.isArray(res.data.data)) {
      return res.data.data.map((p) => ({
        ...p,
        id: p._id || p.id,
        type: p.type || p.propertyType,
      }));
    }
  } catch {
    // Fallback
  }
  await delay();
  return getStored(STORAGE_KEYS.PROPERTIES, initialProperties);
}

export async function getProperty(id) {
  try {
    const res = await axios.get(`${API_BASE}/properties/${id}`);
    if (res.data?.success && res.data.data) {
      const p = res.data.data;
      return { ...p, id: p._id || p.id, type: p.type || p.propertyType };
    }
  } catch {
    // Fallback
  }
  await delay();
  const list = getStored(STORAGE_KEYS.PROPERTIES, initialProperties);
  return list.find((p) => p.id === id || p._id === id) || null;
}

// --- Rooms ---
export async function getRoomsByProperty(propertyId) {
  try {
    const res = await axios.get(`${API_BASE}/properties/${propertyId}/rooms`);
    if (res.data?.success && Array.isArray(res.data.data)) {
      return res.data.data.map((r) => ({ ...r, id: r._id || r.id }));
    }
  } catch {
    // Fallback
  }
  await delay();
  const list = getStored(STORAGE_KEYS.ROOMS, initialRooms);
  return list.filter((r) => r.propertyId === propertyId);
}

// --- Evidence ---
export async function getEvidence(propertyId) {
  try {
    const res = await axios.get(`${API_BASE}/evidence?propertyId=${propertyId}`);
    if (res.data?.success && Array.isArray(res.data.data)) {
      return res.data.data.map((e) => ({
        ...e,
        id: e._id || e.id,
        roomId: e.roomId?._id || e.roomId,
      }));
    }
  } catch {
    // Fallback
  }
  await delay();
  const list = getStored(STORAGE_KEYS.EVIDENCE, initialEvidence);
  return list.filter((e) => e.propertyId === propertyId);
}

export async function getEvidenceByRoom(propertyId, roomId) {
  try {
    const res = await axios.get(`${API_BASE}/evidence?propertyId=${propertyId}&roomId=${roomId}`);
    if (res.data?.success && Array.isArray(res.data.data)) {
      return res.data.data.map((e) => ({ ...e, id: e._id || e.id }));
    }
  } catch {
    // Fallback
  }
  await delay();
  const list = getStored(STORAGE_KEYS.EVIDENCE, initialEvidence);
  return list.filter((e) => e.propertyId === propertyId && (e.roomId === roomId || e.roomId?._id === roomId));
}

export async function uploadEvidence(payload) {
  try {
    // If photos are File objects, build FormData
    const hasFiles = payload.files && payload.files.length > 0;
    if (hasFiles) {
      const formData = new FormData();
      formData.append("propertyId", payload.propertyId);
      formData.append("roomId", payload.roomId);
      formData.append("type", payload.type || "move-in");
      formData.append("condition", payload.condition || "good");
      formData.append("notes", payload.notes || "");
      formData.append("component", payload.component || "general");
      payload.files.forEach((file) => formData.append("photos", file));

      const res = await axios.post(`${API_BASE}/evidence`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (res.data?.success) {
        return { success: true, evidence: { ...res.data.data, id: res.data.data._id } };
      }
    } else {
      const res = await axios.post(`${API_BASE}/evidence`, payload);
      if (res.data?.success) {
        return { success: true, evidence: { ...res.data.data, id: res.data.data._id } };
      }
    }
  } catch {
    // Fallback
  }

  await delay(100);
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
  try {
    const res = await axios.patch(`${API_BASE}/evidence/${evidenceId}/status`, {
      status,
      decision: status,
    });
    if (res.data?.success) return { success: true };
  } catch {
    // Fallback
  }

  await delay(50);
  const list = getStored(STORAGE_KEYS.EVIDENCE, initialEvidence);
  const updated = list.map((ev) =>
    ev.id === evidenceId || ev._id === evidenceId ? { ...ev, confirmationStatus: status } : ev
  );
  storage.set(STORAGE_KEYS.EVIDENCE, updated);
  return { success: true };
}

// --- Maintenance ---
export async function getMaintenanceIssues(propertyId) {
  try {
    const res = await axios.get(`${API_BASE}/maintenance?propertyId=${propertyId}`);
    if (res.data?.success && Array.isArray(res.data.data)) {
      return res.data.data.map((m) => ({ ...m, id: m._id || m.id }));
    }
  } catch {
    // Fallback
  }
  await delay();
  const list = getStored(STORAGE_KEYS.MAINTENANCE, initialMaintenance);
  return list.filter((m) => m.propertyId === propertyId);
}

export async function createMaintenanceIssue(payload) {
  try {
    const res = await axios.post(`${API_BASE}/maintenance`, payload);
    if (res.data?.success) {
      return { success: true, issue: { ...res.data.data, id: res.data.data._id } };
    }
  } catch {
    // Fallback
  }

  await delay(100);
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
  try {
    const text = typeof comment === "string" ? comment : comment.text;
    const res = await axios.post(`${API_BASE}/maintenance/${issueId}/comments`, { text });
    if (res.data?.success) {
      return { success: true, comment: res.data.data };
    }
  } catch {
    // Fallback
  }

  await delay(50);
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
    if (issue.id === issueId || issue._id === issueId) {
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
  try {
    const res = await axios.get(`${API_BASE}/disputes?propertyId=${propertyId || ""}`);
    if (res.data?.success && Array.isArray(res.data.data)) {
      return res.data.data.map((d) => ({ ...d, id: d._id || d.id }));
    }
  } catch {
    // Fallback
  }
  await delay();
  const list = getStored(STORAGE_KEYS.DISPUTES, initialDisputes);
  if (!propertyId) return list;
  return list.filter((d) => d.propertyId === propertyId);
}

export async function getDispute(id) {
  try {
    const res = await axios.get(`${API_BASE}/disputes/${id}`);
    if (res.data?.success && res.data.data) {
      const d = res.data.data;
      return { ...d, id: d._id || d.id };
    }
  } catch {
    // Fallback
  }
  await delay();
  const list = getStored(STORAGE_KEYS.DISPUTES, initialDisputes);
  return list.find((d) => d.id === id || d._id === id) || null;
}

export async function createDispute(payload) {
  try {
    const res = await axios.post(`${API_BASE}/disputes`, payload);
    if (res.data?.success) {
      return { success: true, dispute: { ...res.data.data, id: res.data.data._id } };
    }
  } catch {
    // Fallback
  }

  await delay(100);
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
  try {
    const text = typeof comment === "string" ? comment : comment.text;
    const res = await axios.post(`${API_BASE}/disputes/${disputeId}/comments`, { text });
    if (res.data?.success) {
      return { success: true, comment: res.data.data };
    }
  } catch {
    // Fallback
  }

  await delay(50);
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
    if (d.id === disputeId || d._id === disputeId) {
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
  try {
    const res = await axios.post(`${API_BASE}/disputes/${disputeId}/respond`, { responseText });
    if (res.data?.success) return { success: true };
  } catch {
    // Fallback
  }

  await delay(100);
  const list = getStored(STORAGE_KEYS.DISPUTES, initialDisputes);
  const now = new Date().toISOString();

  const updated = list.map((d) => {
    if (d.id === disputeId || d._id === disputeId) {
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
  try {
    const res = await axios.get(`${API_BASE}/notifications`);
    if (res.data?.success && Array.isArray(res.data.data)) {
      return res.data.data.map((n) => ({ ...n, id: n._id || n.id }));
    }
  } catch {
    // Fallback
  }
  await delay();
  return getStored(STORAGE_KEYS.NOTIFICATIONS, initialNotifications);
}

export async function markNotificationRead(id) {
  try {
    const res = await axios.patch(`${API_BASE}/notifications/${id}/read`);
    if (res.data?.success) return { success: true };
  } catch {
    // Fallback
  }
  await delay(50);
  const list = getStored(STORAGE_KEYS.NOTIFICATIONS, initialNotifications);
  const updated = list.map((n) => (n.id === id || n._id === id ? { ...n, read: true } : n));
  storage.set(STORAGE_KEYS.NOTIFICATIONS, updated);
  return { success: true };
}

export async function markAllNotificationsRead() {
  try {
    const res = await axios.patch(`${API_BASE}/notifications/read-all`);
    if (res.data?.success) return { success: true };
  } catch {
    // Fallback
  }
  await delay(50);
  const list = getStored(STORAGE_KEYS.NOTIFICATIONS, initialNotifications);
  const updated = list.map((n) => ({ ...n, read: true }));
  storage.set(STORAGE_KEYS.NOTIFICATIONS, updated);
  return { success: true };
}

// --- Documents ---
export async function getDocuments(propertyId) {
  try {
    const res = await axios.get(`${API_BASE}/documents?propertyId=${propertyId || ""}`);
    if (res.data?.success && Array.isArray(res.data.data)) {
      return res.data.data.map((d) => ({ ...d, id: d._id || d.id }));
    }
  } catch {
    // Fallback
  }
  await delay();
  const list = getStored(STORAGE_KEYS.DOCUMENTS, initialDocuments);
  if (!propertyId) return list;
  return list.filter((d) => d.propertyId === propertyId);
}

export async function uploadDocument(payload) {
  try {
    if (payload.file) {
      const formData = new FormData();
      formData.append("propertyId", payload.propertyId);
      formData.append("name", payload.name);
      formData.append("type", payload.type || "lease");
      formData.append("file", payload.file);

      const res = await axios.post(`${API_BASE}/documents`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (res.data?.success) {
        return { success: true, document: { ...res.data.data, id: res.data.data._id } };
      }
    } else {
      const res = await axios.post(`${API_BASE}/documents`, payload);
      if (res.data?.success) {
        return { success: true, document: { ...res.data.data, id: res.data.data._id } };
      }
    }
  } catch {
    // Fallback
  }

  await delay(100);
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
  try {
    const res = await axios.get(`${API_BASE}/deposit/${propertyId}`);
    if (res.data?.success && res.data.data) {
      return res.data.data;
    }
  } catch {
    // Fallback
  }
  await delay();
  return initialDepositSummary.propertyId === propertyId ? initialDepositSummary : null;
}
