# RentGuard — Smart Rental Property Documentation and Dispute Management Platform

[![Node.js](https://img.shields.io/badge/Node.js-v22.12+-183B32?style=flat&logo=node.js)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-19-183B32?style=flat&logo=react)](https://react.dev/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas%20%7C%20Local-183B32?style=flat&logo=mongodb)](https://www.mongodb.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS%20v4-183B32?style=flat&logo=tailwindcss)](https://tailwindcss.com/)

RentGuard is a production-minded PropTech platform connecting tenants and landlords through a centralized rental-property condition documentation and dispute management system. It eliminates friction over preexisting damage, wear-and-tear, maintenance, and security-deposit deductions by creating a structured digital history of every rental property.

---

## 🏛️ Product Architecture & The Four Pillars

RentGuard is architected strictly around four foundational pillars:

```
DOCUMENT ──► TRACK ──► COMPARE ──► RESOLVE
```

1. **DOCUMENT**: Record baseline property conditions during move-in with room-by-room inspection photographs and condition ratings.
2. **TRACK**: Monitor maintenance requests, prioritize repair tickets, and maintain a chronological contractor log.
3. **COMPARE**: Side-by-side visual and Delta analysis between move-in and move-out inspections to objectively distinguish wear-and-tear from damage.
4. **RESOLVE**: Transparent, itemized security deposit deduction ledgers and evidence-linked dispute mediation without hostile arguments.

---

## 📁 Repository Structure

```
RentGuard/
├── frontend/             # React 19 + Vite + Tailwind CSS + Lucide Icons
│   ├── src/
│   │   ├── components/   # Modular UI (Evidence, Disputes, Maintenance, Layout)
│   │   ├── context/      # AuthContext (JWT/Sessions), PropertyContext
│   │   ├── pages/
│   │   │   ├── public/   # Public Editorial Landing Page (Route: /)
│   │   │   ├── auth/     # Sign In & Sign Up pages
│   │   │   ├── tenant/   # Tenant Dashboard, Move-In, Move-Out, Maintenance, Disputes
│   │   │   └── landlord/ # Landlord Dashboard, Properties, Confirmations
│   │   ├── services/     # api.js REST layer (with offline test runner fallback)
│   │   └── test/         # Vitest & Testing Library suites
│   ├── package.json
│   └── vite.config.js
├── backend/              # Node.js + Express.js + Mongoose + JWT + Multer
│   ├── src/
│   │   ├── config/       # db.js (Mongoose), env.js, storage.js
│   │   ├── models/       # 14 Mongoose models (User, Property, Lease, Evidence, etc.)
│   │   ├── controllers/  # Thin controllers (Auth, Property, Evidence, Dispute, etc.)
│   │   ├── routes/       # Express REST endpoints mounted at /api/v1
│   │   ├── middleware/   # authenticate (JWT), authorize (RBAC), upload (Multer), rateLimiter
│   │   ├── services/     # Business logic, audit logging, notifications, AI client
│   │   ├── utils/        # seed.js (full rental lifecycle demonstration data)
│   │   ├── tests/        # Backend API test suite
│   │   ├── app.js
│   │   └── server.js
│   ├── uploads/          # Persistent local file storage (evidence photos & documents)
│   └── package.json
├── ai-service/           # Optional Node.js + Express inspection microservice
│   ├── src/              # Note comparison, inspection summaries, and tests
│   └── package.json
├── docs/                 # System Documentation
│   ├── API_DOCUMENTATION.md
│   └── DATABASE_DESIGN.md
├── package.json          # Root workspace scripts
└── README.md
```

---

## 🚀 Quick Start Guide

### Prerequisites
* **Node.js**: `v22.12.0` or higher (`node -v`)
* **npm**: `v10.0.0` or higher (`npm -v`)
* **MongoDB**: Local MongoDB instance (`mongodb://127.0.0.1:27017/rentguard`) or a free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) cluster URI.

---

### Step 1: Install Dependencies

From the repository root:

```bash
# Install all three Node.js workspaces
npm install
```

---

### Step 2: Configure Environment Variables

1. **Backend Environment** (`backend/.env`):
   A pre-configured template is located at `backend/.env.example`. Create `backend/.env`:
   ```ini
   PORT=5000
   NODE_ENV=development
   MONGODB_URI=mongodb://127.0.0.1:27017/rentguard
   CLIENT_URL=http://localhost:5173
   JWT_ACCESS_SECRET=rentguard_jwt_access_secret_super_secure_key_2026
   JWT_REFRESH_SECRET=rentguard_jwt_refresh_secret_super_secure_key_2026
   COOKIE_SECRET=rentguard_cookie_signing_secret_key_32bytes
   STORAGE_PROVIDER=local
   UPLOAD_DIR=uploads
   AI_SERVICE_URL=http://localhost:8000
   AI_SERVICE_SECRET=rentguard_ai_secret_token_2026
   ```

2. **Frontend Environment** (`frontend/.env`):
   ```ini
   VITE_API_URL=http://localhost:5000/api/v1
   ```

---

### Step 3: Seed the Demonstration Database

Seed realistic demonstration data including users, occupied & vacant properties, active leases, room checklists, move-in/move-out evidence, maintenance requests, and itemized disputes:

```bash
cd backend
npm run seed
cd ..
```

Output:
```
[Seed] Starting RentGuard database seeding...
[RentGuard DB] Connected to MongoDB
[Seed] Created users: Priya Sharma (Tenant), Rajan Mehta (Landlord)
[Seed] Created properties: 42 Bougainvillea Lane, Indiranagar, 15 Koramangala 5th Block
[Seed] Database successfully seeded with full rental lifecycle data!
```

---

### Step 4: Run the Application

You can start the frontend and backend in separate terminal windows:

#### Terminal 1 — Backend:
```bash
cd backend
npm run dev
```
Backend API will start at: `http://localhost:5000`
Health Check: `http://localhost:5000/api/v1/health`

#### Terminal 2 — Frontend:
```bash
cd frontend
npm run dev
```
Frontend web application will start at: `http://localhost:5173`

#### Terminal 3 — (Optional) AI Microservice:
```bash
npm run dev:ai
```
AI Microservice runs on: `http://localhost:8000`. Copy `ai-service/.env.example` to `ai-service/.env` to customize its port, host, and secret. Keep `AI_SERVICE_SECRET` identical in the backend and AI service.

The service preserves the original keyword-based note comparisons and template summaries. It does not run image analysis or OCR; its confidence and timestamp fields are compatibility values, not verified measurements. No Python installation is required.

---

## 🔑 Demonstration Accounts

| Role | Name | Email | Password |
| :--- | :--- | :--- | :--- |
| **Tenant** | Priya Sharma | `priya@example.com` | `Password123!` |
| **Landlord** | Rajan Mehta | `rajan@example.com` | `Password123!` |

> **Development Persona Switcher**: In development mode, the left sidebar includes a convenient role switcher button to switch between Tenant and Landlord perspectives instantly.

---

## 🧪 Testing

### Backend API Tests
Runs integration tests using Node.js native test runner and Supertest:
```bash
cd backend
npm test
```

### Frontend Component & Route Tests
Runs Vitest unit and integration test suites:
```bash
cd frontend
npm test
```

---

## 🛡️ Security Architecture Highlights

* **Authentication & Credentials**: Passwords salted and hashed with `bcryptjs`. Short-lived JWT access tokens with secure HTTP-only cookies.
* **Zero Trust Resource Isolation**: Every route verifies tenancy or ownership relationship against the database. Tenants cannot read or manipulate foreign properties, disputes, or documents.
* **Persistent Uploads**: Multer disk storage and MIME-type validation. File names sanitized with cryptographically random hashes. No volatile memory blob URLs.
* **Audit Trail**: Every critical action (`USER_LOGIN`, `EVIDENCE_UPLOAD`, `DISPUTE_RAISE`, `DISPUTE_RESPOND`) is appended to an immutable `audit_events` collection with IP and timestamp metadata.
* **HTTP Hardening**: Helmet security headers, CORS origin enforcement, and express-rate-limit protection.
* **AI Decoupling**: The core PropTech platform is fully functional if the AI service is offline. AI recommendations are clearly badged with human review notices.

---

## 📄 Documentation

* [Database Design & Schema Reference](docs/DATABASE_DESIGN.md)
* [REST API Endpoint Documentation](docs/API_DOCUMENTATION.md)

### All checks (from repository root)
```bash
npm test
npm run lint
npm run build
```
