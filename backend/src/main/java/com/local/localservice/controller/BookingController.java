package com.local.localservice.controller;

import com.local.localservice.dao.BookingDAO;
import com.local.localservice.model.Booking;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/bookings")
public class BookingController {
    @Autowired
    private BookingDAO bookingDAO;

    @GetMapping("/user/{userId}")
    public List<Booking> getBookingsByUser(@PathVariable Long userId) {
        return bookingDAO.findAllByUserId(userId);
    }

    @PostMapping
    public ResponseEntity<?> addBooking(@RequestBody Booking booking) {
        int rows = bookingDAO.save(booking);
        if (rows > 0) return ResponseEntity.ok("Booking created");
        return ResponseEntity.status(500).body("Failed to create booking");
    }
}
