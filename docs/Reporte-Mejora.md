# Reporte de mejora

Comparaci?n realizada el 4 de noviembre de 2026. La versi?n inicial es el commit `d915beb`. La versi?n final corresponde a los cambios de esta entrega y a las evidencias locales guardadas en esta carpeta.

## Comparaci?n con el mismo alcance

| Medida | Antes | Despu?s |
|---|---:|---:|
| Errores ESLint | 0 | 0 |
| Advertencias ESLint | 23 | 0 |
| Pruebas sin MySQL real | 56 | 59 |
| Fallos de esas pruebas | 0 | 0 |
| Cobertura de l?neas: reglas y validaci?n | 94,70 % | 95,03 % |
| Cobertura de ramas: reglas y validaci?n | 68,00 % | 70,64 % |
| Cobertura de funciones: reglas y validaci?n | 87,50 % | 88,00 % |

Se eliminaron las 23 advertencias: `(23 - 0) / 23 ? 100 = 100 %`. La cobertura de l?neas de los dos archivos comparables aument? 0,33 puntos porcentuales. Como el c?digo cambi?, tambi?n cambi? la cantidad de l?neas; el porcentaje sirve como referencia, no como una garant?a de ausencia de errores.

## Prueba completa con MySQL

Se agreg? una base vac?a de pruebas y se ejecut? la integraci?n real. Esta revisi?n usa m?s archivos que la comparaci?n anterior, por eso los porcentajes se muestran por separado.

| Medida actual | Resultado local |
|---|---:|
| Pruebas totales con integraci?n real | 60 |
| Pruebas aprobadas | 60 |
| Fallos | 0 |
| Cobertura de l?neas del c?digo cargado de src | 77,10 % |
| Cobertura de ramas | 81,46 % |
| Cobertura de funciones | 77,38 % |
| M?nimo de l?neas solicitado | 60 % |

La cobertura incluye configuraci?n sin claves, base de datos, capa de mantenimiento, reglas y validaci?n de clientes. Excluye los tests y los archivos de conexi?n personal. No cubre toda la interfaz: las pantallas simuladas no aparecen completas en la medici?n de Node.

## Cambios realizados

Se corrigieron comparaciones, c?digo sin uso, promesas sin manejar y etiquetas de formularios. Se simplific? la revisi?n de correos y placas. La prueba de MySQL dej? de ejecutar c?digo con `vm` y ahora recibe una conexi?n de prueba mediante `createDatabase`.

El pipeline tiene cuatro etapas: build prepara el c?digo; test ejecuta las pruebas y exige cobertura; analyze revisa ESLint y espera el resultado nativo de SonarQube; report guarda los resultados y falla si una etapa anterior no aprob?. Se a?adi? un caso que comprueba que una advertencia y una cobertura insuficiente realmente sean rechazadas.

Al ampliar la medici?n se detect? que las pruebas sin MySQL solo cubr?an cerca de 36 % del c?digo cargado. Se resolvi? ejecutando la integraci?n real, no reduciendo el m?nimo ni quitando la base de datos de la medici?n.

## SonarQube

Las capturas mostraron 26 incidencias en un listado filtrado y despu?s 4. En el ?ltimo commit publicado antes de esta entrega (`d383c98`), la API de GitHub inform? `SonarCloud Code Analysis: success`. El panel es privado: no se pudieron consultar desde la API p?blica sus cifras actuales de bugs, duplicaci?n, cobertura o problemas de mantenimiento.

Despu?s de mover la clave al secreto, el control del pull request sobre `f9085eb` inform? Quality Gate passed: 0 incidencias nuevas, 0 puntos de seguridad por revisar y 0,0 % de duplicaci?n del c?digo nuevo. Mostr? 0,0 % de cobertura en SonarQube porque no se importa el reporte en el modo autom?tico; ese valor no sustituye el 77,10 % medido en las pruebas. Estas cifras describen c?digo nuevo del pull request, no toda la rama principal.

Las dos alertas SQL conocidas parecen falsos positivos. Deben revisarse en el panel y registrar la explicaci?n antes de cerrarlas. No se afirma que ya est?n cerradas. La integraci?n nativa actual no importa LCOV; para mostrar cobertura en SonarQube se debe migrar a an?lisis desde CI, configurar un token privado y desactivar el an?lisis autom?tico.

## Prueba del rechazo en GitHub

En la primera ejecuci?n del pull request 1, build y test aprobaron. SonarQube rechaz? una clave escrita para la base temporal. Analyze y report fallaron por ese rechazo, como estaba previsto. Se corrigi? guardando una clave aleatoria en CI_MYSQL_PASSWORD, un secreto cifrado del repositorio. La ejecuci?n inicial es [41948184764](https://github.com/Luis-Adolfo-Gomez-Morales/Taller-Mecanico-SQA/actions/runs/41948184764).

## Resultado remoto y protecci?n

La [ejecuci?n 41948701790](https://github.com/Luis-Adolfo-Gomez-Morales/Taller-Mecanico-SQA/actions/runs/41948701790), del commit `db2ec90`, aprob? build, test, analyze y report. Esta ejecuci?n prueba la integraci?n con MySQL 8.0 y la comprobaci?n nativa de SonarQube en el pull request 1. Los reportes quedaron publicados como archivos descargables.

Despu?s de la autorizaci?n del propietario, el repositorio se hizo p?blico y se activ? la protecci?n de main. Se exigen pull requests y los cinco controles de calidad, tambi?n para el administrador. No se cambiaron ni se publicaron la configuraci?n personal, respaldos, presentaci?n, PDF o video.

## Evidencias y l?mites

Los resultados locales est?n en `docs/evidencias/`. GitHub Actions conserva los reportes de cada nueva ejecuci?n durante 14 d?as. La evidencia remota anterior est? separada de la local: no se dio por aprobado GitHub solo porque las pruebas locales terminaron bien.

## Lo aprendido

Separar las etapas ayuda a saber d?nde ocurri? un fallo. Tambi?n fue necesario diferenciar una conexi?n simulada de una prueba real y comparar coberturas con el mismo alcance. Mantener estas diferencias claras hace que los resultados sean m?s ?tiles para explicar el trabajo.
