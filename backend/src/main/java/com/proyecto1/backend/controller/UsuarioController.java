package com.proyecto1.backend.controller;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController; 
import com.proyecto1.backend.model.Usuario;
import com.proyecto1.backend.service.UsuarioService;
import org.springframework.web.bind.annotation.CrossOrigin;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import java.util.Collections;

@RestController
@RequestMapping("/api/usuarios")
//@CrossOrigin(origins = "http://localhost:5173")
public class UsuarioController {
    private final UsuarioService usuarioService;
    
    public UsuarioController (UsuarioService usuarioService){
        this.usuarioService = usuarioService;
    }

    @GetMapping("/buscar")
    public ResponseEntity<List<Usuario>> buscarUsuarios(@RequestParam String email) {
        // Si escribe menos de 2 letras, devolvemos lista vacía para no cargar todo
        if (email == null || email.length() < 2) {
            return ResponseEntity.ok(Collections.emptyList());
        } 
        
        List<Usuario> usuarios = usuarioService.buscarPorCoincidencia(email);
        return ResponseEntity.ok(usuarios);
    }
    
    @PostMapping
    public ResponseEntity<?> crearUsuario(@RequestBody Usuario usuario) {

        // Validar si el username ya existe
        if (usuarioService.existsByUsername(usuario.getUsername())) {
            return ResponseEntity
                    .status(HttpStatus.CONFLICT)
                    .body("El nombre de usuario ya existe");
        }

        // Validar si el email ya existe
        if (usuarioService.existsByEmail(usuario.getEmail())) {
            return ResponseEntity
                    .status(HttpStatus.CONFLICT)
                    .body("El email ya está registrado");
        }

        // Guardar usuario con contraseña cifrada
        Usuario nuevoUsuario = usuarioService.guardarConPasswordCifrada(usuario);

        return ResponseEntity.status(HttpStatus.CREATED).body(nuevoUsuario);
    }
    
    @GetMapping
    public List<Usuario> listarUsuarios(){
        return usuarioService.listar();
    }
    
    @GetMapping("/{id}")
    public Usuario obtenerUsuario (@PathVariable Long id){
        return usuarioService.obtenerPorId(id); 
    }
    
    @PutMapping("/{id}")
    public Usuario actualizarUsuario (@PathVariable Long id, @RequestBody Usuario usuario){
        return usuarioService.actualizar (id, usuario);
    }
    
    @DeleteMapping("/{id}")
    public void eliminarUsuario (@PathVariable Long id){
        usuarioService.eliminar(id);
    }

    
    
}
