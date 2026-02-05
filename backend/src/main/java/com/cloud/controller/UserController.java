package com.cloud.controller;

import com.cloud.model.User;
import com.cloud.repository.UserRepository;
import com.cloud.service.UserAdminService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;
import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {
    private final UserRepository userRepository;
    private final UserAdminService userAdminService;
    
    public UserController(UserRepository userRepository, UserAdminService userAdminService) {
        this.userRepository = userRepository;
        this.userAdminService = userAdminService;
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
        
    @PostMapping("/{id}/block")
    @PreAuthorize("hasAuthority('ROLE_MANAGER')")
    public ResponseEntity<User> blockUser(@PathVariable Long id) {
        User user = userAdminService.blockUser(id);
        return ResponseEntity.ok(user);
    }
    
    @PostMapping("/{id}/unblock")
    @PreAuthorize("hasAuthority('ROLE_MANAGER')")
    public ResponseEntity<User> unblockUser(@PathVariable Long id) {
        User user = userAdminService.unblockUser(id);
        return ResponseEntity.ok(user);
    }
}
