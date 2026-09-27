# VoltPoint EV Platform - REST API Documentation

**Project:** EV Charging Station Management & Booking Platform  
**Version:** 1.0.0  
**Base URL:** `http://localhost:8080/api`  
**Authentication Scheme:** Bearer Token (Stateless JWT via `Authorization: Bearer <token>`)

---

## 1. Authentication Endpoints (`/api/auth`)

### 1.1 Register User
- **Method & Route:** `POST /api/auth/register`
- **Access:** Public
- **Request Body:**
```json
{
  "name": "Jaydeep Patil",
  "email": "customer@evhub.in",
  "password": "password123",
  "phone": "9876543210",
  "role": "ROLE_CUSTOMER"
}
```
- **Response (200 OK):**
```json
{
  "id": 4,
  "name": "Jaydeep Patil",
  "email": "customer@evhub.in",
  "role": "ROLE_CUSTOMER",
  "phone": "9876543210",
  "token": "eyJhbGciOiJIUzI1NiJ9..."
}
```

### 1.2 Login User
- **Method & Route:** `POST /api/auth/login`
- **Access:** Public
- **Request Body:**
```json
{
  "email": "customer@evhub.in",
  "password": "password123"
}
```
- **Response (200 OK):** Returns JWT token and user profile object.

### 1.3 Get Current User Profile
- **Method & Route:** `GET /api/auth/me`
- **Access:** Authenticated (Any role)

---

## 2. Vehicle Management Endpoints (`/api/vehicles`)

### 2.1 Get Current User's Vehicles
- **Method & Route:** `GET /api/vehicles/my`
- **Access:** Customer, Admin
- **Response (200 OK):** Array of Vehicle objects.

### 2.2 Add New Electric Vehicle
- **Method & Route:** `POST /api/vehicles`
- **Access:** Customer, Admin
- **Request Body:**
```json
{
  "make": "Tata",
  "model": "Nexon EV Max",
  "year": 2024,
  "registrationNumber": "MH 01 EV 1024",
  "batteryCapacityKwh": 40.5,
  "maxChargingPowerKw": 50.0,
  "connectorType": "CCS2"
}
```

### 2.3 Delete Vehicle
- **Method & Route:** `DELETE /api/vehicles/{id}`
- **Access:** Vehicle Owner or Admin

---

## 3. Charging Stations & Chargers (`/api/stations`, `/api/chargers`)

### 3.1 Discover Stations (Dynamic Filtering)
- **Method & Route:** `GET /api/stations`
- **Query Params:**
  - `search`: string (Name, address keyword)
  - `city`: string (`Mumbai`, `Navi Mumbai`, `Thane`)
  - `status`: string (`ACTIVE`, `MAINTENANCE`)
  - `chargerType`: string (`DC_FAST`, `AC_SLOW`)
- **Access:** Public

### 3.2 Get Station Details by ID
- **Method & Route:** `GET /api/stations/{id}`
- **Access:** Public

### 3.3 List Chargers of a Station
- **Method & Route:** `GET /api/stations/{id}/chargers`
- **Access:** Public

### 3.4 Create Station
- **Method & Route:** `POST /api/stations`
- **Access:** Admin only

### 3.5 Add Charger Port
- **Method & Route:** `POST /api/chargers`
- **Access:** Operator, Admin
- **Request Body:**
```json
{
  "stationId": 1,
  "identifier": "CHG-05",
  "chargerType": "DC_FAST",
  "connectorType": "CCS2",
  "powerKw": 60.0,
  "pricePerKwh": 18.5,
  "status": "AVAILABLE"
}
```

### 3.6 Update Charger Hardware Status
- **Method & Route:** `PUT /api/chargers/{id}/status?status=AVAILABLE|MAINTENANCE|OCCUPIED`
- **Access:** Operator, Admin

---

## 4. Slot Booking & Conflict Prevention (`/api/bookings`)

### 4.1 Reserve Slot
- **Method & Route:** `POST /api/bookings`
- **Access:** Customer, Admin
- **Request Body:**
```json
{
  "chargerId": 1,
  "vehicleId": 1,
  "startTime": "2026-09-20T10:00:00.000Z",
  "endTime": "2026-09-20T11:00:00.000Z",
  "estimatedKwh": 35.0
}
```
- **Conflict Response (409 Conflict):**
```json
{
  "message": "Charger is already booked for the selected time interval. Please select a different slot or charger."
}
```

### 4.2 Get User's Bookings
- **Method & Route:** `GET /api/bookings/my`
- **Access:** Customer

### 4.3 Cancel Reservation
- **Method & Route:** `PUT /api/bookings/{id}/cancel`
- **Access:** Customer (Owner), Admin

---

## 5. Live Charging Telemetry & Simulation (`/api/sessions`)

### 5.1 Start Charging Session
- **Method & Route:** `POST /api/sessions/start`
- **Access:** Customer
- **Request Body:**
```json
{
  "bookingId": 1,
  "initialBatteryPercentage": 20.0
}
```

### 5.2 Get Active Session
- **Method & Route:** `GET /api/sessions/active`
- **Access:** Customer

### 5.3 Fast-Forward Simulation Tick (Viva Demo Feature)
- **Method & Route:** `POST /api/sessions/{id}/tick?minutes=15`
- **Access:** Customer, Operator, Admin
- **Description:** Advances charging simulation by `N` minutes. Recalculates delivered kWh, battery percentage increase, and current cost.

### 5.4 Stop Charging Session
- **Method & Route:** `POST /api/sessions/{id}/stop`
- **Access:** Customer, Operator
- **Description:** Finalizes charging session, transitions charger status back to `AVAILABLE`, and automatically creates the itemized Bill with 18% GST.

---

## 6. Billing & Tax Invoices (`/api/bills`)

### 6.1 Get User Invoices
- **Method & Route:** `GET /api/bills/my`
- **Access:** Customer

### 6.2 Get Bill Details by ID
- **Method & Route:** `GET /api/bills/{id}`
- **Access:** Customer, Admin

---

## 7. Simulated Payments (`/api/payments`)

### 7.1 Process Simulated Payment
- **Method & Route:** `POST /api/payments/process`
- **Access:** Customer
- **Request Body:**
```json
{
  "billId": 1,
  "paymentMethod": "UPI"
}
```
- **Response (200 OK):** Returns payment object with generated unique `transactionReference` (e.g., `TXN-82749102`) and sets bill status to `PAID`.

### 7.2 Get Payment History
- **Method & Route:** `GET /api/payments/my`
- **Access:** Customer

---

## 8. Dashboards & Analytics (`/api/dashboard`)

### 8.1 Customer Dashboard
- **Method & Route:** `GET /api/dashboard/customer`
- **Returns:** User stats, vehicle count, upcoming bookings, active live session, total kWh charged, total spent, CO2 saved (kg).

### 8.2 Operator Dashboard
- **Method & Route:** `GET /api/dashboard/operator`
- **Returns:** Station info, all charger ports and live statuses, today's bookings, today's revenue and energy delivered.

### 8.3 Admin Dashboard
- **Method & Route:** `GET /api/dashboard/admin`
- **Returns:** Network-wide KPIs (stations, chargers, users, total revenue, total kWh, recent payments, recent sessions).
