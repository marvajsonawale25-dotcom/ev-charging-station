# EV Charging Station Platform - Viva Voce Questions & Answers Guide

This guide is tailored specifically for **2nd Year Engineering / Semester 3 Mini-Project Viva Presentations**. It equips you with clear, technically sound answers to questions your external examiners or professors are most likely to ask.

---

## Category 1: Project Overview & High-Level Architecture

### Q1: What is the problem statement and real-world relevance of this project?
**Answer:**  
The transition to Electric Vehicles (EVs) in India is expanding rapidly, but drivers suffer from "range anxiety" and unpredictable charger availability at physical hubs. Our platform solves this by providing a unified, real-time web portal where EV owners can:
1. Locate verified nearby stations filtered by connector type and charging speed.
2. Reserve a charging slot in advance to guarantee port availability.
3. Monitor live charging telemetry (battery percentage, energy delivered, cost).
4. Settle digital GST-compliant tax invoices via simulated UPI/Card payments.

### Q2: Why did you choose a monolithic architecture instead of microservices?
**Answer:**  
For an academic engineering project of this scope, a layered monolithic architecture provides:
1. **Low Operational Overhead:** No need for Kubernetes, Docker clusters, API gateways, or service discovery tools (Eureka/Consul).
2. **ACID Transaction Guarantees:** Database transactions (such as reserving a slot, updating charger status, or settling a bill) execute with complete transactional consistency (`@Transactional`) without requiring distributed two-phase commits or Saga orchestrators.
3. **Simplicity in Debugging and Viva Demonstration:** The entire system starts cleanly with Maven and Vite in seconds.

### Q3: What is the end-to-end user workflow in your platform?
**Answer:**  
The workflow follows five core stages:
$$\text{\textbf{DISCOVER}} \longrightarrow \text{\textbf{RESERVE}} \longrightarrow \text{\textbf{CHARGE}} \longrightarrow \text{\textbf{PAY}} \longrightarrow \text{\textbf{TRACK}}$$
- **Discover:** User filters stations by city, connector type (CCS2, Type 2), and power output.
- **Reserve:** User selects an available charger port and locks a time slot. Overlap algorithms reject conflicting bookings.
- **Charge:** User connects their vehicle; charger status changes to `OCCUPIED`. Software simulates battery state-of-charge (SoC) growth and kWh delivery.
- **Pay:** User stops charging; system generates a GST-compliant tax invoice, and payment is processed.
- **Track:** User views charging history, metrics, receipts, and environmental impact (CO₂ saved).

---

## Category 2: Backend Architecture & Spring Boot

### Q4: What is Spring Boot, and why did you choose it over standard Spring Framework?
**Answer:**  
Spring Boot simplifies enterprise Java development through:
1. **Auto-Configuration:** Pre-configures database connections, dispatcher servlets, and Jackson serializers automatically based on classpath dependencies.
2. **Embedded Server:** Comes with an embedded Apache Tomcat server, eliminating the need to deploy `.war` files to external web servers.
3. **Starter POMs:** Bundles required dependencies (e.g., `spring-boot-starter-web`, `spring-boot-starter-data-jpa`, `spring-boot-starter-security`) to eliminate version mismatch errors.

### Q5: Explain the 3-tier layered architecture used in your backend.
**Answer:**  
Our backend enforces strict Separation of Concerns:
1. **Controller Layer (`com.evcharging.controller`):** Handles incoming HTTP REST requests, validates input DTOs (`@Valid`), and returns JSON HTTP responses (`ResponseEntity`).
2. **Service Layer (`com.evcharging.service`):** Encapsulates core business logic (e.g., slot overlap checking, GST calculations, simulation math).
3. **Repository Layer (`com.evcharging.repository`):** Extends Spring Data `JpaRepository` to perform CRUD and custom JPQL/SQL database operations.

### Q6: What is Dependency Injection (DI) and Inversion of Control (IoC) in Spring?
**Answer:**  
- **Inversion of Control (IoC):** The architectural principle where the control of object creation and lifecycle is inverted from the programmer to the Spring Framework container.
- **Dependency Injection (DI):** The pattern through which Spring injects dependent objects (e.g., injecting `BookingRepository` into `BookingService`) using constructor injection, promoting loose coupling and unit testability.

