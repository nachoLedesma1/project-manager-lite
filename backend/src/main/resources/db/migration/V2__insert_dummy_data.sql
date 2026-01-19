-- Usuarios de prueba
INSERT INTO usuario (username, password, email) VALUES
('nacho', '$2a$10$uK9G2m9m9nU8bF9gQ8sT9uQ5xv8x7O0Y.sSdbCq6xW1YVZmj4O5bS', 'nacho@email.com'),
('maria', '$2a$10$uK9G2m9m9nU8bF9gQ8sT9uQ5xv8x7O0Y.sSdbCq6xW1YVZmj4O5bS', 'maria@email.com');
-- (Contraseña encriptada: 1234)

-- Proyectos de prueba
INSERT INTO proyecto (nombre, descripcion, usuario_id) VALUES
('Proyecto Alpha', 'Proyecto de ejemplo 1', 1),
('Proyecto Beta', 'Proyecto de ejemplo 2', 2);

-- Tareas de prueba
INSERT INTO tarea (titulo, descripcion, estado, proyecto_id) VALUES
('Tarea 1', 'Descripcion de tarea 1', 'Pendiente', 1),
('Tarea 2', 'Descripcion de tarea 2', 'En progreso', 1),
('Tarea 3', 'Descripcion de tarea 3', 'Completada', 2);
