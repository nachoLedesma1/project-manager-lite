package com.proyecto1.backend.controller;
import com.proyecto1.backend.service.UsuarioService;
import com.proyecto1.backend.service.WorkSpaceService;
import com.proyecto1.backend.service.WorkspaceMemberService;
import com.proyecto1.backend.model.Usuario;
import com.proyecto1.backend.model.WorkSpace;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.Authentication;

import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/api/workspace")
public class WorkSpaceController {
    @Autowired 
    private WorkSpaceService workSpaceService;

    @Autowired
    private UsuarioService usuarioService; // Necesario para buscar al creador

    @Autowired
    private WorkspaceMemberService workspaceMemberService; // Necesario para crear las relaciones

    @GetMapping
    public List<WorkSpace> getAllWorkSpaces(){
        return workSpaceService.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<WorkSpace> getWorkSpaceById(@PathVariable String id) {
        WorkSpace workSpace = workSpaceService.findById(id);
        return (workSpace != null) ? ResponseEntity.ok(workSpace) : ResponseEntity.notFound().build();
    }

    @PostMapping
    public ResponseEntity<?> createWorkSpace(@RequestBody Map<String, Object> payload, Authentication authentication) {
        try {
            // 1. Obtener datos del payload
            String name = (String) payload.get("name");
            String description = (String) payload.get("description");
            String type = (String) payload.get("type");
            List<Integer> memberIds = (List<Integer>) payload.get("memberIds"); // JSON envía números como Integer

            // 2. Crear y guardar el Workspace
            WorkSpace newWorkSpace = new WorkSpace(name, description, type);
            WorkSpace savedWorkSpace = workSpaceService.save(newWorkSpace);

            // 3. Obtener el usuario creador del token y hacerlo ADMIN
            String username = authentication.getName();
            Usuario creator = usuarioService.findByUsername(username);
            workspaceMemberService.addMemberToWorkspace(savedWorkSpace.getId(), creator.getId(), "ADMIN");

            // 4. Agregar a los miembros invitados (si los hay)
            if (memberIds != null && !memberIds.isEmpty()) {
                for (Integer userId : memberIds) {
                    Long idLong = userId.longValue();
                    // Evitamos agregar al creador dos veces
                    if (!idLong.equals(creator.getId())) {
                        workspaceMemberService.addMemberToWorkspace(savedWorkSpace.getId(), idLong, "member");
                    }
                }
            }

            return ResponseEntity.ok(savedWorkSpace);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Error al crear workspace: " + e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<WorkSpace> updateWorkSpace(@PathVariable String id, @RequestBody WorkSpace workSpaceDetails) {
        WorkSpace updated = workSpaceService.update(id, workSpaceDetails);
        return (updated != null) ? ResponseEntity.ok(updated) : ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteWorkSpace(@PathVariable String id) {
        return workSpaceService.delete(id) ? ResponseEntity.noContent().build() : ResponseEntity.notFound().build();
    }   

    // Endpoint para traer workspaces del usuario logueado (tengan o no proyectos)
    @GetMapping("/mis-workspaces")
    public ResponseEntity<List<WorkSpace>> getMisWorkspaces(Authentication authentication) {
        String username = authentication.getName();
        Usuario usuario = usuarioService.findByUsername(username);
        
        List<WorkSpace> workspaces = workSpaceService.findByUserId(usuario.getId());
        return ResponseEntity.ok(workspaces);
    }
}
