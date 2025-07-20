package com.local.localservice.controller;

import com.local.localservice.dao.ServiceDAO;
import com.local.localservice.dao.UserDAO;
import com.local.localservice.dao.ReviewDAO;
import com.local.localservice.model.Service;
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
@RequestMapping("/services")
public class ServiceController {
    
    private static final Logger logger = LoggerFactory.getLogger(ServiceController.class);
    
    @Autowired
    private ServiceDAO serviceDAO;
    
    @Autowired
    private UserDAO userDAO;
    
    @Autowired
    private ReviewDAO reviewDAO;

    @GetMapping
    public List<Service> getAllServices() {
        logger.info("GET /services - Retrieving all services");
        List<Service> services = serviceDAO.findAll();
        logger.info("Retrieved {} services", services.size());
        return services;
    }

    @GetMapping("/{id}")
    public Service getServiceById(@PathVariable Long id) {
        logger.info("GET /services/{} - Retrieving service by ID", id);
        Service service = serviceDAO.findById(id);
        if (service == null) {
            logger.warn("Service with ID {} not found", id);
        } else {
            logger.info("Successfully retrieved service with ID: {}", id);
        }
        return service;
    }

    @GetMapping("/{id}/details")
    public ResponseEntity<?> getServiceDetails(@PathVariable Long id) {
        logger.info("GET /services/{}/details - Retrieving service details", id);
        
        Service service = serviceDAO.findById(id);
        if (service == null) {
            logger.warn("Service with ID {} not found for details request", id);
            return ResponseEntity.notFound().build();
        }
        
        User provider = userDAO.findById(service.getProviderId());
        Double avgRating = reviewDAO.getAverageRatingForProvider(service.getProviderId());
        Integer reviewCount = reviewDAO.getReviewCountForProvider(service.getProviderId());
        
        Map<String, Object> details = new HashMap<>();
        details.put("service", service);
        details.put("provider", provider);
        details.put("averageRating", avgRating);
        details.put("reviewCount", reviewCount);
        
        logger.info("Successfully retrieved service details for ID: {}", id);
        return ResponseEntity.ok(details);
    }

    @PostMapping
    public ResponseEntity<?> addService(@RequestBody Service service) {
        logger.info("POST /services - Creating new service: {}", service.getTitle());
        
        try {
            int rows = serviceDAO.save(service);
            if (rows > 0) {
                logger.info("Service '{}' created successfully", service.getTitle());
                return ResponseEntity.ok("Service created");
            } else {
                logger.error("Failed to create service: {}", service.getTitle());
                return ResponseEntity.status(500).body("Failed to create service");
            }
        } catch (Exception e) {
            logger.error("Error creating service: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body("Failed to create service");
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateService(@PathVariable Long id, @RequestBody Service service) {
        logger.info("PUT /services/{} - Updating service", id);
        
        try {
            service.setId(id);
            int rows = serviceDAO.update(service);
            if (rows > 0) {
                logger.info("Service with ID {} updated successfully", id);
                return ResponseEntity.ok("Service updated");
            } else {
                logger.warn("No service found with ID {} for update", id);
                return ResponseEntity.status(500).body("Failed to update service");
            }
        } catch (Exception e) {
            logger.error("Error updating service with ID {}: {}", id, e.getMessage(), e);
            return ResponseEntity.status(500).body("Failed to update service");
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteService(@PathVariable Long id) {
        logger.info("DELETE /services/{} - Deleting service", id);
        
        try {
            int rows = serviceDAO.delete(id);
            if (rows > 0) {
                logger.info("Service with ID {} deleted successfully", id);
                return ResponseEntity.ok("Service deleted");
            } else {
                logger.warn("No service found with ID {} for deletion", id);
                return ResponseEntity.status(500).body("Failed to delete service");
            }
        } catch (Exception e) {
            logger.error("Error deleting service with ID {}: {}", id, e.getMessage(), e);
            return ResponseEntity.status(500).body("Failed to delete service");
        }
    }
}
