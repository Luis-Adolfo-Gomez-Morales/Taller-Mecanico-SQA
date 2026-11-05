# Mejoras realizadas y pendientes

Revisión: 4 de noviembre de 2026.

## Cambios terminados

| Tema | Resultado |
|---|---|
| Protección de `main` | Activa; exige pull request y controles aprobados |
| Contraseñas | Hash para claves nuevas y actualización de cuentas antiguas al iniciar sesión |
| Condiciones SQL señaladas | Reescritas y comprobadas con MySQL |
| Cobertura en SonarQube | Reporte enviado desde GitHub; 85,81 % en código nuevo |
| Pruebas de pantallas | Recorrido real aprobado con Electron y MySQL |
| Dependencias | Electron actualizado y revisión sin vulnerabilidades reportadas |

Las cuentas antiguas se actualizan al volver a entrar. Este resultado no significa que todas las contraseñas anteriores ya hayan sido reemplazadas en la base real.

## Próximas mejoras

| Prioridad | Mejora | Motivo |
|---|---|---|
| Media | Ampliar las pruebas de todo el proyecto | La cobertura general de SonarQube es 42,8 % |
| Media | Reducir el código repetido | La duplicación general es 7,4 %, aunque el código nuevo marca 0,0 % |
| Media | Planificar la actualización de la base local MySQL 5.1 | Se mantiene por compatibilidad; GitHub ya prueba con MySQL 8.0 |
| Media | Revisar las reglas SQL que requieren un diccionario de datos | SonarQube muestra un aviso porque no todas pueden comprobarse |
| Baja | Ampliar el recorrido de pantallas con más errores y cancelaciones | El recorrido actual cubre el flujo principal |
| Baja | Preparar un instalador o un despliegue | Son mejoras opcionales del enunciado |

Los pendientes generales no se presentan como problemas ya resueltos. El control actual aprueba porque se cumplen los límites definidos para los cambios nuevos y para las pruebas del pipeline.
