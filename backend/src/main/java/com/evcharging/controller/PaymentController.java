package com.evcharging.controller;

import com.evcharging.dto.PaymentRequest;
import com.evcharging.entity.Payment;
import com.evcharging.entity.User;
import com.evcharging.repository.PaymentRepository;
import com.evcharging.service.AuthService;
import com.evcharging.service.PaymentService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    private final PaymentService paymentService;
    private final AuthService authService;
    private final PaymentRepository paymentRepository;

    public PaymentController(PaymentService paymentService, AuthService authService, PaymentRepository paymentRepository) {
        this.paymentService = paymentService;
        this.authService = authService;
        this.paymentRepository = paymentRepository;
    }

    @PostMapping("/process")
    public ResponseEntity<Payment> processPayment(@Valid @RequestBody PaymentRequest request) {
        User currentUser = authService.getCurrentAuthenticatedUser();
        Payment payment = paymentService.processPayment(request, currentUser);
        return new ResponseEntity<>(payment, HttpStatus.CREATED);
    }

    @GetMapping("/my")
    public ResponseEntity<List<Payment>> getMyPayments() {
        User currentUser = authService.getCurrentAuthenticatedUser();
        return ResponseEntity.ok(paymentService.getUserPayments(currentUser.getId()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Payment> getPaymentById(@PathVariable Long id) {
        return ResponseEntity.ok(paymentService.getPaymentById(id));
    }

    @GetMapping("/station/{stationId}")
    @PreAuthorize("hasAnyAuthority('ROLE_OPERATOR', 'ROLE_ADMIN')")
    public ResponseEntity<List<Payment>> getStationPayments(@PathVariable Long stationId) {
        return ResponseEntity.ok(paymentService.getStationPayments(stationId));
    }

    @GetMapping("/admin/all")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<List<Payment>> getAllPayments() {
        return ResponseEntity.ok(paymentRepository.findAll());
    }
}
