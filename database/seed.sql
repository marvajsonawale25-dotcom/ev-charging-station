-- ====================================================================
-- EV Charging Station Management & Booking Platform
-- Seed Data (DML) - Initial Realistic Production-Style Dataset
-- Includes Mumbai & Navi Mumbai Stations, Chargers, Vehicles, Demo Users
-- ====================================================================

-- Demo Passwords for all seeded users are: password123
-- BCrypt Hash: $2a$10$wK3dC97h0r8mDkV4Jm8EkuE59zYl8N1M0rFpS2z4h1xZq5b2c7G1K (or Spring auto-hash)

-- 1. USERS
INSERT INTO users (id, name, email, password, phone, role, active, created_at)
VALUES 
(1, 'Super Admin', 'admin@evhub.in', '$2a$10$j8d.U9M3iK9.1bU0sB5p1.W/4m6wFh7X0cE2g8H1Y6zL4n2e1A0r6', '9820011223', 'ROLE_ADMIN', TRUE, NOW()),
(2, 'Mumbai Central Operator', 'operator@evhub.in', '$2a$10$j8d.U9M3iK9.1bU0sB5p1.W/4m6wFh7X0cE2g8H1Y6zL4n2e1A0r6', '9820033445', 'ROLE_OPERATOR', TRUE, NOW()),
(3, 'BKC Hub Operator', 'bkc.operator@evhub.in', '$2a$10$j8d.U9M3iK9.1bU0sB5p1.W/4m6wFh7X0cE2g8H1Y6zL4n2e1A0r6', '9820055667', 'ROLE_OPERATOR', TRUE, NOW()),
(4, 'Jaydeep Patil', 'customer@evhub.in', '$2a$10$j8d.U9M3iK9.1bU0sB5p1.W/4m6wFh7X0cE2g8H1Y6zL4n2e1A0r6', '9876543210', 'ROLE_CUSTOMER', TRUE, NOW()),
(5, 'Ananya Sharma', 'ananya@evhub.in', '$2a$10$j8d.U9M3iK9.1bU0sB5p1.W/4m6wFh7X0cE2g8H1Y6zL4n2e1A0r6', '9811223344', 'ROLE_CUSTOMER', TRUE, NOW())
ON CONFLICT (email) DO NOTHING;

SELECT setval('users_id_seq', (SELECT MAX(id) FROM users));

-- 2. VEHICLES
INSERT INTO vehicles (id, user_id, make, model, year, registration_number, battery_capacity_kwh, max_charging_power_kw, connector_type, created_at)
VALUES
(1, 4, 'Tata', 'Nexon EV Max', 2024, 'MH 01 EV 1024', 40.5, 50.0, 'CCS2', NOW()),
(2, 4, 'MG', 'ZS EV', 2023, 'MH 02 AB 8899', 50.3, 50.0, 'CCS2', NOW()),
(3, 5, 'Mahindra', 'XUV400', 2024, 'MH 04 CD 7711', 39.4, 50.0, 'CCS2', NOW())
ON CONFLICT (registration_number) DO NOTHING;

SELECT setval('vehicles_id_seq', (SELECT MAX(id) FROM vehicles));

-- 3. CHARGING STATIONS
INSERT INTO charging_stations (id, name, address, city, pincode, latitude, longitude, price_per_kwh, operating_hours, amenities, status, rating, review_count, operator_id, created_at)
VALUES
(1, 'VoltPoint SuperCharge Hub - BKC', 'G Block, Bandra Kurla Complex, Bandra East', 'Mumbai', '400051', 19.0657, 72.8687, 18.5, '24 / 7 Accessible', 'WiFi, Cafe, Washroom, EV Lounge, 24x7 Security', 'ACTIVE', 4.8, 48, 3, NOW()),
(2, 'VoltPoint Express - Lower Parel', 'High Street Phoenix, Senapati Bapat Marg, Lower Parel', 'Mumbai', '400013', 18.9953, 72.8258, 19.0, '06:00 AM - 11:30 PM', 'Mall Parking, Food Court, Cinema, Restrooms', 'ACTIVE', 4.6, 32, 2, NOW()),
(3, 'VoltPoint FastCharge - Vashi Sector 17', 'Plot 22, Sector 17, Vashi', 'Navi Mumbai', '400703', 19.0771, 72.9986, 17.5, '24 / 7 Accessible', 'Dedicated Parking, Convenience Store, Drinking Water', 'ACTIVE', 4.5, 19, 2, NOW()),
(4, 'VoltPoint Hub - Powai Hiranandani', 'Central Avenue, Hiranandani Gardens, Powai', 'Mumbai', '400076', 19.1197, 72.9051, 18.0, '24 / 7 Accessible', 'Coffee Shop, Free High-Speed WiFi, Restrooms', 'ACTIVE', 4.7, 27, 3, NOW()),
(5, 'VoltPoint GreenPort - Thane Viviana', 'Eastern Express Highway, Near Jupiter Hospital, Thane West', 'Thane', '400606', 19.2088, 72.9715, 17.0, '07:00 AM - 11:00 PM', 'Shopping Mall, Dining, Covered Canopy, CCTV', 'ACTIVE', 4.6, 21, 2, NOW())
ON CONFLICT (id) DO NOTHING;

