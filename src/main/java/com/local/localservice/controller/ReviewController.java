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

    @PutMapping("/{id}")
    public ResponseEntity<?> updateReview(@PathVariable Long id, @RequestBody Review review) {
        review.setId(id);
        int rows = reviewDAO.update(review);
        if (rows > 0) return ResponseEntity.ok("Review updated");
        return ResponseEntity.status(404).body("Review not found");
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteReview(@PathVariable Long id) {
        int rows = reviewDAO.delete(id);
        if (rows > 0) return ResponseEntity.ok("Review deleted");
        return ResponseEntity.status(404).body("Review not found");
    }
}
