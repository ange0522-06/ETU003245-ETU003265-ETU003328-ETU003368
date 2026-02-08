package com.cloud.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/debug")
public class DebugController {

    @GetMapping("/token-info")
    public ResponseEntity<Map<String, Object>> getTokenInfo() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Map<String, Object> info = new HashMap<>();
        
        if (auth != null) {
            info.put("username", auth.getName());
            info.put("authorities", auth.getAuthorities().stream()
                .map(a -> a.getAuthority())
                .collect(Collectors.toList()));
            info.put("authenticated", auth.isAuthenticated());
        } else {
            info.put("message", "No authentication");
        }
        
        return ResponseEntity.ok(info);
    }
}
