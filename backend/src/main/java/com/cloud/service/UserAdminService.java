package com.cloud.service;

import com.cloud.model.User;
import com.cloud.repository.UserRepository;
import org.springframework.stereotype.Service;

@Service
public class UserAdminService {

    private final UserRepository userRepository;

    public UserAdminService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public void unlockUser(Long userId) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setLocked(false);
        user.setFailedAttempts(0);

        userRepository.save(user);
    }
        
    public User blockUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setLocked(true);
        return userRepository.save(user);
    }

    public User unblockUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setLocked(false);
        user.setFailedAttempts(0);
        return userRepository.save(user);
    }
}
