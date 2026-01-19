package com.proyecto1.backend.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;

@Component
public class JwtUtil {

    // Clave secreta (cambiar por algo robusto en producción)
    private final String SECRET_KEY = "miSuperClaveDeJWT_para_proyecto123456789";
    private final long EXPIRATION_TIME = 1000 * 60 * 60; // 1 hora

    // Generación de key segura para HS256
    private final Key key = Keys.hmacShaKeyFor(SECRET_KEY.getBytes());

    // --- Generar token para un username ---
    public String generateToken(String username) {
        return Jwts.builder()
                .setSubject(username)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + EXPIRATION_TIME))
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    // --- Extraer username desde token ---
    public String extractUsername(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody()
                .getSubject();
    }

    // --- Verificar si token expiró ---
    private boolean isTokenExpired(String token) {
        Date expiration = Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody()
                .getExpiration();
        return expiration.before(new Date());
    }

    // --- Validar token (solo firma y expiración) ---
    public boolean validateToken(String token) {
        try {
            Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(token);
            return !isTokenExpired(token);
        } catch (JwtException e) {
            return false;
        }
    }

    // --- Validar token contra un usuario ---
    public boolean validateToken(String token, UserDetails userDetails) {
        final String username = extractUsername(token);
        return (username.equals(userDetails.getUsername()) && !isTokenExpired(token));
    }
}
