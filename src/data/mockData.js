// Temporary mock data until backend API is connected

export const currentUser = {
  id: 1,
  name: "Priya Sharma",
  email: "priya@example.com",
  role: "tenant", // "tenant" | "landlord"
  avatar: null,
};

export const landlordUser = {
  id: 2,
  name: "Rajan Mehta",
  email: "rajan@example.com",
  role: "landlord",
  avatar: null,
};

export const properties = [
  {
    id: "prop-001",
    address: "42 Bougainvillea Lane, Indiranagar, Bengaluru 560038",
    type: "2BHK Apartment",
    floor: "3rd Floor",
    landlordId: 2,
    tenantId: 1,
    monthlyRent: 28000,
    deposit: 84000,
    leaseStart: "2024-02-01",
    leaseEnd: "2025-01-31",
    status: "active",
    coverImage: null,
  },
  {
    id: "prop-002",
    address: "15 Koramangala 5th Block, Bengaluru 560095",
    type: "1BHK Studio",
    floor: "1st Floor",
    landlordId: 2,
    tenantId: null,
    monthlyRent: 18000,
    deposit: 54000,
    leaseStart: null,
    leaseEnd: null,
    status: "vacant",
    coverImage: null,
  },
];

export const rooms = [
  { id: "r1", propertyId: "prop-001", name: "Living Room", order: 1 },
  { id: "r2", propertyId: "prop-001", name: "Master Bedroom", order: 2 },
  { id: "r3", propertyId: "prop-001", name: "Bedroom 2", order: 3 },
  { id: "r4", propertyId: "prop-001", name: "Kitchen", order: 4 },
  { id: "r5", propertyId: "prop-001", name: "Bathroom 1", order: 5 },
  { id: "r6", propertyId: "prop-001", name: "Bathroom 2", order: 6 },
  { id: "r7", propertyId: "prop-001", name: "Balcony", order: 7 },
];

export const evidence = [
  {
    id: "ev-001",
    propertyId: "prop-001",
    roomId: "r1",
    type: "move-in",
    condition: "good",
    notes: "Walls freshly painted, minor scuff near entrance door.",
    photos: [
      { id: "ph-001", url: null, caption: "North wall", takenAt: "2024-02-01T10:00:00Z" },
      { id: "ph-002", url: null, caption: "Ceiling fan", takenAt: "2024-02-01T10:05:00Z" },
    ],
    createdAt: "2024-02-01T10:30:00Z",
    createdBy: 1,
  },
  {
    id: "ev-002",
    propertyId: "prop-001",
    roomId: "r2",
    type: "move-in",
    condition: "excellent",
    notes: "New flooring, no damage observed.",
    photos: [
      { id: "ph-003", url: null, caption: "Wardrobe", takenAt: "2024-02-01T11:00:00Z" },
    ],
    createdAt: "2024-02-01T11:30:00Z",
    createdBy: 1,
  },
  {
    id: "ev-003",
    propertyId: "prop-001",
    roomId: "r4",
    type: "move-in",
    condition: "fair",
    notes: "Chimney slightly dirty, one burner slightly loose.",
    photos: [],
    createdAt: "2024-02-01T12:00:00Z",
    createdBy: 1,
  },
  {
    id: "ev-004",
    propertyId: "prop-001",
    roomId: "r1",
    type: "move-out",
    condition: "fair",
    notes: "Two small nail holes on east wall. Carpet has light staining.",
    photos: [
      { id: "ph-004", url: null, caption: "East wall close-up", takenAt: "2025-01-15T09:00:00Z" },
    ],
    createdAt: "2025-01-15T09:30:00Z",
    createdBy: 1,
  },
];

export const maintenanceIssues = [
  {
    id: "maint-001",
    propertyId: "prop-001",
    title: "Bathroom tap dripping constantly",
    description: "The hot water tap in Bathroom 1 has been dripping for two weeks. Water wastage is noticeable.",
    category: "plumbing",
    priority: "high",
    status: "open",
    reportedAt: "2024-08-10T08:00:00Z",
    reportedBy: 1,
    assignedTo: null,
    resolvedAt: null,
    comments: [
      { id: "c1", userId: 2, userName: "Rajan Mehta", text: "Will send a plumber by Thursday.", createdAt: "2024-08-11T10:00:00Z" },
    ],
  },
  {
    id: "maint-002",
    propertyId: "prop-001",
    title: "Bedroom 2 ceiling fan making noise",
    description: "The ceiling fan wobbles and makes a rattling noise at medium and high speed.",
    category: "electrical",
    priority: "medium",
    status: "in_progress",
    reportedAt: "2024-07-20T09:00:00Z",
    reportedBy: 1,
    assignedTo: "Electrician",
    resolvedAt: null,
    comments: [
      { id: "c2", userId: 2, userName: "Rajan Mehta", text: "Electrician will visit on 25th July.", createdAt: "2024-07-22T11:00:00Z" },
      { id: "c3", userId: 1, userName: "Priya Sharma", text: "Is there an update? No one came on 25th.", createdAt: "2024-07-26T08:00:00Z" },
    ],
  },
  {
    id: "maint-003",
    propertyId: "prop-001",
    title: "Main door lock stiff",
    description: "The main entrance lock requires excessive force to open with the key.",
    category: "general",
    priority: "low",
    status: "resolved",
    reportedAt: "2024-06-05T10:00:00Z",
    reportedBy: 1,
    assignedTo: "Carpenter",
    resolvedAt: "2024-06-12T15:00:00Z",
    comments: [],
  },
];

