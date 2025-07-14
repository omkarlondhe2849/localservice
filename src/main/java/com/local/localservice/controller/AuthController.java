package com.local.localservice.controller;

import com.local.localservice.dao.ServiceDAO;
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

    @Autowired
    private ServiceDAO serviceDAO;

    // Register user
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody User user) {
        int rows = userDAO.save(user);
        if (rows > 0) {
            return ResponseEntity.ok("User registered successfully");
        }
        return ResponseEntity.status(500).body("Failed to register user");
    }

    // Login user
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody User user) {
        User existingUser = userDAO.findByEmailAndPassword(user.getEmail(), user.getPassword());
        if (existingUser != null) {
            return ResponseEntity.ok(existingUser);
        } else {
            return ResponseEntity.status(401).body("Invalid credentials");
        }
    }
    
    //update user by id
    @PutMapping("/users/{id}")
    public ResponseEntity<?> updateUser(@PathVariable Long id, @RequestBody User user) {
        user.setId(id);  // make sure user has the id set from path
        int rows = userDAO.update(user);
        if (rows > 0) {
            return ResponseEntity.ok("User updated successfully");
        } else {
            return ResponseEntity.status(404).body("User not found");
        }
    }

    // Delete user and their services by user id
    @DeleteMapping("/users/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        // First delete services of this user
        int servicesDeleted = serviceDAO.deleteServicesByProviderId(id);

        // Then delete the user
        int userDeleted = userDAO.deleteById(id);

        if (userDeleted > 0) {
            return ResponseEntity.ok("User deleted successfully along with " + servicesDeleted + " service(s)");
        } else {
            return ResponseEntity.status(404).body("User not found");
        }
    }
}
