-- Respaldar previamente las vistas y clientes.id_cliente/placa_vehiculo.
-- La relacion vigente es vehiculos.id_cliente -> clientes.id_cliente.
USE taller_ttc;
DROP VIEW IF EXISTS pilotos;
DROP VIEW IF EXISTS propietarios;
ALTER TABLE clientes DROP COLUMN placa_vehiculo;
