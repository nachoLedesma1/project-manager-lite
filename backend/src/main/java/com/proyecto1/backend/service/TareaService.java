package com.proyecto1.backend.service;
import com.proyecto1.backend.model.Proyecto;
import com.proyecto1.backend.model.Tarea;
import java.util.List;
        
public interface TareaService {
    List<Tarea> findAll();
    Tarea findById (Long id);
    Tarea save (Tarea tarea);
    Tarea update (Long id, Tarea tareaDetails);
    boolean delete (Long id);
    public List<Tarea> buscarPorUsuario(Long usuarioId);
    
}
