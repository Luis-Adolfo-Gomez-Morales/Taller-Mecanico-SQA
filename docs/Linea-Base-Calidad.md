# Línea base de calidad

Revisión realizada el 4 de noviembre de 2026 sobre el commit `d915beb`, anterior a las correcciones de ESLint.

## Cómo se obtuvo

Se extrajo una copia del commit en una carpeta temporal y se ejecutaron ESLint y las pruebas con Node.js 22.22.3. No se cambió la rama principal ni se ejecutaron escrituras en la base del taller. Se usó la versión de ESLint instalada actualmente para repetir la medición del código anterior; esto es una reconstrucción, no una captura tomada el día de ese commit.

## Resultados

| Medida | Resultado inicial |
|---|---:|
| Errores de ESLint | 0 |
| Advertencias de ESLint | 23 |
| Pruebas automáticas | 56 |
| Pruebas aprobadas | 56 |
| Fallos | 0 |
| Cobertura de líneas de reglas y validación | 94,70 % |
| Cobertura de ramas de esos dos archivos | 68,00 % |
| Cobertura de funciones de esos dos archivos | 87,50 % |

Los archivos medidos para la cobertura inicial son `src/maintenance-rules.js` y `src/scripts/cliente-validation.js`. Se eligieron porque están presentes y se prueban en las dos versiones. No es una medida de toda la aplicación ni de una prueba contra MySQL real.

En una documentación anterior se mencionaban 19 advertencias. Al repetir la medición de un commit concreto se obtuvieron 23; se usa este valor porque ahora tiene un registro que se puede comprobar.

## Problemas encontrados

Había comparaciones poco claras y variables o funciones que no se usaban. También faltaban etapas separadas, archivos de reporte y una prueba real de MySQL dentro del pipeline.

Las capturas aportadas durante la revisión mostraron 26 incidencias de SonarQube en un listado filtrado. Otra captura mostró 4 pendientes después de las primeras correcciones. Estos números describen las capturas, no el total actual de todos los filtros ni una consulta nueva al panel privado.

## Evidencia

- [Salida inicial de ESLint](evidencias/linea-base-eslint.txt).
- [Pruebas y cobertura inicial](evidencias/linea-base-pruebas.txt).
- Commit: `d915beb`.

Para repetirlo se puede crear una copia de ese commit, instalar sus dependencias y ejecutar `npx eslint .` y `node --test --experimental-test-coverage --test-coverage-include=src/maintenance-rules.js --test-coverage-include=src/scripts/cliente-validation.js tests/*.test.js`. La versión de Node y la configuración de cobertura deben mantenerse iguales al comparar.
