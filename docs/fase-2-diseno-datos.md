# Diseño de datos

La primera propuesta separó propietarios, vehículos, órdenes y servicios para que los datos no se repitieran en cada atención. La versión actual usa `clientes` y `ordenes_trabajo` como nombres principales.

Cada cliente puede tener varios vehículos. Cada vehículo puede tener varias órdenes. Una orden incluye servicios y repuestos. El historial conserva kilometrajes y los recordatorios se relacionan con el servicio realizado.

La próxima fecha pertenece al detalle del servicio porque dos servicios del mismo vehículo pueden tener intervalos distintos. El nivel de uso ajusta los días: Bajo aumenta 25 %, Normal mantiene el intervalo y Alto reduce 25 %.

Las relaciones y el diagrama actual están en [modelo-relacional-actual.md](modelo-relacional-actual.md). El esquema completo para una base de prueba vacía está en `tests/fixtures/schema.sql`. Los archivos 01 y 02 conservan la primera propuesta; las migraciones posteriores muestran los cambios realizados.
