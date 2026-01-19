package com.proyecto1.backend.service;
import com.proyecto1.backend.model.Usuario;
import java.util.List;
import java.util.Optional;

public interface UsuarioService {
    Usuario guardar(Usuario usuario);
    Usuario guardarConPasswordCifrada(Usuario usuario);
    List<Usuario> listar();
    Usuario obtenerPorId(Long id);
    Usuario actualizar(Long id, Usuario usuario);
    void eliminar(Long id);

    boolean existsByUsername(String username);
    boolean existsByEmail(String email);
    Usuario findByEmail(String email);
    Usuario findByUsername(String username);
    List<Usuario> buscarPorCoincidencia(String query);

}
