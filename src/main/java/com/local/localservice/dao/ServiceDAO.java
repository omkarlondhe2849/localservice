package com.local.localservice.dao;

import com.local.localservice.model.Service;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.*;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class ServiceDAO {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    public List<Service> findAll() {
        String sql = "SELECT * FROM services";
        return jdbcTemplate.query(sql, new BeanPropertyRowMapper<>(Service.class));
    }

    public Service findById(Long id) {
        String sql = "SELECT * FROM services WHERE id = ?";
        List<Service> services = jdbcTemplate.query(sql, new Object[]{id}, new BeanPropertyRowMapper<>(Service.class));
        return services.isEmpty() ? null : services.get(0);
    }

    public int save(Service service) {
        String sql = "INSERT INTO services(title, description, category, location, price, provider_id) VALUES (?, ?, ?, ?, ?, ?)";
        return jdbcTemplate.update(sql,
                service.getTitle(),
                service.getDescription(),
                service.getCategory(),
                service.getLocation(),
                service.getPrice(),
                service.getProviderId());
    }

    public int update(Service service) {
        String sql = "UPDATE services SET title = ?, description = ?, category = ?, location = ?, price = ?, provider_id = ? WHERE id = ?";
        return jdbcTemplate.update(sql,
                service.getTitle(),
                service.getDescription(),
                service.getCategory(),
                service.getLocation(),
                service.getPrice(),
                service.getProviderId(),
                service.getId());
    }

    public int delete(Long id) {
        String sql = "DELETE FROM services WHERE id = ?";
        return jdbcTemplate.update(sql, id);
    }

    // New method: delete all services of a user (provider)
    public int deleteServicesByProviderId(Long providerId) {
        String sql = "DELETE FROM services WHERE provider_id = ?";
        return jdbcTemplate.update(sql, providerId);
    }
}
