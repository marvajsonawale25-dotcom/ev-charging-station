package com.evcharging.service;

import com.evcharging.dto.PaymentRequest;
import com.evcharging.entity.*;
import com.evcharging.exception.BadRequestException;
import com.evcharging.exception.ResourceNotFoundException;
import com.evcharging.repository.BookingRepository;
import com.evcharging.repository.PaymentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final BillService billService;
    private final BookingRepository bookingRepository;

    public PaymentService(PaymentRepository paymentRepository, BillService billService, BookingRepository bookingRepository) {
        this.paymentRepository = paymentRepository;
        this.billService = billService;
        this.bookingRepository = bookingRepository;
    }

    @Transactional
    public Payment processPayment(PaymentRequest request, User currentUser) {
        Bill bill = billService.getBillById(request.getBillId());

        if (bill.getBillStatus() == BillStatus.PAID) {
            throw new BadRequestException("Bill has already been paid in full");
        }

        Booking booking = bill.getSession().getBooking();
        if (!booking.getUser().getId().equals(currentUser.getId()) && currentUser.getRole() != Role.ROLE_ADMIN) {
            throw new BadRequestException("You are not authorized to pay for another user's bill");
        }

        String txnRef = "TXN-EV-" + System.currentTimeMillis() % 1000000 + "-" + UUID.randomUUID().toString().substring(0, 6).toUpperCase();

        Payment payment = Payment.builder()
                .transactionReference(txnRef)
                .user(currentUser)
                .bill(bill)
                .amount(bill.getTotalAmount())
                .paymentMethod(request.getPaymentMethod())
                .paymentStatus(PaymentStatus.SUCCESS)
                .paidAt(LocalDateTime.now())
                .build();

        payment = paymentRepository.save(payment);

        billService.markBillPaid(bill.getId());

        booking.setStatus(BookingStatus.COMPLETED);
        bookingRepository.save(booking);

        return payment;
    }

    public List<Payment> getUserPayments(Long userId) {
        return paymentRepository.findByUserIdOrderByPaidAtDesc(userId);
    }

    public List<Payment> getStationPayments(Long stationId) {
        return paymentRepository.findByStationIdOrderByPaidAtDesc(stationId);
    }

    public Payment getPaymentById(Long id) {
        return paymentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found with ID: " + id));
    }
}
