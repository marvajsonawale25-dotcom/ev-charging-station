-- ====================================================================
-- EV Charging Station Management & Booking Platform
-- PostgreSQL Database Schema Definition (DDL)
-- College Engineering Mini-Project - Java & Full-Stack Architecture
-- ====================================================================

-- Drop existing tables in reverse dependency order (if recreating)
DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS bills CASCADE;
DROP TABLE IF EXISTS charging_sessions CASCADE;
DROP TABLE IF EXISTS bookings CASCADE;
DROP TABLE IF EXISTS chargers CASCADE;
DROP TABLE IF EXISTS charging_stations CASCADE;
DROP TABLE IF EXISTS vehicles CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- --------------------------------------------------------------------
-- 1. USERS TABLE
-- Stores credentials and user profile for CUSTOMER, OPERATOR, and ADMIN
-- --------------------------------------------------------------------
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    role VARCHAR(20) NOT NULL,       -- 'ROLE_CUSTOMER', 'ROLE_OPERATOR', 'ROLE_ADMIN'
    active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITHOUT TIME ZONE
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- --------------------------------------------------------------------
-- 2. VEHICLES TABLE
-- Stores Electric Vehicles owned by Customers
-- --------------------------------------------------------------------
CREATE TABLE vehicles (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    make VARCHAR(50) NOT NULL,
    model VARCHAR(50) NOT NULL,
    year INT,
    registration_number VARCHAR(30) NOT NULL UNIQUE,
    battery_capacity_kwh DOUBLE PRECISION NOT NULL,
    max_charging_power_kw DOUBLE PRECISION NOT NULL,
    connector_type VARCHAR(20) NOT NULL, -- 'CCS2', 'TYPE2', 'CHADEMO', 'GB_T'
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT fk_vehicle_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_vehicles_user ON vehicles(user_id);

-- --------------------------------------------------------------------
-- 3. CHARGING STATIONS TABLE
-- Physical charging station hubs across cities
-- --------------------------------------------------------------------
CREATE TABLE charging_stations (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    address VARCHAR(255) NOT NULL,
    city VARCHAR(50) NOT NULL,
    pincode VARCHAR(10) NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    price_per_kwh DOUBLE PRECISION NOT NULL,
    operating_hours VARCHAR(100) DEFAULT '24 / 7 Accessible',
    amenities VARCHAR(255),
    status VARCHAR(20) DEFAULT 'ACTIVE' NOT NULL, -- 'ACTIVE', 'MAINTENANCE', 'CLOSED'
    rating DOUBLE PRECISION DEFAULT 4.5 NOT NULL,
    review_count INT DEFAULT 0 NOT NULL,
    operator_id BIGINT,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITHOUT TIME ZONE,
    CONSTRAINT fk_station_operator FOREIGN KEY (operator_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_stations_city ON charging_stations(city);
CREATE INDEX idx_stations_status ON charging_stations(status);

-- --------------------------------------------------------------------
-- 4. CHARGERS TABLE
-- Individual charging guns/ports hosted at a charging station
-- --------------------------------------------------------------------
CREATE TABLE chargers (
    id BIGSERIAL PRIMARY KEY,
    station_id BIGINT NOT NULL,
    identifier VARCHAR(50) NOT NULL,
    charger_type VARCHAR(20) NOT NULL,   -- 'DC_FAST', 'AC_SLOW'
    connector_type VARCHAR(20) NOT NULL, -- 'CCS2', 'TYPE2', 'CHADEMO', 'GB_T'
    power_kw DOUBLE PRECISION NOT NULL,
    price_per_kwh DOUBLE PRECISION NOT NULL,
    status VARCHAR(20) DEFAULT 'AVAILABLE' NOT NULL, -- 'AVAILABLE', 'RESERVED', 'OCCUPIED', 'MAINTENANCE', 'OUT_OF_SERVICE'
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITHOUT TIME ZONE,
    CONSTRAINT fk_charger_station FOREIGN KEY (station_id) REFERENCES charging_stations(id) ON DELETE CASCADE
);

CREATE INDEX idx_chargers_station ON chargers(station_id);
CREATE INDEX idx_chargers_status ON chargers(status);

-- --------------------------------------------------------------------
-- 5. BOOKINGS TABLE
-- Advance slot reservations made by customers
-- --------------------------------------------------------------------
CREATE TABLE bookings (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    charger_id BIGINT NOT NULL,
    vehicle_id BIGINT,
    start_time TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    end_time TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    estimated_kwh DOUBLE PRECISION NOT NULL,
    estimated_cost DOUBLE PRECISION NOT NULL,
    status VARCHAR(20) DEFAULT 'CONFIRMED' NOT NULL, -- 'PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED'
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITHOUT TIME ZONE,
    CONSTRAINT fk_booking_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_booking_charger FOREIGN KEY (charger_id) REFERENCES chargers(id) ON DELETE CASCADE,
    CONSTRAINT fk_booking_vehicle FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE SET NULL
);

CREATE INDEX idx_bookings_user ON bookings(user_id);
CREATE INDEX idx_bookings_charger_time ON bookings(charger_id, start_time, end_time);

-- --------------------------------------------------------------------
-- 6. CHARGING SESSIONS TABLE
-- Real-time EV charging session tracking and telemetry
-- --------------------------------------------------------------------
CREATE TABLE charging_sessions (
    id BIGSERIAL PRIMARY KEY,
    booking_id BIGINT UNIQUE,
    user_id BIGINT NOT NULL,
    charger_id BIGINT NOT NULL,
    vehicle_id BIGINT,
    start_time TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    end_time TIMESTAMP WITHOUT TIME ZONE,
    initial_battery_percentage DOUBLE PRECISION DEFAULT 20.0 NOT NULL,
    current_battery_percentage DOUBLE PRECISION DEFAULT 20.0 NOT NULL,
    energy_delivered_kwh DOUBLE PRECISION DEFAULT 0.0 NOT NULL,
    current_cost DOUBLE PRECISION DEFAULT 0.0 NOT NULL,
    status VARCHAR(20) DEFAULT 'IN_PROGRESS' NOT NULL, -- 'IN_PROGRESS', 'COMPLETED', 'INTERRUPTED'
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITHOUT TIME ZONE,
    CONSTRAINT fk_session_booking FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE SET NULL,
    CONSTRAINT fk_session_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_session_charger FOREIGN KEY (charger_id) REFERENCES chargers(id) ON DELETE CASCADE,
    CONSTRAINT fk_session_vehicle FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE SET NULL
);

CREATE INDEX idx_sessions_user ON charging_sessions(user_id);
CREATE INDEX idx_sessions_status ON charging_sessions(status);

-- --------------------------------------------------------------------
-- 7. BILLS TABLE
-- Itemized tax invoices with GST calculation for completed sessions
-- --------------------------------------------------------------------
CREATE TABLE bills (
    id BIGSERIAL PRIMARY KEY,
    session_id BIGINT UNIQUE NOT NULL,
    user_id BIGINT NOT NULL,
    total_kwh DOUBLE PRECISION NOT NULL,
    rate_per_kwh DOUBLE PRECISION NOT NULL,
    base_amount DOUBLE PRECISION NOT NULL,
    tax_amount DOUBLE PRECISION NOT NULL, -- 18% GST (9% CGST + 9% SGST)
    total_amount DOUBLE PRECISION NOT NULL,
    payment_status VARCHAR(20) DEFAULT 'UNPAID' NOT NULL, -- 'UNPAID', 'PAID', 'REFUNDED'
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT fk_bill_session FOREIGN KEY (session_id) REFERENCES charging_sessions(id) ON DELETE CASCADE,
    CONSTRAINT fk_bill_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_bills_user ON bills(user_id);

-- --------------------------------------------------------------------
-- 8. PAYMENTS TABLE
-- Payment transactions and gateway audit log
-- --------------------------------------------------------------------
CREATE TABLE payments (
    id BIGSERIAL PRIMARY KEY,
    bill_id BIGINT UNIQUE NOT NULL,
    amount DOUBLE PRECISION NOT NULL,
    payment_method VARCHAR(20) NOT NULL, -- 'CREDIT_CARD', 'DEBIT_CARD', 'UPI', 'WALLET', 'NET_BANKING'
    payment_status VARCHAR(20) DEFAULT 'SUCCESS' NOT NULL, -- 'PENDING', 'SUCCESS', 'FAILED'
    transaction_reference VARCHAR(100) UNIQUE NOT NULL,
    payment_date TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT fk_payment_bill FOREIGN KEY (bill_id) REFERENCES bills(id) ON DELETE CASCADE
);

CREATE INDEX idx_payments_bill ON payments(bill_id);

-- --------------------------------------------------------------------
-- 9. REVIEWS TABLE
-- Customer feedback, ratings, and reviews for stations
-- --------------------------------------------------------------------
CREATE TABLE reviews (
    id BIGSERIAL PRIMARY KEY,
    station_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT fk_review_station FOREIGN KEY (station_id) REFERENCES charging_stations(id) ON DELETE CASCADE,
    CONSTRAINT fk_review_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_reviews_station ON reviews(station_id);
