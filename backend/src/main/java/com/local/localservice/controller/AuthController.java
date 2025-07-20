package com.local.localservice.controller;

import com.local.localservice.dao.UserDAO;
import com.local.localservice.model.User;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
public class AuthController {
    
    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);
    
    @Autowired
    private UserDAO userDAO;

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
}
