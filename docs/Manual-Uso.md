# Manual de uso

## Entrar

Abrir la aplicaci?n con `npm start` y escribir el usuario y la contrase?a asignados. Si no abre, revisar la conexi?n siguiendo el README. Las cuentas de demostraci?n solo se usan con la base de pruebas.

## Clientes

Abrir Clientes y elegir registrar. Completar nombre, identificaci?n, tel?fono, correo, licencia, fecha de vencimiento y direcci?n. Elegir persona individual o empresa. El contacto de empresa es opcional. Guardar y comprobar que el cliente aparezca en el listado.

El estado se calcula con la fecha de la licencia. Si falta informaci?n de un registro antiguo, completarla antes de guardar. Se puede buscar por nombre, licencia o tel?fono y filtrar por estado.

## Veh?culos

Desde la ficha del cliente elegir agregar veh?culo. Completar placa, propietario, tipo, marca, modelo y kilometraje. El cliente queda seleccionado desde su ficha. El texto del propietario puede ser distinto al nombre del cliente vinculado.

Al cancelar un veh?culo no se borra el cliente que ya fue guardado. Para modificar un veh?culo, buscarlo y elegir editar. No se permite reducir el kilometraje. El cambio de estado pide confirmaci?n.

## Mec?nicos y repuestos

Registrar un mec?nico con sus datos para poder asignarlo a una orden. Revisar el listado despu?s de guardar.

En Repuestos registrar c?digo, nombre y datos de inventario. Usar el formulario de movimientos para entradas o salidas. La existencia cambia al guardar una operaci?n v?lida; una consulta fallida no se presenta como si hubiera cero unidades.

## ?rdenes de trabajo

Crear una orden y seleccionar la placa. La aplicaci?n completa los datos relacionados del veh?culo. Elegir mec?nico, fecha y hora de ingreso, kilometraje, tipo de trabajo y servicios. Agregar repuestos si corresponde.

Guardar la orden como Abierta o En proceso mientras se atiende. Para finalizarla, completar fecha de salida y los datos necesarios. Los repuestos utilizados se descuentan del inventario y no deben descontarse otra vez por guardar sin cambios.

## Historial y mantenimiento

En Historial se pueden buscar registros y filtrar fechas. El panel de inicio muestra servicios pr?ximos y atrasados. Los avisos son internos; la aplicaci?n no env?a correos ni mensajes de WhatsApp. Los recordatorios se actualizan al abrir el sistema y durante su uso.

Si una consulta falla, revisar el mensaje y la conexi?n. No registrar otra vez el mismo dato sin comprobar antes si el guardado anterior se complet?.

## Recorrido para revisar la aplicaci?n

En una base de prueba: entrar, registrar cliente, agregar veh?culo, registrar mec?nico, crear orden, intentar un kilometraje menor, guardar una orden v?lida, consultar historial y revisar el panel. La lista detallada est? en [verificacion-funcional.md](verificacion-funcional.md). Los resultados de pruebas autom?ticas no reemplazan este recorrido visual.
