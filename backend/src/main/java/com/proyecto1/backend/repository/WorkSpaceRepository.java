package com.proyecto1.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

import com.proyecto1.backend.model.WorkSpace;

public interface WorkSpaceRepository extends JpaRepository<WorkSpace, String>{

    // Selecciona el workspace (w) uniendo con sus miembros (m) donde el usuario de ese miembro sea :userId
    @Query("SELECT w FROM WorkSpace w JOIN w.members m WHERE m.usuario.id = :userId")
    List<WorkSpace> findWorkspacesByUserId(@Param("userId") Long userId);
}