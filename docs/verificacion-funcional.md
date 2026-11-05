# Revisi?n manual de la aplicaci?n

Esta lista sirve para abrir el sistema y revisar su funcionamiento visible. No se marca como aprobada solo porque los tests autom?ticos terminen bien. Usar una base separada y datos ficticios.

| Paso | Acci?n | Qu? debe ocurrir | Estado de esta revisi?n |
|---|---|---|---|
| 1 | Entrar con usuario v?lido e inv?lido | Permitir el v?lido y mostrar un mensaje con el inv?lido | Pendiente de recorrido visual |
| 2 | Guardar un cliente completo y otro incompleto | Guardar el completo y se?alar lo que falta en el otro | Pendiente de recorrido visual |
| 3 | Agregar dos veh?culos desde un cliente | Conservar ambos vinculados al cliente | Pendiente de recorrido visual |
| 4 | Cancelar el registro de un veh?culo | Conservar el cliente guardado | Pendiente de recorrido visual |
| 5 | Buscar y editar un veh?culo | Mostrar y conservar los datos correctos | Pendiente de recorrido visual |
| 6 | Intentar reducir kilometraje | Rechazar sin cambiar la lectura anterior | Pendiente de recorrido visual |
| 7 | Registrar mec?nico y crear orden | Permitir asignar el mec?nico a la atenci?n | Pendiente de recorrido visual |
| 8 | Agregar repuestos y guardar dos veces | Descontar solo la cantidad utilizada | Pendiente de recorrido visual |
| 9 | Finalizar una orden con servicio preventivo | Guardar salida y pr?xima fecha | Pendiente de recorrido visual |
| 10 | Consultar historial y buscar por placa | Mostrar las atenciones anteriores | Pendiente de recorrido visual |
| 11 | Consultar panel y volver a abrirlo | Mostrar los avisos sin duplicarlos | Pendiente de recorrido visual |
| 12 | Cortar la conexi?n y consultar | Mostrar error, sin inventar registros ni existencias | Pendiente de recorrido visual |

Los recordatorios son internos. Se revisan al abrir la aplicaci?n, cada hora y al consultar el panel. El estado del cliente depende del vencimiento de su licencia. El propietario escrito del veh?culo y el cliente vinculado pueden ser distintos.

La integraci?n autom?tica ya comprueba varias de estas reglas con MySQL real. La evidencia local est? en `docs/evidencias/pruebas-finales.txt`. El recorrido visual queda pendiente hasta que se haga en la aplicaci?n.
