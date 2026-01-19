-- Renombrar tablas en singular a plural

-- Proyecto
DROP TABLE IF EXISTS proyectos CASCADE;
ALTER TABLE proyecto RENAME TO proyectos;

-- Tarea
DROP TABLE IF EXISTS tareas CASCADE;
ALTER TABLE tarea RENAME TO tareas;

-- Usuario
DROP TABLE IF EXISTS usuarios CASCADE;
ALTER TABLE usuario RENAME TO usuarios;
