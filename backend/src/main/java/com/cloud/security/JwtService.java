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

    private static final String SECRET =
            "super-secret-key-super-secret-key-super-secret-key";
    private static final long EXPIRATION = 1000 * 60 * 60; // 1 heure

    private final String SECRET_KEY = "mysecretkeymysecretkeymysecretkey";

    // ✅ BON TYPE
    private SecretKey getKey() {
        return Keys.hmacShaKeyFor(SECRET.getBytes());
    }

    // public String generateToken(String username) {
    //     return Jwts.builder()
    //             .subject(username)
    //             .issuedAt(new Date())
    //             .expiration(new Date(System.currentTimeMillis() + EXPIRATION))
    //             .signWith(getKey())
    //             .compact();
    // }

    public String generateToken(String username) {
        return Jwts.builder()
                .setSubject(username)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + 86400000))
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }


    public String extractUsername(String token) {
        return getClaims(token).getSubject();
    }

    public boolean isTokenValid(String token) {
        return !getClaims(token).getExpiration().before(new Date());
    }

    private Claims getClaims(String token) {
        return Jwts.parser()
                .verifyWith(getKey()) // ✅ maintenant OK
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    private Key getSigningKey() {
        // Transforme ta clé secrète en clé HMAC
        return Keys.hmacShaKeyFor(SECRET_KEY.getBytes());
    }

}
