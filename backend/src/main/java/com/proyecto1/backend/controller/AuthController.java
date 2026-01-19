package com.proyecto1.backend.controller;

import com.proyecto1.backend.model.Usuario;
import com.proyecto1.backend.security.JwtUtil;
import com.proyecto1.backend.service.UsuarioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    
    @Autowired 
    private JwtUtil jwtUtil;
    
    @Autowired 
    private AuthenticationManager authenticationManager;
    
    @Autowired
    private UsuarioService usuarioService;
    
    @PostMapping("/login")
    public ResponseEntity<Map<String, String>> login(@RequestBody Map<String, String> request) {
        try {
            Authentication auth = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.get("username"),
                            request.get("password")
                    )
            );

            String token = jwtUtil.generateToken(request.get("username"));

            return ResponseEntity.ok(Map.of("token", token));
        } catch (AuthenticationException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                                 .body(Map.of("error", "Usuario o contraseña incorrecta"));
        }
    }
    // Para tener la id de un usuario logeado con el token valido 
    @GetMapping("/me")
    public ResponseEntity<?> getUserInfo(Authentication authentication) {
        String username = authentication.getName();
        Usuario usuario = usuarioService.findByUsername(username);
        return ResponseEntity.ok(usuario);
    }
}
