-- Migracion ADITIVA para MySQL 5.1.45.
-- No elimina, renombra ni cambia columnas consumidas por la aplicacion actual.
-- Ejecutar una sola vez sobre la base de datos local taller_ttc.
USE taller_ttc;

CREATE TABLE IF NOT EXISTS propietarios (
    id_propietario INT NOT NULL AUTO_INCREMENT,
    tipo_persona ENUM('Individual', 'Empresa') NOT NULL,
    nombre VARCHAR(150) NOT NULL,
    identificacion VARCHAR(30) NULL,
    telefono VARCHAR(30) NOT NULL,
    correo VARCHAR(120) NULL,
    direccion VARCHAR(255) NULL,
    contacto_empresa VARCHAR(150) NULL,
    estado ENUM('Activo', 'Inactivo') NOT NULL DEFAULT 'Activo',
    fecha_creacion DATETIME NOT NULL,
    fecha_actualizacion DATETIME NOT NULL,
    PRIMARY KEY (id_propietario),
    KEY idx_propietarios_nombre (nombre),
    KEY idx_propietarios_telefono (telefono)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- La columna es opcional durante la transicion: el modulo de vehiculos actual
-- todavia usa vehiculos.propietario como texto.
ALTER TABLE vehiculos
    ADD COLUMN id_propietario INT NULL AFTER propietario,
    ADD COLUMN anio SMALLINT NULL AFTER modelo_registro,
    ADD COLUMN nivel_uso ENUM('Bajo', 'Normal', 'Alto') NOT NULL DEFAULT 'Normal' AFTER uso,
    ADD COLUMN fecha_registro DATE NULL AFTER kilometraje,
    ADD COLUMN observaciones TEXT NULL AFTER estado,
    ADD KEY idx_vehiculos_propietario (id_propietario);

CREATE TABLE IF NOT EXISTS servicios (
    id_servicio INT NOT NULL AUTO_INCREMENT,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT NULL,
    tipo ENUM('Preventivo', 'Correctivo') NOT NULL DEFAULT 'Preventivo',
    intervalo_dias_normal SMALLINT NULL,
    intervalo_km_referencial INT NULL,
    estado ENUM('Activo', 'Inactivo') NOT NULL DEFAULT 'Activo',
    PRIMARY KEY (id_servicio),
    UNIQUE KEY uq_servicios_nombre (nombre)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- Se conserva ordenes_trabajo; esta tabla agrega el detalle normalizado sin
-- modificar los campos existentes que utiliza la interfaz.
CREATE TABLE IF NOT EXISTS detalle_servicio (
    id_detalle_servicio INT NOT NULL AUTO_INCREMENT,
    id_orden INT NOT NULL,
    id_servicio INT NOT NULL,
    fecha_realizado DATETIME NULL,
    kilometraje_servicio DECIMAL(12,2) NOT NULL,
    trabajo_realizado TEXT NULL,
    observaciones TEXT NULL,
    nivel_uso ENUM('Bajo', 'Normal', 'Alto') NOT NULL DEFAULT 'Normal',
    fecha_proximo_servicio DATE NULL,
    estado_mantenimiento ENUM('Pendiente', 'Realizado', 'Cancelado') NOT NULL DEFAULT 'Pendiente',
    PRIMARY KEY (id_detalle_servicio),
    KEY idx_detalle_orden (id_orden),
    KEY idx_detalle_alertas (fecha_proximo_servicio, estado_mantenimiento),
    CONSTRAINT fk_detalle_orden FOREIGN KEY (id_orden)
        REFERENCES ordenes_trabajo(id_orden)
        ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_detalle_servicio FOREIGN KEY (id_servicio)
        REFERENCES servicios(id_servicio)
        ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE IF NOT EXISTS historial_kilometraje (
    id_historial_kilometraje INT NOT NULL AUTO_INCREMENT,
    id_vehiculo INT NOT NULL,
    id_orden INT NULL,
    fecha_registro DATETIME NOT NULL,
    kilometraje DECIMAL(12,2) NOT NULL,
    origen ENUM('Registro de vehiculo', 'Ingreso a taller', 'Actualizacion') NOT NULL,
    observaciones VARCHAR(255) NULL,
    PRIMARY KEY (id_historial_kilometraje),
    KEY idx_historial_vehiculo_fecha (id_vehiculo, fecha_registro),
    KEY idx_historial_orden (id_orden),
    CONSTRAINT fk_historial_vehiculo FOREIGN KEY (id_vehiculo)
        REFERENCES vehiculos(id_vehiculo)
        ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_historial_orden FOREIGN KEY (id_orden)
        REFERENCES ordenes_trabajo(id_orden)
        ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE IF NOT EXISTS recordatorios (
    id_recordatorio INT NOT NULL AUTO_INCREMENT,
    id_detalle_servicio INT NOT NULL,
    tipo ENUM('Proximo servicio', 'Servicio vencido', 'Segundo aviso') NOT NULL,
    mensaje TEXT NOT NULL,
    canal ENUM('Interno', 'Correo', 'SMS', 'WhatsApp') NOT NULL DEFAULT 'Interno',
    estado ENUM('Generado', 'Enviado', 'Leido', 'Cancelado') NOT NULL DEFAULT 'Generado',
    fecha_generacion DATETIME NOT NULL,
    fecha_envio DATETIME NULL,
    PRIMARY KEY (id_recordatorio),
    UNIQUE KEY uq_recordatorio_detalle_tipo (id_detalle_servicio, tipo),
    KEY idx_recordatorios_estado_fecha (estado, fecha_generacion),
    CONSTRAINT fk_recordatorios_detalle FOREIGN KEY (id_detalle_servicio)
        REFERENCES detalle_servicio(id_detalle_servicio)
        ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE OR REPLACE VIEW vw_mantenimientos_alerta AS
SELECT
    ds.id_detalle_servicio,
    v.id_vehiculo,
    v.placa,
    v.propietario,
    s.nombre AS servicio,
    ds.fecha_proximo_servicio,
    CASE
        WHEN ds.fecha_proximo_servicio < CURDATE() THEN 'Vencido'
        WHEN ds.fecha_proximo_servicio <= DATE_ADD(CURDATE(), INTERVAL 7 DAY) THEN 'Proximo'
        ELSE 'Programado'
    END AS estado_alerta
FROM detalle_servicio ds
INNER JOIN ordenes_trabajo o ON o.id_orden = ds.id_orden
INNER JOIN vehiculos v ON v.placa = o.placa
INNER JOIN servicios s ON s.id_servicio = ds.id_servicio
WHERE ds.estado_mantenimiento = 'Realizado'
  AND ds.fecha_proximo_servicio IS NOT NULL;
