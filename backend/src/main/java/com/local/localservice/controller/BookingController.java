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
import com.stripe.Stripe;
import com.stripe.model.checkout.Session;
import com.stripe.param.checkout.SessionCreateParams;
import com.stripe.model.PaymentIntent;
import com.stripe.param.PaymentIntentRetrieveParams;
import org.springframework.beans.factory.annotation.Value;
import java.security.SecureRandom;
import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.sql.Date;
import java.sql.Time;
import org.springframework.mail.javamail.MimeMessageHelper;
import jakarta.mail.internet.MimeMessage;

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

    @Value("${stripe.api.key}")
    private String stripeApiKey;

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

    // 1. Create booking and Stripe session
    @PostMapping("/create-with-payment")
    public ResponseEntity<?> createBookingWithPayment(@RequestBody Map<String, Object> payload) {
        try {
            Long userId = Long.valueOf(payload.get("userId").toString());
            Long serviceId = Long.valueOf(payload.get("serviceId").toString());
            String bookingDate = payload.get("bookingDate").toString();
            String bookingTime = payload.get("bookingTime").toString();
            String address = payload.getOrDefault("address", "").toString();
            // Fetch service for price
            Service service = serviceDAO.findById(serviceId);
            if (service == null) return ResponseEntity.badRequest().body("Invalid service");
            if (service.getPrice().compareTo(new java.math.BigDecimal("50")) < 0) {
                return ResponseEntity.badRequest().body("Minimum price is ₹50 due to Stripe requirements.");
            }
            // Create booking (PENDING, payment_status=PENDING)
            Booking booking = new Booking();
            booking.setUserId(userId);
            booking.setServiceId(serviceId);
            booking.setProviderId(service.getProviderId());
            booking.setBookingDate(Date.valueOf(bookingDate));
            booking.setBookingTime(Time.valueOf(bookingTime));
            booking.setStatus("PENDING");
            booking.setPaymentStatus("PENDING");
            booking.setAddress(address);
            bookingDAO.save(booking);
            // Send email to provider
            User provider = userDAO.findById(service.getProviderId());
            if (provider != null && provider.getEmail() != null && !provider.getEmail().isEmpty()) {
                SimpleMailMessage message = new SimpleMailMessage();
                message.setTo(provider.getEmail());
                message.setSubject("New Service Booking Request - " + service.getTitle());
                message.setText(
                    "Dear " + provider.getName() + ",\n\n" +
                    "You have received a new booking request!\n\n" +
                    "Booking Details:\n" +
                    "---------------\n" +
                    "Service: " + service.getTitle() + "\n" +
                    "Date: " + booking.getBookingDate() + "\n" +
                    "Time: " + booking.getBookingTime() + "\n" +
                    "Address: " + (booking.getAddress() != null ? booking.getAddress() : "(not provided)") + "\n" +
                    "Amount: ₹" + service.getPrice() + "\n\n" +
                    "Please review and accept/reject this booking request through your provider dashboard.\n\n" +
                    "Note: Quick response to booking requests helps maintain a high acceptance rate and improves your visibility on our platform.\n\n" +
                    "Best regards,\n" +
                    "The Local Service Team"
                );
                mailSender.send(message);
            }
            // Create Stripe session
            Stripe.apiKey = stripeApiKey;
            SessionCreateParams params = SessionCreateParams.builder()
                .setMode(SessionCreateParams.Mode.PAYMENT)
                .setSuccessUrl("http://localhost:3030/success.html?session_id={CHECKOUT_SESSION_ID}")
                .setCancelUrl("http://localhost:3030/cancel.html")
                .addLineItem(
                    SessionCreateParams.LineItem.builder()
                        .setQuantity(1L)
                        .setPriceData(
                            SessionCreateParams.LineItem.PriceData.builder()
                                .setCurrency("inr")
                                .setUnitAmount(service.getPrice().multiply(new java.math.BigDecimal(100)).longValue())
                                .setProductData(SessionCreateParams.LineItem.PriceData.ProductData.builder().setName(service.getTitle()).build())
                                .build()
                        )
                        .build()
                )
                .putMetadata("bookingId", booking.getId().toString())
                .build();
            Session session = Session.create(params);
            // Save session ID to booking
            booking.setStripeSessionId(session.getPaymentIntent());
            bookingDAO.updateStripeSessionId(booking.getId(), session.getPaymentIntent());
            Map<String, Object> resp = new HashMap<>();
            resp.put("sessionId", session.getId());
            resp.put("bookingId", booking.getId());
            return ResponseEntity.ok(resp);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Failed to create booking/payment session");
        }
    }

    // 2. Confirm payment and send OTP
    @PostMapping("/confirm-payment")
    public ResponseEntity<?> confirmPaymentAndSendOtp(@RequestBody Map<String, Object> payload) {
        try {
            Long bookingId = Long.valueOf(payload.get("bookingId").toString());
            String sessionId = payload.get("sessionId").toString();
            Stripe.apiKey = stripeApiKey;
            Session session = Session.retrieve(sessionId);
            if (!"complete".equals(session.getStatus())) {
                return ResponseEntity.badRequest().body("Payment not completed");
            }
            Booking booking = bookingDAO.findById(bookingId);
            if (booking == null) return ResponseEntity.badRequest().body("Invalid booking");
            // Mark as paid
            bookingDAO.updatePaymentStatus(bookingId, "PAID");
            // Generate OTP
            String otp = String.format("%06d", new SecureRandom().nextInt(999999));
            // Set OTP expiry to booking date at 23:59:59
            java.sql.Date bookingDate = booking.getBookingDate();
            java.sql.Timestamp expiry = java.sql.Timestamp.valueOf(bookingDate.toLocalDate().atTime(23, 59, 59));
            bookingDAO.updateOtp(bookingId, otp, expiry);
            // OTP logger
            logger.info("[OTP] BookingID: {}, User: {}, Service: {}, OTP: {}, Expires: {}", bookingId, userDAO.findById(booking.getUserId()) != null ? userDAO.findById(booking.getUserId()).getEmail() : "?", serviceDAO.findById(booking.getServiceId()) != null ? serviceDAO.findById(booking.getServiceId()).getTitle() : "?", otp, expiry);
            // Email OTP to user (HTML receipt)
            User user = userDAO.findById(booking.getUserId());
            Service service = serviceDAO.findById(booking.getServiceId());
            if (user != null && user.getEmail() != null) {
                try {
                    MimeMessage mimeMessage = mailSender.createMimeMessage();
                    MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");
                    helper.setTo(user.getEmail());
                    helper.setSubject("Your Service Booking Receipt & OTP - " + service.getTitle());
                    String html = "" +
                        "<div style='font-family:Arial,sans-serif;max-width:600px;margin:auto;border:1px solid #eee;border-radius:8px;overflow:hidden;'>" +
                        "<div style='background:#2563eb;color:#fff;padding:18px 24px;font-size:1.3em;font-weight:bold;'>Local Service - Payment Receipt</div>" +
                        "<div style='padding:24px;'>" +
                        "<p>Dear <b>" + user.getName() + "</b>,</p>" +
                        "<p>Thank you for booking with Local Service! Your payment has been received and your booking is confirmed.</p>" +
                        "<h3 style='margin-top:32px;margin-bottom:10px;color:#2563eb;'>Booking Details</h3>" +
                        "<table style='width:100%;border-collapse:collapse;margin-bottom:20px;'>" +
                        "<tr><td style='padding:8px 0;color:#555;'>Service</td><td style='padding:8px 0;'><b>" + service.getTitle() + "</b></td></tr>" +
                        "<tr><td style='padding:8px 0;color:#555;'>Date</td><td style='padding:8px 0;'>" + booking.getBookingDate() + "</td></tr>" +
                        "<tr><td style='padding:8px 0;color:#555;'>Time</td><td style='padding:8px 0;'>" + booking.getBookingTime() + "</td></tr>" +
                        "<tr><td style='padding:8px 0;color:#555;'>Address</td><td style='padding:8px 0;'>" + (booking.getAddress() != null ? booking.getAddress() : "(not provided)") + "</td></tr>" +
                        "<tr><td style='padding:8px 0;color:#555;'>Provider</td><td style='padding:8px 0;'>" + (service.getProviderId() != null ? (userDAO.findById(service.getProviderId()) != null ? userDAO.findById(service.getProviderId()).getName() : "Unknown") : "Unknown") + "</td></tr>" +
                        "</table>" +
                        "<h3 style='margin-top:24px;margin-bottom:10px;color:#2563eb;'>Payment Details</h3>" +
                        "<table style='width:100%;border-collapse:collapse;margin-bottom:20px;'>" +
                        "<tr><td style='padding:8px 0;color:#555;'>Amount Paid</td><td style='padding:8px 0;'><b>₹" + service.getPrice() + "</b></td></tr>" +
                        "<tr><td style='padding:8px 0;color:#555;'>Transaction ID</td><td style='padding:8px 0;'>" + session.getPaymentIntent() + "</td></tr>" +
                        "<tr><td style='padding:8px 0;color:#555;'>Payment Status</td><td style='padding:8px 0;'>Completed</td></tr>" +
                        "</table>" +
                        "<h3 style='margin-top:24px;margin-bottom:10px;color:#2563eb;'>Your OTP for Service Completion</h3>" +
                        "<div style='font-size:1.5em;font-weight:bold;letter-spacing:2px;margin-bottom:10px;'>" + otp + "</div>" +
                        "<p style='color:#555;'>Please provide this OTP to your service provider after the service is completed. This OTP will expire at the end of your booking date.</p>" +
                        "<hr style='margin:32px 0;border:none;border-top:1px solid #eee;'>" +
                        "<p style='color:#888;font-size:0.95em;'>If you have any questions or need assistance, please contact our support team.<br>Thank you for choosing Local Service!</p>" +
                        "<div style='color:#2563eb;font-weight:bold;margin-top:18px;'>The Local Service Team</div>" +
                        "</div></div>";
                    helper.setText(html, true);
                    mailSender.send(mimeMessage);
                } catch (Exception e) {
                    logger.error("Failed to send HTML receipt email: {}", e.getMessage(), e);
                }
            }
            return ResponseEntity.ok("Payment confirmed and OTP sent");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Failed to confirm payment/send OTP");
        }
    }

    // 3. Provider completes booking with OTP
    @PostMapping("/complete-with-otp")
    public ResponseEntity<?> completeBookingWithOtp(@RequestBody Map<String, Object> payload) {
        try {
            Long bookingId = Long.valueOf(payload.get("bookingId").toString());
            String otp = payload.get("otp").toString();
            Booking booking = bookingDAO.findById(bookingId);
            if (booking == null) return ResponseEntity.badRequest().body("Invalid booking");
            if (!"PAID".equals(booking.getPaymentStatus())) return ResponseEntity.badRequest().body("Booking not paid");
            if (!otp.equals(booking.getOtp())) return ResponseEntity.badRequest().body("Invalid OTP");
            if (booking.getOtpExpiry() != null && booking.getOtpExpiry().before(new java.util.Date())) return ResponseEntity.badRequest().body("OTP expired");
            // Mark as completed
            bookingDAO.updateStatus(bookingId, "COMPLETED");
            // Payout 80% to provider (simulate)
            java.math.BigDecimal payout = serviceDAO.findById(booking.getServiceId()).getPrice().multiply(new java.math.BigDecimal("0.8"));
            bookingDAO.updateProviderPayout(bookingId, "PAID", payout);
            // Send email to provider about completion and payout
            User provider = userDAO.findById(booking.getProviderId());
            Service service = serviceDAO.findById(booking.getServiceId());
            if (provider != null && provider.getEmail() != null && !provider.getEmail().isEmpty()) {
                SimpleMailMessage message = new SimpleMailMessage();
                message.setTo(provider.getEmail());
                message.setSubject("Service Completed & Payout Processed - " + service.getTitle());
                message.setText(
                    "Dear " + provider.getName() + ",\n\n" +
                    "Great job! The service has been completed successfully and your payout has been processed.\n\n" +
                    "Service Details:\n" +
                    "---------------\n" +
                    "Service: " + service.getTitle() + " (ID: " + service.getId() + ")\n" +
                    "Booking ID: " + booking.getId() + "\n" +
                    "Date: " + booking.getBookingDate() + "\n" +
                    "Time: " + booking.getBookingTime() + "\n" +
                    "Address: " + (booking.getAddress() != null ? booking.getAddress() : "(not provided)") + "\n\n" +
                    "Payout Details:\n" +
                    "--------------\n" +
                    "Total Service Amount: ₹" + service.getPrice() + "\n" +
                    "Platform Fee (20%): ₹" + service.getPrice().multiply(new java.math.BigDecimal("0.2")) + "\n" +
                    "Your Payout (80%): ₹" + payout + "\n" +
                    "Status: Processed\n\n" +
                    "The payout will be reflected in your registered bank account within 2-3 business days.\n\n" +
                    "Thank you for being a valued service provider on our platform!\n\n" +
                    "Best regards,\n" +
                    "The Local Service Team"
                );
                mailSender.send(message);
            }
            return ResponseEntity.ok("Booking completed and payout processed");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Failed to complete booking with OTP");
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
                    message.setSubject("New Service Booking Request - " + service.getTitle());
                    message.setText(
                        "Dear " + provider.getName() + ",\n\n" +
                        "You have received a new booking request!\n\n" +
                        "Booking Details:\n" +
                        "---------------\n" +
                        "Service: " + service.getTitle() + "\n" +
                        "Date: " + booking.getBookingDate() + "\n" +
                        "Time: " + booking.getBookingTime() + "\n" +
                        "Address: " + (booking.getAddress() != null ? booking.getAddress() : "(not provided)") + "\n" +
                        "Amount: ₹" + service.getPrice() + "\n\n" +
                        "Please review and accept/reject this booking request through your provider dashboard.\n\n" +
                        "Note: Quick response to booking requests helps maintain a high acceptance rate and improves your visibility on our platform.\n\n" +
                        "Best regards,\n" +
                        "The Local Service Team"
                    );
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
                                message.setSubject("Booking Confirmed - " + service.getTitle());
                                message.setText(
                                    "Dear " + user.getName() + ",\n\n" +
                                    "Great news! Your booking has been confirmed by the service provider.\n\n" +
                                    "Booking Details:\n" +
                                    "---------------\n" +
                                    "Service: " + service.getTitle() + "\n" +
                                    "Date: " + updatedBooking.getBookingDate() + "\n" +
                                    "Time: " + updatedBooking.getBookingTime() + "\n" +
                                    "Address: " + (updatedBooking.getAddress() != null ? updatedBooking.getAddress() : "(not provided)") + "\n\n" +
                                    "What's Next?\n" +
                                    "-----------\n" +
                                    "1. The provider will arrive at the scheduled time\n" +
                                    "2. After service completion, provide the OTP sent to you\n" +
                                    "3. Rate and review the service\n\n" +
                                    "Need to reschedule or cancel?\n" +
                                    "Please contact us at least 24 hours before the scheduled time.\n\n" +
                                    "Best regards,\n" +
                                    "The Local Service Team"
                                );
                            } else if ("CANCELLED".equalsIgnoreCase(booking.getStatus())) {
                                message.setSubject("Booking Cancelled - " + service.getTitle());
                                String refundText = "";
                                if (updatedBooking.getPaymentStatus() != null && updatedBooking.getPaymentStatus().equalsIgnoreCase("PAID")) {
                                    refundText = "\nRefund Details:\n" +
                                        "---------------\n" +
                                        "Amount: ₹" + service.getPrice() + "\n" +
                                        "Status: Processing\n" +
                                        "Expected Processing Time: 5-7 business days\n" +
                                        "The refund will be credited to your original payment method.\n";
                                }
                                message.setText(
                                    "Dear " + user.getName() + ",\n\n" +
                                    "Your booking has been cancelled.\n\n" +
                                    "Cancelled Booking Details:\n" +
                                    "-----------------------\n" +
                                    "Service: " + service.getTitle() + "\n" +
                                    "Date: " + updatedBooking.getBookingDate() + "\n" +
                                    "Time: " + updatedBooking.getBookingTime() + "\n" +
                                    "Address: " + (updatedBooking.getAddress() != null ? updatedBooking.getAddress() : "(not provided)") + "\n" +
                                    refundText + "\n" +
                                    "We're sorry for any inconvenience caused. You can book the service again or explore other service providers on our platform.\n\n" +
                                    "Best regards,\n" +
                                    "The Local Service Team"
                                );
                            } else if ("COMPLETED".equalsIgnoreCase(booking.getStatus())) {
                                message.setSubject("Service Completed - " + service.getTitle());
                                message.setText(
                                    "Dear " + user.getName() + ",\n\n" +
                                    "Your service has been completed successfully!\n\n" +
                                    "Service Details:\n" +
                                    "---------------\n" +
                                    "Service: " + service.getTitle() + "\n" +
                                    "Date: " + updatedBooking.getBookingDate() + "\n" +
                                    "Time: " + updatedBooking.getBookingTime() + "\n" +
                                    "Address: " + (updatedBooking.getAddress() != null ? updatedBooking.getAddress() : "(not provided)") + "\n\n" +
                                    "We'd Love Your Feedback!\n" +
                                    "--------------------\n" +
                                    "Please take a moment to rate and review your experience. Your feedback helps other users and improves our service quality.\n\n" +
                                    "Thank you for choosing Local Service!\n\n" +
                                    "Best regards,\n" +
                                    "The Local Service Team"
                                );
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

    @DeleteMapping("/{bookingId}")
    public ResponseEntity<?> deleteBooking(@PathVariable Long bookingId) {
        try {
            Booking booking = bookingDAO.findById(bookingId);
            if (booking == null) return ResponseEntity.notFound().build();
            if (booking.getPaymentStatus() != null && booking.getPaymentStatus().equalsIgnoreCase("PAID")) {
                return ResponseEntity.status(400).body("Cannot delete a paid booking.");
            }
            int rows = bookingDAO.delete(bookingId);
            if (rows > 0) {
                return ResponseEntity.ok("Booking deleted");
            } else {
                return ResponseEntity.status(500).body("Failed to delete booking");
            }
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Failed to delete booking");
        }
    }
}
