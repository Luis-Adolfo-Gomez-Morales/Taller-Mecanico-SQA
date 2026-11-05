# L?nea base de calidad

Revisi?n realizada el 4 de noviembre de 2026 sobre el commit `d915beb`, anterior a las correcciones de ESLint.

## C?mo se obtuvo

Se extrajo una copia del commit en una carpeta temporal y se ejecutaron ESLint y las pruebas con Node.js 22.22.3. No se cambi? la rama principal ni se ejecutaron escrituras en la base del taller. Se us? la versi?n de ESLint instalada actualmente para repetir la medici?n del c?digo anterior; esto es una reconstrucci?n, no una captura tomada el d?a de ese commit.

## Resultados

| Medida | Resultado inicial |
|---|---:|
| Errores de ESLint | 0 |
| Advertencias de ESLint | 23 |
| Pruebas autom?ticas | 56 |
| Pruebas aprobadas | 56 |
| Fallos | 0 |
| Cobertura de l?neas de reglas y validaci?n | 94,70 % |
| Cobertura de ramas de esos dos archivos | 68,00 % |
| Cobertura de funciones de esos dos archivos | 87,50 % |

Los archivos medidos para la cobertura inicial son `src/maintenance-rules.js` y `src/scripts/cliente-validation.js`. Se eligieron porque est?n presentes y se prueban en las dos versiones. No es una medida de toda la aplicaci?n ni de una prueba contra MySQL real.

En una documentaci?n anterior se mencionaban 19 advertencias. Al repetir la medici?n de un commit concreto se obtuvieron 23; se usa este valor porque ahora tiene un registro que se puede comprobar.

## Problemas encontrados

Hab?a comparaciones poco claras y variables o funciones que no se usaban. Tambi?n faltaban etapas separadas, archivos de reporte y una prueba real de MySQL dentro del pipeline.

Las capturas aportadas durante la revisi?n mostraron 26 incidencias de SonarQube en un listado filtrado. Otra captura mostr? 4 pendientes despu?s de las primeras correcciones. Estos n?meros describen las capturas, no el total actual de todos los filtros ni una consulta nueva al panel privado.

## Evidencia

- [Salida inicial de ESLint](evidencias/linea-base-eslint.txt).
- [Pruebas y cobertura inicial](evidencias/linea-base-pruebas.txt).
- Commit: `d915beb`.

Para repetirlo se puede crear una copia de ese commit, instalar sus dependencias y ejecutar `npx eslint .` y `node --test --experimental-test-coverage --test-coverage-include=src/maintenance-rules.js --test-coverage-include=src/scripts/cliente-validation.js tests/*.test.js`. La versi?n de Node y la configuraci?n de cobertura deben mantenerse iguales al comparar.
