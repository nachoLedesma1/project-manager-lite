package com.proyecto1.backend.model;

import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
//genera id string automático ?
import java.util.UUID;


@Entity
@Table(name = "workspace")
public class WorkSpace {
    @Id
    //@GeneratedValue(strategy = GenerationType.IDENTITY)
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false, length = 150)
    private String name;

    @Column(nullable = false, length = 500)
    private String description;
    private String type; 

    //relacion con proyectos
    @OneToMany(mappedBy = "workspace", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Proyecto> proyectos;

    //relación con usuarios ?
    @OneToMany(mappedBy = "workspace", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    // Quitamos @JsonIgnore
    // Agregamos esto para romper el bucle:
    @JsonIgnoreProperties({"workspace", "hibernateLazyInitializer", "handler"})
    private List<WorkspaceMember> members = new ArrayList<>();

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "modified_at")
    private LocalDateTime modifiedAt;

    public WorkSpace () {}

    public WorkSpace(String name, String description, String type){
        this.name = name;
        this.description = description;
        this.type = type;
    } 

    //get y set
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; } 
    public void setName(String name) { this.name = name; } 

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public List<Proyecto> getProyectos() { return proyectos; }
    public void setProyectos(List<Proyecto> proyectos) { this.proyectos = proyectos;}

    public List<WorkspaceMember> getMembers() { return members; }
    public void setMembers(List<WorkspaceMember> members) { this.members = members; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getModifiedAt() { return modifiedAt; }
    public void setModifiedAt(LocalDateTime modifiedAt) { this.modifiedAt = modifiedAt; }


}
