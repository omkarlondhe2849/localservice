package com.local.localservice.dao;


import com.local.localservice.model.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.*;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class UserDAO {
    @Autowired
    private JdbcTemplate jdbcTemplate;

    public User findByEmailAndPassword(String email, String password) {
        String sql = "SELECT * FROM users WHERE email = ? AND password = ?";
        List<User> users = jdbcTemplate.query(sql, new Object[]{email, password},
            new BeanPropertyRowMapper<>(User.class));
        return users.isEmpty() ? null : users.get(0);
    }

    public int save(User user) {
        String sql = "INSERT INTO users(name, email, password, phone, role) VALUES (?, ?, ?, ?, ?)";
        return jdbcTemplate.update(sql, user.getName(), user.getEmail(), user.getPassword(), user.getPhone(), user.getRole());
    }
}
