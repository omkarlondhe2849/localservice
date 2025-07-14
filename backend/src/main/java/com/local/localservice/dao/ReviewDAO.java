package com.local.localservice.dao;

import com.local.localservice.model.Review;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.*;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class ReviewDAO {
    @Autowired
    private JdbcTemplate jdbcTemplate;

    public List<Review> findAllByServiceId(Long serviceId) {
        String sql = "SELECT * FROM reviews WHERE service_id = ?";
        return jdbcTemplate.query(sql, new Object[]{serviceId}, new BeanPropertyRowMapper<>(Review.class));
    }

    public int save(Review review) {
        String sql = "INSERT INTO reviews(user_id, service_id, rating, comment) VALUES (?, ?, ?, ?)";
        return jdbcTemplate.update(sql,
                review.getUserId(),
                review.getServiceId(),
                review.getRating(),
                review.getComment());
    }
}
