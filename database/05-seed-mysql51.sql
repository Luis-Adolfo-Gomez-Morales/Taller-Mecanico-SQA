-- Datos de prueba idempotentes para MySQL 5.1.
-- Version corregida: MySQL 5.1 requiere FROM DUAL en INSERT ... SELECT.
USE taller_ttc;

INSERT INTO propietarios (
    tipo_persona, nombre, identificacion, telefono, correo, direccion,
    estado, fecha_creacion, fecha_actualizacion
)
SELECT 'Individual', 'Ana Lopez', '1234567-8', '5555-0101',
       'ana@example.test', 'Ciudad de Guatemala', 'Activo', NOW(), NOW()
FROM DUAL
WHERE NOT EXISTS (
    SELECT 1 FROM propietarios WHERE identificacion = '1234567-8'
);

INSERT INTO servicios (nombre, descripcion, tipo, intervalo_dias_normal, intervalo_km_referencial)
SELECT 'Cambio de aceite', 'Cambio de aceite y revision basica.', 'Preventivo', 180, 5000 FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM servicios WHERE nombre = 'Cambio de aceite');

INSERT INTO servicios (nombre, descripcion, tipo, intervalo_dias_normal, intervalo_km_referencial)
SELECT 'Revision de frenos', 'Inspeccion de pastillas, discos y liquido.', 'Preventivo', 180, 8000 FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM servicios WHERE nombre = 'Revision de frenos');

INSERT INTO servicios (nombre, descripcion, tipo, intervalo_dias_normal, intervalo_km_referencial)
SELECT 'Diagnostico general', 'Diagnostico de falla reportada.', 'Correctivo', NULL, NULL FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM servicios WHERE nombre = 'Diagnostico general');
