package com.cloud.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.util.AntPathMatcher;

import java.io.IOException;

@Component
public class JwtFilter extends OncePerRequestFilter {

    private final JwtService jwtService;

    public JwtFilter(JwtService jwtService) {
        this.jwtService = jwtService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        String path = request.getRequestURI();
        AntPathMatcher pathMatcher = new AntPathMatcher();
        // Ignorer le filtrage JWT pour les routes d'authentification
        if (pathMatcher.match("/api/auth/register", path) || pathMatcher.match("/api/auth/login", path)) {
            filterChain.doFilter(request, response);
            return;
        }

        String header = request.getHeader("Authorization");

        // Si pas de header ou header ne commence pas par Bearer, continuer sans rien faire
        if (header == null || !header.startsWith("Bearer ")) {
            System.out.println("[SECURITY] Pas de header Authorization Bearer pour " + request.getRequestURI());
            filterChain.doFilter(request, response);
            return;
        }

        String token = header.substring(7);
        try {
            if (jwtService.isTokenValid(token)) {
                String username = jwtService.extractUsername(token);
                String role = jwtService.extractRole(token);
                System.out.println("[JWT] Rôle extrait du token : " + role);
                java.util.List<org.springframework.security.core.GrantedAuthority> authorities = java.util.List.of(
                    new org.springframework.security.core.authority.SimpleGrantedAuthority(role)
                );
                UsernamePasswordAuthenticationToken auth =
                        new UsernamePasswordAuthenticationToken(username, null, authorities);
                auth.setDetails(
                        new WebAuthenticationDetailsSource().buildDetails(request)
                );
                SecurityContextHolder.getContext().setAuthentication(auth);
            } else {
                System.out.println("[JWT] Token non valide pour " + request.getRequestURI());
            }
        } catch (Exception e) {
            System.out.println("[JWT] Token invalide ou non autorisé : " + e.getMessage());
        }
        if (SecurityContextHolder.getContext().getAuthentication() == null) {
            System.out.println("[SECURITY] Aucune authentification trouvée pour la requête " + request.getRequestURI());
        }
        filterChain.doFilter(request, response);
    }
}
