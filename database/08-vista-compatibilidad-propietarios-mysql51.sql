-- Compatibilidad para la capa incremental creada antes de normalizar clientes.
USE taller_ttc;

CREATE VIEW propietarios AS
SELECT
    id_cliente AS id_propietario,
    tipo_persona,
    nombre,
    identificacion,
    telefono,
    correo,
    direccion,
    contacto_empresa,
    estado,
    fecha_creacion,
    fecha_actualizacion
FROM clientes;