SELECT setval('charging_stations_id_seq', (SELECT MAX(id) FROM charging_stations));

-- 4. CHARGERS
INSERT INTO chargers (id, station_id, identifier, charger_type, connector_type, power_kw, price_per_kwh, status, created_at)
VALUES
-- Station 1 (BKC)
(1, 1, 'BKC-DC-01', 'DC_FAST', 'CCS2', 60.0, 18.5, 'AVAILABLE', NOW()),
(2, 1, 'BKC-DC-02', 'DC_FAST', 'CCS2', 120.0, 20.0, 'AVAILABLE', NOW()),
(3, 1, 'BKC-AC-01', 'AC_SLOW', 'TYPE2', 22.0, 16.0, 'AVAILABLE', NOW()),
(4, 1, 'BKC-AC-02', 'AC_SLOW', 'TYPE2', 7.4, 14.5, 'AVAILABLE', NOW()),
-- Station 2 (Lower Parel)
(5, 2, 'LP-DC-01', 'DC_FAST', 'CCS2', 50.0, 19.0, 'AVAILABLE', NOW()),
(6, 2, 'LP-DC-02', 'DC_FAST', 'CCS2', 60.0, 19.0, 'AVAILABLE', NOW()),
(7, 2, 'LP-AC-01', 'AC_SLOW', 'TYPE2', 22.0, 16.5, 'AVAILABLE', NOW()),
-- Station 3 (Vashi)
(8, 3, 'VSH-DC-01', 'DC_FAST', 'CCS2', 60.0, 17.5, 'AVAILABLE', NOW()),
(9, 3, 'VSH-AC-01', 'AC_SLOW', 'TYPE2', 22.0, 15.0, 'AVAILABLE', NOW()),
-- Station 4 (Powai)
(10, 4, 'POW-DC-01', 'DC_FAST', 'CCS2', 60.0, 18.0, 'AVAILABLE', NOW()),
(11, 4, 'POW-AC-01', 'AC_SLOW', 'TYPE2', 22.0, 15.5, 'AVAILABLE', NOW()),
-- Station 5 (Thane)
(12, 5, 'THN-DC-01', 'DC_FAST', 'CCS2', 60.0, 17.0, 'AVAILABLE', NOW()),
(13, 5, 'THN-AC-01', 'AC_SLOW', 'TYPE2', 22.0, 14.5, 'AVAILABLE', NOW())
ON CONFLICT (id) DO NOTHING;

SELECT setval('chargers_id_seq', (SELECT MAX(id) FROM chargers));

-- 5. SAMPLE REVIEWS
INSERT INTO reviews (id, station_id, user_id, rating, comment, created_at)
VALUES
(1, 1, 4, 5, 'Exceptional charging speed! Reached 80% from 20% in under 35 minutes on my Nexon EV Max. Very clean lounge too.', NOW() - INTERVAL '2 days'),
(2, 1, 5, 5, 'Reliable 120kW DC charger. No waiting queue on weekday mornings.', NOW() - INTERVAL '4 days'),
(3, 2, 4, 4, 'Convenient location inside Phoenix Mall. Charging is smooth, good security staff.', NOW() - INTERVAL '7 days')
ON CONFLICT (id) DO NOTHING;

SELECT setval('reviews_id_seq', (SELECT MAX(id) FROM reviews));
