# Fase 1: análisis y requerimientos

## 1. Identificación del problema

Un taller de motocicletas y vehículos requiere centralizar el control de propietarios, vehículos, atenciones y mantenimientos preventivos. El control manual o disperso dificulta recuperar el historial de un vehículo y anticipar cuándo debe regresar al taller.

El kilometraje no basta para generar un recordatorio, porque el taller no conoce el recorrido diario del vehículo. Por esta razón, cada servicio preventivo debe conservar el kilometraje real de la atención y una fecha estimada para el siguiente mantenimiento, calculada según el tipo de servicio y el nivel de uso declarado.

## 2. Objetivo general

Analizar, diseñar e implementar un sistema de control de servicios y mantenimiento preventivo que administre propietarios, vehículos, órdenes, historial de atenciones y recordatorios de próximos mantenimientos.

## 3. Objetivos específicos

1. Registrar propietarios individuales y empresas con datos de contacto.
2. Asociar cada vehículo con un propietario y conservar sus datos técnicos.
3. Registrar el ingreso al taller mediante una orden de servicio.
4. Conservar servicios, kilometrajes y observaciones como historial no destructivo.
5. Estimar el próximo servicio con fecha y nivel de uso del vehículo.
6. Mostrar mantenimientos próximos, vencidos y recordatorios pendientes.

## 4. Actores

| Actor | Descripción | Acciones principales |
| --- | --- | --- |
| Administrador o encargado | Personal responsable del sistema. | Gestionar propietarios, vehículos, órdenes, servicios y reportes. |
| Mecánico | Personal que atiende los vehículos. | Registrar diagnóstico, servicios realizados, observaciones y estado de la orden. |
| Propietario individual | Persona dueña de uno o varios vehículos. | Recibir recordatorios por teléfono o correo. |
| Empresa propietaria | Organización dueña de uno o varios vehículos. | Mantener razón social y contacto responsable para recordatorios. |
| Sistema | Aplicación de control. | Generar identificadores, validar reglas y producir alertas. |

## 5. Alcance mínimo

El sistema incluirá propietarios, vehículos, órdenes de servicio, catálogo de servicios, historial de kilometraje, servicios ejecutados y recordatorios internos. También mostrará un dashboard con indicadores de vehículos, órdenes en proceso, mantenimientos próximos y vencidos.

Quedan como mejoras opcionales el envío real por correo, SMS o WhatsApp, agenda de citas, gráficos y Kubernetes. El manejo de repuestos se conserva como extensión ya existente del proyecto, pero no sustituye el historial de mantenimiento solicitado.

## 6. Requerimientos funcionales

| Código | Requerimiento |
| --- | --- |
| RF-01 | Registrar propietarios individuales y empresas con información de identificación y contacto. |
| RF-02 | Registrar vehículos con identificador automático, propietario, tipo, marca, modelo, año, placa, kilometraje, fecha de ingreso, estado y observaciones. |
| RF-03 | Asociar uno o varios vehículos a un propietario. |
| RF-04 | Crear una orden por cada ingreso del vehículo al taller. |
| RF-05 | Registrar motivo, kilometraje de ingreso, servicios realizados, observaciones, fechas y estado de la orden. |
| RF-06 | Conservar el historial de kilometrajes y servicios por vehículo. |
| RF-07 | Registrar una fecha estimada para el próximo mantenimiento preventivo. |
| RF-08 | Clasificar los mantenimientos como próximos cuando faltan siete días o menos y como vencidos cuando la fecha ya pasó. |
| RF-09 | Generar y registrar recordatorios internos para el propietario. |
| RF-10 | Mostrar en el dashboard vehículos registrados, servicios próximos, servicios vencidos, vehículos atendidos y órdenes en proceso. |

## 7. Requerimientos no funcionales

| Código | Requerimiento |
| --- | --- |
| RNF-01 | La aplicación deberá utilizar una base de datos relacional MySQL. |
| RNF-02 | Las contraseñas y credenciales de conexión no se almacenarán en el repositorio. |
| RNF-03 | El modelo de datos deberá utilizar claves primarias, foráneas, índices y restricciones de integridad. |
| RNF-04 | La interfaz deberá estar disponible en español y permitir búsquedas básicas. |
| RNF-05 | Los cambios deberán conservarse en un repositorio Git mediante commits descriptivos. |

## 8. Reglas de negocio

1. Todo vehículo debe tener un propietario activo.
2. La placa de un vehículo es única.
3. El identificador de vehículo se genera automáticamente.
4. El kilometraje nuevo no puede ser menor que el último kilometraje válido del vehículo.
5. Todo ingreso debe generar una orden y un registro de kilometraje.
6. Los historiales de órdenes, servicios y kilometrajes no se eliminan físicamente.
7. Una orden en estado `Terminado` debe incluir al menos un servicio realizado.
8. Todo servicio preventivo terminado debe registrar una fecha estimada para el siguiente mantenimiento.
9. Un mantenimiento es `Próximo` cuando faltan de cero a siete días; es `Vencido` cuando su fecha estimada es anterior a la fecha actual.
10. Solo puede existir un recordatorio activo por mantenimiento y tipo de aviso.
11. El nivel de uso permitido es `Bajo`, `Normal` o `Alto`.

## 9. Criterios de aceptación de fase 1

- El problema, actores, alcance y requerimientos están documentados.
- Las reglas de negocio son verificables y trazables al modelo de datos.
- Se distingue propietario de piloto o conductor.
- Se establece que la estimación se basa en tiempo y nivel de uso, además del kilometraje registrado.
