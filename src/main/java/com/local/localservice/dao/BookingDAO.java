package com.local.localservice.dao;

import com.local.localservice.model.Booking;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.*;
import org.springframework.stereotype.Component;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.sql.Date;
import java.util.List;

@Component
public class BookingDAO {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    // Save new booking
    public int save(Booking booking) {
        String sql = "INSERT INTO bookings (user_id, service_id, booking_date, status) VALUES (?, ?, ?, ?)";
        return jdbcTemplate.update(sql,
                booking.getUserId(),
                booking.getServiceId(),
                new Timestamp(booking.getBookingDate().getTime()),
                booking.getStatus());
    }

    // Get bookings by user ID
    public List<Booking> findAllByUserId(Long userId) {
        String sql = "SELECT * FROM bookings WHERE user_id = ?";
        return jdbcTemplate.query(sql, new Object[]{userId}, new BookingRowMapper());
    }

    // Get booking by ID
    public Booking findById(Long id) {
        String sql = "SELECT * FROM bookings WHERE id = ?";
        List<Booking> bookings = jdbcTemplate.query(sql, new Object[]{id}, new BookingRowMapper());
        return bookings.isEmpty() ? null : bookings.get(0);
    }

    // Update booking
    public int update(Booking booking) {
        String sql = "UPDATE bookings SET user_id = ?, service_id = ?, booking_date = ?, status = ? WHERE id = ?";
        return jdbcTemplate.update(sql,
                booking.getUserId(),
                booking.getServiceId(),
                new Timestamp(booking.getBookingDate().getTime()),
                booking.getStatus(),
                booking.getId());
    }

    // Delete booking by ID
    public int delete(Long id) {
        String sql = "DELETE FROM bookings WHERE id = ?";
        return jdbcTemplate.update(sql, id);
    }

    // RowMapper for Booking
    private static class BookingRowMapper implements RowMapper<Booking> {
        @Override
        public Booking mapRow(ResultSet rs, int rowNum) throws SQLException {
            Booking booking = new Booking();
            booking.setId(rs.getLong("id"));
            booking.setUserId(rs.getLong("user_id"));
            booking.setServiceId(rs.getLong("service_id"));

            Timestamp timestamp = rs.getTimestamp("booking_date");
            booking.setBookingDate(timestamp != null ? new Date(timestamp.getTime()) : null);

            booking.setStatus(rs.getString("status"));
            return booking;
        }
    }
}
