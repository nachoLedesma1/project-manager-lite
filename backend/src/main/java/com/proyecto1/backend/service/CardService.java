package com.proyecto1.backend.service;

import com.proyecto1.backend.model.Card;
import java.util.List;

public interface CardService {

    Card createCard(Long tareaId, Card card);
    Card updateCard(Long id, Card cardDetails);
    void deleteCard(Long id);
    // Opcional: Para mover tarjetas entre columnas
    Card moveCard(Long cardId, Long nuevaTareaId);

}
