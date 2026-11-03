# Informe de Métricas de Calidad del Software

**Proyecto:** Sistema de Gestión de Taller Mecánico  
**Asignatura:** Calidad de Software  
**Versión:** 1.0  
**Herramientas:** Node.js, ESLint, GitHub Actions y Git

## 1. Introducción

Este informe presenta los indicadores utilizados para evaluar la calidad del Sistema de Gestión de Taller Mecánico.

Se documentan los resultados de las pruebas automatizadas, el análisis estático del código, la cobertura de pruebas y la integración continua, incluyendo las mejoras realizadas durante el proceso de corrección.

## 2. Objetivo

Medir y comparar los resultados de calidad del software antes y después de las correcciones, utilizando evidencias verificables obtenidas durante el desarrollo y las ejecuciones automatizadas.

## 3. Métricas de análisis estático

Se utilizó ESLint para identificar advertencias y problemas relacionados con las reglas de programación configuradas.

### 3.1 Comparación de resultados

| Indicador | Resultado inicial | Resultado final |
|---|---:|---:|
| Errores ESLint | 0 | 0 |
| Advertencias ESLint | 19 | 0 |
| Problemas totales | 19 | 0 |
| Reducción de advertencias | — | 100% |

Durante las correcciones se atendieron principalmente comparaciones con operadores no estrictos y declaraciones de variables o funciones que no se utilizaban.

Las advertencias disminuyeron progresivamente hasta obtener una ejecución de ESLint sin problemas.

### 3.2 Interpretación

La eliminación de las 19 advertencias representa una mejora verificable en el cumplimiento de las reglas de análisis estático.

Sin embargo, un resultado sin advertencias no garantiza por sí solo la ausencia de defectos funcionales.

## 4. Métricas de pruebas automatizadas

Los resultados finales registrados fueron:

| Indicador | Resultado |
|---|---:|
| Pruebas ejecutadas | 56 |
| Pruebas aprobadas | 56 |
| Pruebas fallidas | 0 |
| Pruebas omitidas | 0 |
| Porcentaje de aprobación | 100% |

El porcentaje de aprobación se calculó mediante:

**Porcentaje de aprobación = (56 / 56) × 100 = 100%**

No se dispone de una medición inicial comparable que permita determinar cuánto aumentó el porcentaje de aprobación durante las correcciones.

## 5. Métricas de cobertura de código

Los resultados finales se obtuvieron del reporte de GitHub Actions correspondiente a la ejecución número 13.

### 5.1 Cobertura global reportada

| Tipo de cobertura | Resultado |
|---|---:|
| Líneas | 98.07% |
| Ramas | 84.87% |
| Funciones | 86.98% |

**Nota:** Estos valores corresponden al conjunto instrumentado por la herramienta e incluyen archivos de pruebas. No deben interpretarse como cobertura exclusiva de todo el código productivo.

### 5.2 Cobertura de componentes principales

| Componente | Líneas | Ramas | Funciones |
|---|---:|---:|---:|
| `maintenance-rules.js` | 94.33% | 66.85% | 86.36% |
| `cliente-validation.js` | 97.87% | 87.10% | 100.00% |

Estos resultados permiten identificar tanto los componentes ampliamente ejercitados por las pruebas como las ramas que todavía pueden mejorarse.

### 5.3 Comparación inicial y final

No se cuenta con una medición inicial de cobertura equivalente y verificable para realizar una comparación porcentual directa.

Por lo tanto, los porcentajes anteriores se registran como línea base final de la ejecución analizada, sin atribuir un incremento no comprobado.

## 6. Resultados de integración continua

La ejecución número 13 del pipeline de GitHub Actions presentó los siguientes resultados:

| Indicador | Resultado |
|---|---|
| Workflow | Calidad de Software – Taller Mecánico |
| Commit | `0faa7a4` |
| Rama | `main` |
| Estado | Exitoso |
| Duración total | 32 segundos |
| Análisis ESLint | Aprobado |
| Pruebas automatizadas | Aprobadas |
| Verificación de cobertura mínima | Aprobada |

La ejecución demuestra que los controles configurados pudieron completarse correctamente en el entorno automatizado de GitHub.

## 7. Comparación general antes y después

| Indicador | Antes | Después |
|---|---|---|
| Advertencias ESLint | 19 | 0 |
| Errores ESLint | 0 | 0 |
| Pruebas aprobadas | Sin medición inicial comparable | 56 de 56 |
| Cobertura de líneas | Sin medición inicial comparable | 98.07% |
| Cobertura de ramas | Sin medición inicial comparable | 84.87% |
| Cobertura de funciones | Sin medición inicial comparable | 86.98% |
| Pipeline CI/CD | Sin comparación inicial documentada | Ejecución exitosa |

La mejora cuantificable con evidencia inicial y final corresponde a la reducción del 100% de las advertencias ESLint.

Los demás indicadores demuestran el estado final de calidad alcanzado, pero no permiten calcular una variación histórica sin datos iniciales equivalentes.

## 8. Evidencias

Los resultados se respaldan mediante:

- Capturas de las ejecuciones locales de pruebas automatizadas.
- Capturas de los resultados de ESLint.
- Reporte de cobertura de GitHub Actions.
- Ejecución exitosa número 13 del pipeline.
- Historial de commits con las correcciones realizadas.

## 9. Análisis de resultados

Los resultados muestran que el proyecto dispone de un proceso automatizado para verificar las pruebas, aplicar análisis estático y comprobar un umbral mínimo de cobertura.

La eliminación de advertencias ESLint evidencia una mejora en el cumplimiento de las reglas de calidad establecidas.

Asimismo, la aprobación de las 56 pruebas y la ejecución satisfactoria del pipeline respaldan la estabilidad de los comportamientos evaluados.

Entre las oportunidades de mejora se encuentra ampliar la cobertura de ramas del módulo de mantenimiento y revisar periódicamente las dependencias y herramientas del proyecto.

## 10. Conclusiones

1. Se redujeron las advertencias ESLint de 19 a 0, alcanzando una mejora del 100% en este indicador.
2. Las 56 pruebas automatizadas finalizaron satisfactoriamente, sin fallos.
3. La cobertura global reportada alcanzó 98.07% de líneas, 84.87% de ramas y 86.98% de funciones, considerando los archivos instrumentados.
4. GitHub Actions permitió verificar automáticamente los controles configurados después de publicar los cambios.
5. Las métricas obtenidas constituyen evidencia verificable del estado de calidad del proyecto y una referencia para futuras mejoras.