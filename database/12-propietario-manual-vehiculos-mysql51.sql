-- Respaldar vehiculos antes de ejecutar. Mantiene id_cliente y propietario.
ALTER TABLE vehiculos DROP COLUMN piloto;

CREATE OR REPLACE VIEW vw_mantenimientos_alerta AS
SELECT ds.id_detalle_servicio, v.id_vehiculo, v.placa,
       v.propietario AS propietario, s.nombre AS servicio,
       ds.fecha_proximo_servicio,
       CASE WHEN ds.fecha_proximo_servicio < CURDATE() THEN 'Vencido'
            WHEN ds.fecha_proximo_servicio <= DATE_ADD(CURDATE(), INTERVAL 7 DAY) THEN 'Proximo'
            ELSE 'Programado' END AS estado_alerta
FROM detalle_servicio ds
JOIN ordenes_trabajo o ON o.id_orden = ds.id_orden
JOIN vehiculos v ON v.id_vehiculo = o.id_vehiculo
LEFT JOIN clientes c ON c.id_cliente = v.id_cliente
JOIN servicios s ON s.id_servicio = ds.id_servicio
WHERE ds.estado_mantenimiento = 'Realizado' AND ds.fecha_proximo_servicio IS NOT NULL
AND NOT EXISTS (
    SELECT 1 FROM detalle_servicio nuevo
    JOIN ordenes_trabajo otra ON otra.id_orden = nuevo.id_orden
    WHERE otra.id_vehiculo = o.id_vehiculo AND nuevo.id_servicio = ds.id_servicio
      AND nuevo.estado_mantenimiento = 'Realizado'
      AND (nuevo.fecha_realizado > ds.fecha_realizado OR
          (nuevo.fecha_realizado = ds.fecha_realizado AND nuevo.id_detalle_servicio > ds.id_detalle_servicio))
);
