    
package com.cloud.controller;

import com.cloud.model.User;
import com.cloud.repository.UserRepository;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;
import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {
    private final UserRepository userRepository;
    public UserController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @GetMapping
    @PreAuthorize("hasAuthority('ROLE_MANAGER')")
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }
    @GetMapping("/locked")
    @PreAuthorize("hasAuthority('ROLE_MANAGER')")
    public List<User> getLockedUsers() {
        return userRepository.findByLockedTrue();
    }
}
