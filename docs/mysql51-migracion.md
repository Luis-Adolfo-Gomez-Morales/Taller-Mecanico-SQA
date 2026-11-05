# Cambios de la base MySQL 5.1

Estos archivos muestran c?mo cambi? una base que ya exist?a. Antes de aplicarlos se debe hacer un respaldo y revisar las tablas actuales. No se ejecutan todos de nuevo sobre una base actualizada.

| Archivo | Cambio principal |
|---|---|
| 03-migracion-fase-2-mysql51.sql | Agrega propietarios, servicios, historial y recordatorios |
| 05-seed-mysql51.sql | Datos de ejemplo para esa primera etapa |
| 07-normalizar-clientes-con-compatibilidad-mysql51.sql | Re?ne la informaci?n en clientes y vincula veh?culos |
| 08-vista-compatibilidad-propietarios-mysql51.sql | Conserva una vista para el c?digo de esa etapa |
| 09-alertas-relacion-vehiculo-mysql51.sql | Actualiza las alertas por veh?culo |
| 10-simplificar-clientes-mysql51.sql | Simplifica datos del cliente |
| 11-simplificar-vehiculos-mysql51.sql | Retira campos que dejaron de usarse |
| 12-propietario-manual-vehiculos-mysql51.sql | Separa el propietario escrito del cliente vinculado |
| 13-retirar-compatibilidad-clientes-mysql51.sql | Retira vistas antiguas y la placa guardada en clientes |
| 14-tipo-trabajo-pinchazo-mysql51.sql | Agrega el tipo de trabajo de pinchazo |
| 15-mecanicos-mysql51.sql | Agrega el cat?logo de mec?nicos |
| 16-descuento-repuestos-orden-mysql51.sql | Controla las cantidades de repuestos descontadas |

Los archivos 01 y 02 son una propuesta anterior. No deben usarse como si fueran la instalaci?n actual completa. El archivo 09-respaldo-vista-local.sql conserva una definici?n anterior de la vista y no es una migraci?n para repetir.

La instalaci?n de prueba desde cero se prepara con `tests/fixtures/schema.sql` mediante el comando del README. Esa opci?n evita depender de una base antigua y no incluye registros del taller.
