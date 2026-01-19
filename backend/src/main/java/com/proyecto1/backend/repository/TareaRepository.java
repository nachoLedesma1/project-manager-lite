
package com.proyecto1.backend.repository;

import com.proyecto1.backend.model.Tarea;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TareaRepository extends JpaRepository<Tarea, Long> {
    
    List<Tarea> findByProyectoUsuarioId(Long usuarioId);
}
