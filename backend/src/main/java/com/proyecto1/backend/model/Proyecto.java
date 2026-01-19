package com.proyecto1.backend.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.util.List;
import java.time.LocalDateTime;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Table(name = "proyectos")
public class Proyecto {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, length = 150)
    private String nombre;
    
    @Column(nullable = false, length = 500)
    private String descripcion;
    private LocalDate fechaInicio;
    private LocalDate fechaFin;
    
    @Column(nullable = false, length = 20)
    private String estado = "En proceso"; //planeado, en proceso, finalizado

    // NUEVA Relación con Usuario - MUCHOS a UNO
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id", nullable = false)
    @JsonIgnore
    private Usuario usuario;

    @ManyToOne(fetch = FetchType.EAGER) // EAGER carga el workspace automáticamente
    @JoinColumn(name = "workspace_id", nullable = true) // Así se llamará la columna en la base de datos
    // En lugar de @JsonIgnore (que oculta todo), usamos @JsonIgnoreProperties
    // para decir "Trae el objeto WorkSpace, pero no me traigas su lista de proyectos"
    @JsonIgnoreProperties({"proyectos", "boards", "hibernateLazyInitializer", "handler"})
    private WorkSpace workspace; 
    // --------------------
    
    //relacion con tareas
    @OneToMany(mappedBy = "proyecto", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Tarea> tareas;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "modified_at")
    private LocalDateTime modifiedAt;
    
    public Proyecto () {}
    
    public Proyecto(String nombre, String descripcion, LocalDate fechaInicio, 
                    LocalDate fechaFin, String estado, Usuario usuario) {
        this.nombre = nombre;
        this.descripcion = descripcion;
        this.fechaInicio = fechaInicio;
        this.fechaFin = fechaFin;
        this.estado = estado;
        this.usuario = usuario;
    }
    
    //get y set
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }

    public String getDescripcion() { return descripcion; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }

    public LocalDate getFechaInicio() { return fechaInicio; }
    public void setFechaInicio(LocalDate fechaInicio) { this.fechaInicio = fechaInicio; }

    public LocalDate getFechaFin() { return fechaFin; }
    public void setFechaFin(LocalDate fechaFin) { this.fechaFin = fechaFin; }

    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }

    public List<Tarea> getTareas() { return tareas; }
    public void setTareas(List<Tarea> tareas) { this.tareas = tareas; }

    public WorkSpace getWorkspace() {return workspace;}
    public void setWorkspace(WorkSpace workspace) { this.workspace = workspace;}
 
    public Usuario getUsuario() { return usuario; }
    public void setUsuario(Usuario usuario) { this.usuario = usuario; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getModifiedAt() { return modifiedAt; }
    public void setModifiedAt(LocalDateTime modifiedAt) { this.modifiedAt = modifiedAt; }
    
}
