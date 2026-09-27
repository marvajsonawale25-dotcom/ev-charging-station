package com.evcharging.repository;

import com.evcharging.entity.ChargingSession;
import com.evcharging.entity.SessionStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ChargingSessionRepository extends JpaRepository<ChargingSession, Long> {

    Optional<ChargingSession> findBySessionReference(String sessionReference);

    Optional<ChargingSession> findByBookingId(Long bookingId);

    List<ChargingSession> findByChargingStatus(SessionStatus status);

    @Query("SELECT s FROM ChargingSession s WHERE s.booking.user.id = :userId AND s.chargingStatus = 'ACTIVE'")
    Optional<ChargingSession> findActiveSessionByUserId(@Param("userId") Long userId);

    @Query("SELECT s FROM ChargingSession s WHERE s.booking.user.id = :userId ORDER BY s.startTime DESC")
    List<ChargingSession> findByUserIdOrderByStartTimeDesc(@Param("userId") Long userId);

    @Query("SELECT s FROM ChargingSession s WHERE s.booking.station.id = :stationId ORDER BY s.startTime DESC")
    List<ChargingSession> findByStationIdOrderByStartTimeDesc(@Param("stationId") Long stationId);

    @Query("SELECT COUNT(s) FROM ChargingSession s WHERE s.chargingStatus = :status")
    long countByChargingStatus(@Param("status") SessionStatus status);

    @Query("SELECT COUNT(s) FROM ChargingSession s WHERE s.booking.station.id = :stationId AND s.chargingStatus = :status")
    long countByStationIdAndStatus(@Param("stationId") Long stationId, @Param("status") SessionStatus status);

    @Query("SELECT COALESCE(SUM(s.energyConsumedKwh), 0) FROM ChargingSession s WHERE s.booking.user.id = :userId")
    Double sumEnergyConsumedByUserId(@Param("userId") Long userId);

    @Query("SELECT COUNT(s) FROM ChargingSession s WHERE s.booking.vehicle.id = :vehicleId AND s.chargingStatus = :status")
    long countByVehicleIdAndStatus(@Param("vehicleId") Long vehicleId, @Param("status") SessionStatus status);
}
