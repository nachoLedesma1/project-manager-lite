package com.proyecto1.backend.model;
import jakarta.persistence.*;
import lombok.EqualsAndHashCode;
import lombok.ToString;

import java.time.LocalDate;
import java.time.LocalDateTime;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.util.List;
import java.util.ArrayList;

@Entity
@Table(name = "tareas")
public class Tarea {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) //especifica como se genera la clave primaria
    private long id;
    
    @Column(nullable = false, length = 100)
    private String titulo;
    
    @Column(length = 500)
    private String descripcion;
    private LocalDate fechaInicio;
    private LocalDate fechaFin;
    
    @Column(nullable = false, length = 20)
    private String estado = "ACTIVO"; // ejemplo: "pendiente", "en proceso", "completado"
    
    @ManyToOne
    @JoinColumn(name = "proyecto_id")
    // Usamos JsonIgnoreProperties para romper el ciclo infinito sin impedir la escritura
    @JsonIgnoreProperties("tareas")
    private Proyecto proyecto;  

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "modified_at")
    private LocalDateTime modifiedAt;

    // Esto le dice a Java: "Cuando traigas una Tarea, trae sus Cartas"
    // FetchType.EAGER asegura que las cargue sí o sí al serializar a JSON
    @OneToMany(mappedBy = "tarea", cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    @ToString.Exclude  
    @EqualsAndHashCode.Exclude 
    private List<Card> cards = new ArrayList<>();
    
    //constructor vacío (obligatorio para JPA)
    public Tarea(){
        
    }
    
    //constructor con parámetros
    public Tarea (String titulo, String descripcion, LocalDate fechaInicio, LocalDate fechaFin, String estado){
        this.titulo = titulo;
        this.descripcion = descripcion;
        this.fechaInicio = fechaInicio;
        this.fechaFin = fechaFin;
        this.estado = estado;
    }
    
    //get y set
    public Long getId(){
        return id;
    }
    
    public void setId (Long id){
        this.id = id;
    }
    
    public String getTitulo(){
        return titulo;
    }
    
    public void setTitulo (String titulo){
        this.titulo = titulo;
    }
    
    public String getDescripcion (){
        return descripcion;
    }
    
    public void setDescripcion (String descripcion){
        this.descripcion = descripcion;
    }
    
     public LocalDate getFechaInicio() {
        return fechaInicio;
    }

    public void setFechaInicio(LocalDate fechaInicio) {
        this.fechaInicio = fechaInicio;
    }

    public LocalDate getFechaFin() {
        return fechaFin;
    }

    public void setFechaFin(LocalDate fechaFin) {
        this.fechaFin = fechaFin;
    }
    
    public String getEstado(){
        return estado;
    }
    
    public void setEstado (String estado){
        this.estado = estado;
    }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getModifiedAt() { return modifiedAt; }
    public void setModifiedAt(LocalDateTime modifiedAt) { this.modifiedAt = modifiedAt; }

    public List<Card> getCards() {
        return cards;
    }

    public void setCards(List<Card> cards) {
        this.cards = cards;
    }

    public Proyecto getProyecto() {
        return proyecto;
    }

    public void setProyecto(Proyecto proyecto) {
        this.proyecto = proyecto;
    }
    
}
