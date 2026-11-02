# Taller Mecánico

Aplicacion de escritorio hecha con Electron para gestionar informacion de un taller mecanico.

## Estructura

- `main.js`: proceso principal de Electron y registro de handlers IPC.
- `src/preload.js`: puente seguro entre las vistas y Electron.
- `src/database.js`: acceso a datos y consultas de MySQL.
- `src/db-config.js`: configuracion local de conexion a MySQL.
- `src/views/`: pantallas HTML de la aplicacion.
- `src/scripts/`: JavaScript de interfaz.
- `src/scripts/modules/`: logica especifica de cada modulo.
- `src/styles/`: estilos globales.
- `src/styles/modules/`: estilos especificos de cada modulo.

## Comandos

```powershell
npm install
npm start
```

## Limpieza

`node_modules/` es una carpeta generada por `npm install`, por eso queda excluida en `.gitignore`.
