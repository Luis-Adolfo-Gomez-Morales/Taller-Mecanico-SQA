# Manual de uso

## Entrar

Abrir la aplicación con `npm start` y escribir el usuario y la contraseña asignados. Si no abre, revisar la conexión siguiendo el README. Las cuentas de demostración solo se usan con la base de pruebas.

## Clientes

Abrir Clientes y elegir registrar. Completar nombre, identificación, teléfono, correo, licencia, fecha de vencimiento y dirección. Elegir persona individual o empresa. El contacto de empresa es opcional. Guardar y comprobar que el cliente aparezca en el listado.

El estado se calcula con la fecha de la licencia. Si falta información de un registro antiguo, completarla antes de guardar. Se puede buscar por nombre, licencia o teléfono y filtrar por estado.

## Vehículos

Desde la ficha del cliente elegir agregar vehículo. Completar placa, propietario, tipo, marca, modelo y kilometraje. El cliente queda seleccionado desde su ficha. El texto del propietario puede ser distinto al nombre del cliente vinculado.

Al cancelar un vehículo no se borra el cliente que ya fue guardado. Para modificar un vehículo, buscarlo y elegir editar. No se permite reducir el kilometraje. El cambio de estado pide confirmación.

## Mecánicos y repuestos

Registrar un mecánico con sus datos para poder asignarlo a una orden. Revisar el listado después de guardar.

En Repuestos registrar código, nombre y datos de inventario. Usar el formulario de movimientos para entradas o salidas. La existencia cambia al guardar una operación válida; una consulta fallida no se presenta como si hubiera cero unidades.

## Órdenes de trabajo

Crear una orden y seleccionar la placa. La aplicación completa los datos relacionados del vehículo. Elegir mecánico, fecha y hora de ingreso, kilometraje, tipo de trabajo y servicios. Agregar repuestos si corresponde.

Guardar la orden como Abierta o En proceso mientras se atiende. Para finalizarla, completar fecha de salida y los datos necesarios. Los repuestos utilizados se descuentan del inventario y no deben descontarse otra vez por guardar sin cambios.

## Historial y mantenimiento

En Historial se pueden buscar registros y filtrar fechas. El panel de inicio muestra servicios próximos y atrasados. Los avisos son internos; la aplicación no envía correos ni mensajes de WhatsApp. Los recordatorios se actualizan al abrir el sistema y durante su uso.

Si una consulta falla, revisar el mensaje y la conexión. No registrar otra vez el mismo dato sin comprobar antes si el guardado anterior se completó.

## Recorrido para revisar la aplicación

En una base de prueba: entrar, registrar cliente, agregar vehículo, registrar mecánico, crear orden, intentar un kilometraje menor, guardar una orden válida, consultar historial y revisar el panel. La lista detallada está en [verificacion-funcional.md](verificacion-funcional.md). Este recorrido ya se comprobó con las pantallas reales; sus capturas están en evidencias/README.md.
