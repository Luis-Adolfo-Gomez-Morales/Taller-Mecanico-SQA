-- Ejecutar despues de 09. Respaldar clientes antes de retirar columnas.
-- La aplicacion consulta y guarda el estado usando la fecha de MySQL.
CREATE OR REPLACE VIEW pilotos AS
SELECT id_cliente AS id_piloto, nombre, dpi, telefono, correo, licencia,
       tipo_licencia, vence_licencia,
       IF(vence_licencia >= CURDATE(), 'Activo', 'Inactivo') AS estado,
       placa_vehiculo AS vehiculo, direccion, fecha_creacion, fecha_actualizacion
FROM clientes;

CREATE OR REPLACE VIEW propietarios AS
SELECT id_cliente AS id_propietario, tipo_persona, nombre, telefono, correo,
       direccion, contacto_empresa,
       IF(vence_licencia >= CURDATE(), 'Activo', 'Inactivo') AS estado,
       fecha_creacion, fecha_actualizacion
FROM clientes;

ALTER TABLE clientes
    DROP INDEX uq_clientes_identificacion,
    DROP COLUMN identificacion,
    DROP COLUMN emergencia,
    MODIFY COLUMN contacto_empresa VARCHAR(150) NULL;

UPDATE clientes
SET contacto_empresa = NULL
WHERE CHAR_LENGTH(TRIM(contacto_empresa)) = 0;

UPDATE clientes
SET estado = IF(vence_licencia >= CURDATE(), 'Activo', 'Inactivo');
