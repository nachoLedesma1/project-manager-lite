package com.proyecto1.backend.service;

import com.proyecto1.backend.model.Card;
import com.proyecto1.backend.model.Tarea;
import com.proyecto1.backend.repository.CardRepository;
import com.proyecto1.backend.repository.TareaRepository;
import com.proyecto1.backend.service.CardService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CardServiceImpl implements CardService{

    @Autowired
    private CardRepository cardRepository;

    @Autowired
    private TareaRepository tareaRepository;

    @Override
    @Transactional
    public Card createCard(Long tareaId, Card cardData) {
        // 1. Buscamos la Tarea (Columna) a la que pertenecerá la tarjeta
        Tarea tarea = tareaRepository.findById(tareaId)
                .orElseThrow(() -> new RuntimeException("No se encontró la Tarea/Lista con ID: " + tareaId));

        // 2. Asignamos la relación
        cardData.setTarea(tarea);
        
        // 3. Asignamos posición (lógica simple: al final de la lista)
        // Si quieres orden, podrías hacer tarea.getCards().size();
        if (cardData.getPosition() == null) {
            cardData.setPosition(0); 
        }

        // 4. Guardamos
        return cardRepository.save(cardData);
    }

    @Override
    @Transactional
    public Card updateCard(Long id, Card cardDetails) {
        Card cardExistente = cardRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Tarjeta no encontrada"));

        // Actualizamos solo lo que viene (si no es null)
        if (cardDetails.getTitle() != null) cardExistente.setTitle(cardDetails.getTitle());
        if (cardDetails.getDescription() != null) cardExistente.setDescription(cardDetails.getDescription());
        if (cardDetails.getStatus() != null) cardExistente.setStatus(cardDetails.getStatus());
        if (cardDetails.getPosition() != null) cardExistente.setPosition(cardDetails.getPosition());

        return cardRepository.save(cardExistente);
    }

    @Override
    @Transactional
    public void deleteCard(Long id) {
        if (!cardRepository.existsById(id)) {
            throw new RuntimeException("Tarjeta no encontrada para eliminar");
        }
        cardRepository.deleteById(id);
    }
    
    @Override
    @Transactional
    public Card moveCard(Long cardId, Long nuevaTareaId) {
        // 1. Buscar la carta y la nueva lista
        Card card = cardRepository.findById(cardId)
                .orElseThrow(() -> new RuntimeException("Tarjeta no encontrada"));
        
        Tarea nuevaTarea = tareaRepository.findById(nuevaTareaId)
                .orElseThrow(() -> new RuntimeException("Nueva lista no encontrada"));

        // 2. OBTENER LA LISTA VIEJA esto es para que se actualice siempre
        Tarea viejaTarea = card.getTarea();

        // 3. Si la carta ya estaba en una lista, la sacamos de la memoria de esa lista
        // Esto evita que Hibernate "se confunda" y la regrese al lugar original
        if (viejaTarea != null) {
            //viejaTarea.getCards().remove(card);
        }

        // 4. Asignamos la nueva relación
        card.setTarea(nuevaTarea);
        
        // 5. Agregamos la carta a la lista en memoria de la nueva tarea (opcional, pero buena práctica)
        nuevaTarea.getCards().add(card);

        // 6. Guardamos
        return cardRepository.save(card);
    }

}
