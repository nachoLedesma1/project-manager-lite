-- Tabla de usuarios
CREATE TABLE usuario (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(150) UNIQUE
);

-- Tabla de proyectos
CREATE TABLE proyecto (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    descripcion TEXT,
    usuario_id INT NOT NULL REFERENCES usuario(id) ON DELETE CASCADE
);

-- Tabla de tareas
CREATE TABLE tarea (
    id SERIAL PRIMARY KEY,
    titulo VARCHAR(150) NOT NULL,
    descripcion TEXT,
    estado VARCHAR(50) NOT NULL,
    proyecto_id INT NOT NULL REFERENCES proyecto(id) ON DELETE CASCADE
);
