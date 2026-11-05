# Plan de aseguramiento de calidad

Proyecto: Taller Mecánico. Curso: Aseguramiento de la Calidad del Software. Revisión final: 4 de noviembre de 2026.

## Propósito

El objetivo fue agregar un proceso de revisión a una aplicación existente. Antes de aceptar un cambio, se comprueba que las pruebas pasen, que el código no tenga advertencias y que se cumpla la cobertura mínima.

## Alcance

Se revisan clientes, vehículos, kilometraje, órdenes, repuestos, historial, mantenimiento e inicio de sesión. Se incluyen pruebas de funciones pequeñas, pruebas con datos simulados, integración real con MySQL y un recorrido por las pantallas de Electron.

Se conservó la aplicación de escritorio del proyecto anterior. No se incluyen pruebas de carga ni un despliegue en la nube. La presentación y el video forman parte de la entrega externa.

## Referencias y reglas

Como referencia se usó el modelo de calidad [ISO/IEC 25010:2023](https://www.iso.org/standard/78176.html), principalmente para ordenar las revisiones de funcionamiento, confiabilidad, seguridad y mantenimiento. El proyecto no representa una certificación.

Las reglas de trabajo fueron usar nombres claros, comentarios cortos en español, consultas con parámetros y claves personales fuera de Git. Las contraseñas nuevas se guardan con hash. Las cuentas anteriores se actualizan cuando su dueño inicia sesión correctamente.

## Actividades y responsables

| Momento | Actividad | Resultado que se guarda |
|---|---|---|
| Antes de corregir | Revisar una versión anterior | Línea base |
| Durante los cambios | Corregir el problema y repetir las pruebas | Cambios y resultados |
| Antes de integrar | Abrir un pull request y ejecutar los controles | Revisión en GitHub |
| Al terminar | Comparar los resultados y guardar capturas | Reporte de mejora y evidencias |

El responsable del proyecto revisa los cambios y sus resultados. La revisión automática es obligatoria. Al ser un trabajo individual, no se exige la aprobación de otra cuenta.

## Herramientas y pruebas

| Herramienta | Uso |
|---|---|
| Git y GitHub | Guardar los cambios y revisar los pull requests |
| GitHub Actions | Ejecutar el proceso de calidad |
| Node Test Runner | Comprobar validaciones y operaciones |
| Playwright y Electron | Recorrer la aplicación con pantallas reales |
| ESLint | Revisar las reglas del código |
| SonarQube Cloud | Revisar problemas, duplicación y cobertura |
| MySQL | Guardar los datos y probar las operaciones reales |

Las pruebas pequeñas revisan datos y reglas concretas. La integración simulada comprueba respuestas y errores sin un servidor. La integración real usa MySQL en una base separada. El recorrido de pantallas comprueba el uso de la aplicación. Repetir estas pruebas después de un cambio permite detectar regresiones.

## Condiciones para aceptar un cambio

| Control | Condición |
|---|---|
| Build | Código preparado y sin errores de sintaxis |
| Pruebas | Cero casos fallidos |
| Cobertura de Node.js | Al menos 60 % de líneas del código medido |
| ESLint | Cero errores y cero advertencias |
| SonarQube | Quality Gate aprobado; en código nuevo, cobertura mínima de 80 % y duplicación máxima de 3 % |
| Reporte | Todas las etapas anteriores aprobadas |
| Rama principal | Pull request y controles obligatorios antes de integrar |

La regla de `main` también se aplica al administrador y bloquea el borrado y los cambios forzados de la rama.

## Resultados y métricas

La ejecución final del código tuvo 67 pruebas aprobadas y un recorrido de pantallas aprobado. ESLint terminó sin problemas. Node.js midió 80,27 % de cobertura de líneas y SonarQube mostró 85,81 % en código nuevo.

SonarQube también mide todo el proyecto: su cobertura general fue 42,8 % y la duplicación general fue 7,4 %. Se muestran por separado porque no son las mismas medidas. La comparación completa está en [Reporte-Mejora.md](Reporte-Mejora.md).

## Riesgos y atención de problemas

| Riesgo | Medida aplicada |
|---|---|
| Cambiar datos reales al probar | Usar una base separada con nombre terminado en `_sqa_test` |
| Publicar claves | Usar configuración personal excluida y secretos de GitHub |
| Aceptar un cambio con fallos | Exigir las pruebas y revisiones antes de integrar |
| Confundir porcentajes | Indicar qué código mide cada herramienta |
| No recibir el resultado de SonarQube | Detener el análisis y revisar la conexión |
| Perder el registro de un problema | Anotar la mejora y volver a comprobarla después de corregir |

Cuando se encuentra un problema, se revisa su causa, se corrige y se repiten las pruebas relacionadas. Las mejoras que todavía conviene realizar están en [deuda-tecnica.md](deuda-tecnica.md).

## Evidencias y seguimiento

Se guardaron resultados de pruebas, capturas del pipeline, capturas de SonarQube y pantallas de la aplicación. Están organizadas en [evidencias](evidencias/README.md). Para futuras modificaciones se mantiene el mismo proceso de revisión.
