package com.evcharging.service;

import com.evcharging.dto.BookingRequest;
import com.evcharging.entity.*;
import com.evcharging.exception.BadRequestException;
import com.evcharging.exception.ConflictException;
import com.evcharging.exception.ResourceNotFoundException;
import com.evcharging.repository.BookingRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class BookingService {

    private final BookingRepository bookingRepository;
    private final VehicleService vehicleService;
    private final StationService stationService;
    private final ChargerService chargerService;
    private final com.evcharging.repository.ChargerRepository chargerRepository;

    public BookingService(BookingRepository bookingRepository, VehicleService vehicleService, StationService stationService, ChargerService chargerService, com.evcharging.repository.ChargerRepository chargerRepository) {
        this.bookingRepository = bookingRepository;
        this.vehicleService = vehicleService;
        this.stationService = stationService;
        this.chargerService = chargerService;
        this.chargerRepository = chargerRepository;
    }

    public boolean isConnectorCompatible(ConnectorType vehicleConn, ConnectorType chargerConn) {
        if (vehicleConn == null || chargerConn == null) return true;
        if (vehicleConn == chargerConn) return true;
        if (vehicleConn == ConnectorType.CCS2 && chargerConn == ConnectorType.TYPE2) return true;
        if (vehicleConn == ConnectorType.TYPE2 && chargerConn == ConnectorType.CCS2) return true;
        return false;
    }

    @Transactional
    public Booking createBooking(BookingRequest request, User currentUser) {
        Vehicle vehicle;
        if (request.getVehicleId() != null) {
            vehicle = vehicleService.getVehicleById(request.getVehicleId());
            if (!vehicle.getUser().getId().equals(currentUser.getId())) {
                throw new BadRequestException("Selected vehicle does not belong to the logged-in user");
            }
        } else {
            List<Vehicle> userVehicles = vehicleService.getVehiclesByUserId(currentUser.getId());
            if (!userVehicles.isEmpty()) {
                vehicle = userVehicles.get(0);
            } else {
                com.evcharging.dto.VehicleRequest defReq = new com.evcharging.dto.VehicleRequest(
                        "Tata Nexon EV Max",
                        "MH-01-EV-" + (1000 + (currentUser.getId() % 9000)),
                        40.5,
                        ConnectorType.CCS2
                );
                vehicle = vehicleService.createVehicle(defReq, currentUser);
            }
        }

        ChargingStation station = stationService.getStationById(request.getStationId());

        if (station.getOperator() != null && !station.getOperator().isActive()) {
            throw new BadRequestException("This charging station is temporarily unavailable.");
        }

        LocalDateTime startTime = request.getStartTime();
        LocalDateTime endTime = startTime.plusMinutes(request.getDurationMinutes());

        if (startTime.isBefore(LocalDateTime.now().minusMinutes(30))) {
            throw new BadRequestException("Booking start time cannot be in the past");
        }

        Charger charger = null;
        BookingStatus initialStatus = BookingStatus.CONFIRMED;

        // If specific charger requested
        if (request.getChargerId() != null) {
            charger = chargerService.getChargerById(request.getChargerId());
            if (!charger.getStation().getId().equals(station.getId())) {
                throw new BadRequestException("Selected charger does not belong to this station");
            }

            if (charger.getStatus() == ChargerStatus.MAINTENANCE || charger.getStatus() == ChargerStatus.OFFLINE) {
                throw new BadRequestException("Selected charger is currently offline or under maintenance");
            }

            if (!isConnectorCompatible(vehicle.getConnectorType(), charger.getConnectorType())) {
                throw new BadRequestException("Connector Incompatibility: Vehicle requires " 
                        + vehicle.getConnectorType() + " but charger provides " + charger.getConnectorType());
            }

            long conflicts = bookingRepository.countConflictingBookings(charger.getId(), startTime, endTime);
            if (conflicts > 0) {
                throw new ConflictException("Slot Unavailable: The selected charger already has a reservation during this time window (" 
                        + startTime.toLocalTime() + " - " + endTime.toLocalTime() + "). Please select another slot or charger.");
            }

            // If booking starts right now or within 5 mins, mark charger state accordingly
            if (!startTime.isAfter(LocalDateTime.now())) {
                charger.setStatus(ChargerStatus.OCCUPIED);
                initialStatus = BookingStatus.ACTIVE;
                chargerRepository.save(charger);
            } else if (!startTime.isAfter(LocalDateTime.now().plusMinutes(5))) {
                charger.setStatus(ChargerStatus.RESERVED);
                chargerRepository.save(charger);
            }
        } else {
            // Automatic Port Assignment logic
            boolean isNearStart = !startTime.isAfter(LocalDateTime.now().plusMinutes(5));
            List<Charger> stationChargers = chargerRepository.findByStationId(station.getId());

            boolean hasCompatible = stationChargers.stream().anyMatch(c ->
                    isConnectorCompatible(vehicle.getConnectorType(), c.getConnectorType())
            );
            if (!hasCompatible && !stationChargers.isEmpty()) {
                throw new BadRequestException("Connector Incompatibility: Vehicle requires " 
                        + vehicle.getConnectorType() + " but this station has no compatible ports.");
            }

            if (isNearStart) {
                // Find available compatible charger right now
                for (Charger c : stationChargers) {
                    if (c.getStatus() == ChargerStatus.AVAILABLE && isConnectorCompatible(vehicle.getConnectorType(), c.getConnectorType())) {
                        long conflicts = bookingRepository.countConflictingBookings(c.getId(), startTime, endTime);
                        if (conflicts == 0) {
                            charger = c;
                            if (!startTime.isAfter(LocalDateTime.now())) {
                                charger.setStatus(ChargerStatus.OCCUPIED);
                                initialStatus = BookingStatus.ACTIVE;
                            } else {
                                charger.setStatus(ChargerStatus.RESERVED);
                            }
                            chargerRepository.save(charger);
                            break;
                        }
                    }
                }

                if (charger == null && !stationChargers.isEmpty()) {
                    throw new ConflictException("No compatible charger is available at " + station.getName() + " for this immediate time window.");
                }
            }
            // If booking is > 5 mins away, charger remains null until the background scheduler assigns it ~5 min before start.
        }

        String reference = "BK-" + System.currentTimeMillis() % 1000000 + "-" + UUID.randomUUID().toString().substring(0, 4).toUpperCase();

        Booking booking = Booking.builder()
                .bookingReference(reference)
                .user(currentUser)
                .vehicle(vehicle)
                .station(station)
                .charger(charger)
                .startTime(startTime)
                .endTime(endTime)
                .durationMinutes(request.getDurationMinutes())
                .status(initialStatus)
                .build();

        return bookingRepository.save(booking);
    }

    public List<Booking> getUserBookings(Long userId) {
        return bookingRepository.findByUserIdOrderByStartTimeDesc(userId);
    }

    public List<Booking> getStationBookings(Long stationId) {
        return bookingRepository.findByStationIdOrderByStartTimeDesc(stationId);
    }

    public Booking getBookingById(Long id) {
        return bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with ID: " + id));
    }

    @Transactional
    public Booking cancelBooking(Long id, User currentUser) {
        Booking booking = getBookingById(id);

        boolean isCustomerOwner = booking.getUser().getId().equals(currentUser.getId());
        boolean isStationOperator = booking.getStation() != null && booking.getStation().getOperator() != null && booking.getStation().getOperator().getId().equals(currentUser.getId());
        boolean isAdmin = currentUser.getRole() == Role.ROLE_ADMIN;

        if (!isCustomerOwner && !isStationOperator && !isAdmin) {
            throw new BadRequestException("You are not authorized to cancel this booking");
        }

        if (booking.getStatus() == BookingStatus.COMPLETED) {
            throw new BadRequestException("Booking cannot be cancelled because it has already been completed.");
        }
        if (booking.getStatus() == BookingStatus.CANCELLED) {
            throw new BadRequestException("Booking is already cancelled.");
        }

        booking.setStatus(BookingStatus.CANCELLED);
        if (booking.getCharger() != null) {
            Charger charger = booking.getCharger();
            if (charger.getStatus() == ChargerStatus.OCCUPIED || charger.getStatus() == ChargerStatus.RESERVED) {
                charger.setStatus(ChargerStatus.AVAILABLE);
                chargerRepository.save(charger);
            }
        }
        return bookingRepository.save(booking);
    }

    @Transactional
    public void cancelFutureBookingsForOperator(Long operatorId) {
        List<ChargingStation> stations = stationService.getStationsByOperatorId(operatorId);
        if (stations == null || stations.isEmpty()) {
            return;
        }

        List<Long> stationIds = stations.stream().map(ChargingStation::getId).collect(Collectors.toList());
        List<Booking> futureBookings = bookingRepository.findFutureBookingsByStationIds(
                stationIds, BookingStatus.CONFIRMED, LocalDateTime.now());

        for (Booking booking : futureBookings) {
            booking.setStatus(BookingStatus.CANCELLED);
            if (booking.getCharger() != null) {
                Charger charger = booking.getCharger();
                if (charger.getStatus() == ChargerStatus.OCCUPIED || charger.getStatus() == ChargerStatus.RESERVED) {
                    charger.setStatus(ChargerStatus.AVAILABLE);
                    chargerRepository.save(charger);
                }
            }
            bookingRepository.save(booking);
        }
    }
}
