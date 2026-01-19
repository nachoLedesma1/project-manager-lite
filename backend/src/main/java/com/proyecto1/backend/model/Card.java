package com.proyecto1.backend.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data; // Si usas Lombok, si no, genera getters/setters
import lombok.EqualsAndHashCode;
import lombok.ToString;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.time.LocalDateTime;

@Entity
@Data
@Table(name = "card")
public class Card {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;
    private String description;
    private String status; // 'pendiente', 'en-proceso', etc.
    private Integer position;

    // Relación Muchos Cards pertenecen a Una Tarea (Columna)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tarea_id", nullable = false)
    @JsonIgnore // Evita bucles infinitos al convertir a JSON
    @ToString.Exclude 
    @EqualsAndHashCode.Exclude 
    private Tarea tarea;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "modified_at")
    private LocalDateTime modifiedAt;

}
