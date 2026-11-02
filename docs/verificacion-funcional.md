# Verificacion funcional

La aplicacion utiliza el esquema compatible con MySQL 5.1 (migraciones 03, 07 y 08), no el esquema alternativo de 01-schema.sql. Ejecutar tambien 09-alertas-relacion-vehiculo-mysql51.sql antes de usar esta version.

- Clientes: id_cliente es la relacion principal. La lectura prioriza clientes.nombre; propietario se conserva como campo compatible. El formulario permite seleccionar un cliente por nombre e identificador. Los nuevos clientes deben registrarse primero en Clientes con sus campos obligatorios completos; Vehiculos ya no crea clientes incompletos. No fusiona nombres ambiguos.
- Ordenes: id_vehiculo se asigna al guardar. Placa, vehiculo, marca y tipo son datos historicos y se conservan al editar. Se mantienen Abierta, En proceso y Finalizada, ahora seleccionables en el formulario; Entregada es opcional y no se agrega.
- Kilometraje: se compara con el mayor valor del vehiculo y su historial dentro de una transaccion con bloqueo del vehiculo. Cada ingreso agrega una fila, incluso si repite kilometraje. Editar una orden antigua sin cambiar su kilometraje no agrega lecturas ni reduce el actual. No se sobrescriben las lecturas previas.
- Servicios: seleccion multiple del catalogo en la orden. Al finalizar se exige fecha de salida y se registra fecha_realizado, kilometraje y proxima fecha. Bajo multiplica dias por 1.25, Normal por 1 y Alto por 0.75 (redondeo al dia mas cercano, minimo uno). Los kilometros son referenciales, no se inventa un recorrido diario para calcular fechas. Los correctivos no generan fecha preventiva.
- Recordatorios: internos y sin envio externo. Se generan al iniciar, cada hora mientras la aplicacion esta abierta y al consultar el dashboard. Incluyen hoy, los siguientes siete dias y vencidos; la clave unica evita duplicados y conserva el estado de avisos existentes. Con la aplicacion cerrada se recuperan al abrirla; no existe un servicio de sistema en segundo plano.
- Dashboard: datos reales; vehiculos atendidos cuenta vehiculos distintos con orden finalizada, ordenes en proceso cuenta exactamente ese estado. Agenda de hasta 100 servicios ordenados por fecha, incluidos vencidos y programados. Se retiran ejemplos ficticios de llantas.
- La vista 09 usa id_vehiculo y muestra solo la ultima atencion realizada de cada servicio por vehiculo para no seguir alertando de ciclos sustituidos.

Comprobar en una BD de prueba: crear cliente/vehiculo, rechazar kilometraje menor, guardar dos ingresos con igual lectura, seleccionar servicios y finalizar, editar observaciones sin duplicar historial, revisar alertas a 8/7/0/-1 dias y consultar dashboard dos veces sin duplicar recordatorios.

## Registro de clientes

La migracion 10 retira identificacion y emergencia y actualiza las vistas de compatibilidad. Contacto empresa es opcional: vacio, espacios u omision se guardan como NULL. El formulario tiene nueve campos obligatorios y un contacto opcional. El ID y las fechas de registro son automaticos.

El estado no se captura. Se calcula usando CURDATE() de MySQL: licencia con vencimiento igual o posterior a hoy = Activo; licencia vencida o sin fecha = Inactivo. Se guarda al crear/editar y se sincroniza al listar clientes. Las vistas calculan el estado en cada consulta. Los indicadores, filtros y tabla se refrescan cada minuto y al volver a la pantalla. Con la aplicacion cerrada, el estado almacenado se sincroniza al volver a consultar; no se instala un evento de servidor.

El propietario se registra sin placa. Guardar y agregar vehiculo abre el formulario del vehiculo con id_cliente seleccionado y bloqueado. Al guardar o cancelar el vehiculo se vuelve a la ficha del propietario. La ficha permite agregar mas vehiculos y muestra todos los vinculados por vehiculos.id_cliente. La columna antigua clientes.placa_vehiculo se conserva como dato legado, sin usarse ni sobrescribirse; no se requiere migracion SQL. No se inventan datos faltantes de clientes anteriores: deben completarse al editarlos.

Validacion: node --test tests/clientes.validation.test.js. Integracion con rollback: node tests/maintenance.integration.js.

## Vehiculos simplificados

La migracion 11 elimina exclusivamente de vehiculos: no_tarjeta, modelo_registro, anio, fecha_registro y observaciones. Modelo se guarda directamente desde el formulario y se muestra en la tabla y detalle, conservando los valores existentes de esa columna. Los campos de historial y ordenes se conservan. El alta se abre desde la ficha del propietario; se retiran los accesos Nuevo vehiculo del modulo Vehiculos y Registrar nuevo propietario del formulario.

creado_por se asigna con el ID autenticado en el proceso principal de Electron para esa ventana. Se comprueba que siga siendo un usuario activo. Editar no altera al creador original. Los registros antiguos sin autor no se atribuyen a un usuario inventado. Reiniciar la aplicacion e iniciar sesion para cargar el nuevo manejador.

## Cliente vinculado y propietario manual

La migracion 12 elimina piloto exclusivamente de vehiculos. El encabezado muestra el nombre de clientes mediante id_cliente, conservado automaticamente desde la ficha del cliente. Propietario es texto manual obligatorio e independiente del nombre del cliente; las lecturas, ediciones y alertas respetan vehiculos.propietario. La tabla del modulo muestra el cliente asociado en su columna Cliente. Ordenes nuevas autocompletan el cliente vinculado, sin depender del piloto eliminado. Los datos historicos de ordenes se conservan.

## Datos reales en los modulos

Ordenes inicia con catalogos vacios y carga vehiculos, inventario, servicios y ordenes desde MySQL. Se retiraron los objetos de demostracion incrustados. Mecanicos se sugieren a partir de ordenes almacenadas, no de un supuesto campo del vehiculo. Existencia en el detalle de repuestos se consulta al inventario actual; sin referencia se muestra explicitamente, sin inventar cero.

Los listados distinguen carga, error de conexion y consulta vacia; los indicadores muestran -- cuando no se pudieron consultar datos. La vista de consulta del cliente no permite agregar vehiculos; el boton se mantiene al registrar/editar. Se conservan placeholders de ayuda, listas de opciones y borradores hasta guardar: no son registros de negocio. No se borraron datos existentes de MySQL.

## Estado de vehiculos y avisos

En edicion se muestra Activar/Desactivar vehiculo. Requiere confirmacion y guarda inmediatamente solo el estado y su fecha de actualizacion; conserva el borrador de los otros campos. No aparece en nuevo registro ni consulta.

Todos los nuevos avisos modales deben usar window.ui.alert(mensaje, opciones) y await window.ui.confirm(mensaje, opciones), cargados antes de los modulos. Evitar alert/confirm nativos. Los dialogos comparten dialogs.css, texto seguro, cola de mensajes, foco modal y cancelacion con Escape.

Los avisos negativos usan rojo (tone: danger, por defecto en ui.alert); confirmaciones de activar usan verde (tone: success). Avisos informativos pueden usar tone: info (azul). El control Activar/Desactivar es una etiqueta compacta en el encabezado, visible solo al editar.
