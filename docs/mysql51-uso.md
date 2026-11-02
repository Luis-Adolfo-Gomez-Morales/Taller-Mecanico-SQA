# Uso local con MySQL 5.1

La base local fue migrada mediante `database/03-migracion-fase-2-mysql51.sql`.

Para nuevas instalaciones con MySQL 5.1, ejecutar en este orden:

1. `database/03-migracion-fase-2-mysql51.sql`
2. `database/05-seed-mysql51.sql`

El archivo `04-seed-mysql51.sql` se conserva como primera propuesta de datos de prueba, pero MySQL 5.1 requiere `FROM DUAL` en sus sentencias `INSERT ... SELECT`. Utiliza la versión corregida `05-seed-mysql51.sql`.

La capa de acceso a las nuevas tablas está en `src/maintenance-layer.js`. Es independiente de los módulos visuales existentes y fue validada contra la base local antes de integrarse al IPC en la siguiente capa funcional.
