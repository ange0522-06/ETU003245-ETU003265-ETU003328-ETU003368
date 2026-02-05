package com.cloud.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.util.Date;
import java.security.Key;

import io.jsonwebtoken.SignatureAlgorithm;


@Service
public class JwtService {

    // Shared secret used for signing and verification - must be the same
    private static final String SECRET = "super-secret-key-super-secret-key-super-secret-key";
    private static final long EXPIRATION_MS = 24L * 60 * 60 * 1000; // 24h

    private java.security.Key getSigningKey() {
        return Keys.hmacShaKeyFor(SECRET.getBytes());
    }

    public String generateToken(String username, String role) {
        return Jwts.builder()
                .setSubject(username)
                .claim("role", role)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + EXPIRATION_MS))
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    public String extractUsername(String token) {
        Claims claims = getClaims(token);
        return claims == null ? null : claims.getSubject();
    }

    public boolean isTokenValid(String token) {
        try {
            Claims claims = getClaims(token);
            return claims != null && claims.getExpiration().after(new Date());
        } catch (Exception e) {
            return false;
        }
    }

    private Claims getClaims(String token) {
        try {
            return Jwts.parser()
                    .setSigningKey(getSigningKey())
                    .parseClaimsJws(token)
                    .getBody();
        } catch (Exception e) {
            return null;
        }
    }

    // Ajoute cette méthode pour extraire le rôle du token
    public String extractRole(String token) {
        Claims claims = getClaims(token);
        if (claims == null) return null;
        Object roleObj = claims.get("role");
        return roleObj != null ? roleObj.toString() : null;
    }

}
