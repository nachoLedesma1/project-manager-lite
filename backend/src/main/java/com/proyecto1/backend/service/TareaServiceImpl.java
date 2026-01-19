package com.proyecto1.backend.service;
import com.proyecto1.backend.model.Proyecto;
import com.proyecto1.backend.model.Tarea;
import com.proyecto1.backend.repository.TareaRepository;
import com.proyecto1.backend.service.TareaService;

import java.util.List;
import java.util.Optional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class TareaServiceImpl implements TareaService{
    @Autowired
    private TareaRepository tareaRepository;
    
    @Override
    public List<Tarea> findAll(){
        return tareaRepository.findAll();
    }
    
    @Override
    public Tarea findById(Long id) {
        Optional<Tarea> tarea = tareaRepository.findById(id);
        return tarea.orElse(null);
    }
    
    @Override 
    public Tarea save(Tarea tarea){
        return tareaRepository.save(tarea);
    }
    
    @Override
    public Tarea update (Long id, Tarea tareaDetails){
        Optional<Tarea> tareaOpcional = tareaRepository.findById(id);
        
        if(tareaOpcional.isPresent()){
            Tarea tarea = tareaOpcional.get();
            //faltan cosas
            tarea.setTitulo(tareaDetails.getTitulo());
            tarea.setDescripcion(tareaDetails.getDescripcion());
            tarea.setFechaInicio(tareaDetails.getFechaInicio());
            tarea.setFechaFin(tareaDetails.getFechaFin());
            tarea.setEstado(tareaDetails.getEstado());

            return tareaRepository.save(tarea);
        }
        return null;
    }
    
    @Override
    public boolean delete(Long id) {
        if (tareaRepository.existsById(id)) {
            tareaRepository.deleteById(id);
            return true;
        }
        return false;
    }

    // Nota que devuelve una LISTA, porque un proyecto puede tener varias tareas
    public List<Tarea> buscarPorUsuario(Long usuarioId) {
        return tareaRepository.findByProyectoUsuarioId(usuarioId);
    }
}
