package com.evcharging.service;

import com.evcharging.dto.ReviewRequest;
import com.evcharging.entity.ChargingStation;
import com.evcharging.entity.Review;
import com.evcharging.entity.User;
import com.evcharging.repository.ReviewRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final StationService stationService;

    public ReviewService(ReviewRepository reviewRepository, StationService stationService) {
        this.reviewRepository = reviewRepository;
        this.stationService = stationService;
    }

    public List<Review> getStationReviews(Long stationId) {
        return reviewRepository.findByStationIdOrderByCreatedAtDesc(stationId);
    }

    public List<Review> getOperatorReviews(Long operatorId) {
        return reviewRepository.findByStationOperatorIdOrderByCreatedAtDesc(operatorId);
    }

    public List<Review> getAllReviews() {
        return reviewRepository.findAll();
    }

    @Transactional
    public Review addReview(ReviewRequest request, User currentUser) {
        ChargingStation station = stationService.getStationById(request.getStationId());

        Review review = Review.builder()
                .station(station)
                .user(currentUser)
                .rating(request.getRating())
                .comment(request.getComment() != null ? request.getComment().trim() : null)
                .build();

        return reviewRepository.save(review);
    }
}
