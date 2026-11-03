# Matriz de Pruebas Automatizadas

**Proyecto:** Sistema de Gestión de Taller Mecánico  
**Asignatura:** Calidad de Software  
**Versión:** 1.0  
**Total de casos:** 56  
**Resultado general:** 56 aprobados, 0 fallidos

## 1. Objetivo

Documentar los casos de prueba automatizados del Sistema de Gestión de Taller Mecánico, identificando los comportamientos verificados y sus resultados, con el propósito de respaldar las actividades de aseguramiento de calidad.

## 2. Matriz de casos de prueba

La matriz se organiza por áreas funcionales. Cada caso corresponde a una prueba reportada por la ejecución de `npm test`.

### 2.1 Validaciones de propietarios y clientes

| ID | Caso de prueba | Resultado esperado | Estado |
|---|---|---|---|
| CP-01 | Validación de campos obligatorios y longitudes | Rechazar datos ausentes o fuera de los límites definidos | Aprobado |
| CP-02 | Validación de correo, estados, fechas y asignaciones | Rechazar valores incorrectos | Aprobado |
| CP-03 | Datos de propietarios individuales y empresas | Exigir datos necesarios y normalizar espacios | Aprobado |
| CP-04 | Contacto opcional y estado del propietario | Normalizar contacto opcional y restringir el estado desde el formulario | Aprobado |
| CP-05 | Registro de propietario sin vehículo | Permitir el registro sin vehículo y rechazar relaciones mediante placa | Aprobado |

### 2.2 Historial

| ID | Caso de prueba | Resultado esperado | Estado |
|---|---|---|---|
| CP-06 | Consulta del historial | Filtrar y paginar resultados; limpiar datos ante errores | Aprobado |

### 2.3 Cobertura de operaciones y reglas de negocio

| ID | Caso de prueba | Resultado esperado | Estado |
|---|---|---|---|
| CP-07 | Vehículo sin cliente | Rechazar el registro | Aprobado |
| CP-08 | Propietario vacío | Rechazar datos vacíos | Aprobado |
| CP-09 | Cliente inexistente | Rechazar la referencia | Aprobado |
| CP-10 | Nivel de uso inválido | Rechazar el valor | Aprobado |
| CP-11 | Registro de vehículo e historial | Registrar la información correctamente | Aprobado |
| CP-12 | Edición de vehículo inexistente | Rechazar la operación | Aprobado |
| CP-13 | Estado inválido de orden | Rechazar el estado | Aprobado |
| CP-14 | Orden sin vehículo | Rechazar la operación | Aprobado |
| CP-15 | Orden inexistente | Rechazar la referencia | Aprobado |
| CP-16 | Mecánico inválido | Rechazar la asignación | Aprobado |
| CP-17 | Selección inválida de servicios | Rechazar la selección | Aprobado |
| CP-18 | Identificador inválido de servicio | Rechazar el identificador | Aprobado |
| CP-19 | Servicio inactivo | Rechazar el servicio | Aprobado |
| CP-20 | Generación de recordatorios | Generar los recordatorios esperados | Aprobado |
| CP-21 | Dashboard sin mantenimientos | Gestionar correctamente la ausencia de mantenimientos | Aprobado |
| CP-22 | Dashboard con servicio vencido | Identificar el mantenimiento vencido | Aprobado |

### 2.4 Fechas y estados de mantenimiento

| ID | Caso de prueba | Resultado esperado | Estado |
|---|---|---|---|
| CP-23 | Días restantes según calendario local | Identificar fechas actuales, futuras y vencidas | Aprobado |
| CP-24 | Límites de estados y urgencia | Respetar límites y priorizar la referencia más urgente | Aprobado |

### 2.5 Validación de kilometraje

| ID | Caso de prueba | Resultado esperado | Estado |
|---|---|---|---|
| CP-25 | Kilometraje válido | Aceptar el valor | Aprobado |
| CP-26 | Kilometraje cero | Aceptar cero | Aprobado |
| CP-27 | Redondeo de kilometraje | Redondear a dos decimales | Aprobado |
| CP-28 | Kilometraje negativo | Rechazar el valor | Aprobado |
| CP-29 | Kilometraje vacío | Rechazar el valor | Aprobado |
| CP-30 | Kilometraje no numérico | Rechazar el valor | Aprobado |
| CP-31 | Kilometraje infinito | Rechazar el valor | Aprobado |

### 2.6 Cálculo del próximo mantenimiento

