package com.evcharging.service;

import com.evcharging.dto.AdminDashboardStats;
import com.evcharging.dto.CustomerDashboardStats;
import com.evcharging.dto.OperatorDashboardStats;
import com.evcharging.entity.*;
import com.evcharging.repository.*;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

@Service
public class DashboardService {

    private final UserRepository userRepository;
    private final ChargingStationRepository stationRepository;
    private final ChargerRepository chargerRepository;
    private final BookingRepository bookingRepository;
    private final ChargingSessionRepository sessionRepository;
    private final PaymentRepository paymentRepository;

    public DashboardService(UserRepository userRepository, ChargingStationRepository stationRepository, ChargerRepository chargerRepository, BookingRepository bookingRepository, ChargingSessionRepository sessionRepository, PaymentRepository paymentRepository) {
        this.userRepository = userRepository;
        this.stationRepository = stationRepository;
        this.chargerRepository = chargerRepository;
        this.bookingRepository = bookingRepository;
        this.sessionRepository = sessionRepository;
        this.paymentRepository = paymentRepository;
    }

    public CustomerDashboardStats getCustomerDashboard(Long userId) {
        List<ChargingSession> sessions = sessionRepository.findByUserIdOrderByStartTimeDesc(userId);
        Double totalEnergy = sessionRepository.sumEnergyConsumedByUserId(userId);
        Double totalSpent = paymentRepository.sumTotalSpentByUserId(userId);
        List<Booking> bookings = bookingRepository.findByUserIdOrderByStartTimeDesc(userId);

        Optional<ChargingSession> activeSession = sessionRepository.findActiveSessionByUserId(userId);
        Booking upcomingBooking = bookings.stream()
                .filter(b -> b.getStatus() == BookingStatus.CONFIRMED && b.getStartTime().isAfter(LocalDateTime.now().minusHours(1)))
                .findFirst()
                .orElse(null);

        double safeEnergy = totalEnergy != null ? Math.round(totalEnergy * 100.0) / 100.0 : 0.0;
        double safeSpent = totalSpent != null ? Math.round(totalSpent * 100.0) / 100.0 : 0.0;
        double carbonSaved = Math.round(safeEnergy * 0.75 * 10.0) / 10.0;

        return CustomerDashboardStats.builder()
                .totalSessions(sessions.size())
                .totalEnergyKwh(safeEnergy)
                .totalAmountSpent(safeSpent)
                .carbonSavedKg(carbonSaved)
                .activeSession(activeSession.orElse(null))
                .upcomingBooking(upcomingBooking)
                .recentBookings(bookings.stream().limit(5).toList())
                .build();
    }

