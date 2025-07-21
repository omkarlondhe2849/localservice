package com.local.localservice.dao;

import com.local.localservice.model.Review;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.*;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class ReviewDAO {
    
    private static final Logger logger = LoggerFactory.getLogger(ReviewDAO.class);
    
    @Autowired
    private JdbcTemplate jdbcTemplate;

    public List<Review> findAll() {
        logger.debug("Executing query: SELECT * FROM reviews ORDER BY id DESC");
        try {
            String sql = "SELECT * FROM reviews ORDER BY id DESC";
            List<Review> reviews = jdbcTemplate.query(sql, new BeanPropertyRowMapper<>(Review.class));
            logger.info("Retrieved {} reviews from database", reviews.size());
            return reviews;
        } catch (Exception e) {
            logger.error("Error retrieving all reviews: {}", e.getMessage(), e);
            throw e;
        }
    }

    public List<Review> findAllByServiceId(Long serviceId) {
        logger.debug("Executing query: SELECT * FROM reviews WHERE service_id = {}", serviceId);
        try {
            String sql = "SELECT * FROM reviews WHERE service_id = ?";
            List<Review> reviews = jdbcTemplate.query(sql, new Object[]{serviceId}, new BeanPropertyRowMapper<>(Review.class));
            logger.info("Retrieved {} reviews for service ID: {}", reviews.size(), serviceId);
            return reviews;
        } catch (Exception e) {
            logger.error("Error retrieving reviews for service ID {}: {}", serviceId, e.getMessage(), e);
            throw e;
        }
    }

    public int save(Review review) {
        logger.debug("Executing INSERT for review: user ID {}, service ID {}, rating: {}", 
                   review.getUserId(), review.getServiceId(), review.getRating());
        try {
            String sql = "INSERT INTO reviews(user_id, service_id, rating, comment) VALUES (?, ?, ?, ?)";
            int result = jdbcTemplate.update(sql,
                    review.getUserId(),
                    review.getServiceId(),
                    review.getRating(),
                    review.getComment());
            logger.info("Review saved successfully, rows affected: {}", result);
            return result;
        } catch (Exception e) {
            logger.error("Error saving review: {}", e.getMessage(), e);
            throw e;
        }
    }

    public Double getAverageRatingForProvider(Long providerId) {
        logger.debug("Executing query: SELECT AVG(r.rating) FROM reviews r JOIN services s ON r.service_id = s.id WHERE s.provider_id = {}", providerId);
        try {
            String sql = "SELECT AVG(r.rating) FROM reviews r " +
                        "JOIN services s ON r.service_id = s.id " +
                        "WHERE s.provider_id = ?";
            Double result = jdbcTemplate.queryForObject(sql, new Object[]{providerId}, Double.class);
            Double roundedResult = result != null ? Math.round(result * 10.0) / 10.0 : null;
            logger.info("Average rating for provider ID {}: {}", providerId, roundedResult);
            return roundedResult;
        } catch (Exception e) {
            logger.error("Error calculating average rating for provider ID {}: {}", providerId, e.getMessage(), e);
            throw e;
        }
    }

    public Integer getReviewCountForProvider(Long providerId) {
        logger.debug("Executing query: SELECT COUNT(r.id) FROM reviews r JOIN services s ON r.service_id = s.id WHERE s.provider_id = {}", providerId);
        try {
            String sql = "SELECT COUNT(r.id) FROM reviews r " +
                        "JOIN services s ON r.service_id = s.id " +
                        "WHERE s.provider_id = ?";
            Integer result = jdbcTemplate.queryForObject(sql, new Object[]{providerId}, Integer.class);
            logger.info("Review count for provider ID {}: {}", providerId, result);
            return result;
        } catch (Exception e) {
            logger.error("Error calculating review count for provider ID {}: {}", providerId, e.getMessage(), e);
            throw e;
        }
    }

    public Double getPlatformAverageRating() {
        logger.debug("Executing query: SELECT AVG(rating) FROM reviews");
        try {
            String sql = "SELECT AVG(rating) FROM reviews";
            Double result = jdbcTemplate.queryForObject(sql, Double.class);
            Double roundedResult = result != null ? Math.round(result * 10.0) / 10.0 : null;
            logger.info("Platform average rating: {}", roundedResult);
            return roundedResult;
        } catch (Exception e) {
            logger.error("Error calculating platform average rating: {}", e.getMessage(), e);
            throw e;
        }
    }
}
