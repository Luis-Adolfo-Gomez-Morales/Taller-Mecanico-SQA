# Plan de Aseguramiento de Calidad del Software (SQA)

**Proyecto:** Sistema de Gestión de Taller Mecánico  
**Asignatura:** Calidad de Software  
**Versión del documento:** 1.0  
**Estado:** En ejecución y seguimiento

## 1. Introducción

El presente Plan de Aseguramiento de Calidad del Software (SQA) establece las actividades, herramientas, criterios y mecanismos de verificación utilizados para evaluar la calidad del Sistema de Gestión de Taller Mecánico.

El sistema es una aplicación de escritorio desarrollada con Electron, JavaScript y MySQL, orientada a la administración de clientes, vehículos, órdenes de trabajo, servicios y mantenimientos preventivos.

El plan busca identificar defectos, verificar el funcionamiento de las reglas de negocio, promover buenas prácticas de programación y automatizar controles de calidad durante el desarrollo.

## 2. Objetivo general

Establecer y aplicar un proceso de aseguramiento de calidad que permita verificar el funcionamiento, la mantenibilidad y la confiabilidad del Sistema de Gestión de Taller Mecánico mediante pruebas automatizadas, análisis estático y un pipeline de integración continua.

## 3. Objetivos específicos

- Definir criterios de calidad para los componentes del sistema.
- Implementar pruebas automatizadas para validar reglas de negocio y operaciones principales.
- Detectar problemas de programación mediante ESLint.
- Medir la cobertura de código alcanzada por las pruebas.
- Automatizar las verificaciones mediante GitHub Actions.
- Registrar resultados y evidencias para facilitar la evaluación y mejora continua.

## 4. Alcance del plan

El aseguramiento de calidad comprende los siguientes componentes y procesos:

- Validación de información de clientes y vehículos.
- Reglas de mantenimiento preventivo.
- Control y actualización del kilometraje.
- Registro e historial de operaciones.
- Validaciones relacionadas con órdenes de trabajo.
- Pruebas de integración utilizando conexiones simuladas cuando corresponde.
- Análisis estático del código JavaScript.
- Ejecución automatizada de pruebas y controles de cobertura.

El plan se concentra en los componentes incluidos en las pruebas y verificaciones configuradas. No representa una certificación de que todas las funcionalidades de la aplicación estén libres de defectos.

## 5. Herramientas utilizadas

| Herramienta | Aplicación en el proyecto |
|---|---|
| Visual Studio Code | Edición, revisión y mantenimiento del código |
| Git | Control de versiones y seguimiento de modificaciones |
| GitHub | Almacenamiento del repositorio |
| GitHub Actions | Automatización de verificaciones de calidad |
| Node.js | Ejecución de pruebas y herramientas |
| Node Test Runner | Pruebas automatizadas |
| ESLint | Análisis estático del código |
| Electron | Plataforma de la aplicación de escritorio |
| MySQL | Gestión de información persistente |

## 6. Estrategia de aseguramiento de calidad

### 6.1 Pruebas automatizadas

Se utilizan pruebas automatizadas para comprobar comportamientos esperados del sistema y detectar regresiones después de realizar modificaciones.

Las pruebas consideran validaciones, reglas de mantenimiento, operaciones con datos simulados y comportamientos específicos de los módulos evaluados.

**Resultado verificado:**

- Pruebas ejecutadas: 56.
- Pruebas aprobadas: 56.
- Pruebas fallidas: 0.
- Pruebas omitidas: 0.

### 6.2 Análisis estático

Se utiliza ESLint para revisar el código JavaScript e identificar problemas relacionados con las reglas de programación configuradas.

Durante la revisión se detectaron advertencias relacionadas con comparaciones y elementos declarados que no se utilizaban.

Posteriormente, se realizaron correcciones y se ejecutó nuevamente el análisis.

**Resultado final local:**

- Errores: 0.
- Advertencias: 0.

El análisis también fue ejecutado exitosamente dentro de GitHub Actions.

### 6.3 Cobertura de pruebas

La cobertura permite identificar qué proporción del código instrumentado fue ejecutada durante las pruebas.

