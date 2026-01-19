-- 1. Eliminar la tabla incorrecta (plural) si existe
DROP TABLE IF EXISTS workspace_members;

-- 2. Eliminar la Primary Key ACTUAL de la tabla correcta
-- Postgres suele llamar a la PK "nombretabla_pkey". Esto quita la restricción vieja.
ALTER TABLE workspace_member DROP CONSTRAINT IF EXISTS workspace_member_pkey;

-- 3. Asegurarse de que exista la columna ID
-- La creamos sin marcarla como PK todavía para evitar conflictos en esta línea
ALTER TABLE workspace_member ADD COLUMN IF NOT EXISTS id BIGSERIAL;

-- 4. Ahora que la tabla está limpia de PKs viejas, asignamos la NUEVA PK al id
ALTER TABLE workspace_member ADD PRIMARY KEY (id);