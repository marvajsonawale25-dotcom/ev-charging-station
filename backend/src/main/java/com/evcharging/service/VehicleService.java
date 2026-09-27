package com.evcharging.service;

import com.evcharging.dto.VehicleRequest;
import com.evcharging.entity.BookingStatus;
import com.evcharging.entity.SessionStatus;
import com.evcharging.entity.User;
import com.evcharging.entity.Vehicle;
import com.evcharging.exception.BadRequestException;
import com.evcharging.exception.ResourceNotFoundException;
import com.evcharging.repository.BookingRepository;
import com.evcharging.repository.ChargingSessionRepository;
import com.evcharging.repository.VehicleRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class VehicleService {

    private final VehicleRepository vehicleRepository;
    private final BookingRepository bookingRepository;
    private final ChargingSessionRepository chargingSessionRepository;

    public VehicleService(VehicleRepository vehicleRepository,
                          BookingRepository bookingRepository,
                          ChargingSessionRepository chargingSessionRepository) {
        this.vehicleRepository = vehicleRepository;
        this.bookingRepository = bookingRepository;
        this.chargingSessionRepository = chargingSessionRepository;
    }

    public List<Vehicle> getVehiclesByUserId(Long userId) {
        return vehicleRepository.findByUserId(userId);
    }

    public Vehicle getVehicleById(Long id) {
        return vehicleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found with ID: " + id));
    }

    @Transactional
    public Vehicle createVehicle(VehicleRequest request, User user) {
        String reg = request.getRegistrationNumber().trim().toUpperCase();
        if (vehicleRepository.existsByRegistrationNumber(reg)) {
            throw new BadRequestException("Vehicle with registration number already exists: " + reg);
        }

        Vehicle vehicle = Vehicle.builder()
                .user(user)
                .modelName(request.getModelName().trim())
                .registrationNumber(reg)
                .batteryCapacityKwh(request.getBatteryCapacityKwh())
                .connectorType(request.getConnectorType())
                .build();

        return vehicleRepository.save(vehicle);
    }

    @Transactional
    public void deleteVehicle(Long id, User currentUser) {
        Vehicle vehicle = getVehicleById(id);
        if (!vehicle.getUser().getId().equals(currentUser.getId())) {
            throw new BadRequestException("You can only delete your own vehicles");
        }

        // 1. Check for active charging sessions or active bookings
        long activeBookings = bookingRepository.countByVehicleIdAndStatus(id, BookingStatus.ACTIVE);
        long activeSessions = chargingSessionRepository.countByVehicleIdAndStatus(id, SessionStatus.ACTIVE);
        if (activeBookings > 0 || activeSessions > 0) {
            throw new BadRequestException("This vehicle cannot be deleted while it is being used in an active charging session.");
        }

        // 2. Check for upcoming / future bookings
        long upcomingBookings = bookingRepository.countUpcomingBookingsByVehicleId(id, BookingStatus.CONFIRMED, LocalDateTime.now());
        if (upcomingBookings > 0) {
            throw new BadRequestException("This vehicle cannot be deleted because it is associated with an upcoming booking.");
        }

        // 3. Nullify vehicle on any remaining historical bookings (COMPLETED, CANCELLED, expired) to preserve history
        bookingRepository.nullifyVehicleByVehicleId(id);

        // 4. Delete the vehicle
        vehicleRepository.delete(vehicle);
    }
}
