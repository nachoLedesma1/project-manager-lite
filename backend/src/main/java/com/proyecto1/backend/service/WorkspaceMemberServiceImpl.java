package com.proyecto1.backend.service;

import com.proyecto1.backend.model.Usuario;
import com.proyecto1.backend.model.WorkSpace;
import com.proyecto1.backend.model.WorkspaceMember;
import com.proyecto1.backend.repository.UsuarioRepository;
import com.proyecto1.backend.repository.WorkSpaceRepository;
import com.proyecto1.backend.repository.WorkspaceMemberRepository;
import com.proyecto1.backend.service.WorkspaceMemberService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class WorkspaceMemberServiceImpl implements WorkspaceMemberService {

    private final WorkspaceMemberRepository memberRepository;
    private final WorkSpaceRepository workSpaceRepository;
    private final UsuarioRepository usuarioRepository;
    @Autowired
    private WorkspaceMemberRepository workspaceMemberRepository;

    public WorkspaceMemberServiceImpl(WorkspaceMemberRepository memberRepository, 
                                      WorkSpaceRepository workSpaceRepository, 
                                      UsuarioRepository usuarioRepository) {
        this.memberRepository = memberRepository;
        this.workSpaceRepository = workSpaceRepository;
        this.usuarioRepository = usuarioRepository;
    }

    @Override
    public WorkspaceMember addMemberToWorkspace(String workspaceId, Long usuarioId, String role) {
        // 1. Validar que el workspace exista
        WorkSpace workspace = workSpaceRepository.findById(workspaceId)
                .orElseThrow(() -> new RuntimeException("Workspace no encontrado"));

        // 2. Validar que el usuario exista
        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        // 3. Validar si ya existe la relación (Opcional pero recomendado)
        if(memberRepository.findByWorkspaceIdAndUsuarioId(workspaceId, usuarioId).isPresent()){
            throw new RuntimeException("El usuario ya es miembro de este workspace");
        }

        // 4. Crear y guardar
        WorkspaceMember newMember = new WorkspaceMember(usuario, workspace, role);
        return memberRepository.save(newMember);
    }

    @Override
    public List<WorkspaceMember> getMembersByWorkspace(String workspaceId) {
        return memberRepository.findByWorkspaceId(workspaceId);
    }

    @Override
    public void removeMember(Long memberId) {
        memberRepository.deleteById(memberId);
    }

    @Override
    public WorkspaceMember updateMemberRole(Long memberId, String newRole) {
        // 1. Buscar la membresía existente
        WorkspaceMember member = workspaceMemberRepository.findById(memberId)
                .orElseThrow(() -> new RuntimeException("Miembro no encontrado con ID: " + memberId));

        // 2. Actualizar el rol
        member.setRole(newRole);

        // 3. Guardar cambios
        return workspaceMemberRepository.save(member);
    }

}
