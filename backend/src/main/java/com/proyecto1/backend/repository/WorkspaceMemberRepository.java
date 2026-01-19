package com.proyecto1.backend.repository;

import com.proyecto1.backend.model.WorkspaceMember;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface WorkspaceMemberRepository extends JpaRepository<WorkspaceMember, Long>{

    // Buscar todos los miembros de un workspace
    List<WorkspaceMember> findByWorkspaceId(String workspaceId);

    // Buscar todos los workspaces de un usuario
    List<WorkspaceMember> findByUsuarioId(Long usuarioId);

    // Verificar si un usuario ya está en un workspace (para no agregarlo 2 veces)
    Optional<WorkspaceMember> findByWorkspaceIdAndUsuarioId(String workspaceId, Long usuarioId);
    

}
