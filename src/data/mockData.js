// RentGuard mock data for prototype demo

const wallPhotoSvg = `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'><rect width='100%25' height='100%25' fill='%23EDEBE6'/><rect x='20' y='20' width='360' height='260' rx='8' fill='%23F8F7F4' stroke='%23D8D4C9' stroke-width='2'/><path d='M40 220 L160 140 L240 190 L320 120 L360 160 L360 260 L40 260 Z' fill='%23EAF3EC'/><circle cx='100' cy='80' r='25' fill='%23D8D4C9'/><text x='50%25' y='265' font-family='sans-serif' font-size='12' fill='%237A7A70' text-anchor='middle'>North Wall — Clean Condition</text></svg>`;

const fanPhotoSvg = `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'><rect width='100%25' height='100%25' fill='%23EDEBE6'/><rect x='20' y='20' width='360' height='260' rx='8' fill='%23F8F7F4' stroke='%23D8D4C9' stroke-width='2'/><circle cx='200' cy='140' r='24' fill='%232F4F3D'/><path d='M200 140 L120 70 M200 140 L280 70 M200 140 L200 230' stroke='%233A4A3E' stroke-width='8' stroke-linecap='round'/><text x='50%25' y='265' font-family='sans-serif' font-size='12' fill='%237A7A70' text-anchor='middle'>Ceiling Fan Inspection</text></svg>`;

const wardrobePhotoSvg = `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'><rect width='100%25' height='100%25' fill='%23EDEBE6'/><rect x='20' y='20' width='360' height='260' rx='8' fill='%23F8F7F4' stroke='%23D8D4C9' stroke-width='2'/><rect x='100' y='50' width='200' height='200' rx='4' fill='%23E8E5DE' stroke='%232F4F3D' stroke-width='2'/><line x1='200' y1='50' x2='200' y2='250' stroke='%232F4F3D' stroke-width='2'/><circle cx='185' cy='150' r='4' fill='%23C07D18'/><circle cx='215' cy='150' r='4' fill='%23C07D18'/><text x='50%25' y='275' font-family='sans-serif' font-size='12' fill='%237A7A70' text-anchor='middle'>Master Bedroom Wardrobe</text></svg>`;

const nailHolesPhotoSvg = `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'><rect width='100%25' height='100%25' fill='%23EDEBE6'/><rect x='20' y='20' width='360' height='260' rx='8' fill='%23F8F7F4' stroke='%23D8D4C9' stroke-width='2'/><circle cx='170' cy='130' r='3' fill='%23B5533C'/><circle cx='230' cy='135' r='3' fill='%23B5533C'/><circle cx='200' cy='133' r='45' fill='none' stroke='%23B5533C' stroke-width='1.5' stroke-dasharray='4'/><text x='50%25' y='265' font-family='sans-serif' font-size='12' fill='%23B5533C' text-anchor='middle'>East Wall — 2 Minor Nail Holes (approx 2mm)</text></svg>`;

export const users = [
  {
    id: 1,
    name: "Priya Sharma",
    email: "priya@example.com",
    role: "tenant",
    avatar: null,
  },
  {
    id: 2,
    name: "Rajan Mehta",
    email: "rajan@example.com",
    role: "landlord",
    avatar: null,
  },
];

