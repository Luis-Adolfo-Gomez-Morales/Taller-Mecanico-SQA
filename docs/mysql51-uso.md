# Uso con MySQL 5.1

El proyecto conserva compatibilidad con una instalación anterior de MySQL 5.1.45. El pipeline utiliza una base temporal MySQL 8.0 para comprobar las operaciones en GitHub.

Para comenzar desde una base vacía se recomienda seguir el README y usar `npm run db:test:prepare` con un nombre terminado en `_sqa_test`. El esquema actual está en `tests/fixtures/schema.sql` y sus datos de inicio son ficticios.

Para una instalación antigua, revisar el [registro de migraciones](mysql51-migracion.md). No basta con ejecutar solamente la migración 03: la aplicación actual también incluye los cambios posteriores de clientes, vehículos, mecánicos y repuestos.

La configuración personal se copia desde `src/db-config.example.js` y queda fuera de Git. No publicar respaldos ni datos reales en el repositorio.
