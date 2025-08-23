package com.local.localservice.dao;

import com.local.localservice.model.Booking;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.*;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Component;

import java.sql.Date;
import java.sql.PreparedStatement;
import java.sql.Statement;
import java.time.LocalDate;
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
            KeyHolder keyHolder = new GeneratedKeyHolder();
            jdbcTemplate.update(connection -> {
                PreparedStatement ps = connection.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS);
                ps.setLong(1, booking.getUserId());
                ps.setLong(2, booking.getServiceId());
                ps.setLong(3, booking.getProviderId());
                ps.setDate(4, booking.getBookingDate());
                ps.setTime(5, booking.getBookingTime());
                ps.setString(6, booking.getStatus());
                ps.setString(7, booking.getAddress());
                return ps;
            }, keyHolder);
            Number key = keyHolder.getKey();
            if (key != null) {
                booking.setId(key.longValue());
            }
            logger.info("Booking saved successfully, id: {}", booking.getId());
            return 1;
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

    // Find bookings that are paid, not completed, and booking_date < today
    public List<Booking> findOverdueUncompletedPaidBookings(LocalDate today) {
        logger.debug("Finding overdue, uncompleted, paid bookings before {}", today);
        String sql = "SELECT * FROM bookings WHERE payment_status = 'PAID' AND status != 'COMPLETED' AND booking_date < ? AND payment_status != 'REFUNDED'";
        return jdbcTemplate.query(sql, new Object[]{Date.valueOf(today)}, new BeanPropertyRowMapper<>(Booking.class));
    }

    public int updatePaymentStatus(Long bookingId, String paymentStatus) {
        logger.debug("Updating payment_status for booking ID: {} to {}", bookingId, paymentStatus);
        String sql = "UPDATE bookings SET payment_status = ? WHERE id = ?";
        return jdbcTemplate.update(sql, paymentStatus, bookingId);
    }

    public int updateStripeSessionId(Long bookingId, String sessionId) {
        logger.debug("Updating stripe_session_id for booking ID: {} to {}", bookingId, sessionId);
        String sql = "UPDATE bookings SET stripe_session_id = ? WHERE id = ?";
        return jdbcTemplate.update(sql, sessionId, bookingId);
    }

    public int updateOtp(Long bookingId, String otp, java.sql.Timestamp expiry) {
        logger.debug("Updating OTP for booking ID: {} to {} (expiry: {})", bookingId, otp, expiry);
        String sql = "UPDATE bookings SET otp = ?, otp_expiry = ? WHERE id = ?";
        return jdbcTemplate.update(sql, otp, expiry, bookingId);
    }

    public int updateProviderPayout(Long bookingId, String payoutStatus, java.math.BigDecimal payoutAmount) {
        logger.debug("Updating provider payout for booking ID: {} to status: {}, amount: {}", bookingId, payoutStatus, payoutAmount);
        String sql = "UPDATE bookings SET provider_payout_status = ?, provider_payout_amount = ? WHERE id = ?";
        return jdbcTemplate.update(sql, payoutStatus, payoutAmount, bookingId);
    }

    public java.math.BigDecimal sumProviderPayoutForCompletedBookings(Long providerId) {
        logger.debug("Summing provider_payout_amount for completed bookings for provider_id = {}", providerId);
        String sql = "SELECT COALESCE(SUM(provider_payout_amount), 0) FROM bookings WHERE provider_id = ? AND status = 'COMPLETED' AND provider_payout_status = 'PAID'";
        java.math.BigDecimal sum = jdbcTemplate.queryForObject(sql, new Object[]{providerId}, java.math.BigDecimal.class);
        return sum != null ? sum : java.math.BigDecimal.ZERO;
    }

    public int delete(Long bookingId) {
        logger.debug("Deleting booking with ID: {}", bookingId);
        String sql = "DELETE FROM bookings WHERE id = ?";
        return jdbcTemplate.update(sql, bookingId);
    }
}

