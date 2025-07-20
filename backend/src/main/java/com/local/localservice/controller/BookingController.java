package com.local.localservice.controller;

import com.local.localservice.dao.BookingDAO;
import com.local.localservice.dao.UserDAO;
import com.local.localservice.model.Booking;
import com.local.localservice.model.User;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/bookings")
public class BookingController {
    
    private static final Logger logger = LoggerFactory.getLogger(BookingController.class);
    
    @Autowired
    private BookingDAO bookingDAO;
    
    @Autowired
    private UserDAO userDAO;

    @GetMapping
    public List<Booking> getAllBookings() {
        logger.info("GET /bookings - Retrieving all bookings");
        List<Booking> bookings = bookingDAO.findAll();
        logger.info("Retrieved {} bookings", bookings.size());
        return bookings;
    }

    @GetMapping("/user/{userId}")
    public List<Booking> getBookingsByUser(@PathVariable Long userId) {
        logger.info("GET /bookings/user/{} - Retrieving bookings for user", userId);
        List<Booking> bookings = bookingDAO.findAllByUserId(userId);
        logger.info("Retrieved {} bookings for user ID: {}", bookings.size(), userId);
        return bookings;
    }

    @GetMapping("/provider/{providerId}")
    public List<Booking> getBookingsByProvider(@PathVariable Long providerId) {
        logger.info("GET /bookings/provider/{} - Retrieving bookings for provider", providerId);
        List<Booking> bookings = bookingDAO.findAllByProviderId(providerId);
        logger.info("Retrieved {} bookings for provider ID: {}", bookings.size(), providerId);
        return bookings;
    }

    @GetMapping("/provider/{providerId}/with-customers")
    public ResponseEntity<?> getBookingsWithCustomerDetails(@PathVariable Long providerId) {
        logger.info("GET /bookings/provider/{}/with-customers - Retrieving bookings with customer details", providerId);
        
        try {
            List<Booking> bookings = bookingDAO.findAllByProviderId(providerId);
            
            List<Map<String, Object>> bookingsWithCustomers = bookings.stream()
                .map(booking -> {
                    Map<String, Object> bookingWithCustomer = new HashMap<>();
                    bookingWithCustomer.put("booking", booking);
                    
                    User customer = userDAO.findById(booking.getUserId());
                    if (customer != null) {
                        Map<String, Object> customerInfo = new HashMap<>();
                        customerInfo.put("id", customer.getId());
                        customerInfo.put("name", customer.getName());
                        customerInfo.put("email", customer.getEmail());
                        customerInfo.put("phone", customer.getPhone());
                        bookingWithCustomer.put("customer", customerInfo);
                    }
                    
                    return bookingWithCustomer;
                })
                .toList();
            
            logger.info("Retrieved {} bookings with customer details for provider ID: {}", bookingsWithCustomers.size(), providerId);
            return ResponseEntity.ok(bookingsWithCustomers);
        } catch (Exception e) {
            logger.error("Error retrieving bookings with customer details for provider ID {}: {}", providerId, e.getMessage(), e);
            return ResponseEntity.status(500).body("Failed to retrieve bookings");
        }
    }

    @PostMapping
    public ResponseEntity<?> addBooking(@RequestBody Booking booking) {
        logger.info("POST /bookings - Creating new booking for service ID: {}, user ID: {}", booking.getServiceId(), booking.getUserId());
        
        try {
            int rows = bookingDAO.save(booking);
            if (rows > 0) {
                logger.info("Booking created successfully for service ID: {}, user ID: {}", booking.getServiceId(), booking.getUserId());
                return ResponseEntity.ok("Booking created");
            } else {
                logger.error("Failed to create booking for service ID: {}, user ID: {}", booking.getServiceId(), booking.getUserId());
                return ResponseEntity.status(500).body("Failed to create booking");
            }
        } catch (Exception e) {
            logger.error("Error creating booking: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body("Failed to create booking");
        }
    }

    @PutMapping("/{bookingId}")
    public ResponseEntity<?> updateBookingStatus(@PathVariable Long bookingId, @RequestBody Booking booking) {
        logger.info("PUT /bookings/{} - Updating booking status to: {}", bookingId, booking.getStatus());
        
        try {
            int rows = bookingDAO.updateStatus(bookingId, booking.getStatus());
            if (rows > 0) {
                logger.info("Booking status updated successfully for booking ID: {} to status: {}", bookingId, booking.getStatus());
                return ResponseEntity.ok("Booking status updated");
            } else {
                logger.warn("No booking found with ID {} for status update", bookingId);
                return ResponseEntity.status(500).body("Failed to update booking status");
            }
        } catch (Exception e) {
            logger.error("Error updating booking status for ID {}: {}", bookingId, e.getMessage(), e);
            return ResponseEntity.status(500).body("Failed to update booking status");
        }
    }
}
