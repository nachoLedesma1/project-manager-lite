package com.proyecto1.backend.service;

import java.util.List;

import com.proyecto1.backend.model.WorkSpace;

public interface WorkSpaceService {
    List <WorkSpace> findAll();
    WorkSpace findById (String id);
    WorkSpace save (WorkSpace workSpace);
    WorkSpace update (String id, WorkSpace workSpaceDetails);
    boolean delete (String id);
    List<WorkSpace> findByUserId(Long userId);
}
