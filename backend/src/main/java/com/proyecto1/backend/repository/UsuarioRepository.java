package com.proyecto1.backend.repository;
import com.proyecto1.backend.model.Usuario;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface UsuarioRepository extends JpaRepository <Usuario, Long> {

    void deleteById(Long id);
    Optional<Usuario> findByUsername(String username);
    Optional<Usuario> findByEmail(String email);

    public boolean existsByUsername(String username);

    public boolean existsByEmail(String email);

    //busca los primeros 10 mail que empiecen con el texto dado (ignora mayúsculas)
    List<Usuario> findTop10ByEmailStartingWithIgnoreCase(String prefix);
    
}
