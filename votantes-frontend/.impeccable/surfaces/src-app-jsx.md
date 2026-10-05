---
version: 1
slug: "src-app-jsx"
primary_target: "src/App.jsx"
related_targets: ["src/layouts/MainLayout.jsx","src/pages"]
---

# Superficie: app completa de Dynamic Electoral (votantes-frontend)

Modo: Operate. Todas las pantallas por igual (login, campañas, dashboard, aspirantes, líderes, votantes, usuarios, asistencia, informes), en computador y en celular.

Audiencia y tarea: equipos de campaña (admin del aspirante principal, equipos de concejales/diputados, digitadores, puestos de control el día E) registran líderes y votantes, revisan totales y marcan asistencia por cédula. Superadmin opera campañas.

Restricciones del usuario: nada del aspecto anterior se conserva; evitar plantilla genérica, recargado, frío/técnico y lento en celular. Cada campaña debe verse con su marca (color/logo aún no existen en datos: color por defecto derivado de la campaña hasta que se configure).

Decisiones abiertas: número de tarjetón y logo del candidato/partido (fase 2, no inventar); color configurable por campaña (fase 2).

## Direction contract

THESIS: La app se viste con el pendón de cada campaña: una franja vertical en el color de la campaña con el nombre del aspirante principal en letra geométrica pesada hace de navegación; todo el trabajo va en tinta sobre blanco. Rechaza el panel genérico de barra oscura con tarjetas de colores y gráficas decorativas.

OWN-WORLD: Tinta #121417 sobre papel blanco y fondo #F2F2EF; filetes finos #DEDDD8. Un solo color de campaña (por defecto de una paleta curada de colores de partido con contraste AA sobre blanco) vive solo en el pendón, la acción principal y el foco. Amarillo voto #FFD23F solo como placa de cifra/marca. Figtree variable (elegida por el usuario): peso 800 con interletra apretada para el pendón, títulos y cifras; pesos de lectura para la interfaz. Cifras tabulares grandes como titular. Tablas con filetes, encabezados en mayúsculas por peso, sin cebra ni tarjetas de colores. Eliminar aislado y en contorno.

STORY: Al entrar, el usuario sabe en qué campaña está (el pendón lo dice), ve su número (las cifras encabezan cada pantalla) y hace su tarea sin elegir nada que el sistema deduce.

FIRST VIEWPORT: Escritorio: pendón de 264px a la izquierda, a toda altura, color de campaña; el nombre del aspirante principal en peso 800 a 34px con el tipo y el territorio debajo, luego la navegación en blanco con la opción activa invertida (placa blanca, texto en color de campaña), al pie el usuario y salir. A la derecha, en el dashboard, una fila de cifras titulares (votantes en 56px de peso 800 tabular) separadas por filetes, y debajo el desglose por aspirante como plantel. Acción principal de cada pantalla arriba a la derecha en color de campaña. Celular: el pendón se vuelve banda superior con nombre y botón de menú que abre la navegación a pantalla completa en el color de la campaña.

FORM: Pendón de campaña (pendones, vallas y afiches de campaña en Colombia), posición 6 de la lista ordenada; seed dffa45c7. Préstamos: color confinado (léxico), eliminar aislado (consola), cifra como titular (campo de datos), jerarquía por peso y mayúsculas en tablas (itinerario), aspirantes como plantel con ficha fija (catálogo). Interacción firma: al entrar o cambiar de campaña el pendón se iza (la franja de color se despliega de arriba abajo una vez, 450 ms, salida suave; sin animación con movimiento reducido).

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
