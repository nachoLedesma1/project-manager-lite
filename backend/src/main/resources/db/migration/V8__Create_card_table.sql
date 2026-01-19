-- V8__Create_card_table.sql
--porque primero la hice con una relación mal 
DROP TABLE IF EXISTS card;

CREATE TABLE card (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50), -- 'pendiente', 'en-proceso', 'completado'
    position INT DEFAULT 0, -- Para el orden (Drag & Drop futuro)
    tarea_id BIGINT NOT NULL, -- Relación con la Columna (List)
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    modified_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_card_tarea FOREIGN KEY (tarea_id) REFERENCES tareas(id) ON DELETE CASCADE
);

-- Índices para mejorar rendimiento al buscar
CREATE INDEX idx_card_tarea_id ON card(tarea_id);