package com.evcharging.repository;

import com.evcharging.entity.Booking;
import com.evcharging.entity.BookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {
    
    Optional<Booking> findByBookingReference(String bookingReference);

    List<Booking> findByUserIdOrderByStartTimeDesc(Long userId);

    List<Booking> findByStationIdOrderByStartTimeDesc(Long stationId);

    List<Booking> findByStationIdAndStartTimeBetween(Long stationId, LocalDateTime start, LocalDateTime end);

    @Query("SELECT COUNT(b) FROM Booking b WHERE b.charger.id = :chargerId " +
           "AND b.status IN ('CONFIRMED', 'ACTIVE') " +
           "AND (b.startTime < :endTime AND b.endTime > :startTime)")
    long countConflictingBookings(@Param("chargerId") Long chargerId,
                                 @Param("startTime") LocalDateTime startTime,
                                 @Param("endTime") LocalDateTime endTime);

    @Query("SELECT COUNT(b) FROM Booking b WHERE b.startTime >= :startOfDay AND b.startTime < :endOfDay")
    long countBookingsToday(@Param("startOfDay") LocalDateTime startOfDay, 
                            @Param("endOfDay") LocalDateTime endOfDay);

    @Query("SELECT COUNT(b) FROM Booking b WHERE b.station.id = :stationId AND b.startTime >= :startOfDay AND b.startTime < :endOfDay")
    long countStationBookingsToday(@Param("stationId") Long stationId,
                                  @Param("startOfDay") LocalDateTime startOfDay, 
                                  @Param("endOfDay") LocalDateTime endOfDay);

    @Query("SELECT b FROM Booking b WHERE b.status = :status AND b.charger IS NULL AND b.startTime <= :thresholdTime AND b.endTime > :currentTime")
    List<Booking> findUnassignedUpcomingBookings(@Param("status") BookingStatus status,
                                                @Param("thresholdTime") LocalDateTime thresholdTime,
                                                @Param("currentTime") LocalDateTime currentTime);

    @Query("SELECT b FROM Booking b WHERE b.status = :status AND b.charger IS NOT NULL AND b.startTime <= :currentTime AND b.endTime > :currentTime")
    List<Booking> findActiveWindowBookings(@Param("status") BookingStatus status,
                                          @Param("currentTime") LocalDateTime currentTime);

    @Query("SELECT b FROM Booking b WHERE b.status IN ('CONFIRMED', 'ACTIVE') AND b.endTime <= :currentTime")
    List<Booking> findExpiredBookings(@Param("currentTime") LocalDateTime currentTime);

    @Query("SELECT b FROM Booking b WHERE b.station.id IN :stationIds AND b.status = :status AND b.endTime > :currentTime")
    List<Booking> findFutureBookingsByStationIds(@Param("stationIds") List<Long> stationIds,
                                                @Param("status") BookingStatus status,
                                                @Param("currentTime") LocalDateTime currentTime);

    @Query("SELECT COUNT(b) FROM Booking b WHERE b.vehicle.id = :vehicleId AND b.status = :status")
    long countByVehicleIdAndStatus(@Param("vehicleId") Long vehicleId, @Param("status") BookingStatus status);

    @Query("SELECT COUNT(b) FROM Booking b WHERE b.vehicle.id = :vehicleId AND b.status = :status AND b.endTime > :currentTime")
    long countUpcomingBookingsByVehicleId(@Param("vehicleId") Long vehicleId,
                                         @Param("status") BookingStatus status,
                                         @Param("currentTime") LocalDateTime currentTime);

    @org.springframework.data.jpa.repository.Modifying
    @Query("UPDATE Booking b SET b.vehicle = NULL WHERE b.vehicle.id = :vehicleId")
    void nullifyVehicleByVehicleId(@Param("vehicleId") Long vehicleId);
}
