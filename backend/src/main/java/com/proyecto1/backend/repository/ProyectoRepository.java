package com.proyecto1.backend.repository;
import com.proyecto1.backend.model.Proyecto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ProyectoRepository extends JpaRepository <Proyecto, Long> {
    /*
    En Spring Data JPA no hace falta escribir SQL manualmente para operaciones 
    básicas, porque JpaRepository ya trae todos los métodos CRUD implementados.
    Solo se declara cuando es personalizado como 
    List<Proyecto> findByEstado(String estado);
    List<Proyecto> findByNombreContaining(String nombre);
    */

    List<Proyecto> findByUsuarioId(Long usuarioId);
    
}
