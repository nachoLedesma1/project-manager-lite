package com.proyecto1.backend.service;
import com.proyecto1.backend.model.Proyecto;
import com.proyecto1.backend.repository.ProyectoRepository;
import com.proyecto1.backend.service.ProyectoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ProyectoServiceImpl implements ProyectoService{
    
    @Autowired
    private ProyectoRepository proyectoRepository;
    
    @Override 
    public List<Proyecto> findAll(){
        return proyectoRepository.findAll();
    }
    
    @Override
    public Proyecto findById (Long id){
        Optional<Proyecto> proyecto = proyectoRepository.findById(id);
        return proyecto.orElse(null);
    } 
    
    @Override
    public Proyecto save (Proyecto proyecto){
        return proyectoRepository.save(proyecto);
    }
    
    @Override
    public Proyecto update(Long id, Proyecto proyectoDetails) {
        Optional<Proyecto> proyectoOptional = proyectoRepository.findById(id);

        if (proyectoOptional.isPresent()) {
            Proyecto proyecto = proyectoOptional.get();
            // ⚡ Ajusta según los atributos de la entidad Proyecto
            proyecto.setNombre(proyectoDetails.getNombre());
            proyecto.setDescripcion(proyectoDetails.getDescripcion());
            proyecto.setFechaInicio(proyectoDetails.getFechaInicio());
            proyecto.setFechaFin(proyectoDetails.getFechaFin());
            proyecto.setEstado(proyectoDetails.getEstado());

            return proyectoRepository.save(proyecto);
        }

        return null;
    }
    
    @Override
    public boolean delete(Long id) {
        if (proyectoRepository.existsById(id)) {
            proyectoRepository.deleteById(id);
            return true;
        }
        return false;
    }

    // Nota que devuelve una LISTA, porque un usuario puede tener varios proyectos
    public List<Proyecto> findByUsuarioId(Long usuarioId) {
        return proyectoRepository.findByUsuarioId(usuarioId);
    }
}
