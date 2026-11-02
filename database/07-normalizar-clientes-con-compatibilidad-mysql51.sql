-- Migracion relacional segura para MySQL 5.1.
-- Usar esta version en lugar de 06. Ejecutar con la aplicacion cerrada.
USE taller_ttc;

ALTER TABLE propietarios
    CHANGE COLUMN id_propietario id_cliente INT NOT NULL AUTO_INCREMENT,
    ADD COLUMN dpi VARCHAR(30) NULL AFTER identificacion,
    ADD COLUMN licencia VARCHAR(50) NULL AFTER correo,
    ADD COLUMN tipo_licencia VARCHAR(10) NULL AFTER licencia,
    ADD COLUMN vence_licencia DATE NULL AFTER tipo_licencia,
    ADD COLUMN placa_vehiculo VARCHAR(20) NULL AFTER contacto_empresa,
    ADD COLUMN emergencia VARCHAR(150) NULL AFTER direccion,
    ADD UNIQUE KEY uq_clientes_identificacion (identificacion);

RENAME TABLE propietarios TO clientes;

ALTER TABLE clientes
    MODIFY COLUMN tipo_persona ENUM('Individual', 'Empresa') NOT NULL DEFAULT 'Individual';

INSERT INTO clientes (
    tipo_persona, nombre, identificacion, dpi, telefono, correo, licencia,
    tipo_licencia, vence_licencia, placa_vehiculo, direccion, emergencia,
    estado, fecha_creacion, fecha_actualizacion
)
SELECT
    'Individual', p.nombre, p.nit, p.dpi, IFNULL(p.telefono, 'Sin contacto'),
    p.correo, p.licencia, p.tipo_licencia, p.vence_licencia, p.vehiculo,
    p.direccion, p.emergencia,
    IF(p.estado = 'Inactivo', 'Inactivo', 'Activo'),
    IFNULL(p.fecha_creacion, NOW()), IFNULL(p.fecha_actualizacion, NOW())
FROM pilotos p
LEFT JOIN clientes c ON c.nombre = p.nombre
WHERE c.id_cliente IS NULL;

INSERT INTO clientes (
    tipo_persona, nombre, telefono, estado, fecha_creacion, fecha_actualizacion
)
SELECT 'Individual', v.propietario, 'Sin contacto', 'Activo', NOW(), NOW()
FROM vehiculos v
LEFT JOIN clientes c ON c.nombre = v.propietario
WHERE v.propietario IS NOT NULL
  AND TRIM(v.propietario) <> ''
  AND c.id_cliente IS NULL;

ALTER TABLE vehiculos
    CHANGE COLUMN id_propietario id_cliente INT NULL,
    DROP KEY idx_vehiculos_propietario,
    ADD KEY idx_vehiculos_cliente (id_cliente);

UPDATE vehiculos v
INNER JOIN clientes c ON c.nombre = v.propietario
SET v.id_cliente = c.id_cliente
WHERE v.id_cliente IS NULL;

ALTER TABLE vehiculos
    ADD CONSTRAINT fk_vehiculos_cliente
    FOREIGN KEY (id_cliente) REFERENCES clientes(id_cliente)
    ON UPDATE CASCADE ON DELETE RESTRICT;

ALTER TABLE ordenes_trabajo
    ADD COLUMN id_vehiculo INT NULL AFTER placa,
    ADD KEY idx_ordenes_vehiculo (id_vehiculo);

UPDATE ordenes_trabajo o
INNER JOIN vehiculos v ON v.placa = o.placa
SET o.id_vehiculo = v.id_vehiculo
WHERE o.id_vehiculo IS NULL;

ALTER TABLE ordenes_trabajo
    ADD CONSTRAINT fk_ordenes_vehiculo
    FOREIGN KEY (id_vehiculo) REFERENCES vehiculos(id_vehiculo)
    ON UPDATE CASCADE ON DELETE RESTRICT;

ALTER TABLE repuestos_movimientos
    ADD CONSTRAINT fk_repuestos_movimientos_repuesto
    FOREIGN KEY (id_repuesto) REFERENCES inventario_repuestos(id_repuesto)
    ON UPDATE CASCADE ON DELETE RESTRICT;

-- La tabla anterior se migra a clientes. La vista conserva compatibilidad con
-- el codigo actual mientras las pantallas se renombran en una capa posterior.
DROP TABLE pilotos;

CREATE VIEW pilotos AS
SELECT
    id_cliente AS id_piloto,
    nombre,
    dpi,
    identificacion AS nit,
    telefono,
    correo,
    licencia,
    tipo_licencia,
    vence_licencia,
    estado,
    placa_vehiculo AS vehiculo,
    direccion,
    emergencia,
    fecha_creacion,
    fecha_actualizacion
FROM clientes;
