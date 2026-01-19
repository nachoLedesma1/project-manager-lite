package com.proyecto1.backend.model;
import jakarta.persistence.*;

import java.time.LocalDateTime;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Table(name = "workspace_member")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class WorkspaceMember {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Relación con el Usuario
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "usuario_id")
    // Aquí queremos ver el usuario (nombre, email), pero no su password ni sus otros grupos
    @JsonIgnoreProperties({"password", "roles", "workspaceMemberships", "hibernateLazyInitializer"})
    private Usuario usuario;

    // Relación con el Workspace (Recuerda que el ID es String)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "workspace_id")
    @JsonIgnoreProperties({"members", "hibernateLazyInitializer", "handler"})
    private WorkSpace workspace;

    @Column(name = "role")
    private String role; // "ADMIN" o "MEMBER"

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "modified_at")
    private LocalDateTime modifiedAt;

    // Constructores, Getters y Setters
    public WorkspaceMember() {}

    public WorkspaceMember(Usuario usuario, WorkSpace workspace, String role) {
        this.usuario = usuario;
        this.workspace = workspace;
        this.role = role;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Usuario getUsuario() { return usuario; }
    public void setUsuario(Usuario usuario) { this.usuario = usuario; }

    public WorkSpace getWorkspace() { return workspace; }
    public void setWorkspace(WorkSpace workspace) { this.workspace = workspace; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getModifiedAt() { return modifiedAt; }
    public void setModifiedAt(LocalDateTime modifiedAt) { this.modifiedAt = modifiedAt; }
}
