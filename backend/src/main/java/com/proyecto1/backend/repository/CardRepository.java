package com.proyecto1.backend.repository;

import com.proyecto1.backend.model.Card;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CardRepository extends JpaRepository<Card, Long>{
    
}
