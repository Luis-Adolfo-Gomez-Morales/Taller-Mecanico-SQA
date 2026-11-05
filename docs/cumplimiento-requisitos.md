# Revisi?n de requisitos del proyecto final

Se revis? el documento ?Proyecto Final 2026? el 4 de noviembre de 2026. Esta tabla distingue lo preparado en el repositorio de lo que todav?a necesita evidencia o una acci?n externa.

| Solicitud del PDF | Evidencia en el proyecto | Estado |
|---|---|---|
| Aplicaci?n existente con operaciones de registro, consulta, edici?n y eliminaci?n | Electron, MySQL y m?dulos del taller | Implementado; prueba real separada |
| Justificar una tecnolog?a distinta | README y Plan SQA | Documentado |
| Plan SQA con prop?sito, alcance, est?ndares, actividades, m?tricas, herramientas y riesgos | SQA_PLAN.md | Actualizado |
| Pruebas unitarias, integraci?n y regresi?n | tests y matriz de pruebas | Implementado; 60 casos con MySQL |
| Matriz con ID, tipo, entrada, esperado y obtenido | matriz-pruebas.md | Actualizada |
| Cobertura m?nima de al menos 60 % | scripts/test-ci.js | Verificado localmente: 77,10 % del c?digo medido |
| Linter y SonarQube | ESLint e integraci?n nativa | Configurado; panel privado |
| Etapas build, test, analyze y report | .github/workflows/main.yml | Implementadas; validar ejecuci?n remota de esta entrega |
| Fallar al no cumplir los controles | L?mite de cobertura, max-warnings 0 y espera de SonarQube | Implementado; prueba de rechazo incluida |
| Pull requests y protecci?n de rama principal | Plantilla de PR y controles configurados | Protecci?n pendiente: main no est? protegida y API responde 403 |
| Revisi?n autom?tica y manual | Workflow y lista del pull request | Autom?tica preparada; revisi?n humana debe quedar registrada |
| M?tricas antes y despu?s | Linea-Base-Calidad.md y Reporte-Mejora.md | Evidencias locales incluidas |
| Gesti?n de deuda t?cnica | deuda-tecnica.md | Registrada con prioridades |
| README con badges, instalaci?n y tecnolog?as | README.md | Actualizado |
| Manual t?cnico y manual de uso | Manual-Tecnico.md y Manual-Uso.md | Agregados |
| Acceso del docente | Repositorio privado | Confirmar invitaci?n del docente |
| Video de 4?5 minutos, MP4, m?nimo 720p | Entrega en plataforma del curso | Pendiente fuera de GitHub |
| Presentaci?n de 8?10 diapositivas exportada a PDF | Entrega en plataforma del curso | Pendiente fuera de GitHub |
| Docker, despliegue cloud, notificaciones y E2E | Mejoras opcionales | No son obligatorios; MySQL de CI ya usa contenedor |

## Qu? falta fuera del c?digo

Hay que resolver la protecci?n de main, comprobar el resultado remoto, revisar las alertas pendientes en SonarQube y confirmar el acceso del docente. Tambi?n hay que realizar y entregar la presentaci?n y el video. No se considera terminada la entrega acad?mica solo porque las pruebas pasen.

El video debe mostrar una rama, un cambio, un pull request, las etapas y la aprobaci?n o rechazo de un control. Tambi?n debe mostrar el dashboard con sus m?tricas reales y la comparaci?n antes/despu?s. La presentaci?n debe incluir objetivo, alcance, tecnolog?as, diagrama del pipeline, m?tricas, capturas, conclusiones y referencias.

La presentaci?n, el documento PDF y el video no se agregan a GitHub. Sus extensiones est?n excluidas en .gitignore. Las capturas que se utilicen deben corresponder a ejecuciones reales, sin cambiar n?meros para que parezcan aprobadas.
