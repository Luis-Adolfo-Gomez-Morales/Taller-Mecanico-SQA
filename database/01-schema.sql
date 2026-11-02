-- Sistema de Control de Servicios y Mantenimiento Preventivo de Vehículos
-- Fase 2: modelo relacional, integridad y consultas de alertas.
-- Requiere MySQL 8.0 o superior.

CREATE DATABASE IF NOT EXISTS taller_ttc
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE taller_ttc;

CREATE TABLE IF NOT EXISTS usuarios (
    id_usuario INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    usuario VARCHAR(50) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    nombre VARCHAR(120) NOT NULL,
    estado ENUM('Activo', 'Inactivo') NOT NULL DEFAULT 'Activo',
    ultimo_acceso DATETIME NULL,
    fecha_creacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT uq_usuarios_usuario UNIQUE (usuario)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS propietarios (
    id_propietario INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    tipo_persona ENUM('Individual', 'Empresa') NOT NULL,
    nombre VARCHAR(150) NOT NULL,
    identificacion VARCHAR(30) NULL,
    telefono VARCHAR(30) NOT NULL,
    correo VARCHAR(120) NULL,
    direccion VARCHAR(255) NULL,
    contacto_empresa VARCHAR(150) NULL,
    estado ENUM('Activo', 'Inactivo') NOT NULL DEFAULT 'Activo',
    fecha_creacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_propietarios_nombre (nombre),
    INDEX idx_propietarios_contacto (telefono, correo)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS vehiculos (
    id_vehiculo INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    id_propietario INT UNSIGNED NOT NULL,
    tipo VARCHAR(50) NOT NULL,
    marca VARCHAR(60) NOT NULL,
    modelo VARCHAR(80) NOT NULL,
    anio SMALLINT UNSIGNED NULL,
    placa VARCHAR(15) NOT NULL,
    kilometraje_actual DECIMAL(12,2) NOT NULL DEFAULT 0,
    nivel_uso ENUM('Bajo', 'Normal', 'Alto') NOT NULL DEFAULT 'Normal',
    fecha_registro DATE NOT NULL,
    estado ENUM('Activo', 'En taller', 'Inactivo') NOT NULL DEFAULT 'Activo',
    observaciones TEXT NULL,
    fecha_creacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT uq_vehiculos_placa UNIQUE (placa),
    CONSTRAINT chk_vehiculos_kilometraje CHECK (kilometraje_actual >= 0),
    CONSTRAINT chk_vehiculos_anio CHECK (anio IS NULL OR anio BETWEEN 1886 AND 2100),
    CONSTRAINT fk_vehiculos_propietario
        FOREIGN KEY (id_propietario) REFERENCES propietarios(id_propietario)
        ON UPDATE CASCADE ON DELETE RESTRICT,
    INDEX idx_vehiculos_propietario (id_propietario),
    INDEX idx_vehiculos_estado (estado)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS servicios (
    id_servicio INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT NULL,
    tipo ENUM('Preventivo', 'Correctivo') NOT NULL DEFAULT 'Preventivo',
    intervalo_dias_normal SMALLINT UNSIGNED NULL,
    intervalo_km_referencial INT UNSIGNED NULL,
    estado ENUM('Activo', 'Inactivo') NOT NULL DEFAULT 'Activo',
    CONSTRAINT uq_servicios_nombre UNIQUE (nombre),
    CONSTRAINT chk_servicios_intervalo CHECK (
        intervalo_dias_normal IS NULL OR intervalo_dias_normal > 0
    )
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS ordenes_servicio (
    id_orden INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    numero VARCHAR(30) NOT NULL,
    id_vehiculo INT UNSIGNED NOT NULL,
    fecha_ingreso DATETIME NOT NULL,
    kilometraje_ingreso DECIMAL(12,2) NOT NULL,
    motivo_ingreso TEXT NOT NULL,
    estado ENUM('Recibido', 'En proceso', 'Terminado', 'Entregado', 'Cancelado') NOT NULL DEFAULT 'Recibido',
    fecha_terminado DATETIME NULL,
    fecha_entrega DATETIME NULL,
    observaciones TEXT NULL,
    fecha_creacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT uq_ordenes_numero UNIQUE (numero),
    CONSTRAINT chk_ordenes_kilometraje CHECK (kilometraje_ingreso >= 0),
    CONSTRAINT fk_ordenes_vehiculo
        FOREIGN KEY (id_vehiculo) REFERENCES vehiculos(id_vehiculo)
        ON UPDATE CASCADE ON DELETE RESTRICT,
    INDEX idx_ordenes_vehiculo_fecha (id_vehiculo, fecha_ingreso),
    INDEX idx_ordenes_estado (estado)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS historial_kilometraje (
    id_historial_kilometraje INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    id_vehiculo INT UNSIGNED NOT NULL,
    id_orden INT UNSIGNED NULL,
    fecha_registro DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    kilometraje DECIMAL(12,2) NOT NULL,
    origen ENUM('Registro de vehículo', 'Ingreso a taller', 'Actualización') NOT NULL,
    observaciones VARCHAR(255) NULL,
    CONSTRAINT chk_historial_kilometraje CHECK (kilometraje >= 0),
    CONSTRAINT fk_historial_vehiculo
        FOREIGN KEY (id_vehiculo) REFERENCES vehiculos(id_vehiculo)
        ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_historial_orden
        FOREIGN KEY (id_orden) REFERENCES ordenes_servicio(id_orden)
        ON UPDATE CASCADE ON DELETE SET NULL,
    INDEX idx_historial_vehiculo_fecha (id_vehiculo, fecha_registro)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS detalle_servicio (
    id_detalle_servicio INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    id_orden INT UNSIGNED NOT NULL,
    id_servicio INT UNSIGNED NOT NULL,
    fecha_realizado DATETIME NULL,
    kilometraje_servicio DECIMAL(12,2) NOT NULL,
    trabajo_realizado TEXT NULL,
    observaciones TEXT NULL,
    nivel_uso ENUM('Bajo', 'Normal', 'Alto') NOT NULL DEFAULT 'Normal',
    fecha_proximo_servicio DATE NULL,
    estado_mantenimiento ENUM('Pendiente', 'Realizado', 'Cancelado') NOT NULL DEFAULT 'Pendiente',
    CONSTRAINT chk_detalle_kilometraje CHECK (kilometraje_servicio >= 0),
    CONSTRAINT fk_detalle_orden
        FOREIGN KEY (id_orden) REFERENCES ordenes_servicio(id_orden)
        ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_detalle_servicio
        FOREIGN KEY (id_servicio) REFERENCES servicios(id_servicio)
        ON UPDATE CASCADE ON DELETE RESTRICT,
    INDEX idx_detalle_alertas (fecha_proximo_servicio, estado_mantenimiento),
    INDEX idx_detalle_orden (id_orden)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS recordatorios (
    id_recordatorio INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    id_detalle_servicio INT UNSIGNED NOT NULL,
    tipo ENUM('Próximo servicio', 'Servicio vencido', 'Segundo aviso') NOT NULL,
    mensaje TEXT NOT NULL,
    canal ENUM('Interno', 'Correo', 'SMS', 'WhatsApp') NOT NULL DEFAULT 'Interno',
    estado ENUM('Generado', 'Enviado', 'Leído', 'Cancelado') NOT NULL DEFAULT 'Generado',
    fecha_generacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_envio DATETIME NULL,
    CONSTRAINT uq_recordatorio_detalle_tipo UNIQUE (id_detalle_servicio, tipo),
    CONSTRAINT fk_recordatorios_detalle
        FOREIGN KEY (id_detalle_servicio) REFERENCES detalle_servicio(id_detalle_servicio)
        ON UPDATE CASCADE ON DELETE RESTRICT,
    INDEX idx_recordatorios_estado_fecha (estado, fecha_generacion)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS inventario_repuestos (
    id_repuesto INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    codigo VARCHAR(50) NOT NULL,
    nombre VARCHAR(150) NOT NULL,
    descripcion TEXT NULL,
    existencia DECIMAL(12,2) NOT NULL DEFAULT 0,
    precio_unitario DECIMAL(12,2) NOT NULL DEFAULT 0,
    estado ENUM('Activo', 'Inactivo') NOT NULL DEFAULT 'Activo',
    fecha_creacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT uq_repuestos_codigo UNIQUE (codigo),
    CONSTRAINT chk_repuestos_existencia CHECK (existencia >= 0),
    CONSTRAINT chk_repuestos_precio CHECK (precio_unitario >= 0)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS orden_repuestos (
    id_orden_repuesto INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    id_orden INT UNSIGNED NOT NULL,
    id_repuesto INT UNSIGNED NOT NULL,
    cantidad DECIMAL(12,2) NOT NULL,
    precio_unitario DECIMAL(12,2) NOT NULL,
    subtotal DECIMAL(12,2) AS (cantidad * precio_unitario) STORED,
    CONSTRAINT chk_orden_repuestos_cantidad CHECK (cantidad > 0),
    CONSTRAINT chk_orden_repuestos_precio CHECK (precio_unitario >= 0),
    CONSTRAINT fk_orden_repuestos_orden
        FOREIGN KEY (id_orden) REFERENCES ordenes_servicio(id_orden)
        ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_orden_repuestos_repuesto
        FOREIGN KEY (id_repuesto) REFERENCES inventario_repuestos(id_repuesto)
        ON UPDATE CASCADE ON DELETE RESTRICT,
    INDEX idx_orden_repuestos_orden (id_orden)
) ENGINE=InnoDB;

CREATE OR REPLACE VIEW vw_mantenimientos_alerta AS
SELECT
    ds.id_detalle_servicio,
    p.id_propietario,
    p.nombre AS propietario,
    p.telefono,
    p.correo,
    v.id_vehiculo,
    v.placa,
    CONCAT(v.marca, ' ', v.modelo) AS vehiculo,
    s.nombre AS servicio,
    ds.fecha_proximo_servicio,
    CASE
        WHEN ds.fecha_proximo_servicio < CURDATE() THEN 'Vencido'
        WHEN ds.fecha_proximo_servicio <= DATE_ADD(CURDATE(), INTERVAL 7 DAY) THEN 'Próximo'
        ELSE 'Programado'
    END AS estado_alerta
FROM detalle_servicio ds
INNER JOIN ordenes_servicio o ON o.id_orden = ds.id_orden
INNER JOIN vehiculos v ON v.id_vehiculo = o.id_vehiculo
INNER JOIN propietarios p ON p.id_propietario = v.id_propietario
INNER JOIN servicios s ON s.id_servicio = ds.id_servicio
WHERE ds.estado_mantenimiento = 'Realizado'
  AND ds.fecha_proximo_servicio IS NOT NULL;
