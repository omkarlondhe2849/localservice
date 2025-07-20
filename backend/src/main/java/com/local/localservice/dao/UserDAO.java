package com.local.localservice.dao;


import com.local.localservice.model.User;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.*;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class UserDAO {
    
    private static final Logger logger = LoggerFactory.getLogger(UserDAO.class);
    
    @Autowired
    private JdbcTemplate jdbcTemplate;

    public User findByEmailAndPassword(String email, String password) {
        logger.debug("Executing authentication query for email: {}", email);
        try {
            String sql = "SELECT * FROM users WHERE email = ? AND password = ?";
            List<User> users = jdbcTemplate.query(sql, new Object[]{email, password},
                new BeanPropertyRowMapper<>(User.class));
            User user = users.isEmpty() ? null : users.get(0);
            if (user == null) {
                logger.debug("Authentication failed for email: {}", email);
            } else {
                logger.debug("Authentication successful for user: {} (ID: {})", user.getName(), user.getId());
            }
            return user;
        } catch (Exception e) {
            logger.error("Error during authentication for email {}: {}", email, e.getMessage(), e);
            throw e;
        }
    }

    public User findById(Long id) {
        logger.debug("Executing query: SELECT * FROM users WHERE id = {}", id);
        try {
            String sql = "SELECT * FROM users WHERE id = ?";
            List<User> users = jdbcTemplate.query(sql, new Object[]{id}, new BeanPropertyRowMapper<>(User.class));
            User user = users.isEmpty() ? null : users.get(0);
            if (user == null) {
                logger.debug("No user found with ID: {}", id);
            } else {
                logger.debug("Found user with ID {}: {}", id, user.getName());
            }
            return user;
        } catch (Exception e) {
            logger.error("Error retrieving user with ID {}: {}", id, e.getMessage(), e);
            throw e;
        }
    }

    public int save(User user) {
        logger.debug("Executing INSERT for user: {} ({})", user.getName(), user.getEmail());
        try {
            String sql = "INSERT INTO users(name, email, password, phone, role) VALUES (?, ?, ?, ?, ?)";
            int result = jdbcTemplate.update(sql, user.getName(), user.getEmail(), user.getPassword(), user.getPhone(), user.getRole());
            logger.info("User '{}' saved successfully, rows affected: {}", user.getName(), result);
            return result;
        } catch (Exception e) {
            logger.error("Error saving user '{}': {}", user.getName(), e.getMessage(), e);
            throw e;
        }
    }
}