### Q7: Why did you not use Lombok in this project?
**Answer:**  
We used standard Java POJOs with explicit getters, setters, and constructors rather than Project Lombok because Lombok's annotation processor often encounters bytecode incompatibilities on newer Java releases (such as Oracle JDK 21 and JDK 26). Standard Java guarantees 100% stable compilation on any machine without IDE plugins or compiler errors.

---

## Category 3: Security & Authentication (JWT)

### Q8: How does authentication and authorization work in your application?
**Answer:**  
We use Spring Security 6 with stateless JSON Web Tokens (JWT):
1. The user logs in via `POST /api/auth/login` with email and password.
2. `AuthenticationManager` validates credentials against the database using `BCryptPasswordEncoder`.
3. Upon success, the server generates a cryptographically signed JWT token (HMAC-SHA256) containing the user's email and role.
4. The React client stores this token and sends it in the `Authorization: Bearer <token>` header for subsequent requests.
5. Our custom `AuthTokenFilter` intercepts every request, validates the signature, extracts user details, and populates the `SecurityContextHolder`.

### Q9: Why is JWT termed "stateless"? What is its advantage over session cookies?
**Answer:**  
JWT is stateless because the server does not store user session data in server memory or Redis. All claims (user ID, role, expiry) are embedded directly within the token itself. The server simply verifies the HMAC signature using its private secret key. This reduces server memory usage and simplifies horizontal scaling.

### Q10: How do you protect passwords in the database?
**Answer:**  
Passwords are never stored in plain text. We use `BCryptPasswordEncoder`, which implements the salted Blowfish adaptive hash algorithm. Salt is automatically generated and embedded in the hash, protecting against rainbow table and dictionary attacks.

---

## Category 4: Database & Spring Data JPA

### Q11: How did you implement double-booking / slot conflict prevention?
**Answer:**  
We implemented the interval overlap condition in `BookingRepository`:
$$\text{Existing Start} < \text{New End} \quad\text{AND}\quad \text{Existing End} > \text{New Start}$$
In JPQL:
```java
@Query("SELECT COUNT(b) FROM Booking b WHERE b.charger.id = :chargerId " +
       "AND b.status IN ('CONFIRMED', 'PENDING') " +
       "AND b.startTime < :newEndTime AND b.endTime > :newStartTime")
long countConflictingBookings(...);
```
If the count exceeds 0, the booking is rejected with HTTP `409 Conflict`.

### Q12: What is Hibernate and what is the difference between JPA and Hibernate?
**Answer:**  
- **JPA (Java Persistence API / Jakarta Persistence):** The official Java specification that defines annotations (like `@Entity`, `@Id`, `@OneToMany`) and query interfaces.
- **Hibernate:** The actual Object-Relational Mapping (ORM) framework that implements the JPA specification, translating Java object interactions into SQL dialects for PostgreSQL.

### Q13: What is the N+1 select problem in ORM, and how did you prevent Jackson proxy serialization errors?
**Answer:**  
- When entities have lazy-loaded relationships (`FetchType.LAZY`), fetching $N$ records causes Hibernate to execute 1 query for the parent plus $N$ queries for the children.
- Furthermore, serializing Hibernate ByteBuddy proxy objects to JSON can trigger `Cannot call isConcrete() on a `Type` that is not concrete` or empty bean errors.
- We resolved this by placing `@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})` on our entities and configuring `spring.jackson.serialization.fail-on-empty-beans=false`.

---

## Category 5: EV Charging Simulation & Business Logic

### Q14: How does your application simulate real-time EV hardware charging?
**Answer:**  
Since physical chargers communicate over hardware protocols like OCPP, we accurately simulate the physical charging process using standard electrical formulas:
1. **Energy Delivered:**
   $$\text{Energy (kWh)} = \text{Power (kW)} \times \left(\frac{\text{Duration in Mins}}{60}\right) \times 0.90\text{ (Efficiency)}$$
