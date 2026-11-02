# Modelo relacional actual

## Clientes y compatibilidad

`clientes` es la tabla física que representa a las personas o empresas atendidas por el taller. Sustituye la tabla física `pilotos`, porque la interfaz la presenta como Clientes.

Para no interrumpir el código existente durante la transición, se conservan dos vistas actualizables:

- `pilotos`: expone los nombres de columna que todavía usa la interfaz existente.
- `propietarios`: mantiene la compatibilidad con la capa de mantenimiento creada en fase 2.

Las vistas no duplican datos: ambas leen y escriben sobre `clientes`.

## Relaciones

```text
clientes 1 ─── N vehiculos 1 ─── N ordenes_trabajo
ordenes_trabajo 1 ─── N detalle_servicio N ─── 1 servicios
vehiculos 1 ─── N historial_kilometraje
detalle_servicio 1 ─── N recordatorios
ordenes_trabajo 1 ─── N orden_repuestos N ─── 1 inventario_repuestos
inventario_repuestos 1 ─── N repuestos_movimientos

usuarios N ─── N roles N ─── N permisos N ─── 1 modulos
```

## Integridad aplicada

- `vehiculos.id_cliente` referencia `clientes.id_cliente`.
- `ordenes_trabajo.id_vehiculo` referencia `vehiculos.id_vehiculo`.
- `repuestos_movimientos.id_repuesto` referencia `inventario_repuestos.id_repuesto`.
- Las relaciones ya existentes de órdenes, detalles, repuestos, usuarios, roles y permisos se conservaron.
- Las columnas de texto heredadas (`propietario`, `piloto`, `placa`) se mantienen como historial visual y compatibilidad de interfaz; las claves foráneas son la relación operativa.

## Migraciones ejecutadas localmente

1. `03-migracion-fase-2-mysql51.sql`
2. `07-normalizar-clientes-con-compatibilidad-mysql51.sql`
3. `08-vista-compatibilidad-propietarios-mysql51.sql`

Antes de normalizar se generó y verificó una copia temporal de `pilotos`; fue eliminada después de confirmar que los registros, las relaciones y las consultas funcionaban correctamente.
