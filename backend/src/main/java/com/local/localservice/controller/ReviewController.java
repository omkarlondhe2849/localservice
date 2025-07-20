package com.local.localservice.controller;

import com.local.localservice.dao.ReviewDAO;
import com.local.localservice.model.Review;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/reviews")
public class ReviewController {
    
    private static final Logger logger = LoggerFactory.getLogger(ReviewController.class);
    
    @Autowired
    private ReviewDAO reviewDAO;

    @GetMapping
    public List<Review> getAllReviews() {
        logger.info("GET /reviews - Retrieving all reviews");
        List<Review> reviews = reviewDAO.findAll();
        logger.info("Retrieved {} reviews", reviews.size());
        return reviews;
    }

    @GetMapping("/service/{serviceId}")
    public List<Review> getReviewsByService(@PathVariable Long serviceId) {
        logger.info("GET /reviews/service/{} - Retrieving reviews for service", serviceId);
        List<Review> reviews = reviewDAO.findAllByServiceId(serviceId);
        logger.info("Retrieved {} reviews for service ID: {}", reviews.size(), serviceId);
        return reviews;
    }

    @PostMapping
    public ResponseEntity<?> addReview(@RequestBody Review review) {
        logger.info("POST /reviews - Creating new review for service ID: {}, user ID: {}, rating: {}", 
                   review.getServiceId(), review.getUserId(), review.getRating());
        
        try {
            int rows = reviewDAO.save(review);
            if (rows > 0) {
                logger.info("Review created successfully for service ID: {}, user ID: {}", 
                           review.getServiceId(), review.getUserId());
                return ResponseEntity.ok("Review created");
            } else {
                logger.error("Failed to create review for service ID: {}, user ID: {}", 
                           review.getServiceId(), review.getUserId());
                return ResponseEntity.status(500).body("Failed to create review");
            }
        } catch (Exception e) {
            logger.error("Error creating review: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body("Failed to create review");
        }
    }
}

