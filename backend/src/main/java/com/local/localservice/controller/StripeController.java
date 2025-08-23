package com.local.localservice.controller;

import com.stripe.Stripe;
import com.stripe.model.checkout.Session;
import com.stripe.param.checkout.SessionCreateParams;
import com.stripe.model.Refund;
import com.stripe.param.RefundCreateParams;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.local.localservice.dao.BookingDAO;
import com.local.localservice.model.Booking;
import java.time.LocalDate;
import java.util.List;
import java.util.HashMap;
import java.util.Map;

@RestController
@CrossOrigin(origins = {"http://localhost:5500", "http://127.0.0.1:5500", "http://localhost:3030", "http://127.0.0.1:3030"})
public class StripeController {
    @Autowired
    private BookingDAO bookingDAO;

    public StripeController(@Value("${stripe.api.key}") String apiKey) {
        Stripe.apiKey = apiKey;
    }

    @PostMapping("/create-checkout-session")
    public ResponseEntity<Map<String, String>> createCheckoutSession(@RequestBody Map<String, Object> data) {
        try {
            long amount = ((Number) data.getOrDefault("amount", 1000)).longValue(); // in cents
            String currency = (String) data.getOrDefault("currency", "inr");
            String name = (String) data.getOrDefault("name", "Test Product");
            String successUrl = (String) data.getOrDefault("successUrl", "http://localhost:5500/success.html");
            String cancelUrl = (String) data.getOrDefault("cancelUrl", "http://localhost:5500/cancel.html");

            SessionCreateParams params = SessionCreateParams.builder()
                .setMode(SessionCreateParams.Mode.PAYMENT)
                .setSuccessUrl(successUrl + "?session_id={CHECKOUT_SESSION_ID}")
                .setCancelUrl(cancelUrl)
                .addLineItem(
                    SessionCreateParams.LineItem.builder()
                        .setQuantity(1L)
                        .setPriceData(
                            SessionCreateParams.LineItem.PriceData.builder()
                                .setCurrency(currency)
                                .setUnitAmount(amount)
                                .setProductData(
                                    SessionCreateParams.LineItem.PriceData.ProductData.builder()
                                        .setName(name)
                                        .build()
                                )
                                .build()
                        )
                        .build()
                )
                .build();

            Session session = Session.create(params);

            Map<String, String> responseData = new HashMap<>();
            responseData.put("id", session.getId());
            return ResponseEntity.ok(responseData);
        } catch (Exception e) {
            e.printStackTrace();
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }

    // Scheduled job: runs every hour
    @Scheduled(cron = "0 0 * * * *")
    public void refundOverdueBookings() {
        List<Booking> overdue = bookingDAO.findOverdueUncompletedPaidBookings(LocalDate.now());
        for (Booking booking : overdue) {
            try {
                if (booking.getStripeSessionId() != null) {
                    RefundCreateParams params = RefundCreateParams.builder()
                        .setPaymentIntent(booking.getStripeSessionId())
                        .build();
                    Refund refund = Refund.create(params);
                    bookingDAO.updatePaymentStatus(booking.getId(), "REFUNDED");
                    bookingDAO.updateStatus(booking.getId(), "REFUNDED");
                }
            } catch (Exception e) {
                e.printStackTrace();
            }
        }
    }
} 