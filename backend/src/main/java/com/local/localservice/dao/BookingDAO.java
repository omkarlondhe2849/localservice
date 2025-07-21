package com.local.localservice.dao;

import com.local.localservice.model.Booking;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.*;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class BookingDAO {
    
    private static final Logger logger = LoggerFactory.getLogger(BookingDAO.class);
    
    @Autowired
    private JdbcTemplate jdbcTemplate;

    public List<Booking> findAll() {
        logger.debug("Executing query: SELECT * FROM bookings ORDER BY booking_date DESC, booking_time DESC");
        try {
            String sql = "SELECT * FROM bookings ORDER BY booking_date DESC, booking_time DESC";
            List<Booking> bookings = jdbcTemplate.query(sql, new BeanPropertyRowMapper<>(Booking.class));
            logger.info("Retrieved {} bookings from database", bookings.size());
            return bookings;
        } catch (Exception e) {
            logger.error("Error retrieving all bookings: {}", e.getMessage(), e);
            throw e;
        }
    }

    public List<Booking> findAllByUserId(Long userId) {
        logger.debug("Executing query: SELECT * FROM bookings WHERE user_id = {}", userId);
        try {
            String sql = "SELECT * FROM bookings WHERE user_id = ?";
            List<Booking> bookings = jdbcTemplate.query(sql, new Object[]{userId}, new BeanPropertyRowMapper<>(Booking.class));
            logger.info("Retrieved {} bookings for user ID: {}", bookings.size(), userId);
            return bookings;
        } catch (Exception e) {
            logger.error("Error retrieving bookings for user ID {}: {}", userId, e.getMessage(), e);
            throw e;
        }
    }

    public List<Booking> findAllByProviderId(Long providerId) {
        logger.debug("Executing query: SELECT * FROM bookings WHERE provider_id = {}", providerId);
        try {
            String sql = "SELECT * FROM bookings WHERE provider_id = ? ORDER BY booking_date DESC, booking_time DESC";
            List<Booking> bookings = jdbcTemplate.query(sql, new Object[]{providerId}, new BeanPropertyRowMapper<>(Booking.class));
            logger.info("Retrieved {} bookings for provider ID: {}", bookings.size(), providerId);
            return bookings;
        } catch (Exception e) {
            logger.error("Error retrieving bookings for provider ID {}: {}", providerId, e.getMessage(), e);
            throw e;
        }
    }

    public int save(Booking booking) {
        logger.debug("Executing INSERT for booking: user ID {}, service ID {}, provider ID {}", 
                   booking.getUserId(), booking.getServiceId(), booking.getProviderId());
        try {
            String sql = "INSERT INTO bookings(user_id, service_id, provider_id, booking_date, booking_time, status, address) VALUES (?, ?, ?, ?, ?, ?, ?)";
            int result = jdbcTemplate.update(sql,
                    booking.getUserId(),
                    booking.getServiceId(),
                    booking.getProviderId(),
                    booking.getBookingDate(),
                    booking.getBookingTime(),
                    booking.getStatus(),
                    booking.getAddress());
            logger.info("Booking saved successfully, rows affected: {}", result);
            return result;
        } catch (Exception e) {
            logger.error("Error saving booking: {}", e.getMessage(), e);
            throw e;
        }
    }

    public int updateStatus(Long bookingId, String status) {
        logger.debug("Executing UPDATE for booking ID: {} with status: {}", bookingId, status);
        try {
            String sql = "UPDATE bookings SET status = ? WHERE id = ?";
            int result = jdbcTemplate.update(sql, status, bookingId);
            logger.info("Booking status updated successfully for ID: {}, rows affected: {}", bookingId, result);
            return result;
        } catch (Exception e) {
            logger.error("Error updating booking status for ID {}: {}", bookingId, e.getMessage(), e);
            throw e;
        }
    }

    public int countByProviderIdAndStatus(Long providerId, String status) {
        logger.debug("Executing COUNT for bookings with provider_id = {} and status = {}", providerId, status);
        try {
            String sql = "SELECT COUNT(*) FROM bookings WHERE provider_id = ? AND status = ?";
            Integer count = jdbcTemplate.queryForObject(sql, new Object[]{providerId, status}, Integer.class);
            logger.info("Counted {} bookings for provider_id {} with status {}", count, providerId, status);
            return count != null ? count : 0;
        } catch (Exception e) {
            logger.error("Error counting bookings for provider_id {} and status {}: {}", providerId, status, e.getMessage(), e);
            throw e;
        }
    }

    public int countCompletedByProviderId(Long providerId) {
        logger.debug("Executing COUNT for completed bookings with provider_id = {}", providerId);
        try {
            String sql = "SELECT COUNT(*) FROM bookings WHERE provider_id = ? AND status = 'COMPLETED'";
            Integer count = jdbcTemplate.queryForObject(sql, new Object[]{providerId}, Integer.class);
            logger.info("Counted {} completed bookings for provider_id {}", count, providerId);
            return count != null ? count : 0;
        } catch (Exception e) {
            logger.error("Error counting completed bookings for provider_id {}: {}", providerId, e.getMessage(), e);
            throw e;
        }
    }

    public Booking findById(Long id) {
        logger.debug("Executing query: SELECT * FROM bookings WHERE id = {}", id);
        try {
            String sql = "SELECT * FROM bookings WHERE id = ?";
            List<Booking> bookings = jdbcTemplate.query(sql, new Object[]{id}, new BeanPropertyRowMapper<>(Booking.class));
            return bookings.isEmpty() ? null : bookings.get(0);
        } catch (Exception e) {
            logger.error("Error retrieving booking with ID {}: {}", id, e.getMessage(), e);
            throw e;
        }
    }
}

