# Dise?o de datos

La primera propuesta separ? propietarios, veh?culos, ?rdenes y servicios para que los datos no se repitieran en cada atenci?n. La versi?n actual usa `clientes` y `ordenes_trabajo` como nombres principales.

Cada cliente puede tener varios veh?culos. Cada veh?culo puede tener varias ?rdenes. Una orden incluye servicios y repuestos. El historial conserva kilometrajes y los recordatorios se relacionan con el servicio realizado.

La pr?xima fecha pertenece al detalle del servicio porque dos servicios del mismo veh?culo pueden tener intervalos distintos. El nivel de uso ajusta los d?as: Bajo aumenta 25 %, Normal mantiene el intervalo y Alto reduce 25 %.

Las relaciones y el diagrama actual est?n en [modelo-relacional-actual.md](modelo-relacional-actual.md). El esquema completo para una base de prueba vac?a est? en `tests/fixtures/schema.sql`. Los archivos 01 y 02 conservan la primera propuesta; las migraciones posteriores muestran los cambios realizados.