export const currentUser = users[0];
export const landlordUser = users[1];

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
    leaseStart: "2026-04-01",
    leaseEnd: "2027-03-31",
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
      { id: "ph-001", url: wallPhotoSvg, caption: "North wall", takenAt: "2026-04-01T10:00:00Z", uploadedBy: 1 },
      { id: "ph-002", url: fanPhotoSvg, caption: "Ceiling fan", takenAt: "2026-04-01T10:05:00Z", uploadedBy: 1 },
    ],
    createdAt: "2026-04-01T10:30:00Z",
    createdBy: 1,
  },
  {
    id: "ev-002",
    propertyId: "prop-001",
    roomId: "r2",
    type: "move-in",
    condition: "good",
    notes: "New flooring, no damage observed.",
    photos: [
      { id: "ph-003", url: wardrobePhotoSvg, caption: "Wardrobe", takenAt: "2026-04-01T11:00:00Z", uploadedBy: 1 },
    ],
    createdAt: "2026-04-01T11:30:00Z",
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
    createdAt: "2026-04-01T12:00:00Z",
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
      { id: "ph-004", url: nailHolesPhotoSvg, caption: "East wall close-up", takenAt: "2026-09-15T09:00:00Z", uploadedBy: 1 },
    ],
    createdAt: "2026-09-15T09:30:00Z",
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
    reportedAt: "2026-08-10T08:00:00Z",
    reportedBy: 1,
    assignedTo: null,
    resolvedAt: null,
    comments: [
      { id: "c1", userId: 2, userName: "Rajan Mehta", text: "Will send a plumber by Thursday.", createdAt: "2026-08-11T10:00:00Z" },
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
    reportedAt: "2026-07-20T09:00:00Z",
    reportedBy: 1,
    assignedTo: "Electrician",
    resolvedAt: null,
    comments: [
      { id: "c2", userId: 2, userName: "Rajan Mehta", text: "Electrician will visit on 25th July.", createdAt: "2026-07-22T11:00:00Z" },
      { id: "c3", userId: 1, userName: "Priya Sharma", text: "Is there an update? No one came on 25th.", createdAt: "2026-07-26T08:00:00Z" },
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
    reportedAt: "2026-06-05T10:00:00Z",
    reportedBy: 1,
    assignedTo: "Carpenter",
    resolvedAt: "2026-06-12T15:00:00Z",
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
    raisedAt: "2026-09-20T10:00:00Z",
    resolvedAt: null,
    timeline: [
      { id: "t1", event: "Dispute raised by tenant", date: "2026-09-20T10:00:00Z", userId: 1 },
      { id: "t2", event: "Landlord notified", date: "2026-09-20T10:05:00Z", userId: null },
      { id: "t3", event: "Landlord responded: Deduction is for complete wall repainting", date: "2026-09-22T14:00:00Z", userId: 2 },
    ],
    comments: [
      { id: "dc1", userId: 1, userName: "Priya Sharma", text: "I've attached photos showing the holes are minor. Requesting reconsideration.", createdAt: "2026-09-20T10:30:00Z" },
      { id: "dc2", userId: 2, userName: "Rajan Mehta", text: "The wall paint is damaged beyond spot repair. Full repaint required.", createdAt: "2026-09-22T14:00:00Z" },
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
    raisedAt: "2026-09-21T11:00:00Z",
    resolvedAt: null,
    timeline: [
      { id: "t4", event: "Dispute raised by tenant", date: "2026-09-21T11:00:00Z", userId: 1 },
      { id: "t5", event: "Awaiting landlord response", date: "2026-09-21T11:05:00Z", userId: null },
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
    createdAt: "2026-09-22T14:05:00Z",
    link: "/tenant/disputes/disp-001",
  },
  {
    id: "notif-002",
    type: "maintenance",
    title: "Maintenance issue updated",
    body: "Status changed to In Progress: Bathroom tap dripping constantly",
    read: false,
    createdAt: "2026-08-11T10:05:00Z",
    link: "/tenant/maintenance",
  },
  {
    id: "notif-003",
    type: "lease",
    title: "Lease review milestone",
    body: "6 months remaining on your active lease at 42 Bougainvillea Lane.",
    read: true,
    createdAt: "2026-09-30T09:00:00Z",
    link: "/property/prop-001",
  },
  {
    id: "notif-004",
    type: "document",
    title: "New document shared",
    body: "Your landlord has shared the signed lease agreement.",
    read: true,
    createdAt: "2026-04-01T08:00:00Z",
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
    uploadedAt: "2026-04-01T08:00:00Z",
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
    uploadedAt: "2026-04-01T14:00:00Z",
    uploadedBy: 1,
    url: null,
  },
  {
    id: "doc-003",
    propertyId: "prop-001",
    name: "Rent Receipts - April 2026",
    type: "receipt",
    fileType: "pdf",
    size: "0.3 MB",
    uploadedAt: "2026-05-05T10:00:00Z",
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
    uploadedAt: "2026-07-30T16:00:00Z",
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
