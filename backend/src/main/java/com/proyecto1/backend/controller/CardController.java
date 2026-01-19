package com.proyecto1.backend.controller;

import com.proyecto1.backend.model.Card;
import com.proyecto1.backend.service.CardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cards")
@CrossOrigin(origins = "http://localhost:5173")
public class CardController {
    
    @Autowired
    private CardService cardService;

    // CREAR: POST /api/cards/list/{tareaId}
    // Body: { "title": "Comprar pan", "status": "pendiente" }
    @PostMapping("/list/{tareaId}")
    public ResponseEntity<Card> createCard(@PathVariable Long tareaId, @RequestBody Card card) {
        Card nuevaCard = cardService.createCard(tareaId, card);
        return ResponseEntity.ok(nuevaCard);
    }

    // ACTUALIZAR: PUT /api/cards/{id}
    @PutMapping("/{id}")
    public ResponseEntity<Card> updateCard(@PathVariable Long id, @RequestBody Card card) {
        Card cardActualizada = cardService.updateCard(id, card);
        return ResponseEntity.ok(cardActualizada);
    }

    // BORRAR: DELETE /api/cards/{id}
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCard(@PathVariable Long id) {
        cardService.deleteCard(id);
        return ResponseEntity.noContent().build();
    }
    
    // MOVER: PUT /api/cards/{id}/move/{newTareaId}
    @PutMapping("/{id}/move/{newTareaId}")
    public ResponseEntity<Card> moveCard(@PathVariable Long id, @PathVariable Long newTareaId) {
        return ResponseEntity.ok(cardService.moveCard(id, newTareaId));
    }

}
