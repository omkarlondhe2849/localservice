package com.local.localservice.dao;

import com.local.localservice.model.Booking;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.*;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class BookingDAO {
    @Autowired
    private JdbcTemplate jdbcTemplate;

    public List<Booking> findAllByUserId(Long userId) {
        String sql = "SELECT * FROM bookings WHERE user_id = ?";
        return jdbcTemplate.query(sql, new Object[]{userId}, new BeanPropertyRowMapper<>(Booking.class));
    }

    public int save(Booking booking) {
        String sql = "INSERT INTO bookings(user_id, service_id, provider_id, booking_date, booking_time, status) VALUES (?, ?, ?, ?, ?, ?)";
        return jdbcTemplate.update(sql,
                booking.getUserId(),
                booking.getServiceId(),
                booking.getProviderId(),
                booking.getBookingDate(),
                booking.getBookingTime(),
                booking.getStatus());
    }
}