    public OperatorDashboardStats getOperatorDashboard(Long operatorId) {

    List<ChargingStation> stations = stationRepository.findByOperatorId(operatorId);

    ChargingStation station = stations.isEmpty() ? null : stations.get(0);

    if (station == null) {
        OperatorDashboardStats emptyStats = new OperatorDashboardStats();

        emptyStats.setChargers(List.of());
        emptyStats.setTodaysBookings(List.of());
        emptyStats.setActiveSessions(List.of());

        return emptyStats;
    }

    LocalDateTime startOfDay =
            LocalDateTime.of(LocalDate.now(), LocalTime.MIN);

    LocalDateTime endOfDay =
            LocalDateTime.of(LocalDate.now(), LocalTime.MAX);

    // Chargers
    List<Charger> chargers =
            chargerRepository.findByStationId(station.getId());

    long totalChargers = chargers.size();

    long availableChargers = chargers.stream()
            .filter(c -> c.getStatus() == ChargerStatus.AVAILABLE)
            .count();

    long occupiedChargers = chargers.stream()
            .filter(c -> c.getStatus() == ChargerStatus.OCCUPIED)
            .count();

    // Today's bookings
    List<Booking> todaysBookings =
            bookingRepository.findByStationIdAndStartTimeBetween(
                    station.getId(),
                    startOfDay,
                    endOfDay
            );

    // Active sessions
    List<ChargingSession> activeSessions =
            sessionRepository.findByStationIdOrderByStartTimeDesc(
                    station.getId()
            ).stream()
            .filter(s -> s.getChargingStatus() == SessionStatus.ACTIVE)
            .toList();

    // Today's energy
    double totalKwhDeliveredToday =
            sessionRepository.findByStationIdOrderByStartTimeDesc(
                    station.getId()
            ).stream()
            .filter(s -> s.getStartTime() != null)
            .filter(s -> !s.getStartTime().isBefore(startOfDay)
                    && !s.getStartTime().isAfter(endOfDay))
            .filter(s -> s.getEnergyConsumedKwh() != null)
            .mapToDouble(ChargingSession::getEnergyConsumedKwh)
            .sum();

    // Today's revenue
    double totalRevenueToday = paymentRepository
            .findByStationIdOrderByPaidAtDesc(station.getId())
            .stream()
            .filter(p -> p.getPaidAt() != null)
            .filter(p -> !p.getPaidAt().isBefore(startOfDay)
                    && !p.getPaidAt().isAfter(endOfDay))
            .filter(p -> p.getPaymentStatus() == PaymentStatus.SUCCESS)
            .mapToDouble(Payment::getAmount)
            .sum();

    double utilization =
            totalChargers > 0
                    ? ((double) occupiedChargers / totalChargers) * 100.0
                    : 0.0;

    OperatorDashboardStats stats = new OperatorDashboardStats();

    stats.setStation(station);
    stats.setChargers(chargers);
    stats.setTodaysBookings(todaysBookings);
    stats.setActiveSessions(activeSessions);

    stats.setTotalRevenueToday(
            Math.round(totalRevenueToday * 100.0) / 100.0
    );

    stats.setTotalKwhDeliveredToday(
            Math.round(totalKwhDeliveredToday * 100.0) / 100.0
    );

    stats.setTotalStations(stations.size());
    stats.setTotalChargers(totalChargers);
    stats.setAvailableChargers(availableChargers);
    stats.setOccupiedChargers(occupiedChargers);
    stats.setTodayBookings(todaysBookings.size());
    stats.setActiveSessionCount(activeSessions.size());

    stats.setTotalRevenue(
            Math.round(totalRevenueToday * 100.0) / 100.0
    );

    stats.setChargerUtilizationPercentage(
            Math.round(utilization * 10.0) / 10.0
    );

    return stats;
}

    public AdminDashboardStats getAdminDashboard() {
        LocalDateTime startOfDay = LocalDateTime.of(LocalDate.now(), LocalTime.MIN);
        LocalDateTime endOfDay = LocalDateTime.of(LocalDate.now(), LocalTime.MAX);

        long totalUsers = userRepository.count();
        long totalCustomers = userRepository.countByRole(Role.ROLE_CUSTOMER);
        long totalOperators = userRepository.countByRole(Role.ROLE_OPERATOR);
        long totalStations = stationRepository.count();
        long totalChargers = chargerRepository.count();
        long activeChargers = chargerRepository.countByStatus(ChargerStatus.AVAILABLE) + chargerRepository.countByStatus(ChargerStatus.OCCUPIED);
        long activeSessions = sessionRepository.countByChargingStatus(SessionStatus.ACTIVE);
        long todayBookings = bookingRepository.countBookingsToday(startOfDay, endOfDay);
        long totalBookings = bookingRepository.count();
        Double totalRevenue = paymentRepository.sumTotalRevenue();

        return AdminDashboardStats.builder()
                .totalUsers(totalUsers)
                .totalCustomers(totalCustomers)
                .totalOperators(totalOperators)
                .totalStations(totalStations)
                .totalChargers(totalChargers)
                .activeChargers(activeChargers)
                .activeSessions(activeSessions)
                .todayBookings(todayBookings)
                .totalBookings(totalBookings)
                .totalRevenue(totalRevenue != null ? Math.round(totalRevenue * 100.0) / 100.0 : 0.0)
                .build();
    }
}
