package com.local.localservice.controller;

import com.local.localservice.dao.UserDAO;
import com.local.localservice.model.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
public class AuthController {
    @Autowired
    private UserDAO userDAO;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody User user) {
        User found = userDAO.findByEmailAndPassword(user.getEmail(), user.getPassword());
        if (found == null) {
            return ResponseEntity.status(401).body("Invalid credentials");
        }
        return ResponseEntity.ok(found);
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody User user) {
        int rows = userDAO.save(user);
        if (rows > 0) return ResponseEntity.ok("User registered successfully");
        return ResponseEntity.status(500).body("Registration failed");
    }
}
