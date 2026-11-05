# Plan de aseguramiento de calidad (SQA)

Proyecto: Taller Mec?nico. Curso: Aseguramiento de la Calidad del Software. Revisi?n: 4 de noviembre de 2026.

## Prop?sito y alcance

El objetivo es revisar los cambios de una aplicaci?n existente antes de aceptarlos. Se comprueban datos de clientes, kilometraje, mantenimiento, ?rdenes, inventario e historial. Tambi?n se revisan algunas acciones de las pantallas con datos simulados.

Se mantuvo Electron, JavaScript y MySQL porque el sistema viene de un proyecto anterior. El enunciado permite esa opci?n. No se incluyen pruebas de carga ni un despliegue en la nube. Las pruebas de pantalla no reemplazan una revisi?n manual de la aplicaci?n abierta.

## Referencias y reglas de trabajo

Se tom? como referencia el modelo de calidad ISO/IEC 25010:2023 para ordenar los aspectos de funcionamiento, confiabilidad, seguridad y facilidad de mantenimiento. Este trabajo es una aplicaci?n acad?mica de esas ideas; no es una certificaci?n. La referencia oficial est? en [ISO](https://www.iso.org/standard/78176.html).

Las reglas del proyecto son mantener las validaciones en funciones que se puedan probar, usar consultas con par?metros, explicar los cambios con comentarios breves en espa?ol y guardar claves fuera de Git. Se usa la configuraci?n de ESLint del repositorio y una matriz con entradas y resultados para revisar las pruebas.

## Actividades

| Momento | Actividad | Evidencia |
|---|---|---|
| Antes de cambiar | Medir una versi?n anterior y anotar los problemas | L?nea base y archivos de evidencia |
| Durante el cambio | Corregir el problema y revisar el c?digo | Diferencias del commit y pruebas |
| Antes de integrar | Abrir un pull request y ejecutar los controles | Build, test, analyze y report |
| Despu?s de ejecutar | Comparar resultados y anotar pendientes | Reporte de mejora y deuda t?cnica |
| Antes de entregar | Probar el uso y preparar la demostraci?n | Manual de uso y entrega externa |

El estudiante es responsable de mantener el c?digo, revisar los resultados y describir las limitaciones. Si participa un compa?ero, puede revisar el pull request. El autor no puede aprobar su propio cambio como si fuera otra persona.

## Pruebas y herramientas

- Unitarias: validaci?n de clientes, fechas y kilometraje con Node Test Runner.
- Integraci?n simulada: operaciones y errores con conexiones de prueba, sin un servidor MySQL.
- Integraci?n real: operaciones de clientes, veh?culos, ?rdenes, repuestos e historial en una base separada.
- Regresi?n: repetir todos los casos despu?s de cambiar el proyecto.
- Revisi?n autom?tica: ESLint y la integraci?n nativa de SonarQube Cloud.
- Revisi?n manual: leer el cambio, comprobar mensajes y seguir los pasos del manual de uso.

Git conserva los cambios. GitHub Actions ejecuta el proceso y guarda los reportes. La integraci?n real se ejecuta en MySQL 8.0 temporal en GitHub y se verific? localmente con MySQL 5.1.

## Criterios de aceptaci?n

| Control | Criterio | Qu? pasa si no cumple |
|---|---|---|
| Build | Sintaxis correcta y c?digo preparado | Falla build |
| Pruebas | Cero fallos | Falla test |
| Cobertura | Al menos 60 % de l?neas de src cargadas por las pruebas | Falla test |
| ESLint | Cero errores y cero advertencias | Falla analyze |
| SonarQube | Estado success del control nativo del mismo commit | Falla analyze si rechaza o no responde |
| Reporte | Todas las etapas anteriores aprobadas | Falla report y se guardan los resultados disponibles |
| Revisi?n | Revisar el pull request antes de unirlo | La protecci?n de rama debe impedir la uni?n si falta un control |

La cobertura excluye los archivos personales de conexi?n y los tests. El resultado local actual es 77,10 %, pero no corresponde a toda la aplicaci?n: varias pantallas se ejecutan dentro de simulaciones y no aparecen en el reporte de Node. La cobertura del panel SonarQube no se importa mientras se use su an?lisis autom?tico.

## M?tricas

Se registran pruebas ejecutadas y aprobadas, errores y advertencias de ESLint, cobertura de l?neas, ramas y funciones, estado de las etapas e incidencias de SonarQube. La l?nea base se reconstruy? desde el commit `d915beb`, sin cambiar la rama de trabajo.

La comprobaci?n local m?s reciente tiene 60 pruebas aprobadas, cero fallos y ESLint sin problemas. Los valores completos y su alcance est?n en [Reporte-Mejora.md](Reporte-Mejora.md). No se inventan porcentajes ni m?tricas privadas de SonarQube que no se hayan podido consultar.

## Atenci?n de problemas

Primero se registra el archivo y el problema. Despu?s se corrige la causa, se repiten las pruebas y se vuelve a revisar el an?lisis. Los pendientes se anotan con prioridad en [deuda-tecnica.md](deuda-tecnica.md). Una alerta se marca como falso positivo solo despu?s de revisar el c?digo y explicar el motivo.

## Riesgos

| Riesgo | Medida |
|---|---|
| Cambiar datos del taller durante una prueba | Base separada cuyo nombre termina en _sqa_test; las escrituras del caso se revierten |
| Subir claves personales | Configuraci?n local excluida y variables de entorno en CI |
| Aceptar c?digo con fallos | Controles obligatorios y revisi?n mediante pull request |
| Mostrar una cobertura que no corresponde | Indicar los archivos medidos y separar la interfaz simulada |
| No recibir resultado de SonarQube | Detener analyze y revisar la conexi?n del repositorio |
| No poder proteger una rama privada por el plan | Registrar la limitaci?n y completar la configuraci?n con el propietario |
| Dar por realizadas pruebas manuales sin hacerlas | Marcar los pasos como pendientes hasta ejecutarlos |

## Seguimiento

Despu?s de cambios relevantes se ejecutan build, lint y las pruebas. Antes de la entrega se revisa la ejecuci?n remota, la protecci?n de main y las incidencias pendientes. La presentaci?n y el video quedan fuera de GitHub seg?n la forma de entrega acordada.
