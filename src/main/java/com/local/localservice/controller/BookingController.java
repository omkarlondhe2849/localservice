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

    // Get bookings by user ID
    @GetMapping("/user/{userId}")
    public List<Booking> getBookingsByUser(@PathVariable Long userId) {
        return bookingDAO.findAllByUserId(userId);
    }

    // Get booking by ID
    @GetMapping("/{id}")
    public ResponseEntity<?> getBookingById(@PathVariable Long id) {
        Booking booking = bookingDAO.findById(id);
        if (booking != null) {
            return ResponseEntity.ok(booking);
        } else {
            return ResponseEntity.status(404).body("Booking not found");
        }
    }

    // Create new booking
    @PostMapping
    public ResponseEntity<?> addBooking(@RequestBody Booking booking) {
        int rows = bookingDAO.save(booking);
        if (rows > 0) return ResponseEntity.ok("Booking created");
        return ResponseEntity.status(500).body("Failed to create booking");
    }

    // Update existing booking
    @PutMapping("/{id}")
    public ResponseEntity<?> updateBooking(@PathVariable Long id, @RequestBody Booking booking) {
        Booking existingBooking = bookingDAO.findById(id);
        if (existingBooking == null) {
            return ResponseEntity.status(404).body("Booking not found");
        }
        booking.setId(id);
        int rows = bookingDAO.update(booking);
        if (rows > 0) return ResponseEntity.ok("Booking updated");
        return ResponseEntity.status(500).body("Failed to update booking");
    }

    // Delete booking by ID
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteBooking(@PathVariable Long id) {
        int rows = bookingDAO.delete(id);
        if (rows > 0) {
            return ResponseEntity.ok("Booking deleted");
        } else {
            return ResponseEntity.status(404).body("Booking not found");
        }
    }
}
