package com.cloud.dto;

import lombok.Data;

@Data
public class LoginRequest {
    private String idToken;

    public String getIdToken() {
        return idToken;
    }
}
