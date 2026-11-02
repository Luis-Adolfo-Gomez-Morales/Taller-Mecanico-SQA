-- Datos de prueba mínimos para la demostración de fase 2.
USE taller_ttc;

INSERT INTO propietarios (tipo_persona, nombre, identificacion, telefono, correo, direccion)
VALUES
    ('Individual', 'Ana López', '1234567-8', '5555-0101', 'ana@example.test', 'Ciudad de Guatemala'),
    ('Empresa', 'Transportes del Norte, S. A.', '9876543-1', '5555-0102', 'mantenimiento@example.test', 'Zona 12');

INSERT INTO vehiculos (
    id_propietario, tipo, marca, modelo, anio, placa, kilometraje_actual,
    nivel_uso, fecha_registro, estado, observaciones
)
VALUES
    (1, 'Motocicleta', 'Honda', 'CB190R', 2023, 'M-123ABC', 12500, 'Normal', CURDATE(), 'Unidad de prueba individual'),
    (2, 'Pickup', 'Toyota', 'Hilux', 2022, 'C-456DEF', 48900, 'Alto', CURDATE(), 'Unidad de prueba empresarial');

INSERT INTO servicios (nombre, descripcion, tipo, intervalo_dias_normal, intervalo_km_referencial)
VALUES
    ('Cambio de aceite', 'Cambio de aceite y revisión básica.', 'Preventivo', 180, 5000),
    ('Revisión de frenos', 'Inspección de pastillas, discos y líquido.', 'Preventivo', 180, 8000),
    ('Diagnóstico general', 'Diagnóstico de falla reportada.', 'Correctivo', NULL, NULL);

INSERT INTO inventario_repuestos (codigo, nombre, descripcion, existencia, precio_unitario)
VALUES
    ('FIL-001', 'Filtro de aceite', 'Filtro de prueba.', 20, 75.00),
    ('ACE-001', 'Aceite 10W-40', 'Litro de aceite de prueba.', 50, 65.00);
