-- =============================================================
-- Script de inicialización corregido: Roles y Usuarios (MySQL)
-- =============================================================

-- Tabla de roles
CREATE TABLE IF NOT EXISTS roles (
    id_rol INT AUTO_INCREMENT PRIMARY KEY,
    nombre_rol VARCHAR(50) NOT NULL UNIQUE
);

-- Tabla de usuarios
CREATE TABLE IF NOT EXISTS usuarios (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    correo VARCHAR(150) NOT NULL UNIQUE,
    contrasena VARCHAR(255) NOT NULL,
    id_rol INT NOT NULL,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_rol FOREIGN KEY (id_rol) REFERENCES roles(id_rol)
);

-- Insertar roles demo
INSERT IGNORE INTO roles (id_rol, nombre_rol) VALUES 
    (1, 'Administrador'), 
    (2, 'Cliente');

-- Insertar usuarios demo (las contraseñas se almacenan como texto plano según la lógica de login actual)
INSERT IGNORE INTO usuarios (id_usuario, nombre, correo, contrasena, id_rol) VALUES
    (1, 'Benjamín Administrador', 'admin@techstore.cl', 'admin123', 1),
    (2, 'Juan Cliente', 'juan@gmail.com', 'cliente123', 2);
