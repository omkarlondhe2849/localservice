package com.local.localservice.dao;

import com.local.localservice.model.Review;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.*;
import org.springframework.stereotype.Component;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.List;
import java.sql.*;

@Component
public class ReviewDAO {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    public List<Review> findAllByServiceId(Long serviceId) {
        String sql = "SELECT * FROM reviews WHERE service_id = ?";
        return jdbcTemplate.query(sql, new Object[]{serviceId}, new ReviewRowMapper());
    }

    public int save(Review review) {
        String sql = "INSERT INTO reviews (service_id, user_id, rating, comment, created_at) VALUES (?, ?, ?, ?, NOW())";
        return jdbcTemplate.update(sql,
                review.getServiceId(),
                review.getUserId(),
                review.getRating(),
                review.getComment());
    }

    public int update(Review review) {
        String sql = "UPDATE reviews SET rating = ?, comment = ? WHERE id = ?";
        return jdbcTemplate.update(sql,
                review.getRating(),
                review.getComment(),
                review.getId());
    }

    public int delete(Long id) {
        String sql = "DELETE FROM reviews WHERE id = ?";
        return jdbcTemplate.update(sql, id);
    }

    private static class ReviewRowMapper implements RowMapper<Review> {
        @Override
        public Review mapRow(ResultSet rs, int rowNum) throws SQLException {
            Review review = new Review();
            review.setId(rs.getLong("id"));
            review.setServiceId(rs.getLong("service_id"));
            review.setUserId(rs.getLong("user_id"));
            review.setRating(rs.getInt("rating"));
            review.setComment(rs.getString("comment"));
            review.setCreatedAt(rs.getTimestamp("created_at").toLocalDateTime());
            return review;
        }
    }
}
