package com.proyecto1.backend.controller;
import com.proyecto1.backend.model.Proyecto;
import com.proyecto1.backend.model.Tarea;
import com.proyecto1.backend.model.Usuario;
import com.proyecto1.backend.service.ProyectoService;
import com.proyecto1.backend.service.UsuarioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.Authentication;


import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/api/proyectos")
public class ProyectoController {
    
    @Autowired 
    private ProyectoService proyectoService;
    private final UsuarioService usuarioService;

    // Spring Boot usará este constructor para conectar los servicios
    public ProyectoController(ProyectoService proyectoService, UsuarioService usuarioService) {
        this.proyectoService = proyectoService;
        this.usuarioService = usuarioService; // <--- Y ESTA ASIGNACIÓN
    }
    
    @GetMapping
    public List<Proyecto> getAllProyectos(){
        return proyectoService.findAll();
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Proyecto> getProyectoById(@PathVariable Long id) {
        Proyecto proyecto = proyectoService.findById(id);
        return (proyecto != null) ? ResponseEntity.ok(proyecto) : ResponseEntity.notFound().build();
    }
    
    @PostMapping
    public ResponseEntity<Proyecto> crearProyecto(@RequestBody Proyecto proyecto, Authentication authentication) {
        
        // 1. OBTENER EL USUARIO DEL TOKEN
        // authentication.getName() devuelve el username/email del token JWT
        String username = authentication.getName();
        
        // 2. BUSCAR EL USUARIO EN LA BD
        Usuario usuario = usuarioService.findByUsername(username); // O el método que uses para buscar
        
        // 3. ASIGNAR EL USUARIO AL PROYECTO ANTES DE GUARDAR
        proyecto.setUsuario(usuario);
        
        // 4. ASEGURAR OTROS CAMPOS OBLIGATORIOS SI FALTAN
        if (proyecto.getEstado() == null) {
            proyecto.setEstado("ACTIVO");
        }

        // 5. GUARDAR
        Proyecto nuevoProyecto = proyectoService.save(proyecto); 
        return ResponseEntity.ok(nuevoProyecto);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<Proyecto> updateProyecto(@PathVariable Long id, @RequestBody Proyecto proyectoDetails) {
        Proyecto updated = proyectoService.update(id, proyectoDetails);
        return (updated != null) ? ResponseEntity.ok(updated) : ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProyecto(@PathVariable Long id) {
        return proyectoService.delete(id) ? ResponseEntity.noContent().build() : ResponseEntity.notFound().build();
    }

    @Transactional
    @GetMapping("/mis-proyectos")
    public ResponseEntity<List<Proyecto>> getMisProyectos(Authentication authentication) {
        // 1. Obtenemos el username del token (igual que hiciste en /me)
        String username = authentication.getName();
        
        // 2. Buscamos el usuario completo para tener su ID
        Usuario usuario = usuarioService.findByUsername(username);
        
        // 3. Buscamos los proyectos usando el ID de ese usuario
        List<Proyecto> proyectos = proyectoService.findByUsuarioId(usuario.getId());

        // Truco sucio para despertar a Hibernate
        for (Proyecto p : proyectos) {
            for (Tarea t : p.getTareas()) {
                t.getCards().size(); // Esto obliga a Java a cargar las cartas sí o sí
            }
        }
        
        return ResponseEntity.ok(proyectos);
    }
}
