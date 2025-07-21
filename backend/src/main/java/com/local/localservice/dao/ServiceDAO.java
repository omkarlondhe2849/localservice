package com.local.localservice.dao;

import com.local.localservice.model.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.*;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class ServiceDAO {

    private static final Logger logger = LoggerFactory.getLogger(ServiceDAO.class);
    
    @Autowired
    private JdbcTemplate jdbcTemplate;

    public List<Service> findAll() {
        logger.debug("Executing query: SELECT * FROM services");
        try {
            String sql = "SELECT * FROM services";
            List<Service> services = jdbcTemplate.query(sql, new BeanPropertyRowMapper<>(Service.class));
            logger.info("Retrieved {} services from database", services.size());
            return services;
        } catch (Exception e) {
            logger.error("Error retrieving all services: {}", e.getMessage(), e);
            throw e;
        }
    }

    public Service findById(Long id) {
        logger.debug("Executing query: SELECT * FROM services WHERE id = {}", id);
        try {
            String sql = "SELECT * FROM services WHERE id = ?";
            List<Service> services = jdbcTemplate.query(sql, new Object[]{id}, new BeanPropertyRowMapper<>(Service.class));
            Service service = services.isEmpty() ? null : services.get(0);
            if (service == null) {
                logger.debug("No service found with ID: {}", id);
            } else {
                logger.debug("Found service with ID {}: {}", id, service.getTitle());
            }
            return service;
        } catch (Exception e) {
            logger.error("Error retrieving service with ID {}: {}", id, e.getMessage(), e);
            throw e;
        }
    }

    public int save(Service service) {
        logger.debug("Executing INSERT for service: {}", service.getTitle());
        try {
            String sql = "INSERT INTO services(title, description, category, location, price, provider_id) VALUES (?, ?, ?, ?, ?, ?)";
            int result = jdbcTemplate.update(sql,
                    service.getTitle(),
                    service.getDescription(),
                    service.getCategory(),
                    service.getLocation(),
                    service.getPrice(),
                    service.getProviderId());
            logger.info("Service '{}' saved successfully, rows affected: {}", service.getTitle(), result);
            return result;
        } catch (Exception e) {
            logger.error("Error saving service '{}': {}", service.getTitle(), e.getMessage(), e);
            throw e;
        }
    }

    public int update(Service service) {
        logger.debug("Executing UPDATE for service ID: {}", service.getId());
        try {
            String sql = "UPDATE services SET title = ?, description = ?, category = ?, location = ?, price = ?, provider_id = ? WHERE id = ?";
            int result = jdbcTemplate.update(sql,
                    service.getTitle(),
                    service.getDescription(),
                    service.getCategory(),
                    service.getLocation(),
                    service.getPrice(),
                    service.getProviderId(),
                    service.getId());
            logger.info("Service with ID {} updated successfully, rows affected: {}", service.getId(), result);
            return result;
        } catch (Exception e) {
            logger.error("Error updating service with ID {}: {}", service.getId(), e.getMessage(), e);
            throw e;
        }
    }

    public int delete(Long id) {
        logger.debug("Executing DELETE for service ID: {}", id);
        try {
            String sql = "DELETE FROM services WHERE id = ?";
            int result = jdbcTemplate.update(sql, id);
            logger.info("Service with ID {} deleted successfully, rows affected: {}", id, result);
            return result;
        } catch (Exception e) {
            logger.error("Error deleting service with ID {}: {}", id, e.getMessage(), e);
            throw e;
        }
    }

    public int countByProviderId(Long providerId) {
        logger.debug("Executing COUNT for services with provider_id = {}", providerId);
        try {
            String sql = "SELECT COUNT(*) FROM services WHERE provider_id = ?";
            Integer count = jdbcTemplate.queryForObject(sql, new Object[]{providerId}, Integer.class);
            logger.info("Counted {} services for provider_id {}", count, providerId);
            return count != null ? count : 0;
        } catch (Exception e) {
            logger.error("Error counting services for provider_id {}: {}", providerId, e.getMessage(), e);
            throw e;
        }
    }

    public int countAll() {
        logger.debug("Executing COUNT for all services");
        try {
            String sql = "SELECT COUNT(*) FROM services";
            Integer count = jdbcTemplate.queryForObject(sql, Integer.class);
            logger.info("Counted {} services in total", count);
            return count != null ? count : 0;
        } catch (Exception e) {
            logger.error("Error counting all services: {}", e.getMessage(), e);
            throw e;
        }
    }
}
