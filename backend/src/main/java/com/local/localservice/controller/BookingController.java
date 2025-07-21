package com.local.localservice.controller;

import com.local.localservice.dao.BookingDAO;
import com.local.localservice.dao.UserDAO;
import com.local.localservice.dao.ServiceDAO;
import com.local.localservice.model.Booking;
import com.local.localservice.model.User;
import com.local.localservice.model.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
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

    @Autowired
    private ServiceDAO serviceDAO;

    @Autowired
    private JavaMailSender mailSender;

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
            // Always set providerId from the service
            Service service = serviceDAO.findById(booking.getServiceId());
            if (service == null) {
                return ResponseEntity.status(400).body("Invalid service ID");
            }
            booking.setProviderId(service.getProviderId());

            int rows = bookingDAO.save(booking);
            if (rows > 0) {
                logger.info("Booking created successfully for service ID: {}, user ID: {}", booking.getServiceId(), booking.getUserId());
                // Send email to provider
                User provider = userDAO.findById(service.getProviderId());
                if (provider != null && provider.getEmail() != null && !provider.getEmail().isEmpty()) {
                    SimpleMailMessage message = new SimpleMailMessage();
                    message.setTo(provider.getEmail());
                    message.setSubject("New Service Booking Request");
                    message.setText("You have received a new booking request for your service: " + service.getTitle() +
                        "\nBooking address: " + (booking.getAddress() != null ? booking.getAddress() : "(not provided)") +
                        ". Please review and accept or reject the booking.");
                    mailSender.send(message);
                }
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
                // If status is CONFIRMED, CANCELLED, or COMPLETED, send email to user
                if ("CONFIRMED".equalsIgnoreCase(booking.getStatus()) ||
                    "CANCELLED".equalsIgnoreCase(booking.getStatus()) ||
                    "COMPLETED".equalsIgnoreCase(booking.getStatus())) {
                    Booking updatedBooking = bookingDAO.findById(bookingId);
                    if (updatedBooking != null) {
                        User user = userDAO.findById(updatedBooking.getUserId());
                        Service service = serviceDAO.findById(updatedBooking.getServiceId());
                        if (user != null && user.getEmail() != null) {
                            SimpleMailMessage message = new SimpleMailMessage();
                            message.setTo(user.getEmail());
                            if ("CONFIRMED".equalsIgnoreCase(booking.getStatus())) {
                                message.setSubject("Your Booking Has Been Accepted");
                                message.setText("Your booking for service '" + service.getTitle() + "' has been accepted by the provider!\nBooking address: " + (updatedBooking.getAddress() != null ? updatedBooking.getAddress() : "(not provided)") );
                            } else if ("CANCELLED".equalsIgnoreCase(booking.getStatus())) {
                                message.setSubject("Your Booking Has Been Cancelled");
                                message.setText("Your booking for service '" + service.getTitle() + "' has been cancelled by the provider.\nBooking address: " + (updatedBooking.getAddress() != null ? updatedBooking.getAddress() : "(not provided)") );
                            } else if ("COMPLETED".equalsIgnoreCase(booking.getStatus())) {
                                message.setSubject("Your Booking Has Been Completed");
                                message.setText("Your booking for service '" + service.getTitle() + "' has been marked as completed by the provider. Thank you for using our platform!\nBooking address: " + (updatedBooking.getAddress() != null ? updatedBooking.getAddress() : "(not provided)") );
                            }
                            mailSender.send(message);
                        }
                    }
                }
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
