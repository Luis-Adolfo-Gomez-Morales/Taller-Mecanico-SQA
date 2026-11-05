# Matriz de pruebas

Revisión final: 4 de noviembre de 2026.

Hay 66 casos que no necesitan MySQL real y un caso de integración con varias operaciones sobre una base separada. La suite principal reporta 67 pruebas aprobadas. Además, se ejecuta un recorrido completo de pantallas, identificado como CP-68.

La repetición de los casos después de cada cambio sirve como revisión de regresión. Una conexión simulada no se cuenta como una prueba con MySQL real.

| ID | Caso | Tipo | Entrada | Resultado esperado | Resultado obtenido |
|---|---|---|---|---|---|
| CP-01 | Validación de campos obligatorios y longitudes | Unitaria | Campos ausentes, espacios y textos mayores al límite | Rechazar datos ausentes o fuera de los límites definidos | Aprobado; coincide con lo esperado |
| CP-02 | Validación de correo, tipo y fechas | Unitaria | Correo incorrecto, tipo desconocido y fechas imposibles | Rechazar valores incorrectos | Aprobado; coincide con lo esperado |
| CP-03 | Datos de propietarios individuales y empresas | Unitaria | Persona Individual y Empresa; nombre con espacios | Exigir datos necesarios y normalizar espacios | Aprobado; coincide con lo esperado |
| CP-04 | Contacto opcional y estado del propietario | Unitaria | Contacto vacío, nulo, largo y estado enviado desde formulario | Normalizar contacto opcional y restringir el estado desde el formulario | Aprobado; coincide con lo esperado |
| CP-05 | Registro de propietario sin vehículo | Unitaria | Cliente completo sin vehículo | Permitir el registro sin vehículo y rechazar relaciones mediante placa | Aprobado; coincide con lo esperado |
| CP-06 | Consulta del historial | Interfaz simulada | 55 registros; búsqueda y rango de fechas; conexión fallida | Filtrar y paginar resultados; limpiar datos ante errores | Aprobado; coincide con lo esperado |
| CP-07 | Vehículo sin cliente | Integración simulada | Vehículo sin cliente | Rechazar el registro | Aprobado; coincide con lo esperado |
| CP-08 | Propietario vacío | Integración simulada | Propietario vacío | Rechazar datos vacíos | Aprobado; coincide con lo esperado |
| CP-09 | Cliente inexistente | Integración simulada | Identificador de cliente que no existe | Rechazar la referencia | Aprobado; coincide con lo esperado |
| CP-10 | Nivel de uso inválido | Integración simulada | Nivel de uso no permitido | Rechazar el valor | Aprobado; coincide con lo esperado |
| CP-11 | Registro de vehículo e historial | Integración simulada | Cliente válido y kilometraje inicial | Registrar la información correctamente | Aprobado; coincide con lo esperado |
| CP-12 | Edición de vehículo inexistente | Integración simulada | ID de vehículo que no existe | Rechazar la operación | Aprobado; coincide con lo esperado |
| CP-13 | Estado inválido de orden | Integración simulada | Estado de orden desconocido | Rechazar el estado | Aprobado; coincide con lo esperado |
| CP-14 | Orden sin vehículo | Integración simulada | Orden con placa sin registrar | Rechazar la operación | Aprobado; coincide con lo esperado |
| CP-15 | Orden inexistente | Integración simulada | ID de orden inexistente | Rechazar la referencia | Aprobado; coincide con lo esperado |
| CP-16 | Mecánico inválido | Integración simulada | Mecánico inexistente | Rechazar la asignación | Aprobado; coincide con lo esperado |
| CP-17 | Selección inválida de servicios | Integración simulada | Selección de servicios inválida | Rechazar la selección | Aprobado; coincide con lo esperado |
| CP-18 | Identificador inválido de servicio | Integración simulada | Identificador de servicio inválido | Rechazar el identificador | Aprobado; coincide con lo esperado |
| CP-19 | Servicio inactivo | Integración simulada | Servicio inactivo | Rechazar el servicio | Aprobado; coincide con lo esperado |
| CP-20 | Generación de recordatorios | Integración simulada | Servicio con fecha próxima y vencida | Generar los recordatorios esperados | Aprobado; coincide con lo esperado |
| CP-21 | Dashboard sin mantenimientos | Integración simulada | Lista vacía de mantenimientos | Gestionar correctamente la ausencia de mantenimientos | Aprobado; coincide con lo esperado |
| CP-22 | Dashboard con servicio vencido | Integración simulada | Servicio con fecha anterior a hoy | Identificar el mantenimiento vencido | Aprobado; coincide con lo esperado |
| CP-23 | Días restantes según calendario local | Unitaria | Hoy, fecha futura y fecha pasada | Identificar fechas actuales, futuras y vencidas | Aprobado; coincide con lo esperado |
| CP-24 | Límites de estados y urgencia | Unitaria | Fechas y kilómetros cercanos al límite | Respetar límites y priorizar la referencia más urgente | Aprobado; coincide con lo esperado |
| CP-25 | Kilometraje válido | Unitaria | Número positivo | Aceptar el valor | Aprobado; coincide con lo esperado |
| CP-26 | Kilometraje cero | Unitaria | Cero | Aceptar cero | Aprobado; coincide con lo esperado |
| CP-27 | Redondeo de kilometraje | Unitaria | Número con más de dos decimales | Redondear a dos decimales | Aprobado; coincide con lo esperado |
| CP-28 | Kilometraje negativo | Unitaria | Número negativo | Rechazar el valor | Aprobado; coincide con lo esperado |
| CP-29 | Kilometraje vacío | Unitaria | Cadena vacía | Rechazar el valor | Aprobado; coincide con lo esperado |
| CP-30 | Kilometraje no numérico | Unitaria | Texto que no es un número | Rechazar el valor | Aprobado; coincide con lo esperado |
| CP-31 | Kilometraje infinito | Unitaria | Infinity | Rechazar el valor | Aprobado; coincide con lo esperado |
| CP-32 | Próxima fecha con uso normal | Unitaria | Fecha base, 100 días y uso Normal | Calcular la fecha correspondiente | Aprobado; coincide con lo esperado |
| CP-33 | Próxima fecha con uso bajo | Unitaria | Fecha base, 100 días y uso Bajo | Calcular la fecha correspondiente | Aprobado; coincide con lo esperado |
| CP-34 | Próxima fecha con uso alto | Unitaria | Fecha base, 100 días y uso Alto | Calcular la fecha correspondiente | Aprobado; coincide con lo esperado |
| CP-35 | Nivel de uso inválido | Unitaria | Uso desconocido | Rechazar el valor | Aprobado; coincide con lo esperado |
| CP-36 | Fecha inválida | Unitaria | Fecha imposible | Rechazar la fecha | Aprobado; coincide con lo esperado |
| CP-37 | Periodicidad de cero días | Unitaria | Intervalo de cero días | No calcular una próxima fecha | Aprobado; coincide con lo esperado |
| CP-38 | Kilometraje menor al registrado | Integración simulada | Kilometraje inferior al guardado | Rechazar sin modificar MySQL | Aprobado; coincide con lo esperado |
| CP-39 | Actualización de kilometraje | Integración simulada | Kilometraje superior al guardado | Actualizar y registrar historial | Aprobado; coincide con lo esperado |
| CP-40 | Error de MySQL | Integración simulada | Error de consulta simulado | Ejecutar rollback | Aprobado; coincide con lo esperado |
| CP-41 | Consulta de vehículos | Integración simulada | Lista vacía, fallo y recuperación de vehículos | Manejar resultados vacíos, fallos y recuperación sin datos ficticios | Aprobado; coincide con lo esperado |
| CP-42 | Consulta de pilotos | Integración simulada | Lista vacía, fallo y recuperación de clientes | Manejar resultados vacíos, fallos y recuperación sin datos ficticios | Aprobado; coincide con lo esperado |
| CP-43 | Consulta de órdenes de trabajo | Integración simulada | Lista vacía, fallo y recuperación de órdenes | Manejar resultados vacíos, fallos y recuperación sin datos ficticios | Aprobado; coincide con lo esperado |
| CP-44 | Consulta de repuestos | Integración simulada | Lista vacía, fallo y recuperación de repuestos | Manejar resultados vacíos, fallos y recuperación sin datos ficticios | Aprobado; coincide con lo esperado |
| CP-45 | Consulta y edición de clientes | Interfaz simulada | Cliente en consulta y edición | Ocultar o conservar la opción de agregar vehículo según el contexto | Aprobado; coincide con lo esperado |
| CP-46 | Inventario en órdenes | Interfaz simulada | Repuesto existente y referencia no encontrada | Utilizar existencias actuales y conservar referencias válidas | Aprobado; coincide con lo esperado |
| CP-47 | Edición del estado | Interfaz simulada | Editar vehículo; cancelar y confirmar estado | Mostrar el estado solo en edición y respetar cancelación o confirmación | Aprobado; coincide con lo esperado |
| CP-48 | Búsqueda de vehículos | Interfaz simulada | Placa, nombre y modelo con espacios | Alternar placa, nombre y modelo conservando espacios | Aprobado; coincide con lo esperado |
| CP-49 | Indicadores de órdenes | Interfaz simulada | Mes y año; inventario actual | Filtrar por mes y año de creación | Aprobado; coincide con lo esperado |
| CP-50 | Búsqueda de órdenes | Interfaz simulada | Placa, cliente, número y mecánico | Buscar por placa, cliente, número y mecánico | Aprobado; coincide con lo esperado |
| CP-51 | Autocompletado por placa | Interfaz simulada | Placa existente y campos manuales | Completar vehículo y cliente sin modificar campos manuales | Aprobado; coincide con lo esperado |
| CP-52 | Campos automáticos y pinchazo | Interfaz simulada | Orden existente y casilla de pinchazo | Restringir campos automáticos y permitir la opción de pinchazo en edición | Aprobado; coincide con lo esperado |
| CP-53 | Selección y búsqueda de servicios | Interfaz simulada | Palabras de un servicio y selección única | Permitir selección única y búsqueda por palabras | Aprobado; coincide con lo esperado |
| CP-54 | Acciones sobre estado de órdenes | Interfaz simulada | Orden abierta; cancelar y avanzar | Cancelar o avanzar sin perder información | Aprobado; coincide con lo esperado |
| CP-55 | Confirmaciones y avisos | Interfaz simulada | Mensajes en cola, Escape y texto con etiquetas | Permitir cancelación, ordenar avisos y mostrar texto seguro | Aprobado; coincide con lo esperado |
| CP-56 | Usuario creador | Integración simulada | Sesión válida y creadoPor alterado desde formulario | Obtener el creador desde la sesión de la ventana | Aprobado; coincide con lo esperado |
| CP-57 | Formatos de correo | Unitaria | Correo con subdominio, dos @, espacios y dominio incompleto | Aceptar formatos válidos y rechazar los demás | Aprobado |
| CP-58 | Conexiones separadas de base de datos | Integración simulada | Dos conexiones con mecánicos diferentes | Cada instancia consulta su propia conexión | Aprobado |
| CP-59 | Rechazo de controles de calidad | Integración de herramientas | Código con variable sin uso y cobertura requerida de 100 % en un ejemplo | ESLint y cobertura devuelven error | Aprobado; ambos controles rechazaron el ejemplo |
| CP-60 | Operaciones reales en MySQL | Integración real | Cliente, vehículos, mecánico, órdenes, servicios y repuestos ficticios | Guardar, consultar, editar, validar restricciones y revertir cambios | Aprobado: MySQL 5.1 local y 8.0 en GitHub |
| CP-61 | Claves con hash y sal diferente | Unitaria o integración simulada | Una clave correcta y otra incorrecta | Guardar hashes distintos y aceptar solo la clave correcta | Aprobado |
| CP-62 | Datos y hashes incompletos | Unitaria o integración simulada | Claves vacías, largas y formatos no permitidos | Rechazar los valores incorrectos | Aprobado |
| CP-63 | Actualización de una cuenta antigua | Unitaria o integración simulada | Usuario y clave anterior correctos | Permitir entrar y guardar el hash sin cambiar la clave | Aprobado |
| CP-64 | Clave incorrecta en cuenta antigua | Unitaria o integración simulada | Usuario válido y clave incorrecta | Rechazar sin modificar la cuenta | Aprobado |
| CP-65 | Cuenta con hash existente | Unitaria o integración simulada | Usuario con clave ya protegida | Permitir entrar sin generar otro hash ni enviarlo a la pantalla | Aprobado |
| CP-66 | Cambio simultáneo de clave | Unitaria o integración simulada | La cuenta cambia mientras se intenta actualizar | No sobrescribir el cambio de la cuenta | Aprobado |
| CP-67 | Usuario inexistente o datos vacíos | Unitaria o integración simulada | Usuario desconocido, usuario vacío o clave vacía | Rechazar el inicio de sesión | Aprobado |
| CP-68 | Recorrido completo de pantallas | E2E con MySQL real | Cliente, vehículo, mecánico, repuesto y orden ficticios | Completar la atención, conservar el historial y descontar inventario una sola vez | Aprobado en Windows y Linux |

## Cómo se ejecutan

- `npm test`: 66 casos, sin CP-60 ni CP-68.
- `npm run test:coverage`: 67 casos, incluyendo CP-60, con la base preparada y `RUN_DB_TESTS=1`.
- `npm run test:e2e`: CP-68, un recorrido completo de la aplicación.

El orden mostrado por Node.js puede ser distinto al de los identificadores de esta tabla.

| Resultado final | Valor |
|---|---:|
| Suite principal aprobada | 67 de 67 |
| Recorrido de pantallas aprobado | 1 de 1 |
| Fallos | 0 |
| Casos omitidos | 0 |

Las salidas están en [pruebas-finales.txt](evidencias/pruebas-finales.txt) y [recorrido-pantallas.txt](evidencias/recorrido-pantallas.txt). Las imágenes del recorrido están en [evidencias](evidencias/README.md).
