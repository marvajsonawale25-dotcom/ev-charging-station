package com.evcharging.repository;

import com.evcharging.entity.Bill;
import com.evcharging.entity.BillStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface BillRepository extends JpaRepository<Bill, Long> {
    Optional<Bill> findBySessionId(Long sessionId);
    Optional<Bill> findByBillReference(String billReference);
    long countByBillStatus(BillStatus status);
}
