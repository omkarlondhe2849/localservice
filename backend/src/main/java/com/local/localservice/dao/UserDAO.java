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

    public User findByEmail(String email) {
        logger.debug("Executing query: SELECT * FROM users WHERE email = {}", email);
        try {
            String sql = "SELECT * FROM users WHERE email = ?";
            List<User> users = jdbcTemplate.query(sql, new Object[]{email}, new BeanPropertyRowMapper<>(User.class));
            return users.isEmpty() ? null : users.get(0);
        } catch (Exception e) {
            logger.error("Error retrieving user with email {}: {}", email, e.getMessage(), e);
            throw e;
        }
    }

    public int updateResetToken(String email, String token, String expiry) {
        logger.debug("Updating reset token for email: {}", email);
        try {
            String sql = "UPDATE users SET reset_token = ?, reset_token_expiry = ? WHERE email = ?";
            return jdbcTemplate.update(sql, token, expiry, email);
        } catch (Exception e) {
            logger.error("Error updating reset token for email {}: {}", email, e.getMessage(), e);
            throw e;
        }
    }

    public User findByResetToken(String token) {
        logger.debug("Executing query: SELECT * FROM users WHERE reset_token = {}", token);
        try {
            String sql = "SELECT * FROM users WHERE reset_token = ?";
            List<User> users = jdbcTemplate.query(sql, new Object[]{token}, new BeanPropertyRowMapper<>(User.class));
            return users.isEmpty() ? null : users.get(0);
        } catch (Exception e) {
            logger.error("Error retrieving user with reset token {}: {}", token, e.getMessage(), e);
            throw e;
        }
    }

    public int updatePasswordByEmail(String email, String newPassword) {
        logger.debug("Updating password for email: {}", email);
        try {
            String sql = "UPDATE users SET password = ?, reset_token = NULL, reset_token_expiry = NULL WHERE email = ?";
            return jdbcTemplate.update(sql, newPassword, email);
        } catch (Exception e) {
            logger.error("Error updating password for email {}: {}", email, e.getMessage(), e);
            throw e;
        }
    }

    public int countProviders() {
        logger.debug("Executing COUNT for providers");
        try {
            String sql = "SELECT COUNT(*) FROM users WHERE role = 'PROVIDER'";
            Integer count = jdbcTemplate.queryForObject(sql, Integer.class);
            logger.info("Counted {} providers", count);
            return count != null ? count : 0;
        } catch (Exception e) {
            logger.error("Error counting providers: {}", e.getMessage(), e);
            throw e;
        }
    }

    public int countCustomers() {
        logger.debug("Executing COUNT for customers");
        try {
            String sql = "SELECT COUNT(*) FROM users WHERE role = 'USER'";
            Integer count = jdbcTemplate.queryForObject(sql, Integer.class);
            logger.info("Counted {} customers", count);
            return count != null ? count : 0;
        } catch (Exception e) {
            logger.error("Error counting customers: {}", e.getMessage(), e);
            throw e;
        }
    }
}
