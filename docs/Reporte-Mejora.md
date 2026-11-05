# Reporte de mejora

Revisión final: 4 de noviembre de 2026. El proyecto parte de una aplicación existente del taller. La versión inicial medida fue `d915beb` y el código final comprobado corresponde a `7a600ff`.

## Antes y después

| Medida | Antes | Después |
|---|---:|---:|
| Errores ESLint | 0 | 0 |
| Advertencias ESLint | 23 | 0 |
| Pruebas que no requieren MySQL real | 56 | 66 |
| Fallos de esas pruebas | 0 | 0 |
| Prueba de integración real dentro del pipeline | No estaba incluida | Aprobada |
| Recorrido de pantallas dentro del pipeline | No estaba incluido | Aprobado |

Las advertencias se redujeron de 23 a 0. La reducción fue del 100 %. También se agregaron pruebas de contraseñas, operaciones reales con MySQL y un recorrido de la aplicación.

La cobertura inicial de 94,70 % correspondía solamente a dos archivos: reglas de mantenimiento y validación de clientes. No se compara directamente con el porcentaje final, porque la revisión final incluye más archivos.

## Resultados de las pruebas

| Medida | Resultado final en GitHub |
|---|---:|
| Pruebas con integración real | 67 |
| Aprobadas | 67 |
| Fallidas | 0 |
| Recorrido completo de pantallas | 1 aprobado |
| Cobertura de líneas medida por Node.js | 80,27 % |
| Cobertura de ramas medida por Node.js | 81,21 % |
| Cobertura de funciones medida por Node.js | 79,31 % |
| Mínimo de líneas exigido en el pipeline | 60 % |

La cobertura de Node.js corresponde al código de `src` cargado por las pruebas. No incluye los propios tests ni los archivos personales de conexión. El recorrido de pantallas se ejecuta aparte y no se suma a ese porcentaje.

## Resultados de SonarQube

El reporte de cobertura se envía desde GitHub Actions. El panel del código nuevo mostró:

| Medida de código nuevo | Resultado |
|---|---:|
| Cobertura | 85,81 % |
| Incidencias nuevas | 0 |
| Incidencias aceptadas | 0 |
| Duplicación | 0,0 % |
| Puntos de seguridad por revisar | 0 |
| Control de calidad | Passed |

El porcentaje del panel se ve con dos decimales. El resumen de GitHub lo redondea a 85,8 %.

También se guardó la pantalla de código general:

| Medida de todo el proyecto | Resultado |
|---|---:|
| Cobertura general | 42,8 % |
| Duplicación general | 7,4 % |
| Incidencias abiertas de seguridad | 0 |
| Incidencias abiertas de confiabilidad | 0 |
| Incidencias abiertas de mantenimiento | 0 |

Estos porcentajes no contradicen el 80,27 % de Node.js ni el 85,81 % del código nuevo. Cada revisión considera un conjunto distinto de código. La cobertura general y la duplicación del proyecto todavía se pueden mejorar. El control actual de SonarQube evalúa la cobertura y la duplicación de los cambios nuevos.

En el análisis aparece un aviso sobre la falta de un diccionario para algunas reglas SQL. El análisis terminó y el control aprobó, pero esas reglas no se pudieron comprobar por completo.

## Correcciones realizadas

Se corrigieron comparaciones, variables sin uso, promesas sin manejar y etiquetas de formularios. Se simplificó la validación de correo y placas. Las dos condiciones SQL señaladas se escribieron usando la longitud del texto y se comprobó su resultado con MySQL.

Las contraseñas nuevas ahora se guardan con hash. Las cuentas antiguas se actualizan después de un inicio de sesión correcto. Electron y las dependencias se actualizaron; la última revisión de dependencias terminó sin vulnerabilidades reportadas.

El pipeline quedó dividido en build, test, analyze y report. Se protegió `main` y se integraron los cambios mediante pull requests.

## Comprobación del rechazo

La [ejecución 41948184764](https://github.com/Luis-Adolfo-Gomez-Morales/Taller-Mecanico-SQA/actions/runs/41948184764) fue rechazada porque había una clave escrita en la configuración de la base temporal. Se corrigió guardándola como secreto de GitHub. Esto permitió comprobar que un control fallido sí detiene el proceso.

También existe una prueba que verifica el rechazo de una advertencia de ESLint y de un ejemplo que no alcanza la cobertura solicitada.

## Evidencia final

La [ejecución 41952310669](https://github.com/Luis-Adolfo-Gomez-Morales/Taller-Mecanico-SQA/actions/runs/41952310669), número 27, aprobó las cuatro etapas y el análisis de SonarQube. Las capturas y las salidas de pruebas se guardaron en [evidencias](evidencias/README.md), para conservarlas aunque los archivos de Actions venzan.

## Conclusión

El proyecto ahora tiene un proceso repetible para revisar los cambios antes de integrarlos. Las pruebas y las capturas permiten explicar los resultados con ejemplos reales. Como siguiente mejora conviene ampliar la cobertura general y reducir el código repetido, manteniendo las revisiones que ya funcionan.
