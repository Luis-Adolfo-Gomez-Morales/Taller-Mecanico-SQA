# Matriz de pruebas

Revisi?n: 4 de noviembre de 2026. Se conservan los IDs de la primera matriz y se agregan los casos nuevos al final.

Hay 59 pruebas que no requieren MySQL real y una prueba de integraci?n con varias operaciones en una base separada: 60 casos reportados en total. La repetici?n completa sirve como revisi?n de regresi?n. Los tipos indican c?mo est? escrito cada caso; una conexi?n simulada no se presenta como MySQL real.

| ID | Caso | Tipo | Entrada | Resultado esperado | Resultado obtenido |
|---|---|---|---|---|---|
| CP-01 | Validación de campos obligatorios y longitudes | Unitaria | Campos ausentes, espacios y textos mayores al l?mite | Rechazar datos ausentes o fuera de los límites definidos | Aprobado; coincide con lo esperado |
| CP-02 | Validación de correo, estados, fechas y asignaciones | Unitaria | Correo incorrecto, tipo desconocido y fechas imposibles | Rechazar valores incorrectos | Aprobado; coincide con lo esperado |
| CP-03 | Datos de propietarios individuales y empresas | Unitaria | Persona Individual y Empresa; nombre con espacios | Exigir datos necesarios y normalizar espacios | Aprobado; coincide con lo esperado |
| CP-04 | Contacto opcional y estado del propietario | Unitaria | Contacto vac?o, nulo, largo y estado enviado desde formulario | Normalizar contacto opcional y restringir el estado desde el formulario | Aprobado; coincide con lo esperado |
| CP-05 | Registro de propietario sin vehículo | Unitaria | Cliente completo sin veh?culo | Permitir el registro sin vehículo y rechazar relaciones mediante placa | Aprobado; coincide con lo esperado |
| CP-06 | Consulta del historial | Interfaz simulada | 55 registros; b?squeda y rango de fechas; conexi?n fallida | Filtrar y paginar resultados; limpiar datos ante errores | Aprobado; coincide con lo esperado |
| CP-07 | Vehículo sin cliente | Integraci?n simulada | Veh?culo sin cliente | Rechazar el registro | Aprobado; coincide con lo esperado |
| CP-08 | Propietario vacío | Integraci?n simulada | Propietario vac?o | Rechazar datos vacíos | Aprobado; coincide con lo esperado |
| CP-09 | Cliente inexistente | Integraci?n simulada | Identificador de cliente que no existe | Rechazar la referencia | Aprobado; coincide con lo esperado |
| CP-10 | Nivel de uso inválido | Integraci?n simulada | Nivel de uso no permitido | Rechazar el valor | Aprobado; coincide con lo esperado |
| CP-11 | Registro de vehículo e historial | Integraci?n simulada | Cliente v?lido y kilometraje inicial | Registrar la información correctamente | Aprobado; coincide con lo esperado |
| CP-12 | Edición de vehículo inexistente | Integraci?n simulada | ID de veh?culo que no existe | Rechazar la operación | Aprobado; coincide con lo esperado |
| CP-13 | Estado inválido de orden | Integraci?n simulada | Estado de orden desconocido | Rechazar el estado | Aprobado; coincide con lo esperado |
| CP-14 | Orden sin vehículo | Integraci?n simulada | Orden con placa sin registrar | Rechazar la operación | Aprobado; coincide con lo esperado |
| CP-15 | Orden inexistente | Integraci?n simulada | ID de orden inexistente | Rechazar la referencia | Aprobado; coincide con lo esperado |
| CP-16 | Mecánico inválido | Integraci?n simulada | Mec?nico inexistente | Rechazar la asignación | Aprobado; coincide con lo esperado |
| CP-17 | Selección inválida de servicios | Integraci?n simulada | Selecci?n de servicios inv?lida | Rechazar la selección | Aprobado; coincide con lo esperado |
| CP-18 | Identificador inválido de servicio | Integraci?n simulada | Identificador de servicio inv?lido | Rechazar el identificador | Aprobado; coincide con lo esperado |
| CP-19 | Servicio inactivo | Integraci?n simulada | Servicio inactivo | Rechazar el servicio | Aprobado; coincide con lo esperado |
| CP-20 | Generación de recordatorios | Integraci?n simulada | Servicio con fecha pr?xima y vencida | Generar los recordatorios esperados | Aprobado; coincide con lo esperado |
| CP-21 | Dashboard sin mantenimientos | Integraci?n simulada | Lista vac?a de mantenimientos | Gestionar correctamente la ausencia de mantenimientos | Aprobado; coincide con lo esperado |
| CP-22 | Dashboard con servicio vencido | Integraci?n simulada | Servicio con fecha anterior a hoy | Identificar el mantenimiento vencido | Aprobado; coincide con lo esperado |
| CP-23 | Días restantes según calendario local | Unitaria | Hoy, fecha futura y fecha pasada | Identificar fechas actuales, futuras y vencidas | Aprobado; coincide con lo esperado |
| CP-24 | Límites de estados y urgencia | Unitaria | Fechas y kil?metros cercanos al l?mite | Respetar límites y priorizar la referencia más urgente | Aprobado; coincide con lo esperado |
| CP-25 | Kilometraje válido | Unitaria | N?mero positivo | Aceptar el valor | Aprobado; coincide con lo esperado |
| CP-26 | Kilometraje cero | Unitaria | Cero | Aceptar cero | Aprobado; coincide con lo esperado |
| CP-27 | Redondeo de kilometraje | Unitaria | N?mero con m?s de dos decimales | Redondear a dos decimales | Aprobado; coincide con lo esperado |
| CP-28 | Kilometraje negativo | Unitaria | N?mero negativo | Rechazar el valor | Aprobado; coincide con lo esperado |
| CP-29 | Kilometraje vacío | Unitaria | Cadena vac?a | Rechazar el valor | Aprobado; coincide con lo esperado |
| CP-30 | Kilometraje no numérico | Unitaria | Texto que no es un n?mero | Rechazar el valor | Aprobado; coincide con lo esperado |
| CP-31 | Kilometraje infinito | Unitaria | Infinity | Rechazar el valor | Aprobado; coincide con lo esperado |
| CP-32 | Próxima fecha con uso normal | Unitaria | Fecha base, 100 d?as y uso Normal | Calcular la fecha correspondiente | Aprobado; coincide con lo esperado |
| CP-33 | Próxima fecha con uso bajo | Unitaria | Fecha base, 100 d?as y uso Bajo | Calcular la fecha correspondiente | Aprobado; coincide con lo esperado |
| CP-34 | Próxima fecha con uso alto | Unitaria | Fecha base, 100 d?as y uso Alto | Calcular la fecha correspondiente | Aprobado; coincide con lo esperado |
| CP-35 | Nivel de uso inválido | Unitaria | Uso desconocido | Rechazar el valor | Aprobado; coincide con lo esperado |
| CP-36 | Fecha inválida | Unitaria | Fecha imposible | Rechazar la fecha | Aprobado; coincide con lo esperado |
| CP-37 | Periodicidad de cero días | Unitaria | Intervalo de cero d?as | No calcular una próxima fecha | Aprobado; coincide con lo esperado |
| CP-38 | Kilometraje menor al registrado | Integraci?n simulada | Kilometraje inferior al guardado | Rechazar sin modificar MySQL | Aprobado; coincide con lo esperado |
| CP-39 | Actualización de kilometraje | Integraci?n simulada | Kilometraje superior al guardado | Actualizar y registrar historial | Aprobado; coincide con lo esperado |
| CP-40 | Error de MySQL | Integraci?n simulada | Error de consulta simulado | Ejecutar rollback | Aprobado; coincide con lo esperado |
| CP-41 | Consulta de vehículos | Integraci?n simulada | Lista vac?a, fallo y recuperaci?n de veh?culos | Manejar resultados vacíos, fallos y recuperación sin datos ficticios | Aprobado; coincide con lo esperado |
| CP-42 | Consulta de pilotos | Integraci?n simulada | Lista vac?a, fallo y recuperaci?n de clientes | Manejar resultados vacíos, fallos y recuperación sin datos ficticios | Aprobado; coincide con lo esperado |
| CP-43 | Consulta de órdenes de trabajo | Integraci?n simulada | Lista vac?a, fallo y recuperaci?n de ?rdenes | Manejar resultados vacíos, fallos y recuperación sin datos ficticios | Aprobado; coincide con lo esperado |
| CP-44 | Consulta de repuestos | Integraci?n simulada | Lista vac?a, fallo y recuperaci?n de repuestos | Manejar resultados vacíos, fallos y recuperación sin datos ficticios | Aprobado; coincide con lo esperado |
| CP-45 | Consulta y edición de clientes | Interfaz simulada | Cliente en consulta y edici?n | Ocultar o conservar la opción de agregar vehículo según el contexto | Aprobado; coincide con lo esperado |
| CP-46 | Inventario en órdenes | Interfaz simulada | Repuesto existente y referencia no encontrada | Utilizar existencias actuales y conservar referencias válidas | Aprobado; coincide con lo esperado |
| CP-47 | Edición del estado | Interfaz simulada | Editar veh?culo; cancelar y confirmar estado | Mostrar el estado solo en edición y respetar cancelación o confirmación | Aprobado; coincide con lo esperado |
| CP-48 | Búsqueda de vehículos | Interfaz simulada | Placa, nombre y modelo con espacios | Alternar placa, nombre y modelo conservando espacios | Aprobado; coincide con lo esperado |
| CP-49 | Indicadores de órdenes | Interfaz simulada | Mes y a?o; inventario actual | Filtrar por mes y año de creación | Aprobado; coincide con lo esperado |
| CP-50 | Búsqueda de órdenes | Interfaz simulada | Placa, cliente, n?mero y mec?nico | Buscar por placa, cliente, número y mecánico | Aprobado; coincide con lo esperado |
| CP-51 | Autocompletado por placa | Interfaz simulada | Placa existente y campos manuales | Completar vehículo y cliente sin modificar campos manuales | Aprobado; coincide con lo esperado |
| CP-52 | Campos automáticos y pinchazo | Interfaz simulada | Orden existente y casilla de pinchazo | Restringir campos automáticos y permitir la opción de pinchazo en edición | Aprobado; coincide con lo esperado |
| CP-53 | Selección y búsqueda de servicios | Interfaz simulada | Palabras de un servicio y selecci?n ?nica | Permitir selección única y búsqueda por palabras | Aprobado; coincide con lo esperado |
| CP-54 | Acciones sobre estado de órdenes | Interfaz simulada | Orden abierta; cancelar y avanzar | Cancelar o avanzar sin perder información | Aprobado; coincide con lo esperado |
| CP-55 | Confirmaciones y avisos | Interfaz simulada | Mensajes en cola, Escape y texto con etiquetas | Permitir cancelación, ordenar avisos y mostrar texto seguro | Aprobado; coincide con lo esperado |
| CP-56 | Usuario creador | Integraci?n simulada | Sesi?n v?lida y creadoPor alterado desde formulario | Obtener el creador desde la sesión de la ventana | Aprobado; coincide con lo esperado |
| CP-57 | Formatos de correo | Unitaria | Correo con subdominio, dos @, espacios y dominio incompleto | Aceptar formatos v?lidos y rechazar los dem?s | Aprobado |
| CP-58 | Conexiones separadas de base de datos | Integraci?n simulada | Dos conexiones con mec?nicos diferentes | Cada instancia consulta su propia conexi?n | Aprobado |
| CP-59 | Rechazo de controles de calidad | Integraci?n de herramientas | C?digo con variable sin uso y cobertura requerida de 100 % en un ejemplo | ESLint y cobertura devuelven error | Aprobado; ambos controles rechazaron el ejemplo |
| CP-60 | Operaciones reales en MySQL | Integraci?n real | Cliente, veh?culos, mec?nico, ?rdenes, servicios y repuestos ficticios | Guardar, consultar, editar, validar restricciones y revertir cambios | Aprobado en base separada MySQL 5.1 |

## Ejecuci?n y resultados

`npm test` ejecuta CP-01 a CP-59. Para ejecutar tambi?n CP-60 se prepara la base siguiendo el README y se ejecuta `npm run test:coverage` con RUN_DB_TESTS=1 y DB_NAME terminado en _sqa_test. El orden que muestra Node puede variar respecto a los IDs de la tabla.

| Medida | Resultado local |
|---|---:|
| Casos con MySQL | 60 |
| Aprobados | 60 |
| Fallidos | 0 |
| Omitidos | 0 |
| Aprobaci?n | 100 % |

La evidencia est? en [evidencias/pruebas-finales.txt](evidencias/pruebas-finales.txt). Las revisiones visuales pendientes se describen en [verificacion-funcional.md](verificacion-funcional.md) y no se suman como pruebas autom?ticas aprobadas.
