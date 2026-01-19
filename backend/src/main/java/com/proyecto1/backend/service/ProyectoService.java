package com.proyecto1.backend.service;
import com.proyecto1.backend.model.Proyecto;

import java.util.List;

public interface ProyectoService {
    List <Proyecto> findAll();
    Proyecto findById (Long id);
    Proyecto save (Proyecto proyecto);
    Proyecto update (Long id, Proyecto proyectoDetails);
    boolean delete (Long id);
    List<Proyecto> findByUsuarioId(Long usuarioId);
}
