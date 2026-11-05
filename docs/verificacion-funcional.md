# Revisión de las pantallas

Se realizó un recorrido real de Electron usando una base separada de MySQL con datos ficticios. Playwright completó las acciones del formulario y comprobó lo que se guardó. El mismo recorrido pasó en Windows y en GitHub con Linux.

| Paso | Acción comprobada | Resultado |
|---|---|---|
| 1 | Entrar con clave incorrecta y después con la correcta | Rechazó la primera y abrió el inicio con la segunda |
| 2 | Registrar un cliente y agregar su vehículo desde la ficha | Guardó los datos y mantuvo la relación |
| 3 | Intentar bajar kilometraje y después guardar una lectura mayor | Rechazó la lectura menor y conservó la válida |
| 4 | Registrar un mecánico y un repuesto | Ambos aparecieron en sus listados |
| 5 | Finalizar una orden con servicio y dos repuestos; volver a guardarla | Guardó la atención y descontó los repuestos una sola vez |
| 6 | Consultar historial y panel de mantenimiento | Mostró la atención y el mantenimiento del vehículo |

El recorrido terminó sin errores de pantalla. Se ejecuta con `npm run test:e2e` y se reporta como un caso completo aparte de las 67 pruebas de la suite principal.

Las capturas están en [evidencias](evidencias/README.md) y la salida del recorrido está en [recorrido-pantallas.txt](evidencias/recorrido-pantallas.txt).

Todavía se pueden agregar más recorridos, por ejemplo cancelaciones y cortes de conexión mientras la aplicación está abierta. Los errores de conexión ya tienen pruebas con datos simulados, pero no se cortó el servidor durante este recorrido.
