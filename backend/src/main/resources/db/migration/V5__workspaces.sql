-- ===============================================
-- ESPACIOS DE TRABAJO
-- ===============================================

CREATE TABLE IF NOT EXISTS workspace (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    type VARCHAR(50) NOT NULL
);

CREATE TABLE IF NOT EXISTS workspace_member (
    workspace_id VARCHAR(50) NOT NULL REFERENCES workspace(id) ON DELETE CASCADE,
    usuario_id INT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL DEFAULT 'member',
    PRIMARY KEY (workspace_id, usuario_id)
);

-- ===============================================
-- TABLEROS / PROYECTOS
-- ===============================================

-- Tu tabla proyecto ya existe, solo añadimos columna workspace_id para proyectos grupales
ALTER TABLE proyectos
ADD COLUMN IF NOT EXISTS workspace_id VARCHAR(50) REFERENCES workspace(id) ON DELETE CASCADE;

-- ===============================================
-- DATOS DE EJEMPLO: WORKSPACES
-- ===============================================

INSERT INTO workspace (id, name, description, type)
VALUES ('ws-1', 'Mi Empresa', 'Proyectos corporativos', 'empresa')
ON CONFLICT (id) DO NOTHING;

INSERT INTO workspace_member (workspace_id, usuario_id, role)
VALUES 
('ws-1', 1, 'admin'),  -- Usuario "Tú"
('ws-1', 2, 'member')  -- Usuario "Juan Pérez"
ON CONFLICT (workspace_id, usuario_id) DO NOTHING;

-- Proyectos dentro del workspace (tableros)
INSERT INTO proyectos (nombre, descripcion, usuario_id, workspace_id, estado)
VALUES 
('Desarrollo Q1', 'Tablero de desarrollo Q1', 1, 'ws-1', 'PENDIENTE')
ON CONFLICT DO NOTHING;

-- ===============================================
-- DATOS DE EJEMPLO: PROYECTOS PERSONALES
-- ===============================================

-- Proyecto personal para usuario 1
INSERT INTO proyectos (nombre, descripcion, usuario_id, estado)
VALUES 
('Proyecto Personal', 'Proyecto personal demo', 1, 'PENDIENTE')
ON CONFLICT DO NOTHING;

-- ===============================================
-- TAREAS DE EJEMPLO
-- ===============================================

-- Tareas del proyecto grupal
INSERT INTO tareas (titulo, descripcion, estado, proyecto_id)
SELECT 'Pendiente', '', 'PENDIENTE', id FROM proyectos WHERE nombre='Desarrollo Q1'
ON CONFLICT DO NOTHING;

INSERT INTO tareas (titulo, descripcion, estado, proyecto_id)
SELECT 'En Progreso', '', 'EN_PROGRESO', id FROM proyectos WHERE nombre='Desarrollo Q1'
ON CONFLICT DO NOTHING;

INSERT INTO tareas (titulo, descripcion, estado, proyecto_id)
SELECT 'Completado', '', 'COMPLETADO', id FROM proyectos WHERE nombre='Desarrollo Q1'
ON CONFLICT DO NOTHING;

-- Tareas del proyecto personal
INSERT INTO tareas (titulo, descripcion, estado, proyecto_id)
SELECT 'Pendiente', '', 'PENDIENTE', id FROM proyectos WHERE nombre='Proyecto Personal'
ON CONFLICT DO NOTHING;

INSERT INTO tareas (titulo, descripcion, estado, proyecto_id)
SELECT 'En Progreso', '', 'EN_PROGRESO', id FROM proyectos WHERE nombre='Proyecto Personal'
ON CONFLICT DO NOTHING;

INSERT INTO tareas (titulo, descripcion, estado, proyecto_id)
SELECT 'Completado', '', 'COMPLETADO', id FROM proyectos WHERE nombre='Proyecto Personal'
ON CONFLICT DO NOTHING;
