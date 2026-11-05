# Problemas pendientes y mejoras

Revisi?n: 4 de noviembre de 2026. La prioridad indica qu? conviene resolver primero, no que ya se haya realizado.

| ID | Pendiente | Prioridad | Pr?ximo paso | Estado |
|---|---|---|---|---|
| DT-01 | main sin protecci?n obligatoria | Alta | Resolver el acceso al ajuste y exigir PR y controles | Pendiente; GitHub exige Pro o repositorio p?blico |
| DT-02 | Comparaci?n de contrase?as en texto en authenticateUser | Alta | Migrar a hashes de contrase?a y actualizar usuarios con un procedimiento controlado | Pendiente; no se cambian claves reales en esta entrega |
| DT-03 | Dos alertas SQL conocidas parecen falsos positivos | Media | Revisar el c?digo se?alado en SonarQube y explicar antes de cerrarlas | Pendiente en panel privado |
| DT-04 | Cobertura del dashboard no importada por el modo autom?tico | Media | Configurar an?lisis desde CI con secreto privado si se necesita mostrar cobertura en SonarQube | LCOV disponible en Actions |
| DT-05 | Parte de la interfaz solo tiene pruebas simuladas | Media | Agregar revisi?n visual y, como mejora opcional, pruebas E2E | Pendiente |
| DT-06 | MySQL 5.1 y Electron 28 son versiones antiguas | Media | Planificar actualizaci?n y repetir las pruebas antes de cambiar el entorno local | Compatibilidad conservada |
| DT-07 | Instalador y despliegue autom?tico | Baja | Preparar empaquetado si el alcance se ampl?a | Opcional seg?n el enunciado |

Se resolvieron en esta entrega: falta de cuatro etapas, ausencia de reportes, configuraci?n personal obligatoria en CI y prueba real de MySQL fuera del pipeline. Cada pendiente se cierra solo despu?s de tener evidencia.
