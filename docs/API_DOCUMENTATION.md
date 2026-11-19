# RentGuard REST API Documentation

Base URL: `http://localhost:5000/api/v1` (with alias `/api`)

All protected endpoints require an `Authorization: Bearer <token>` header or a valid `rentguard_token` HTTP-only cookie.

---

## 1. Authentication Endpoints

### 1.1 Register User
* **Method**: `POST`
* **Path**: `/auth/register`
* **Public**: Yes
* **Request Body**:
  ```json
  {
    "name": "Priya Sharma",
    "email": "priya@example.com",
    "password": "Password123!",
    "role": "tenant"
  }
  ```
* **Response (201 Created)**:
  ```json
  {
    "success": true,
    "message": "Account created successfully",
    "data": {
      "user": {
        "_id": "6732f91...",
        "name": "Priya Sharma",
        "email": "priya@example.com",
        "role": "tenant",
        "isEmailVerified": true
      },
      "token": "eyJhbGciOiJIUzI1NiIs..."
    }
  }
  ```

### 1.2 Login User
* **Method**: `POST`
* **Path**: `/auth/login`
* **Public**: Yes
* **Request Body**:
  ```json
  {
    "email": "priya@example.com",
    "password": "Password123!",
    "role": "tenant"
  }
  ```
* **Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Logged in successfully",
    "data": {
      "user": { ... },
      "token": "eyJhbGciOiJIUzI1NiIs..."
    }
  }
  ```

### 1.3 Get Current Profile
* **Method**: `GET`
* **Path**: `/auth/me`
* **Protected**: Yes (Bearer Token)
* **Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "user": { ... }
    }
  }
  ```

### 1.4 Logout
* **Method**: `POST`
* **Path**: `/auth/logout`
* **Protected**: Yes
* **Response (200 OK)**: Clears cookie and invalidates session.

---

## 2. Properties & Rooms

### 2.1 List Properties
* **Method**: `GET`
* **Path**: `/properties`
* **Protected**: Yes
* **Behavior**: Scoped by role. Landlords receive owned properties; Tenants receive properties linked to their active leases.

### 2.2 Get Property Details
* **Method**: `GET`
* **Path**: `/properties/:propertyId`
* **Protected**: Yes (Validates user ownership/tenancy relationship)

### 2.3 Create Property
* **Method**: `POST`
* **Path**: `/properties`
* **Protected**: Yes (Role: `landlord` or `admin`)
* **Request Body**:
  ```json
  {
    "name": "Palm Residency 4B",
    "address": "128 Indiranagar 100ft Road, Bengaluru",
    "propertyType": "2BHK Apartment",
    "monthlyRent": 32000,
    "deposit": 96000
  }
  ```

### 2.4 List Rooms for Property
* **Method**: `GET`
* **Path**: `/properties/:propertyId/rooms`
* **Protected**: Yes

---

## 3. Evidence & Inspections

### 3.1 List Evidence
* **Method**: `GET`
* **Path**: `/evidence?propertyId=:id&roomId=:roomId&type=:type`
* **Protected**: Yes

### 3.2 Upload Evidence
* **Method**: `POST`
* **Path**: `/evidence`
* **Protected**: Yes
* **Content-Type**: `multipart/form-data` or `application/json`
* **Fields**: `propertyId`, `roomId`, `type`, `condition`, `notes`, `photos` (files or array of `{ url, caption }`)

### 3.3 Review Evidence (Landlord)
* **Method**: `PATCH`
* **Path**: `/evidence/:evidenceId/status`
* **Protected**: Yes (Role: `landlord`)
* **Request Body**:
  ```json
  {
    "decision": "confirmed",
    "reason": "Verified upon physical walkthrough"
  }
  ```

---

## 4. Maintenance Requests

### 4.1 List Issues
* **Method**: `GET`
* **Path**: `/maintenance?propertyId=:id&status=open&priority=high`
* **Protected**: Yes

### 4.2 Report Issue
* **Method**: `POST`
* **Path**: `/maintenance`
* **Protected**: Yes
* **Request Body**:
  ```json
  {
    "propertyId": "6732f9...",
    "title": "Kitchen faucet leaking",
    "description": "Continuous drip under the main sink",
    "category": "plumbing",
    "priority": "medium"
  }
  ```

### 4.3 Add Maintenance Comment
* **Method**: `POST`
* **Path**: `/maintenance/:issueId/comments`
* **Protected**: Yes
* **Request Body**:
  ```json
  {
    "text": "Plumber scheduled for tomorrow at 10 AM."
  }
  ```

---

## 5. Disputes & Deposit Management

### 5.1 List Disputes
* **Method**: `GET`
* **Path**: `/disputes?propertyId=:id&status=disputed`
* **Protected**: Yes

### 5.2 Raise Dispute
* **Method**: `POST`
* **Path**: `/disputes`
* **Protected**: Yes
* **Request Body**:
  ```json
  {
    "propertyId": "6732f9...",
    "title": "Excessive painting charge",
    "description": "₹8,000 deducted for minor nail holes",
    "amount": 8000
  }
  ```

### 5.3 Respond to Dispute (Landlord)
* **Method**: `POST`
* **Path**: `/disputes/:disputeId/respond`
* **Protected**: Yes (Role: `landlord`)
* **Request Body**:
  ```json
  {
    "responseText": "Full wall repainting required per agreement terms."
  }
  ```

### 5.4 Get Security Deposit Summary
* **Method**: `GET`
* **Path**: `/deposit/:propertyId`
* **Protected**: Yes
* **Response**: Returns total deposit held, itemized deduction ledger, and calculated refund amount.

---

## 6. Documents Vault

### 6.1 List Documents
* **Method**: `GET`
* **Path**: `/documents?propertyId=:id&type=lease`
* **Protected**: Yes

### 6.2 Upload Document
* **Method**: `POST`
* **Path**: `/documents`
* **Protected**: Yes
* **Content-Type**: `multipart/form-data`
* **Fields**: `file` (PDF/Image), `propertyId`, `name`, `type`

### 6.3 Download Document
* **Method**: `GET`
* **Path**: `/documents/:documentId/download`
* **Protected**: Yes (Validates user authorization)

---

## 7. Notifications

### 7.1 List Notifications
* **Method**: `GET`
* **Path**: `/notifications?filter=unread`
* **Protected**: Yes

### 7.2 Mark Read
* **Method**: `PATCH`
* **Path**: `/notifications/:notificationId/read`
* **Protected**: Yes

### 7.3 Mark All Read
* **Method**: `PATCH`
* **Path**: `/notifications/read-all`
* **Protected**: Yes

---

## 8. AI Microservice Endpoints

### 8.1 Compare Move-In vs Move-Out Photos
* **Method**: `POST`
* **Path**: `/ai/compare-inspections`
* **Protected**: Yes
* **Request Body**:
  ```json
  {
    "moveInPhoto": "...",
    "moveOutPhoto": "...",
    "room": "Living Room",
    "component": "Walls",
    "moveInNotes": "Clean wall",
    "moveOutNotes": "2 nail holes visible"
  }
  ```
* **Response**:
  ```json
  {
    "success": true,
    "data": {
      "room": "Living Room",
      "component": "Walls",
      "delta": "deterioration",
      "observations": ["Surface penetrations / fastener holes detected on wall surface."],
      "confidence": 0.84,
      "requiresHumanReview": true
    }
  }
  ```

