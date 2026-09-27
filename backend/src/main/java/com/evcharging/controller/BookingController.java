package com.evcharging.controller;

import com.evcharging.dto.BookingRequest;
import com.evcharging.entity.Booking;
import com.evcharging.entity.User;
import com.evcharging.repository.BookingRepository;
import com.evcharging.service.AuthService;
import com.evcharging.service.BookingService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    private final BookingService bookingService;
    private final AuthService authService;
    private final BookingRepository bookingRepository;

    public BookingController(BookingService bookingService, AuthService authService, BookingRepository bookingRepository) {
        this.bookingService = bookingService;
        this.authService = authService;
        this.bookingRepository = bookingRepository;
    }

    @PostMapping
    public ResponseEntity<Booking> createBooking(@Valid @RequestBody BookingRequest request) {
        User currentUser = authService.getCurrentAuthenticatedUser();
        Booking booking = bookingService.createBooking(request, currentUser);
        return new ResponseEntity<>(booking, HttpStatus.CREATED);
    }

    @GetMapping("/my")
    public ResponseEntity<List<Booking>> getMyBookings() {
        User currentUser = authService.getCurrentAuthenticatedUser();
        return ResponseEntity.ok(bookingService.getUserBookings(currentUser.getId()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Booking> getBookingById(@PathVariable Long id) {
        return ResponseEntity.ok(bookingService.getBookingById(id));
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<Booking> cancelBooking(@PathVariable Long id) {
        User currentUser = authService.getCurrentAuthenticatedUser();
        return ResponseEntity.ok(bookingService.cancelBooking(id, currentUser));
    }

    @GetMapping("/station/{stationId}")
    @PreAuthorize("hasAnyAuthority('ROLE_OPERATOR', 'ROLE_ADMIN')")
    public ResponseEntity<List<Booking>> getStationBookings(@PathVariable Long stationId) {
        return ResponseEntity.ok(bookingService.getStationBookings(stationId));
    }

    @GetMapping("/admin/all")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<List<Booking>> getAllBookings() {
        return ResponseEntity.ok(bookingRepository.findAll());
    }
}
