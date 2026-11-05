# Análisis del sistema del taller

Este documento resume el problema del proyecto que se reutilizó para el trabajo de calidad. El plan del curso y los controles se explican en SQA_PLAN.md.

## Problema y objetivo

El taller necesita guardar clientes, vehículos y atenciones en un mismo lugar. Llevarlos por separado dificulta consultar el historial y saber cuándo toca otro mantenimiento. El objetivo es conservar esos datos y ayudar al encargado a revisar los servicios pendientes.

## Personas que lo usan

El encargado registra clientes, vehículos, mecánicos, repuestos y órdenes. El mecánico atiende el vehículo y aporta los datos del trabajo. El cliente recibe la información del taller; la aplicación genera avisos internos y no envía mensajes automáticamente.

## Funciones principales

| ID | Necesidad |
|---|---|
| RF-01 | Registrar clientes individuales y empresas con sus datos de contacto |
| RF-02 | Vincular uno o varios vehículos a un cliente |
| RF-03 | Guardar placa, propietario, tipo, marca, modelo y kilometraje |
| RF-04 | Registrar una orden por cada atención, con fechas, mecánico, trabajos y estado |
| RF-05 | Conservar el historial de servicios y kilometraje |
| RF-06 | Calcular una próxima fecha para servicios preventivos |
| RF-07 | Mostrar servicios próximos y atrasados en el panel |
| RF-08 | Registrar repuestos y descontar los utilizados en una orden |

## Reglas

Una placa no se repite. El kilometraje no puede bajar. Una orden puede estar Abierta, En proceso o Finalizada. Para finalizar se piden los datos de salida y del servicio. Los avisos próximos incluyen hoy y los siguientes siete días; una fecha anterior a hoy se considera atrasada.

El uso Bajo aumenta el intervalo del mantenimiento un 25 %, Normal lo conserva y Alto lo reduce un 25 %. Los kilómetros se muestran como referencia; no se inventa un recorrido diario del vehículo.

La aplicación mantiene datos anteriores de las órdenes para conservar el historial. Se impide borrar un cliente o vehículo cuando se perderían relaciones importantes. Los cambios se guardan mediante Git y se revisan con pruebas y análisis automático.

## Límites

No se incluyen mensajes por correo o WhatsApp, pruebas de carga ni un despliegue web. La aplicación es de escritorio. Las claves de conexión personal quedan fuera del repositorio. Las claves nuevas usan hash y las cuentas anteriores se actualizan al iniciar sesión correctamente.
