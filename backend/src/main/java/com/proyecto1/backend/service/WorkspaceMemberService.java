package com.proyecto1.backend.service;

import com.proyecto1.backend.model.WorkspaceMember;
import java.util.List;

public interface WorkspaceMemberService {

    WorkspaceMember addMemberToWorkspace(String workspaceId, Long usuarioId, String role);
    List<WorkspaceMember> getMembersByWorkspace(String workspaceId);
    void removeMember(Long memberId);
    WorkspaceMember updateMemberRole(Long memberId, String newRole);

}
