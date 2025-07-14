package com.local.localservice.controller;

import com.local.localservice.dao.ReviewDAO;
import com.local.localservice.model.Review;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/reviews")
public class ReviewController {
    @Autowired
    private ReviewDAO reviewDAO;

    @GetMapping("/service/{serviceId}")
    public List<Review> getReviewsByService(@PathVariable Long serviceId) {
        return reviewDAO.findAllByServiceId(serviceId);
    }

    @PostMapping
    public ResponseEntity<?> addReview(@RequestBody Review review) {
        int rows = reviewDAO.save(review);
        if (rows > 0) return ResponseEntity.ok("Review added");
        return ResponseEntity.status(500).body("Failed to add review");
    }
}

