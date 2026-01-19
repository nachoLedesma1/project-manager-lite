package com.proyecto1.backend.controller;

import com.proyecto1.backend.model.Proyecto;
import com.proyecto1.backend.model.Tarea;
import com.proyecto1.backend.model.Usuario;
import com.proyecto1.backend.service.ProyectoService;
import com.proyecto1.backend.service.TareaService;
import com.proyecto1.backend.service.UsuarioService;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/tareas")
public class TareaController {
    @Autowired 
    private TareaService tareaService;
    private final ProyectoService proyectoService;
    private final UsuarioService usuarioService;

    // Spring Boot usará este constructor para conectar los servicios
    public TareaController(ProyectoService proyectoService, TareaService tareaService,
        UsuarioService usuarioService
    ) {
        this.proyectoService = proyectoService;
        this.tareaService = tareaService; // <--- Y ESTA ASIGNACIÓN
        this.usuarioService = usuarioService;
    }
    
    //obtener todas las tareas
    @GetMapping
    public ResponseEntity<List<Tarea>> getAllTareas (){
        return ResponseEntity.ok(tareaService.findAll());
    }
    
    //Buscar tareas por id
    @GetMapping("/{id}")
    public ResponseEntity<Tarea> getTareaById(@PathVariable Long id){
        Tarea tarea = tareaService.findById(id);
        if(tarea != null){
            return ResponseEntity.ok(tarea);
        }
        else{
            return ResponseEntity.notFound().build();
        }
    }
    
    //crear tarea
    @PostMapping 
    public ResponseEntity<Tarea> createTarea (@RequestBody Tarea tarea){
        return ResponseEntity.ok(tareaService.save(tarea));
    }
    
    //actualizar tarea existente
    @PutMapping("/{id}")
    public ResponseEntity<Tarea> updateTarea (@PathVariable Long id, @RequestBody Tarea tareaDetails){
        Tarea updatedTarea = tareaService.update(id, tareaDetails);
        if(updatedTarea != null){
            return ResponseEntity.ok(updatedTarea);
        }
        else{
            return ResponseEntity.notFound().build();
        }
    }
    
    //eliminar tarea
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTarea (@PathVariable Long id){
        boolean deleted = tareaService.delete(id);
        if(deleted){
            return ResponseEntity.noContent().build();
        }
        else{
            return ResponseEntity.notFound().build();
        }
    }
    // get tareas relacionadas a un usuario en específico 
    @GetMapping("/mis-tareas")
    public ResponseEntity<List<Tarea>> getMisTareas(Authentication authentication) {
        String username = authentication.getName();
        Usuario usuario = usuarioService.findByUsername(username);

        // ¡Listo! Una sola línea hace todo el trabajo sucio
        List<Tarea> tareas = tareaService.buscarPorUsuario(usuario.getId());
        
        return ResponseEntity.ok(tareas);
    }
}