Los resultados registrados en GitHub Actions, ejecución número 13, fueron:

| Indicador | Resultado |
|---|---:|
| Cobertura global de líneas | 98.07% |
| Cobertura global de ramas | 84.87% |
| Cobertura global de funciones | 86.98% |
| Líneas de `maintenance-rules.js` | 94.33% |
| Líneas de `cliente-validation.js` | 97.87% |

**Consideración:** La cobertura global reportada incluye archivos de pruebas. Por ello, debe interpretarse como cobertura del conjunto instrumentado y no como cobertura exclusiva de todo el código productivo.

La verificación de cobertura mínima configurada en el pipeline terminó satisfactoriamente.

### 6.4 Integración continua

Se utiliza GitHub Actions para ejecutar automáticamente controles de calidad cuando se realizan cambios en el repositorio, de acuerdo con los eventos configurados en el workflow.

El proceso incluye:

1. Descarga del código fuente.
2. Configuración de Node.js.
3. Instalación de dependencias.
4. Análisis estático con ESLint.
5. Ejecución de pruebas y medición de cobertura.
6. Verificación del umbral mínimo de cobertura.

**Evidencia:** Ejecución número 13, commit `0faa7a4`, finalizada correctamente.

## 7. Criterios de aceptación de calidad

| Criterio | Condición de aceptación |
|---|---|
| Pruebas automatizadas | Ninguna prueba fallida |
| Análisis estático | Ningún error ni advertencia de ESLint |
| Cobertura | Cumplimiento del umbral mínimo configurado |
| Integración continua | Finalización exitosa del pipeline |
| Control de versiones | Cambios registrados mediante commits |
| Evidencias | Resultados verificables de las ejecuciones |

## 8. Gestión de defectos y mejoras

Los problemas detectados durante las verificaciones deben registrarse y atenderse según su impacto.

El procedimiento consiste en:

1. Identificar el defecto o advertencia.
2. Determinar el archivo y componente afectado.
3. Analizar la causa.
4. Aplicar una corrección controlada.
5. Ejecutar nuevamente las pruebas automatizadas.
6. Repetir el análisis estático.
7. Registrar el cambio mediante Git.
8. Verificar los resultados en GitHub Actions.

Este procedimiento permite reducir el riesgo de introducir nuevos defectos durante las correcciones.

## 9. Indicadores de seguimiento

Los indicadores utilizados para evaluar los resultados son:

- Número de pruebas ejecutadas.
- Porcentaje de pruebas aprobadas.
- Número de pruebas fallidas.
- Número de errores y advertencias de ESLint.
- Cobertura de líneas, ramas y funciones.
- Estado de las ejecuciones del pipeline.
- Cambios registrados en el repositorio.

Estos indicadores permiten comparar resultados entre diferentes momentos del desarrollo.

## 10. Riesgos y acciones preventivas

| Riesgo | Acción preventiva |
|---|---|
| Introducción de defectos al modificar código | Ejecutar pruebas de regresión |
| Validaciones incorrectas | Mantener pruebas de reglas de negocio |
| Problemas de mantenibilidad | Aplicar análisis estático |
| Cobertura insuficiente | Revisar casos no cubiertos |
| Fallos de integración | Ejecutar el pipeline después de los cambios |
| Dependencias desactualizadas | Revisar advertencias y planificar actualizaciones compatibles |

## 11. Evidencias del aseguramiento de calidad

Las evidencias del proyecto incluyen:

- Resultados de las pruebas automatizadas.
- Resultados del análisis ESLint.
- Reportes de cobertura.
- Historial de ejecuciones de GitHub Actions.
- Commits asociados con las correcciones.

La ejecución número 13 de GitHub Actions demuestra la finalización exitosa de los controles configurados.

## 12. Seguimiento y mejora continua

El aseguramiento de calidad debe mantenerse durante las siguientes modificaciones del proyecto.

Cada cambio relevante deberá verificarse mediante pruebas, análisis estático y ejecución del pipeline.

Los resultados obtenidos servirán como referencia para evaluar mejoras, identificar problemas pendientes y respaldar las conclusiones del proyecto académico.