2. **Battery State of Charge (SoC):**
   $$\Delta\text{Battery \%} = \left(\frac{\text{Delivered kWh}}{\text{Vehicle Battery Capacity}}\right) \times 100$$
3. **Real-time Cost:**
   $$\text{Cost (₹)} = \text{Delivered kWh} \times \text{Tariff Rate (₹/kWh)}$$
4. **Fast-Forward Simulation:** The `/api/sessions/{id}/tick?minutes=N` endpoint allows simulating 5, 15, or 30 minutes of charging instantly for viva evaluations.

### Q15: How is GST calculated on charging bills?
**Answer:**  
Under Indian taxation rules:
- Base Amount = Delivered Units (kWh) $\times$ Tariff Rate (₹/kWh)
- GST = 18% (split into 9% CGST and 9% SGST)
- Total Invoice = Base Amount + 18% GST

---

## Category 6: Frontend Architecture (React 18 & Vite)

### Q16: Why did you choose React with Vite instead of traditional JSP or Thymeleaf?
**Answer:**  
1. **Single Page Application (SPA):** Provides smooth navigation without full browser reloads.
2. **Component Reusability:** Modular UI components (`Navbar`, `Footer`, `ChargerBadge`) are reused across pages.
3. **Vite Build Tool:** Uses native ES modules (ESM) to provide instant server start (under 700ms) and lightning-fast Hot Module Replacement (HMR).

### Q17: How is authentication state managed in the React frontend?
**Answer:**  
We use React's `Context API` (`AuthContext.jsx`). It wraps the entire application, holds the current user state and JWT token, provides `login`, `register`, and `logout` actions, and saves credentials in `localStorage`. Protected routes (`ProtectedRoute.jsx`) check user roles before granting access to specific dashboards.

### Q18: What is an Axios Interceptor, and how is it used here?
**Answer:**  
An interceptor intercepts HTTP requests or responses before they are handled by `then` or `catch`. In `src/api/axios.js`:
- The **Request Interceptor** automatically extracts the JWT token from `localStorage` and attaches it to the `Authorization: Bearer <token>` header for all outgoing API calls.
- The **Response Interceptor** catches HTTP 401 Unauthorized errors and logs out the user if the token has expired.

---

## Category 7: Database & Performance

### Q19: Why did you choose PostgreSQL over MySQL?
**Answer:**  
1. Strict adherence to ANSI SQL standards.
2. Advanced indexing support (B-Tree, GiST, GIN) ideal for geospatial coordinates and time intervals.
3. Native handling of JSONB and complex analytical queries.

### Q20: What indexes did you create, and why?
**Answer:**  
- `users(email)`: For $O(1)$ fast lookups during login.
- `stations(city, status)`: For rapid station search filtering.
- `chargers(station_id, status)`: For filtering available ports at a station.
- `bookings(charger_id, start_time, end_time)`: For sub-millisecond slot conflict overlap checks.

---

## Quick Reference Summary Table for Viva Examiners

| Feature | Implementation Detail |
|---|---|
| **Programming Language** | Java 17 / 21 / 26 (Standard POJOs, No Lombok) |
| **Backend Framework** | Spring Boot 3.3.4 (Spring Web, Spring Data JPA) |
| **Security Mechanism** | Spring Security 6 + Stateless JWT (HMAC-SHA256) |
| **Relational Database** | PostgreSQL 18 on port 5432 |
| **Frontend Framework** | React 18 + Vite + Bootstrap 5 + Lucide Icons |
| **Slot Overlap Logic** | Interval overlap theorem ($\text{Start}_A < \text{End}_B \land \text{End}_A > \text{Start}_B$) |
| **Hardware Telemetry** | Simulated mathematical model ($\text{kWh} = P \times t \times \eta$) |
| **Tax Invoicing** | Indian 18% GST (9% CGST + 9% SGST) |
| **Demo Roles** | `ROLE_CUSTOMER`, `ROLE_OPERATOR`, `ROLE_ADMIN` |
