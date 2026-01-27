package com.cloud.service;

import com.cloud.model.User;
import com.cloud.security.JwtService;
import com.cloud.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.util.Optional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtService jwtService;

    @Value("${security.login.max-attempts:3}")
    private int maxAttempts;
    
    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public String authenticate(String username, String password) {

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.isLocked()) {
            throw new RuntimeException("Account locked");
        }

        if (!passwordEncoder.matches(password, user.getPassword())) {

            user.setFailedAttempts(user.getFailedAttempts() + 1);

            if (user.getFailedAttempts() >= maxAttempts) {
                user.setLocked(true);
            }

            userRepository.save(user);
            throw new RuntimeException("Invalid credentials");
        }


        user.setFailedAttempts(0);
        userRepository.save(user);

        return jwtService.generateToken(user.getUsername());
    }

    // private final UserRepository userRepository;
    // private final PasswordEncoder passwordEncoder;


    public User register(String username, String password) {
        if(userRepository.findByUsername(username).isPresent()) {
            throw new RuntimeException("Username already exists");
        }
        User user = new User();
        user.setUsername(username);
        user.setPassword(passwordEncoder.encode(password));
        user.setRole("USER");
        user.setLocked(false);
        user.setFailedAttempts(0);

        return userRepository.save(user);
    }

    public User login(String username, String password) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new RuntimeException("Invalid password");
        }

        return user;
    }
}
