package com.proyecto1.backend.service;

import com.proyecto1.backend.model.Usuario;
import com.proyecto1.backend.repository.UsuarioRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import org.springframework.security.crypto.password.PasswordEncoder;

@Service
public class UsuarioServiceImpl implements UsuarioService {
    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    public UsuarioServiceImpl(UsuarioRepository usuarioRepository, PasswordEncoder passwordEncoder) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public Usuario guardar(Usuario usuario) {
        return usuarioRepository.save(usuario);
    }

    @Override
    public Usuario guardarConPasswordCifrada(Usuario usuario) {
        usuario.setPassword(passwordEncoder.encode(usuario.getPassword()));

        // Asignar rol por defecto si es null
        if (usuario.getRol() == null) {
            usuario.setRol("USER");
        }

        return usuarioRepository.save(usuario);
    }

    @Override
    public List<Usuario> listar() {
        return usuarioRepository.findAll();
    }

    @Override
    public Usuario obtenerPorId(Long id) {
        return usuarioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
    }

    @Override
    public Usuario actualizar(Long id, Usuario usuario) {
        Usuario existente = obtenerPorId(id);
        existente.setNombre(usuario.getNombre());
        existente.setEmail(usuario.getEmail());

        if (usuario.getPassword() != null && !usuario.getPassword().isEmpty()) {
            existente.setPassword(passwordEncoder.encode(usuario.getPassword()));
        }

        return usuarioRepository.save(existente);
    }

    @Override
    public void eliminar(Long id) {
        usuarioRepository.deleteById(id);
    }

    @Override
    public boolean existsByUsername(String username) {
        return usuarioRepository.existsByUsername(username);
    }

    @Override
    public boolean existsByEmail(String email) {
        return usuarioRepository.existsByEmail(email);
    }
    
    @Override
    public Usuario findByUsername(String username) {
        return usuarioRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado: " + username));
    }

    @Override
    public Usuario findByEmail(String email) {
        // Retorna el usuario si existe, o null si no
        return usuarioRepository.findByEmail(email).orElse(null);
    }

    @Override
    public List<Usuario> buscarPorCoincidencia(String query) {
        return usuarioRepository.findTop10ByEmailStartingWithIgnoreCase(query);
    }
}
