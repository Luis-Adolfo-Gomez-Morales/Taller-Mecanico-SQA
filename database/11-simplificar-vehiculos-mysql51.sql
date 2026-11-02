-- Ejecutar despues de 10, con respaldo previo de vehiculos.
-- Conservar modelo y los valores de creado_por existentes.
ALTER TABLE vehiculos
    DROP COLUMN no_tarjeta,
    DROP COLUMN modelo_registro,
    DROP COLUMN anio,
    DROP COLUMN fecha_registro,
    DROP COLUMN observaciones;
