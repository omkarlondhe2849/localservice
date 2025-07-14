package com.local.localservice.controller;

import com.local.localservice.dao.ServiceDAO;
import com.local.localservice.model.Service;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/services")
public class ServiceController {

    @Autowired
    private ServiceDAO serviceDAO;

    // GET /services - Get all services
    @GetMapping
    public List<Service> getAllServices() {
        return serviceDAO.findAll();
    }

    // GET /services/{id} - Get a specific service by ID
    @GetMapping("/{id}")
    public ResponseEntity<Service> getServiceById(@PathVariable Long id) {
        Service service = serviceDAO.findById(id);
        if (service == null) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(service);
    }

    // POST /services or /services/add - Add a new service
    @PostMapping({ "", "/add" })
    public ResponseEntity<?> addService(@RequestBody Service service) {
        int rows = serviceDAO.save(service);
        if (rows > 0) return ResponseEntity.ok("Service added successfully.");
        return ResponseEntity.status(500).body("Failed to add service.");
    }

    // PUT /services/{id} - Update existing service
    @PutMapping("/{id}")
    public ResponseEntity<?> updateService(@PathVariable Long id, @RequestBody Service service) {
        service.setId(id);
        int rows = serviceDAO.update(service);
        if (rows > 0) return ResponseEntity.ok("Service updated successfully.");
        return ResponseEntity.status(404).body("Service not found.");
    }

    // DELETE /services/{id} - Delete a service by ID
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteService(@PathVariable Long id) {
        int rows = serviceDAO.delete(id);
        if (rows > 0) return ResponseEntity.ok("Service deleted successfully.");
        return ResponseEntity.status(404).body("Service not found.");
    }
}
