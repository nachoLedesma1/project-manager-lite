package com.proyecto1.backend.service;
import com.proyecto1.backend.model.WorkSpace;
import com.proyecto1.backend.repository.WorkSpaceRepository;

import java.util.List;
import java.util.Optional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class WorkSpaceServiceImpl implements WorkSpaceService {
    @Autowired
    private WorkSpaceRepository workSpaceRepository;

    @Override
    public List<WorkSpace> findAll() {
        return workSpaceRepository.findAll();
    }

    @Override
    public WorkSpace findById(String id) {
        Optional<WorkSpace> workSpace = workSpaceRepository.findById(id);
        return workSpace.orElse(null);
    }

    @Override
    public WorkSpace save(WorkSpace workSpace) {
        return workSpaceRepository.save(workSpace);
    }

    @Override
    public WorkSpace update(String id, WorkSpace workSpaceDetails) {
        Optional<WorkSpace> workSpaceOptional = workSpaceRepository.findById(id);
        if (workSpaceOptional.isPresent()) {
            WorkSpace workSpace = workSpaceOptional.get();
            workSpace.setName(workSpaceDetails.getName());
            workSpace.setDescription(workSpaceDetails.getDescription());
            workSpace.setType(workSpaceDetails.getType());

            return workSpaceRepository.save(workSpace);
        }
        return null;
    }

    @Override
    public boolean delete(String id) {
        if (workSpaceRepository.existsById(id)) {
            workSpaceRepository.deleteById(id);
            return true;
        }
        return false;
    }

    @Override
    public List<WorkSpace> findByUserId(Long userId) {
        return workSpaceRepository.findWorkspacesByUserId(userId);
    }

}
