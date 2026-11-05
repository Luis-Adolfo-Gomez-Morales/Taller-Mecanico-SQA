# An?lisis del sistema del taller

Este documento resume el problema del proyecto que se reutiliz? para el trabajo de calidad. El plan del curso y los controles se explican en SQA_PLAN.md.

## Problema y objetivo

El taller necesita guardar clientes, veh?culos y atenciones en un mismo lugar. Llevarlos por separado dificulta consultar el historial y saber cu?ndo toca otro mantenimiento. El objetivo es conservar esos datos y ayudar al encargado a revisar los servicios pendientes.

## Personas que lo usan

El encargado registra clientes, veh?culos, mec?nicos, repuestos y ?rdenes. El mec?nico atiende el veh?culo y aporta los datos del trabajo. El cliente recibe la informaci?n del taller; la aplicaci?n genera avisos internos y no env?a mensajes autom?ticamente.

## Funciones principales

| ID | Necesidad |
|---|---|
| RF-01 | Registrar clientes individuales y empresas con sus datos de contacto |
| RF-02 | Vincular uno o varios veh?culos a un cliente |
| RF-03 | Guardar placa, propietario, tipo, marca, modelo y kilometraje |
| RF-04 | Registrar una orden por cada atenci?n, con fechas, mec?nico, trabajos y estado |
| RF-05 | Conservar el historial de servicios y kilometraje |
| RF-06 | Calcular una pr?xima fecha para servicios preventivos |
| RF-07 | Mostrar servicios pr?ximos y atrasados en el panel |
| RF-08 | Registrar repuestos y descontar los utilizados en una orden |

## Reglas

Una placa no se repite. El kilometraje no puede bajar. Una orden puede estar Abierta, En proceso o Finalizada. Para finalizar se piden los datos de salida y del servicio. Los avisos pr?ximos incluyen hoy y los siguientes siete d?as; una fecha anterior a hoy se considera atrasada.

El uso Bajo aumenta el intervalo del mantenimiento un 25 %, Normal lo conserva y Alto lo reduce un 25 %. Los kil?metros se muestran como referencia; no se inventa un recorrido diario del veh?culo.

La aplicaci?n mantiene datos anteriores de las ?rdenes para conservar el historial. Se impide borrar un cliente o veh?culo cuando se perder?an relaciones importantes. Los cambios se guardan mediante Git y se revisan con pruebas y an?lisis autom?tico.

## L?mites

No se incluyen mensajes por correo o WhatsApp, pruebas de carga ni un despliegue web. La aplicaci?n es de escritorio. Las claves de conexi?n personal quedan fuera del repositorio. El manejo actual de contrase?as de usuarios est? anotado como mejora pendiente en deuda-tecnica.md.
