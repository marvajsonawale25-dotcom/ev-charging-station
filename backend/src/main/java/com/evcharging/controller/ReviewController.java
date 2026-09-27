package com.evcharging.controller;

import com.evcharging.dto.ReviewRequest;
import com.evcharging.entity.Review;
import com.evcharging.entity.User;
import com.evcharging.service.AuthService;
import com.evcharging.service.ReviewService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reviews")
public class ReviewController {

    private final ReviewService reviewService;
    private final AuthService authService;

    public ReviewController(ReviewService reviewService, AuthService authService) {
        this.reviewService = reviewService;
        this.authService = authService;
    }

    @GetMapping("/station/{stationId}")
    public ResponseEntity<List<Review>> getStationReviews(@PathVariable Long stationId) {
        return ResponseEntity.ok(reviewService.getStationReviews(stationId));
    }

    @GetMapping("/operator")
    @PreAuthorize("hasAnyAuthority('ROLE_OPERATOR', 'ROLE_ADMIN')")
    public ResponseEntity<List<Review>> getOperatorReviews() {
        User operator = authService.getCurrentAuthenticatedUser();
        return ResponseEntity.ok(reviewService.getOperatorReviews(operator.getId()));
    }

    @GetMapping("/admin/all")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<List<Review>> getAllReviews() {
        return ResponseEntity.ok(reviewService.getAllReviews());
    }

    @PostMapping
    public ResponseEntity<Review> addReview(@Valid @RequestBody ReviewRequest request) {
        User currentUser = authService.getCurrentAuthenticatedUser();
        Review review = reviewService.addReview(request, currentUser);
        return new ResponseEntity<>(review, HttpStatus.CREATED);
    }
}
