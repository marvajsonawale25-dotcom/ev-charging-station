package com.evcharging.service;

import com.evcharging.entity.*;
import com.evcharging.exception.BadRequestException;
import com.evcharging.exception.ResourceNotFoundException;
import com.evcharging.repository.BookingRepository;
import com.evcharging.repository.ChargerRepository;
import com.evcharging.repository.ChargingSessionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class ChargingSessionService {

    private final ChargingSessionRepository sessionRepository;
    private final BookingRepository bookingRepository;
    private final ChargerRepository chargerRepository;
    private final BillService billService;

    public ChargingSessionService(ChargingSessionRepository sessionRepository, BookingRepository bookingRepository, ChargerRepository chargerRepository, BillService billService) {
        this.sessionRepository = sessionRepository;
        this.bookingRepository = bookingRepository;
        this.chargerRepository = chargerRepository;
        this.billService = billService;
    }

    @Transactional
    public ChargingSession startSession(Long bookingId, User currentUser) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with ID: " + bookingId));

        if (!booking.getUser().getId().equals(currentUser.getId()) && currentUser.getRole() != Role.ROLE_ADMIN) {
            throw new BadRequestException("You can only start sessions for your own bookings");
        }

        if (booking.getStatus() != BookingStatus.CONFIRMED) {
            throw new BadRequestException("Cannot start session. Booking status must be CONFIRMED, but is " + booking.getStatus());
        }

        Optional<ChargingSession> activeUserSession = sessionRepository.findActiveSessionByUserId(currentUser.getId());
        if (activeUserSession.isPresent()) {
            throw new BadRequestException("You already have an active charging session in progress (Session #" + activeUserSession.get().getId() + ")");
        }

        booking.setStatus(BookingStatus.ACTIVE);
        bookingRepository.save(booking);

        Charger charger = booking.getCharger();
        charger.setStatus(ChargerStatus.OCCUPIED);
        chargerRepository.save(charger);

        String reference = "SES-" + System.currentTimeMillis() % 1000000 + "-" + UUID.randomUUID().toString().substring(0, 4).toUpperCase();
        double initialBattery = 28.0;

        ChargingSession session = ChargingSession.builder()
                .sessionReference(reference)
                .booking(booking)
                .startTime(LocalDateTime.now())
                .durationMinutes(0)
                .initialBatteryPercentage(initialBattery)
                .currentBatteryPercentage(initialBattery)
                .energyConsumedKwh(0.0)
                .chargingStatus(SessionStatus.ACTIVE)
                .currentCost(0.0)
                .build();

        return sessionRepository.save(session);
    }

    @Transactional
    public ChargingSession getSession(Long id) {
        ChargingSession session = sessionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Charging session not found with ID: " + id));

        if (session.getChargingStatus() == SessionStatus.ACTIVE) {
            updateSimulatedSessionState(session);
        }

        return session;
    }

    public Optional<ChargingSession> getActiveSessionForUser(Long userId) {
        Optional<ChargingSession> session = sessionRepository.findActiveSessionByUserId(userId);
        session.ifPresent(this::updateSimulatedSessionState);
        return session;
    }

    public List<ChargingSession> getUserSessions(Long userId) {
        return sessionRepository.findByUserIdOrderByStartTimeDesc(userId);
    }

    public List<ChargingSession> getStationSessions(Long stationId) {
        return sessionRepository.findByStationIdOrderByStartTimeDesc(stationId);
    }

    @Transactional
    public ChargingSession simulateTick(Long id, int additionalMinutes) {
        ChargingSession session = getSession(id);
        if (session.getChargingStatus() != SessionStatus.ACTIVE) {
            throw new BadRequestException("Simulation tick can only be applied to ACTIVE charging sessions");
        }

        Charger charger = session.getBooking().getCharger();
        Vehicle vehicle = session.getBooking().getVehicle();

        double powerKw = charger.getPowerRatingKw();
        double batteryCapKwh = vehicle.getBatteryCapacityKwh();

        double addedKwh = powerKw * (additionalMinutes / 60.0);
        double newEnergy = session.getEnergyConsumedKwh() + addedKwh;

        double batteryGain = (addedKwh / batteryCapKwh) * 100.0;
        double newBattery = Math.min(100.0, session.getCurrentBatteryPercentage() + batteryGain);

        session.setDurationMinutes(session.getDurationMinutes() + additionalMinutes);
        session.setCurrentBatteryPercentage(Math.round(newBattery * 10.0) / 10.0);
        session.setEnergyConsumedKwh(Math.round(newEnergy * 100.0) / 100.0);

        double cost = session.getEnergyConsumedKwh() * charger.getPricePerKwh();
        session.setCurrentCost(Math.round(cost * 100.0) / 100.0);

        if (session.getCurrentBatteryPercentage() >= 100.0) {
            session.setCurrentBatteryPercentage(100.0);
            return stopSession(session.getId(), session.getBooking().getUser());
        }

        return sessionRepository.save(session);
    }

    @Transactional
    public ChargingSession stopSession(Long id, User currentUser) {
        ChargingSession session = sessionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Charging session not found with ID: " + id));

        if (session.getChargingStatus() == SessionStatus.COMPLETED) {
            throw new BadRequestException("Charging session is already completed and billed");
        }

        boolean isOwner = session.getBooking().getUser().getId().equals(currentUser.getId());
        boolean isOperator = currentUser.getRole() == Role.ROLE_OPERATOR;
        boolean isAdmin = currentUser.getRole() == Role.ROLE_ADMIN;

        if (!isOwner && !isOperator && !isAdmin) {
            throw new BadRequestException("You do not have permission to stop this session");
        }

        session.setChargingStatus(SessionStatus.COMPLETED);
        session.setEndTime(LocalDateTime.now());

        if (session.getEnergyConsumedKwh() <= 0.0) {
            session.setEnergyConsumedKwh(2.5);
            session.setCurrentBatteryPercentage(Math.min(100.0, session.getInitialBatteryPercentage() + 5.0));
            session.setCurrentCost(Math.round(2.5 * session.getBooking().getCharger().getPricePerKwh() * 100.0) / 100.0);
        }

        long actualMinutes = Duration.between(session.getStartTime(), session.getEndTime()).toMinutes();
        session.setDurationMinutes(Math.max(session.getDurationMinutes(), (int) actualMinutes));

        Charger charger = session.getBooking().getCharger();
        charger.setStatus(ChargerStatus.AVAILABLE);
        chargerRepository.save(charger);

        session = sessionRepository.save(session);

        billService.generateBill(session);

        return session;
    }

    private void updateSimulatedSessionState(ChargingSession session) {
        long elapsedSeconds = Duration.between(session.getStartTime(), LocalDateTime.now()).getSeconds();
        int elapsedMinutes = (int) (elapsedSeconds / 60);

        if (elapsedMinutes > session.getDurationMinutes()) {
            session.setDurationMinutes(elapsedMinutes);

            Charger charger = session.getBooking().getCharger();
            Vehicle vehicle = session.getBooking().getVehicle();

            double powerKw = charger.getPowerRatingKw();
            double batteryCapKwh = vehicle.getBatteryCapacityKwh();

            double effectiveHours = elapsedMinutes / 60.0;
            double energy = powerKw * effectiveHours;
            double batteryGain = (energy / batteryCapKwh) * 100.0;
            double currentBattery = Math.min(100.0, session.getInitialBatteryPercentage() + batteryGain);

            session.setEnergyConsumedKwh(Math.round(energy * 100.0) / 100.0);
            session.setCurrentBatteryPercentage(Math.round(currentBattery * 10.0) / 10.0);
            session.setCurrentCost(Math.round(session.getEnergyConsumedKwh() * charger.getPricePerKwh() * 100.0) / 100.0);

            sessionRepository.save(session);
        }
    }
}
