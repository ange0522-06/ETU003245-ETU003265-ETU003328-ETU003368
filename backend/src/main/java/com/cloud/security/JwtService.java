
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
    private static final long EXPIRATION = 86400000; // 24 heures

    // ✅ Utiliser la même clé pour signer ET parser
    private SecretKey getKey() {
        return Keys.hmacShaKeyFor(SECRET.getBytes());
    }

    public String generateToken(String username, String role) {
        return Jwts.builder()
                .setSubject(username)
                .claim("role", role)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + EXPIRATION))
                .signWith(getKey(), SignatureAlgorithm.HS256)
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

    // Ajoute cette méthode pour extraire le rôle du token
    public String extractRole(String token) {
        Claims claims = getClaims(token);
        Object roleObj = claims.get("role");
        return roleObj != null ? roleObj.toString() : "user";
    }

}
