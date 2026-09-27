package com.evcharging.service;

import com.evcharging.entity.Booking;
import com.evcharging.entity.BookingStatus;
import com.evcharging.entity.Charger;
import com.evcharging.entity.ChargerStatus;
import com.evcharging.entity.ConnectorType;
import com.evcharging.repository.BookingRepository;
import com.evcharging.repository.ChargerRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class BookingSchedulerService {

    private static final Logger log = LoggerFactory.getLogger(BookingSchedulerService.class);

    private final BookingRepository bookingRepository;
    private final ChargerRepository chargerRepository;

    public BookingSchedulerService(BookingRepository bookingRepository, ChargerRepository chargerRepository) {
        this.bookingRepository = bookingRepository;
        this.chargerRepository = chargerRepository;
    }

    /**
     * Periodically runs every 10 seconds:
     * 1. Identifies bookings approximately 5 minutes before scheduled start time and auto-assigns available compatible charger.
     * 2. Transitions booking to ACTIVE and charger to OCCUPIED when the scheduled start time arrives.
     * 3. Completes expired bookings and safely releases chargers back to AVAILABLE.
     */
    @Scheduled(fixedRate = 10000)
    @Transactional
    public void processBookingsAndPortAssignments() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime window5Min = now.plusMinutes(5);

        // Step 1: Assign ports to upcoming bookings (within ~5 minutes of start time) that have no charger assigned yet
        List<Booking> unassignedBookings = bookingRepository.findUnassignedUpcomingBookings(BookingStatus.CONFIRMED, window5Min, now);
        for (Booking booking : unassignedBookings) {
            if (booking.getStation() == null) continue;

            List<Charger> stationChargers = chargerRepository.findByStationId(booking.getStation().getId());
            ConnectorType vehicleConnector = booking.getVehicle() != null ? booking.getVehicle().getConnectorType() : null;

            for (Charger charger : stationChargers) {
                if (charger.getStatus() == ChargerStatus.AVAILABLE && isConnectorCompatible(vehicleConnector, charger.getConnectorType())) {
                    long conflicts = bookingRepository.countConflictingBookings(charger.getId(), booking.getStartTime(), booking.getEndTime());
                    if (conflicts == 0) {
                        booking.setCharger(charger);
                        if (!booking.getStartTime().isAfter(now)) {
                            charger.setStatus(ChargerStatus.OCCUPIED);
                            booking.setStatus(BookingStatus.ACTIVE);
                        } else {
                            charger.setStatus(ChargerStatus.RESERVED);
                        }
                        chargerRepository.save(charger);
                        bookingRepository.save(booking);
                        log.info("Auto-assigned port {} to booking #{} at station '{}'", charger.getIdentifier(), booking.getId(), booking.getStation().getName());
                        break;
                    }
                }
            }
        }

        // Step 2: Transition CONFIRMED bookings whose start time has arrived to ACTIVE, and charger to OCCUPIED
        List<Booking> activeWindowBookings = bookingRepository.findActiveWindowBookings(BookingStatus.CONFIRMED, now);
        for (Booking booking : activeWindowBookings) {
            booking.setStatus(BookingStatus.ACTIVE);
            Charger charger = booking.getCharger();
            if (charger != null && (charger.getStatus() == ChargerStatus.RESERVED || charger.getStatus() == ChargerStatus.AVAILABLE)) {
                charger.setStatus(ChargerStatus.OCCUPIED);
                chargerRepository.save(charger);
            }
            bookingRepository.save(booking);
            log.info("Booking #{} is now ACTIVE, charger {} set to OCCUPIED", booking.getId(), charger != null ? charger.getIdentifier() : "N/A");
        }

        // Step 3: Transition expired bookings to COMPLETED and release chargers to AVAILABLE
        List<Booking> expiredBookings = bookingRepository.findExpiredBookings(now);
        for (Booking booking : expiredBookings) {
            booking.setStatus(BookingStatus.COMPLETED);
            Charger charger = booking.getCharger();
            if (charger != null && (charger.getStatus() == ChargerStatus.OCCUPIED || charger.getStatus() == ChargerStatus.RESERVED)) {
                long activeConflicts = bookingRepository.countConflictingBookings(charger.getId(), now.minusSeconds(1), now.plusSeconds(1));
                if (activeConflicts == 0) {
                    charger.setStatus(ChargerStatus.AVAILABLE);
                    chargerRepository.save(charger);
                }
            }
            bookingRepository.save(booking);
            log.info("Booking #{} expired and marked COMPLETED", booking.getId());
        }
    }

    private boolean isConnectorCompatible(ConnectorType vehicleConn, ConnectorType chargerConn) {
        if (vehicleConn == null || chargerConn == null) return true;
        if (vehicleConn == chargerConn) return true;
        if (vehicleConn == ConnectorType.CCS2 && chargerConn == ConnectorType.TYPE2) return true;
        if (vehicleConn == ConnectorType.TYPE2 && chargerConn == ConnectorType.CCS2) return true;
        return false;
    }
}
