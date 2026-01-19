package com.proyecto1.backend.controller;

import com.proyecto1.backend.model.WorkspaceMember;
import com.proyecto1.backend.service.WorkspaceMemberService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/members")
public class WorkspaceMemberController {

    private final WorkspaceMemberService memberService;

    public WorkspaceMemberController(WorkspaceMemberService memberService) {
        this.memberService = memberService;
    }

    // GET: Obtener todos los miembros de un workspace
    @GetMapping("/workspace/{workspaceId}")
    public ResponseEntity<List<WorkspaceMember>> getMembers(@PathVariable String workspaceId) {
        return ResponseEntity.ok(memberService.getMembersByWorkspace(workspaceId));
    }

    // POST: Agregar un miembro
    // Espera un JSON así: { "workspaceId": "ws-1", "usuarioId": 5, "role": "admin" }
    @PostMapping
    public ResponseEntity<?> addMember(@RequestBody Map<String, Object> payload) {
        try {
            String wsId = (String) payload.get("workspaceId");
            // Ojo con los casteos de Integer a Long en JSON
            Long userId = ((Number) payload.get("usuarioId")).longValue(); 
            String role = (String) payload.get("role");

            WorkspaceMember created = memberService.addMemberToWorkspace(wsId, userId, role);
            return ResponseEntity.ok(created);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateMemberRole(@PathVariable Long id, @RequestBody Map<String, String> payload) {
        try {
            String newRole = payload.get("role");
            if (newRole == null || newRole.isEmpty()) {
                return ResponseEntity.badRequest().body("El rol es obligatorio");
            }

            WorkspaceMember updated = memberService.updateMemberRole(id, newRole);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(e.getMessage());
        }
    }

    // DELETE: Eliminar un miembro por el ID de la membresía (no del usuario)
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> removeMember(@PathVariable Long id) {
        memberService.removeMember(id);
        return ResponseEntity.noContent().build();
    }

}