export const disputes = [
  {
    id: "disp-001",
    propertyId: "prop-001",
    title: "Deduction for nail holes claimed excessive",
    description: "Landlord is claiming ₹8,000 for two small nail holes in the living room. Standard repair cost is under ₹500.",
    amount: 8000,
    status: "disputed",
    raisedBy: 1,
    raisedAt: "2025-01-20T10:00:00Z",
    resolvedAt: null,
    timeline: [
      { id: "t1", event: "Dispute raised by tenant", date: "2025-01-20T10:00:00Z", userId: 1 },
      { id: "t2", event: "Landlord notified", date: "2025-01-20T10:05:00Z", userId: null },
      { id: "t3", event: "Landlord responded: Deduction is for complete wall repainting", date: "2025-01-22T14:00:00Z", userId: 2 },
    ],
    comments: [
      { id: "dc1", userId: 1, userName: "Priya Sharma", text: "I've attached photos showing the holes are minor. Requesting reconsideration.", createdAt: "2025-01-20T10:30:00Z" },
      { id: "dc2", userId: 2, userName: "Rajan Mehta", text: "The wall paint is damaged beyond spot repair. Full repaint required.", createdAt: "2025-01-22T14:00:00Z" },
    ],
  },
  {
    id: "disp-002",
    propertyId: "prop-001",
    title: "Carpet cleaning deduction",
    description: "₹3,500 deducted for carpet cleaning. Carpet was in similar condition at move-in per evidence report.",
    amount: 3500,
    status: "pending",
    raisedBy: 1,
    raisedAt: "2025-01-21T11:00:00Z",
    resolvedAt: null,
    timeline: [
      { id: "t4", event: "Dispute raised by tenant", date: "2025-01-21T11:00:00Z", userId: 1 },
      { id: "t5", event: "Awaiting landlord response", date: "2025-01-21T11:05:00Z", userId: null },
    ],
    comments: [],
  },
];

export const notifications = [
  {
    id: "notif-001",
    type: "dispute",
    title: "Landlord responded to your dispute",
    body: "Rajan Mehta has replied to: Deduction for nail holes claimed excessive",
    read: false,
    createdAt: "2025-01-22T14:05:00Z",
    link: "/tenant/disputes/disp-001",
  },
  {
    id: "notif-002",
    type: "maintenance",
    title: "Maintenance issue updated",
    body: "Status changed to In Progress: Bathroom tap dripping constantly",
    read: false,
    createdAt: "2024-08-11T10:05:00Z",
    link: "/tenant/maintenance",
  },
  {
    id: "notif-003",
    type: "lease",
    title: "Lease expiring in 3 months",
    body: "Your lease at 42 Bougainvillea Lane expires on 31 January 2025.",
    read: true,
    createdAt: "2024-10-31T09:00:00Z",
    link: "/property/prop-001",
  },
  {
    id: "notif-004",
    type: "document",
    title: "New document shared",
    body: "Your landlord has shared the signed lease agreement.",
    read: true,
    createdAt: "2024-02-01T08:00:00Z",
    link: "/documents",
  },
];

export const documents = [
  {
    id: "doc-001",
    propertyId: "prop-001",
    name: "Lease Agreement",
    type: "lease",
    fileType: "pdf",
    size: "1.2 MB",
    uploadedAt: "2024-02-01T08:00:00Z",
    uploadedBy: 2,
    url: null,
  },
  {
    id: "doc-002",
    propertyId: "prop-001",
    name: "Move-In Condition Report",
    type: "condition_report",
    fileType: "pdf",
    size: "3.4 MB",
    uploadedAt: "2024-02-01T14:00:00Z",
    uploadedBy: 1,
    url: null,
  },
  {
    id: "doc-003",
    propertyId: "prop-001",
    name: "Rent Receipts - Feb 2024",
    type: "receipt",
    fileType: "pdf",
    size: "0.3 MB",
    uploadedAt: "2024-03-05T10:00:00Z",
    uploadedBy: 2,
    url: null,
  },
  {
    id: "doc-004",
    propertyId: "prop-001",
    name: "Maintenance Invoice - Fan Repair",
    type: "invoice",
    fileType: "pdf",
    size: "0.5 MB",
    uploadedAt: "2024-07-30T16:00:00Z",
    uploadedBy: 2,
    url: null,
  },
];

export const depositSummary = {
  propertyId: "prop-001",
  totalDeposit: 84000,
  deductions: [
    { id: "ded-001", reason: "Nail holes in living room wall", amount: 8000, status: "disputed" },
    { id: "ded-002", reason: "Carpet cleaning", amount: 3500, status: "pending" },
  ],
  totalDeducted: 11500,
  refundAmount: 72500,
};
