# Migración local: MySQL 5.1

La instancia local usa MySQL 5.1.45. Por compatibilidad, la implementación de fase 2 se aplica en capas y no reemplaza las tablas que ya usa la aplicación Electron.

## Migración aplicada

El archivo `database/03-migracion-fase-2-mysql51.sql` agrega:

- Tabla `propietarios`.
- Tabla `servicios`.
- Tabla `detalle_servicio`, relacionada con `ordenes_trabajo`.
- Tabla `historial_kilometraje`, relacionada con `vehiculos` y, opcionalmente, con la orden.
- Tabla `recordatorios`.
- Campos opcionales en `vehiculos`: `id_propietario`, `nivel_uso`, `anio`, `fecha_registro` y `observaciones`.
- Vista `vw_mantenimientos_alerta`.

No elimina tablas, no borra registros, no cambia columnas existentes y no modifica las vistas HTML/CSS actuales. Los módulos existentes continuarán usando sus campos actuales mientras la capa de datos incorpora gradualmente las nuevas relaciones.

## Datos de prueba

`database/04-seed-mysql51.sql` crea, solo si no existen, un propietario y tres servicios de ejemplo. Puede ejecutarse más de una vez sin duplicar esos registros.

## Compatibilidad

El archivo `database/01-schema.sql` representa el modelo objetivo para MySQL 8. No debe ejecutarse sobre la instancia MySQL 5.1 existente. Para el entorno local se usa exclusivamente la migración `03` y los datos de prueba `04`.