| ID | Caso de prueba | Resultado esperado | Estado |
|---|---|---|---|
| CP-32 | Próxima fecha con uso normal | Calcular la fecha correspondiente | Aprobado |
| CP-33 | Próxima fecha con uso bajo | Calcular la fecha correspondiente | Aprobado |
| CP-34 | Próxima fecha con uso alto | Calcular la fecha correspondiente | Aprobado |
| CP-35 | Nivel de uso inválido | Rechazar el valor | Aprobado |
| CP-36 | Fecha inválida | Rechazar la fecha | Aprobado |
| CP-37 | Periodicidad de cero días | No calcular una próxima fecha | Aprobado |

### 2.7 Integración y operaciones de kilometraje

| ID | Caso de prueba | Resultado esperado | Estado |
|---|---|---|---|
| CP-38 | Kilometraje menor al registrado | Rechazar sin modificar MySQL | Aprobado |
| CP-39 | Actualización de kilometraje | Actualizar y registrar historial | Aprobado |
| CP-40 | Error de MySQL | Ejecutar rollback | Aprobado |

### 2.8 Recuperación de consultas por módulo

| ID | Caso de prueba | Resultado esperado | Estado |
|---|---|---|---|
| CP-41 | Consulta de vehículos | Manejar resultados vacíos, fallos y recuperación sin datos ficticios | Aprobado |
| CP-42 | Consulta de pilotos | Manejar resultados vacíos, fallos y recuperación sin datos ficticios | Aprobado |
| CP-43 | Consulta de órdenes de trabajo | Manejar resultados vacíos, fallos y recuperación sin datos ficticios | Aprobado |
| CP-44 | Consulta de repuestos | Manejar resultados vacíos, fallos y recuperación sin datos ficticios | Aprobado |

### 2.9 Interfaz, búsquedas y órdenes de trabajo

| ID | Caso de prueba | Resultado esperado | Estado |
|---|---|---|---|
| CP-45 | Consulta y edición de clientes | Ocultar o conservar la opción de agregar vehículo según el contexto | Aprobado |
| CP-46 | Inventario en órdenes | Utilizar existencias actuales y conservar referencias válidas | Aprobado |
| CP-47 | Edición del estado | Mostrar el estado solo en edición y respetar cancelación o confirmación | Aprobado |
| CP-48 | Búsqueda de vehículos | Alternar placa, nombre y modelo conservando espacios | Aprobado |
| CP-49 | Indicadores de órdenes | Filtrar por mes y año de creación | Aprobado |
| CP-50 | Búsqueda de órdenes | Buscar por placa, cliente, número y mecánico | Aprobado |
| CP-51 | Autocompletado por placa | Completar vehículo y cliente sin modificar campos manuales | Aprobado |
| CP-52 | Campos automáticos y pinchazo | Restringir campos automáticos y permitir la opción de pinchazo en edición | Aprobado |
| CP-53 | Selección y búsqueda de servicios | Permitir selección única y búsqueda por palabras | Aprobado |
| CP-54 | Acciones sobre estado de órdenes | Cancelar o avanzar sin perder información | Aprobado |
| CP-55 | Confirmaciones y avisos | Permitir cancelación, ordenar avisos y mostrar texto seguro | Aprobado |
| CP-56 | Usuario creador | Obtener el creador desde la sesión de la ventana | Aprobado |

## 3. Resultados de ejecución

| Indicador | Valor |
|---|---:|
| Casos de prueba | 56 |
| Aprobados | 56 |
| Fallidos | 0 |
| Cancelados | 0 |
| Omitidos | 0 |
| Porcentaje de aprobación | 100% |
| Duración total | 395.3347 ms |

## 4. Tipos de verificación

Los casos documentados abarcan validaciones de datos, reglas de negocio, comportamiento de interfaces, operaciones con bases de datos simuladas y comprobaciones de integración.

La clasificación específica de cada prueba como unitaria, de integración o de regresión deberá sustentarse en su implementación. La ejecución completa de la suite después de realizar cambios permite utilizarla como mecanismo de detección de regresiones.

## 5. Evidencias

Los resultados se obtuvieron mediante el comando `npm test` ejecutado desde la raíz del proyecto.

El pipeline de GitHub Actions también contiene una etapa de ejecución de pruebas automatizadas y medición de cobertura.

## 6. Conclusión

La ejecución de los 56 casos finalizó sin fallos, lo que respalda el comportamiento de los componentes evaluados bajo las condiciones contempladas en las pruebas.

La matriz proporciona trazabilidad entre los casos ejecutados y sus resultados, y servirá como referencia para futuras modificaciones y ampliaciones del sistema.