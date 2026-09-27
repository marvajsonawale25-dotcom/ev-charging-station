package com.evcharging.config;

import com.evcharging.entity.*;
import com.evcharging.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Initializes seed demo data for academic presentations and evaluation.
 * Creates demo users, realistic Mumbai & Navi Mumbai charging stations,
 * chargers, vehicles, sample bookings, sessions, and payments.
 */
@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final UserRepository userRepository;
    private final VehicleRepository vehicleRepository;
    private final ChargingStationRepository stationRepository;
    private final ChargerRepository chargerRepository;
    private final BookingRepository bookingRepository;
    private final ChargingSessionRepository sessionRepository;
    private final BillRepository billRepository;
    private final PaymentRepository paymentRepository;
    private final ReviewRepository reviewRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository,
                           VehicleRepository vehicleRepository,
                           ChargingStationRepository stationRepository,
                           ChargerRepository chargerRepository,
                           BookingRepository bookingRepository,
                           ChargingSessionRepository sessionRepository,
                           BillRepository billRepository,
                           PaymentRepository paymentRepository,
                           ReviewRepository reviewRepository,
                           PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.vehicleRepository = vehicleRepository;
        this.stationRepository = stationRepository;
        this.chargerRepository = chargerRepository;
        this.bookingRepository = bookingRepository;
        this.sessionRepository = sessionRepository;
        this.billRepository = billRepository;
        this.paymentRepository = paymentRepository;
        this.reviewRepository = reviewRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(String... args) {
        if (userRepository.count() > 0) {
            log.info("Database already contains data. Skipping initial seeding.");
            return;
        }

        log.info("Seeding initial demo data for EV Charging Platform...");

        // 1. Create System Users
        User admin = User.builder()
                .name("Admin Jaydeep")
                .email("admin@evhub.in")
                .password(passwordEncoder.encode("Admin@123"))
                .phone("+91 98200 11223")
                .role(Role.ROLE_ADMIN)
                .build();
        userRepository.save(admin);

        User operatorBkc = User.builder()
                .name("Mumbai Charging Infra Pvt Ltd")
                .email("operator@evhub.in")
                .password(passwordEncoder.encode("Operator@123"))
                .phone("+91 98190 44556")
                .role(Role.ROLE_OPERATOR)
                .build();
        userRepository.save(operatorBkc);

        User operatorNavi = User.builder()
                .name("Navi Mumbai Green Power")
                .email("operator.navi@evhub.in")
                .password(passwordEncoder.encode("Operator@123"))
                .phone("+91 98210 77889")
                .role(Role.ROLE_OPERATOR)
                .build();
        userRepository.save(operatorNavi);

        User customerRahul = User.builder()
                .name("Rahul Sharma")
                .email("customer@evhub.in")
                .password(passwordEncoder.encode("Customer@123"))
                .phone("+91 98765 43210")
                .role(Role.ROLE_CUSTOMER)
                .build();
        userRepository.save(customerRahul);

        User customerPriya = User.builder()
                .name("Priya Patel")
                .email("priya@evhub.in")
                .password(passwordEncoder.encode("Customer@123"))
                .phone("+91 98111 22334")
                .role(Role.ROLE_CUSTOMER)
                .build();
        userRepository.save(customerPriya);

        // 2. Create Registered Vehicles
        Vehicle nexonEv = Vehicle.builder()
                .user(customerRahul)
                .modelName("Tata Nexon EV Max")
                .registrationNumber("MH-02-EV-4412")
                .batteryCapacityKwh(40.5)
                .connectorType(ConnectorType.CCS2)
                .build();
        vehicleRepository.save(nexonEv);

        Vehicle mgZsEv = Vehicle.builder()
                .user(customerRahul)
                .modelName("MG ZS EV")
                .registrationNumber("MH-43-EV-8890")
                .batteryCapacityKwh(50.3)
                .connectorType(ConnectorType.CCS2)
                .build();
        vehicleRepository.save(mgZsEv);

        Vehicle tiagoEv = Vehicle.builder()
                .user(customerPriya)
                .modelName("Tata Tiago EV")
                .registrationNumber("MH-01-EV-6701")
                .batteryCapacityKwh(24.0)
                .connectorType(ConnectorType.CCS2)
                .build();
        vehicleRepository.save(tiagoEv);

        Vehicle atherScooter = Vehicle.builder()
                .user(customerPriya)
                .modelName("Ather 450X")
                .registrationNumber("MH-03-EV-9922")
                .batteryCapacityKwh(3.7)
                .connectorType(ConnectorType.TYPE2)
                .build();
        vehicleRepository.save(atherScooter);

        // 3. Create Charging Stations
        // Station 1: BKC Mumbai
        ChargingStation stnBkc = ChargingStation.builder()
                .operator(operatorBkc)
                .name("VoltPulse BKC Supercharge Hub")
                .address("Plot C-66, G Block, Bandra Kurla Complex (BKC), Bandra East")
                .city("Mumbai")
                .latitude(19.0657)
                .longitude(72.8687)
                .operatingHours("24/7 Open")
                .contactNumber("+91 22 6678 1200")
                .description("Premier ultra-fast EV charging station located in the heart of BKC with lounge and high-speed DC chargers.")
                .amenities("Cafe Coffee Day, Free WiFi, Restrooms, Valet, 24/7 Security")
                .status(StationStatus.ACTIVE)
                .build();
        stationRepository.save(stnBkc);

        // Station 2: Vashi Navi Mumbai
        ChargingStation stnVashi = ChargingStation.builder()
                .operator(operatorNavi)
                .name("GreenRoute Vashi Station")
                .address("Sector 17, Near Vashi Plaza, Sector 17 Vashi")
                .city("Navi Mumbai")
                .latitude(19.0771)
                .longitude(72.9986)
                .operatingHours("06:00 AM - 11:30 PM")
                .contactNumber("+91 22 2789 4410")
                .description("Conveniently accessible charging station in commercial hub of Vashi, offering DC fast and AC charging.")
                .amenities("Food Court, Restrooms, ATM, Air Filling Station")
                .status(StationStatus.ACTIVE)
                .build();
        stationRepository.save(stnVashi);

        // Station 3: Powai Mumbai
        ChargingStation stnPowai = ChargingStation.builder()
                .operator(operatorBkc)
                .name("EcoCharge Hiranandani Powai")
                .address("Central Avenue, Hiranandani Gardens, Powai")
                .city("Mumbai")
                .latitude(19.1197)
                .longitude(72.9051)
                .operatingHours("24/7 Open")
                .contactNumber("+91 22 4002 9911")
                .description("Scenic charging station situated in Hiranandani Powai near restaurants and shopping centers.")
                .amenities("Starbucks, Covered Parking, CCTV, Restroom")
                .status(StationStatus.ACTIVE)
                .build();
        stationRepository.save(stnPowai);

        // Station 4: Viviana Mall Thane
        ChargingStation stnThane = ChargingStation.builder()
                .operator(operatorBkc)
                .name("Viviana Mall EV PowerZone")
                .address("Eastern Express Highway, Near Jupiter Hospital, Thane West")
                .city("Thane")
                .latitude(19.2088)
                .longitude(72.9714)
                .operatingHours("10:00 AM - 11:00 PM")
                .contactNumber("+91 22 6170 1000")
                .description("Mall basement charging zone. Charge your EV quickly while shopping or watching a movie.")
                .amenities("Shopping Mall, Cinepolis, Restrooms, Food Court")
                .status(StationStatus.ACTIVE)
                .build();
        stationRepository.save(stnThane);

        // Station 5: Seawoods Grand Central Navi Mumbai
        ChargingStation stnSeawoods = ChargingStation.builder()
                .operator(operatorNavi)
                .name("Seawoods Grand Central EV Hub")
                .address("Sector 40, Seawoods Railway Station Complex, Nerul")
                .city("Navi Mumbai")
                .latitude(19.0219)
                .longitude(73.0183)
                .operatingHours("24/7 Open")
                .contactNumber("+91 22 6818 2000")
                .description("Integrated transit charging hub directly connected to Seawoods railway and Grand Central Mall.")
                .amenities("Railway Connectivity, Mall, Food Court, EV Lounge")
                .status(StationStatus.ACTIVE)
                .build();
        stationRepository.save(stnSeawoods);

        // Station 6: Andheri MIDC Mumbai
        ChargingStation stnAndheri = ChargingStation.builder()
                .operator(operatorBkc)
                .name("MIDC Andheri Fast Charging Hub")
                .address("Cross Road A, MIDC Industrial Area, Andheri East")
                .city("Mumbai")
                .latitude(19.1171)
                .longitude(72.8682)
                .operatingHours("24/7 Open")
                .contactNumber("+91 22 2836 5500")
                .description("High capacity DC fast charging point tailored for commercial and private EV commuters.")
                .amenities("Quick Bites, Restroom, Drinking Water")
                .status(StationStatus.ACTIVE)
                .build();
        stationRepository.save(stnAndheri);

        // 4. Create Chargers
        Charger bkc1 = Charger.builder()
                .station(stnBkc)
                .identifier("Bay 1 - DC Ultra Fast 60kW")
                .chargerType(ChargerType.DC_FAST)
                .connectorType(ConnectorType.CCS2)
                .powerRatingKw(60.0)
                .pricePerKwh(19.50)
                .status(ChargerStatus.AVAILABLE)
                .build();
        Charger bkc2 = Charger.builder()
                .station(stnBkc)
                .identifier("Bay 2 - DC Supercharge 120kW")
                .chargerType(ChargerType.DC_FAST)
                .connectorType(ConnectorType.CCS2)
                .powerRatingKw(120.0)
                .pricePerKwh(22.00)
                .status(ChargerStatus.AVAILABLE)
                .build();
        Charger bkc3 = Charger.builder()
                .station(stnBkc)
                .identifier("Bay 3 - AC Fast 22kW")
                .chargerType(ChargerType.AC)
                .connectorType(ConnectorType.TYPE2)
                .powerRatingKw(22.0)
                .pricePerKwh(14.00)
                .status(ChargerStatus.AVAILABLE)
                .build();
        chargerRepository.saveAll(List.of(bkc1, bkc2, bkc3));

        Charger vashi1 = Charger.builder()
                .station(stnVashi)
                .identifier("Slot A - DC Fast 50kW")
                .chargerType(ChargerType.DC_FAST)
                .connectorType(ConnectorType.CCS2)
                .powerRatingKw(50.0)
                .pricePerKwh(18.00)
                .status(ChargerStatus.AVAILABLE)
                .build();
        Charger vashi2 = Charger.builder()
                .station(stnVashi)
                .identifier("Slot B - DC Fast 50kW")
                .chargerType(ChargerType.DC_FAST)
                .connectorType(ConnectorType.CCS2)
                .powerRatingKw(50.0)
                .pricePerKwh(18.00)
                .status(ChargerStatus.AVAILABLE)
                .build();
        Charger vashi3 = Charger.builder()
                .station(stnVashi)
                .identifier("Slot C - AC Type-2 11kW")
                .chargerType(ChargerType.AC)
                .connectorType(ConnectorType.TYPE2)
                .powerRatingKw(11.0)
                .pricePerKwh(13.50)
                .status(ChargerStatus.AVAILABLE)
                .build();
        chargerRepository.saveAll(List.of(vashi1, vashi2, vashi3));

        Charger powai1 = Charger.builder()
                .station(stnPowai)
                .identifier("Bay 1 - DC Fast 60kW")
                .chargerType(ChargerType.DC_FAST)
                .connectorType(ConnectorType.CCS2)
                .powerRatingKw(60.0)
                .pricePerKwh(19.00)
                .status(ChargerStatus.AVAILABLE)
                .build();
        Charger powai2 = Charger.builder()
                .station(stnPowai)
                .identifier("Bay 2 - AC Fast 22kW")
                .chargerType(ChargerType.AC)
                .connectorType(ConnectorType.TYPE2)
                .powerRatingKw(22.0)
                .pricePerKwh(14.50)
                .status(ChargerStatus.AVAILABLE)
                .build();
        chargerRepository.saveAll(List.of(powai1, powai2));

        Charger thane1 = Charger.builder()
                .station(stnThane)
                .identifier("Level B1 - DC Fast 60kW")
                .chargerType(ChargerType.DC_FAST)
                .connectorType(ConnectorType.CCS2)
                .powerRatingKw(60.0)
                .pricePerKwh(18.50)
                .status(ChargerStatus.AVAILABLE)
                .build();
        Charger thane2 = Charger.builder()
                .station(stnThane)
                .identifier("Level B1 - AC 7.4kW")
                .chargerType(ChargerType.AC)
                .connectorType(ConnectorType.TYPE2)
                .powerRatingKw(7.4)
                .pricePerKwh(12.50)
                .status(ChargerStatus.AVAILABLE)
                .build();
        chargerRepository.saveAll(List.of(thane1, thane2));

        Charger seawoods1 = Charger.builder()
                .station(stnSeawoods)
                .identifier("Port 1 - DC Fast 50kW")
                .chargerType(ChargerType.DC_FAST)
                .connectorType(ConnectorType.CCS2)
                .powerRatingKw(50.0)
                .pricePerKwh(17.50)
                .status(ChargerStatus.AVAILABLE)
                .build();
        Charger seawoods2 = Charger.builder()
                .station(stnSeawoods)
                .identifier("Port 2 - AC 22kW")
                .chargerType(ChargerType.AC)
                .connectorType(ConnectorType.TYPE2)
                .powerRatingKw(22.0)
                .pricePerKwh(13.00)
                .status(ChargerStatus.AVAILABLE)
                .build();
        chargerRepository.saveAll(List.of(seawoods1, seawoods2));

        Charger andheri1 = Charger.builder()
                .station(stnAndheri)
                .identifier("Unit 1 - DC Fast 60kW")
                .chargerType(ChargerType.DC_FAST)
                .connectorType(ConnectorType.CCS2)
                .powerRatingKw(60.0)
                .pricePerKwh(18.00)
                .status(ChargerStatus.AVAILABLE)
                .build();
        chargerRepository.save(andheri1);

        // 5. Create Sample Completed Bookings, Sessions, Bills and Payments for Rahul
        LocalDateTime pastDate = LocalDateTime.now().minusDays(2).withHour(14).withMinute(0);
        Booking sampleBooking = Booking.builder()
                .bookingReference("BK-SAMPLE-7821")
                .user(customerRahul)
                .vehicle(nexonEv)
                .station(stnBkc)
                .charger(bkc1)
                .startTime(pastDate)
                .endTime(pastDate.plusMinutes(45))
                .durationMinutes(45)
                .status(BookingStatus.COMPLETED)
                .build();
        bookingRepository.save(sampleBooking);

        ChargingSession sampleSession = ChargingSession.builder()
                .sessionReference("SES-SAMPLE-9901")
                .booking(sampleBooking)
                .startTime(pastDate)
                .endTime(pastDate.plusMinutes(42))
                .durationMinutes(42)
                .initialBatteryPercentage(22.0)
                .currentBatteryPercentage(85.0)
                .energyConsumedKwh(25.5)
                .chargingStatus(SessionStatus.COMPLETED)
                .currentCost(497.25)
                .build();
        sessionRepository.save(sampleSession);

        Bill sampleBill = Bill.builder()
                .billReference("INV-SAMPLE-1044")
                .session(sampleSession)
                .energyConsumedKwh(25.5)
                .pricePerKwh(19.50)
                .baseAmount(497.25)
                .taxAmount(89.51)
                .totalAmount(586.76)
                .billStatus(BillStatus.PAID)
                .build();
        billRepository.save(sampleBill);

        Payment samplePayment = Payment.builder()
                .transactionReference("TXN-EV-SAMPLE-5521")
                .user(customerRahul)
                .bill(sampleBill)
                .amount(586.76)
                .paymentMethod(PaymentMethod.UPI)
                .paymentStatus(PaymentStatus.SUCCESS)
                .paidAt(pastDate.plusMinutes(45))
                .build();
        paymentRepository.save(samplePayment);

        // 6. Create Sample Reviews
        Review review1 = Review.builder()
                .station(stnBkc)
                .user(customerRahul)
                .rating(5)
                .comment("Excellent charging speed! The CCD coffee lounge was very comfortable while my Nexon charged to 85% in 40 mins.")
                .build();

        Review review2 = Review.builder()
                .station(stnVashi)
                .user(customerPriya)
                .rating(4)
                .comment("Very accessible location near Vashi Plaza. Smooth booking and hassle-free payment.")
                .build();

        reviewRepository.saveAll(List.of(review1, review2));

        log.info("Demo data seeding completed successfully!");
    }
}
