package com.evcharging.service;

import com.evcharging.entity.Bill;
import com.evcharging.entity.BillStatus;
import com.evcharging.entity.ChargingSession;
import com.evcharging.exception.BadRequestException;
import com.evcharging.exception.ResourceNotFoundException;
import com.evcharging.repository.BillRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import java.util.UUID;

@Service
public class BillService {

    private final BillRepository billRepository;

    public BillService(BillRepository billRepository) {
        this.billRepository = billRepository;
    }

    @Transactional
    public Bill generateBill(ChargingSession session) {
        Optional<Bill> existing = billRepository.findBySessionId(session.getId());
        if (existing.isPresent()) {
            return existing.get();
        }

        double energyConsumed = session.getEnergyConsumedKwh() != null ? session.getEnergyConsumedKwh() : 0.0;
        double pricePerKwh = session.getBooking().getCharger().getPricePerKwh();

        double baseAmount = Math.round(energyConsumed * pricePerKwh * 100.0) / 100.0;
        double taxAmount = Math.round(baseAmount * 0.18 * 100.0) / 100.0;
        double totalAmount = Math.round((baseAmount + taxAmount) * 100.0) / 100.0;

        String billReference = "INV-" + System.currentTimeMillis() % 1000000 + "-" + UUID.randomUUID().toString().substring(0, 4).toUpperCase();

        Bill bill = Bill.builder()
                .billReference(billReference)
                .session(session)
                .energyConsumedKwh(Math.round(energyConsumed * 100.0) / 100.0)
                .pricePerKwh(pricePerKwh)
                .baseAmount(baseAmount)
                .taxAmount(taxAmount)
                .totalAmount(totalAmount)
                .billStatus(BillStatus.UNPAID)
                .build();

        return billRepository.save(bill);
    }

    public Bill getBillById(Long id) {
        return billRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Bill not found with ID: " + id));
    }

    public Bill getBillBySessionId(Long sessionId) {
        return billRepository.findBySessionId(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("Bill not found for session ID: " + sessionId));
    }

    @Transactional
    public Bill markBillPaid(Long billId) {
        Bill bill = getBillById(billId);
        if (bill.getBillStatus() == BillStatus.PAID) {
            throw new BadRequestException("Bill is already marked as PAID");
        }
        bill.setBillStatus(BillStatus.PAID);
        return billRepository.save(bill);
    }
}
