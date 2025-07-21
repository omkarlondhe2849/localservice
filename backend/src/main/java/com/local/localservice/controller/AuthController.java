package com.local.localservice.controller;

import com.local.localservice.dao.UserDAO;
import com.local.localservice.model.User;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.UUID;
import java.util.Map;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@RestController
@RequestMapping("/auth")
public class AuthController {
    
    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);
    
    @Autowired
    private UserDAO userDAO;

    @Autowired
    private JavaMailSender mailSender;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody User user) {
        logger.info("POST /auth/login - Login attempt for email: {}", user.getEmail());
        
        try {
            User found = userDAO.findByEmailAndPassword(user.getEmail(), user.getPassword());
            if (found == null) {
                logger.warn("Failed login attempt for email: {}", user.getEmail());
                return ResponseEntity.status(401).body("Invalid credentials");
            }
            logger.info("Successful login for user: {} (ID: {})", found.getName(), found.getId());
            return ResponseEntity.ok(found);
        } catch (Exception e) {
            logger.error("Error during login for email {}: {}", user.getEmail(), e.getMessage(), e);
            return ResponseEntity.status(500).body("Login failed");
        }
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody User user) {
        logger.info("POST /auth/register - Registration attempt for email: {}", user.getEmail());
        
        try {
            int rows = userDAO.save(user);
            if (rows > 0) {
                logger.info("User registered successfully: {} ({})", user.getName(), user.getEmail());
                return ResponseEntity.ok("User registered successfully");
            } else {
                logger.error("Failed to register user: {}", user.getEmail());
                return ResponseEntity.status(500).body("Registration failed");
            }
        } catch (Exception e) {
            logger.error("Error during registration for email {}: {}", user.getEmail(), e.getMessage(), e);
            return ResponseEntity.status(500).body("Registration failed");
        }
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody User user) {
        logger.info("POST /auth/forgot-password - Forgot password for email: {}", user.getEmail());
        try {
            User found = userDAO.findByEmail(user.getEmail());
            if (found == null) {
                // Don't reveal if user exists
                return ResponseEntity.ok().build();
            }
            String token = UUID.randomUUID().toString();
            String expiry = LocalDateTime.now().plusMinutes(30)
                .format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));
            userDAO.updateResetToken(user.getEmail(), token, expiry);
            // Send token via plain text email
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(user.getEmail());
            message.setSubject("Password Reset Token");
            message.setText("Your password reset token is: " + token + "\nThis token will expire in 30 minutes.");
            mailSender.send(message);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            logger.error("Error in forgot password: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body("Failed to send reset email");
        }
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> payload) {
        String token = payload.get("token");
        String newPassword = payload.get("password");
        logger.info("POST /auth/reset-password - Reset with token: {}", token);
        try {
            User user = userDAO.findByResetToken(token);
            if (user == null || user.getResetTokenExpiry() == null) {
                return ResponseEntity.status(400).body("Invalid or expired token");
            }
            LocalDateTime expiry = LocalDateTime.parse(user.getResetTokenExpiry(), DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));
            if (LocalDateTime.now().isAfter(expiry)) {
                return ResponseEntity.status(400).body("Token expired");
            }
            userDAO.updatePasswordByEmail(user.getEmail(), newPassword);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            logger.error("Error in reset password: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body("Failed to reset password");
        }
    }
}
