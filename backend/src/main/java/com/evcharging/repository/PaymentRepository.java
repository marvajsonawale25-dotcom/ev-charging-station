package com.evcharging.repository;

import com.evcharging.entity.Payment;
import com.evcharging.entity.PaymentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {

    Optional<Payment> findByTransactionReference(String transactionReference);

    Optional<Payment> findByBillId(Long billId);

    List<Payment> findByUserIdOrderByPaidAtDesc(Long userId);

    @Query("SELECT COALESCE(SUM(p.amount), 0) FROM Payment p WHERE p.paymentStatus = 'SUCCESS'")
    Double sumTotalRevenue();

    @Query("SELECT COALESCE(SUM(p.amount), 0) FROM Payment p WHERE p.user.id = :userId AND p.paymentStatus = 'SUCCESS'")
    Double sumTotalSpentByUserId(@Param("userId") Long userId);

    @Query("SELECT COALESCE(SUM(p.amount), 0) FROM Payment p WHERE p.bill.session.booking.station.id = :stationId AND p.paymentStatus = 'SUCCESS'")
    Double sumRevenueByStationId(@Param("stationId") Long stationId);

    @Query("SELECT p FROM Payment p WHERE p.bill.session.booking.station.id = :stationId ORDER BY p.paidAt DESC")
    List<Payment> findByStationIdOrderByPaidAtDesc(@Param("stationId") Long stationId);
}
