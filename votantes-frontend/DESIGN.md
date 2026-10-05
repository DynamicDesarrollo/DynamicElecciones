---
name: Dynamic Electoral
description: Base de votantes de campañas políticas en Colombia, vestida con el pendón de cada campaña; el trabajo va en tinta sobre papel.
colors:
  # Color de campaña: se inyecta en tiempo de ejecución como --campana (src/lib/marca.js).
  # Sin campaña (superadmin, login) vale tinta. Estos ocho son la paleta curada por defecto, todos AA con texto blanco.
  campana-rojo: "#C8102E"
  campana-azul: "#0033A0"
  campana-verde: "#00703C"
  campana-morado: "#5B2C83"
  campana-naranja: "#B5390B"
  campana-petroleo: "#00607A"
  campana-vino: "#8A1538"
  campana-indigo: "#1F3A93"
  voto: "#ffd23f"
  tinta: "#121417"
  tinta-2: "#3d4148"
  tinta-3: "#5f646c"
  papel: "#ffffff"
  fondo: "#f2f2ef"
  filete: "#dedcd6"
  filete-fuerte: "#b9b6ae"
  ok: "#17683a"
  ok-suave: "#e3f1e8"
  alerta: "#8a4a00"
  alerta-suave: "#fbefd9"
  error: "#b42318"
  error-suave: "#fbe7e4"
  ok-claro: "#6fdc9f"
  error-claro: "#ff9a8f"
typography:
  display:
    fontFamily: "Figtree Variable, Figtree, ui-sans-serif, system-ui, sans-serif"
    fontSize: "2.125rem"
    fontWeight: 800
    lineHeight: 0.88
    letterSpacing: "-0.025em"
  headline:
    fontFamily: "Figtree Variable, Figtree, ui-sans-serif, system-ui, sans-serif"
    fontSize: "2.375rem"
    fontWeight: 800
    lineHeight: 0.95
    letterSpacing: "-0.025em"
  title:
    fontFamily: "Figtree Variable, Figtree, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 800
    lineHeight: 1
    letterSpacing: "-0.025em"
  cifra:
    fontFamily: "Figtree Variable, Figtree, ui-sans-serif, system-ui, sans-serif"
    fontSize: "3.5rem"
    fontWeight: 800
    lineHeight: 0.95
    letterSpacing: "-0.03em"
    fontFeature: "'tnum' 1, 'lnum' 1"
  body:
    fontFamily: "Figtree Variable, Figtree, ui-sans-serif, system-ui, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.5
    fontFeature: "'tnum' 1"
  body-sm:
    fontFamily: "Figtree Variable, Figtree, ui-sans-serif, system-ui, sans-serif"
    fontSize: "13px"
    fontWeight: 400
    lineHeight: 1.45
  ui:
    fontFamily: "Figtree Variable, Figtree, ui-sans-serif, system-ui, sans-serif"
    fontSize: "15px"
    fontWeight: 620
    lineHeight: 1.2
  label:
    fontFamily: "Figtree Variable, Figtree, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 650
    lineHeight: 1.3
    letterSpacing: "0.06em"
rounded:
  md: "6px"
  lg: "8px"
  xl: "12px"
  2xl: "16px"
  full: "9999px"
spacing:
  "1": "4px"
  "2": "8px"
  "3": "12px"
  "4": "16px"
  "5": "20px"
  "6": "24px"
  "7": "28px"
  "8": "32px"
  "10": "40px"
components:
  button-primary:
    backgroundColor: "var(--campana, #121417)"
    textColor: "{colors.papel}"
    typography: "{typography.ui}"
    rounded: "{rounded.md}"
    padding: "0 16px"
    height: "44px"
  button-secondary:
    backgroundColor: "{colors.papel}"
    textColor: "{colors.tinta}"
    typography: "{typography.ui}"
    rounded: "{rounded.md}"
    padding: "0 16px"
    height: "44px"
  button-secondary-hover:
    backgroundColor: "{colors.fondo}"
  button-ghost:
    textColor: "{colors.tinta-2}"
    typography: "{typography.ui}"
    rounded: "{rounded.md}"
    padding: "0 16px"
    height: "44px"
  button-sm:
    rounded: "{rounded.md}"
    padding: "0 12px"
    height: "36px"
  button-icon:
    rounded: "{rounded.md}"
    size: "40px"
  button-danger-quiet:
    textColor: "{colors.error}"
    rounded: "{rounded.md}"
    size: "40px"
  button-danger-quiet-hover:
    backgroundColor: "{colors.error-suave}"
  button-danger-outline:
    backgroundColor: "{colors.papel}"
    textColor: "{colors.error}"
    rounded: "{rounded.md}"
    height: "36px"
    padding: "0 12px"
  button-danger-solid:
    backgroundColor: "{colors.error}"
    textColor: "{colors.papel}"
    rounded: "{rounded.md}"
    height: "44px"
    padding: "0 16px"
  input:
    backgroundColor: "{colors.papel}"
    textColor: "{colors.tinta}"
    typography: "{typography.body}"
    rounded: "{rounded.md}"
    padding: "0 12px"
    height: "44px"
  input-disabled:
    backgroundColor: "{colors.fondo}"
    textColor: "{colors.tinta-3}"
  lamina:
    backgroundColor: "{colors.papel}"
    rounded: "{rounded.lg}"
    padding: "24px"
  cifras-celda:
    backgroundColor: "{colors.papel}"
    textColor: "{colors.tinta}"
    typography: "{typography.cifra}"
    padding: "20px"
  tabla-encabezado:
    textColor: "{colors.tinta-3}"
    typography: "{typography.label}"
    padding: "12px 16px"
  insignia-neutro:
    textColor: "{colors.tinta-2}"
    rounded: "{rounded.full}"
    padding: "0 10px"
    height: "24px"
  insignia-ok:
    backgroundColor: "{colors.ok-suave}"
    textColor: "{colors.ok}"
    rounded: "{rounded.full}"
    padding: "0 10px"
    height: "24px"
  insignia-alerta:
    backgroundColor: "{colors.alerta-suave}"
    textColor: "{colors.alerta}"
    rounded: "{rounded.full}"
    padding: "0 10px"
    height: "24px"
  insignia-error:
    backgroundColor: "{colors.error-suave}"
    textColor: "{colors.error}"
    rounded: "{rounded.full}"
    padding: "0 10px"
    height: "24px"
  insignia-tinta:
    backgroundColor: "{colors.tinta}"
    textColor: "{colors.papel}"
    rounded: "{rounded.full}"
    padding: "0 10px"
    height: "24px"
  pendon:
    backgroundColor: "var(--campana, #121417)"
    textColor: "{colors.papel}"
    width: "264px"
    padding: "28px 20px 20px"
  pendon-opcion-activa:
    backgroundColor: "{colors.papel}"
    textColor: "var(--campana, #121417)"
    typography: "{typography.ui}"
    rounded: "{rounded.md}"
    height: "44px"
    padding: "0 12px"
  pendon-banda:
    backgroundColor: "var(--campana, #121417)"
    textColor: "{colors.papel}"
    height: "56px"
  placa-voto:
    backgroundColor: "{colors.voto}"
    textColor: "{colors.tinta}"
    rounded: "{rounded.lg}"
    padding: "40px 24px"
  modal:
    backgroundColor: "{colors.papel}"
    textColor: "{colors.tinta}"
    rounded: "{rounded.xl}"
---

# Design System: Dynamic Electoral

## Overview

**Creative North Star: "El pendón de campaña"**

La app se viste como los pendones, vallas y afiches de campaña en Colombia: una franja vertical en el color de la campaña lleva el nombre del aspirante principal en letra geométrica pesada y hace de navegación; todo el trabajo va en tinta sobre papel. La campaña es la protagonista y la plataforma se queda en una firma discreta al pie del pendón.

Es un sistema de operación, denso y sobrio: tablas con filetes finos, encabezados de tabla en mayúsculas por peso, láminas blancas sobre un fondo cálido casi blanco, y cifras tabulares grandes como titular de cada pantalla. La jerarquía se construye con tipografía (peso 800 con interletra apretada) y con filetes, no con color ni sombras. El color aparece en tres sitios y en ninguno más; el amarillo voto aparece solo como placa.

Rechazos confirmados: el panel genérico de barra oscura con tarjetas de colores y gráficas decorativas; las tablas en cebra; el recargo visual; nada del aspecto anterior de la app se conserva.

**Key Characteristics:**
- Pendón a toda altura en el color de la campaña (264px en escritorio; banda superior de 56px en celular).
- Tinta sobre papel; filetes de 1px como única estructura.
- Figtree variable: peso 800 con interletra apretada para nombres, títulos y cifras; pesos 400–680 para la interfaz.
- Cifras titulares tabulares en tinta encabezando las pantallas.
- Eliminar siempre aislado, discreto y al final de la fila.
- Controles táctiles de 44px en todas las pantallas.

## Colors

Una paleta de tinta y papel cálido, un solo color de campaña confinado y un amarillo de placa.

### Primary
- **Color de campaña** (`--campana`, inyectado por campaña desde `src/lib/marca.js`): el pendón (lateral, banda del celular y menú a pantalla completa), el botón de acción principal, el anillo de foco, el cursor de texto y la casilla marcada. Mientras la campaña no tenga color propio recibe uno estable de la paleta curada: **Rojo partido**, **Azul partido**, **Verde partido**, **Morado**, **Naranja quemado**, **Petróleo**, **Vino** e **Índigo**, todos con contraste AA (≥4.5:1) con texto blanco. Sin campaña vale tinta. También tiñe la barra del navegador en celular (`theme-color`).

### Secondary
- **Amarillo voto** (#ffd23f): placa, nunca texto sobre blanco ni decoración. Vive en la selección de texto, en la marca de Dynamic (el pendón con visto del logo y la palabra "Electoral" sobre tinta en el ingreso) y en la placa "VOTÓ" de Asistencia.

### Neutral
- **Tinta** (#121417): texto principal, cifras, barras de desglose, insignia de superadmin y color del pendón de Dynamic.
- **Tinta media** (#3d4148): texto secundario y descripciones (9.6:1 sobre blanco).
- **Tinta suave** (#5f646c): rótulos, encabezados de tabla, ayudas y marcadores de posición (5.9:1 sobre blanco).
- **Papel** (#ffffff): láminas, tablas, cifras, campos y modales.
- **Fondo** (#f2f2ef): lienzo de la app, hover de filas y botones secundarios, campos deshabilitados.
- **Filete** (#dedcd6): bordes de láminas y tablas, separadores de filas y de cifras.
- **Filete fuerte** (#b9b6ae): contorno de campos y botones secundarios, línea bajo el encabezado de tabla, barra de desplazamiento.

### Estados
- **Verde ok / suave**, **Ámbar alerta / suave**, **Rojo error / suave**: solo para estado (insignias, avisos en línea, errores de campo, acciones destructivas). El tono suave es fondo; el fuerte es texto o contorno.
- **Verde ok claro** (#6fdc9f) y **Rojo error claro** (#ff9a8f): solo el ícono de los avisos (toasts), que van sobre tinta abajo a la derecha.

### Named Rules
**The Pendón Rule.** El color de campaña vive solo en el pendón, la acción principal y el foco. Ni títulos, ni cifras, ni insignias, ni barras, ni enlaces llevan el color de campaña.

**The Placa Rule.** El amarillo voto es una placa con tinta encima, nunca un color de texto sobre papel ni un acento decorativo. Usos permitidos: selección, marca de Dynamic y la placa "VOTÓ".

**The Dynamic en Tinta Rule.** El superadmin no pertenece a ninguna campaña: ve el pendón de Dynamic en tinta ("Dynamic Electoral" en titular) y solo las opciones de gestión (Campañas, Partidos y Ajustes).

## Typography

**Display Font:** Figtree Variable (con Figtree, ui-sans-serif, system-ui), servida desde el proyecto con `@fontsource-variable/figtree`
**Body Font:** Figtree Variable, la misma familia en pesos de lectura

**Character:** Una sola familia geométrica y amable con dos voces: la de titular (peso 800, interletra -0.025em; -0.03em en cifras) para nombres, títulos y números, y la de lectura (400–680) para todo lo demás. Sin anchos condensados: el carácter sale del peso y de las formas redondas. Toda la app usa cifras tabulares.

### Hierarchy
- **Display** (800, 2.125rem que baja a 1.75rem y 1.375rem según el largo del nombre, interlínea 0.88, mayúsculas): nombre del aspirante principal en el pendón. En el ingreso, "Dynamic Electoral" va de 2.625rem a 3.5rem y, en escritorio, crece con la pantalla entre 3.5rem y 6rem. Sobre ese panel de tinta cuelga del borde superior el pendón amarillo con visto de la marca, a gran tamaño (46% del alto); se despliega una vez al cargar. El formulario va en una lámina de papel de 440px.
- **Headline** (800, 1.875rem en celular y 2.375rem desde 640px, interlínea 0.95): título de cada pantalla en el encabezado; "Ingresar" en 1.875rem.
- **Title** (800, 1.25rem en modales y secciones, 1.125rem en láminas, interlínea 1): títulos de sección y de modal. Los nombres propios destacados (ficha de aspirante, votante encontrado) van a 1.625rem–2rem en mayúsculas.
- **Cifra** (800, tabular y alineada, interletra -0.03em, interlínea 0.95): 3.5rem en la fila de cifras de escritorio; 2.125rem (o 1.75rem en filas de tres) en celular; 1.625rem en filas de desglose y en el campo de cédula; 1.375rem en tablas y fichas.
- **Body** (400, 15px): texto de tablas, descripciones (máximo 62ch) y párrafos. **Body pequeño** (13px) para detalles, ayudas y errores de campo.
- **UI** (620, 15px; 14px en botones pequeños): botones, navegación del pendón, etiquetas de campo (14px).
- **Label / Rótulo** (650, 12px, interletra 0.06em, mayúsculas): encabezados de tabla, etiquetas de cifras, etiquetas de dato en las fichas móviles y nombre de grupo dentro de un desglose.

### Named Rules
**The Cifra-Titular Rule.** El número es el titular: cifras en tinta, en peso 800 tabular, grandes y sin color. Nunca se tiñen con el color de campaña ni con verde o rojo.

**The Dos Voces Rule.** Peso 800 con interletra apretada (`titular` y `cifra`) solo para nombres, títulos y cifras; todo lo que se lee o se pulsa va en pesos 400–680 con interletra normal. Los tamaños salen de la escala con nombre de `src/index.css`, nunca de valores sueltos. Los rótulos en mayúsculas etiquetan datos; no van sobre los títulos.

## Layout

Escritorio (desde 1024px): pendón fijo a la izquierda de 264px a toda la altura; a la derecha, contenido en un contenedor de máximo 1240px, con 32px de margen lateral y 40px arriba (16px y 24px en celular), y 64px al pie. Debajo de 1024px el pendón se vuelve una banda superior pegajosa de 56px con el botón de menú y el nombre; el menú se abre a pantalla completa en el color de la campaña.

Cada pantalla sigue el mismo orden: encabezado (título en peso 800 y descripción a la izquierda, acciones a la derecha y alineadas abajo, la principal al final en color de campaña), fila de cifras cuando aplica, filtros y luego la tabla o las láminas. El encabezado deja 28px antes del contenido.

La fila de cifras es una cuadrícula de celdas separadas por filetes de 1px (columnas automáticas de 11rem mínimo en escritorio; dos columnas en celular, tres cuando hay tres cifras, y la impar final ocupa la fila completa). Los formularios usan una rejilla de una columna en celular y de dos a cuatro en pantallas anchas, con 20px entre columnas y 16px entre filas.

En celular cada fila de tabla se vuelve una ficha: el encabezado desaparece y cada dato muestra su rótulo a la izquierda y su valor a la derecha. Ritmo de espaciado en múltiplos de 4px (8, 12, 16, 20, 24, 28, 40). Altura táctil mínima de 44px; los campos usan al menos 16px de letra para evitar el zoom de iOS.

## Elevation & Depth

Sistema plano. La profundidad se expresa con filetes de 1px (anillos internos) y con el contraste papel sobre fondo, no con sombras. Solo hay cuatro sombras, todas funcionales y en tinta translúcida.

### Shadow Vocabulary
- **Botón principal** (`box-shadow: 0 1px 2px rgb(18 20 23 / 0.18)`): apenas separa la acción principal del papel.
- **Pestaña activa** (`box-shadow: 0 1px 2px rgb(18 20 23 / 0.12)`): la opción elegida del selector segmentado en Duplicados.
- **Banda del celular** (`box-shadow: 0 1px 0 rgb(0 0 0 / 0.15)`): borde inferior de la banda superior pegajosa.
- **Modal** (`box-shadow: 0 24px 64px -12px rgb(18 20 23 / 0.35)`): el único elemento que flota, sobre un velo de tinta al 55%.

### Named Rules
**The Filete Rule.** Las láminas, tablas y cifras se separan con filetes de 1px, nunca con sombras, cebra ni fondos de color. El hover de fila es fondo al 70%.

## Shapes

Esquinas suaves y pequeñas, coherentes en toda la app: 6px para botones, campos, opciones del pendón y avisos en línea; 8px para láminas, tablas, filas de cifras y la placa "VOTÓ"; 12px para el modal en escritorio y 16px solo en las esquinas superiores de la hoja del celular; insignias y barras de progreso en píldora. El estado vacío de Asistencia usa un contorno discontinuo en filete fuerte. La silueta propia del mundo es el pendón con muesca en V (el logo y el ícono de la placa "VOTÓ"), reservada para la marca.

## Components

### Buttons
Firmes y compactos, con peso 620 y una leve contracción al pulsar (escala 0.97, 150ms con salida suave).
- **Shape:** esquinas suaves (6px); 44px de alto con 16px de relleno (36px y 12px en tamaño pequeño; 40px cuadrado solo con ícono).
- **Primario:** fondo color de campaña, texto blanco, sombra mínima; al pasar el cursor se aclara un 8%. Uno por pantalla, arriba a la derecha.
- **Secundario:** papel con contorno interno de filete fuerte; hover a fondo. Exportar, cancelar, paginar.
- **Fantasma:** texto tinta media sin fondo; hover con un velo de tinta al 6%. Editar, cerrar.
- **Foco:** contorno de 2px en color de campaña separado 2px.
- **Deshabilitado / cargando:** opacidad 50%; al cargar el ícono se reemplaza por un giro.

### Eliminar
- **En filas:** botón de ícono rojo sin fondo (`peligro-suave`), siempre el último de la fila y separado 16px de editar; al pasar el cursor toma fondo rojo suave y contorno.
- **Cambio de estado (desactivar campaña):** contorno rojo sobre papel, pequeño, empujado al extremo derecho.
- **Confirmación:** el rojo sólido aparece solo dentro del diálogo de confirmación, junto a Cancelar.

### Cards / Containers (Lámina)
- **Corner Style:** 8px.
- **Background:** papel sobre fondo.
- **Shadow Strategy:** ninguna; ver Elevation & Depth.
- **Border:** filete interno de 1px.
- **Internal Padding:** 20px en celular, 24px desde 640px; título a 1.125rem en peso 800 y contenido 20px debajo.

### Inputs / Fields
- **Style:** papel, contorno interno de filete fuerte, 6px, 44px de alto; etiqueta encima (14px, 620) y ayuda o error debajo (13px). Los selectores llevan un chevron en tinta suave.
- **Focus:** el contorno pasa a 2px en color de campaña; el cursor de texto también es del color de campaña.
- **Error / Disabled:** contorno de 2px rojo y mensaje rojo con `role="alert"`; deshabilitado en fondo con texto tinta suave.
- **Campo de cédula (Asistencia):** 64px de alto con la cédula en cifra a 2rem, junto a un botón principal cuadrado.

### Chips (Insignias)
- **Style:** píldora de 24px, 13px a 620, tono suave de fondo con texto del estado (neutro, ok, alerta, error) o tinta sólida para superadmin.
- **State:** solo informan; no son filtros ni acciones.

### Tabla
Papel con filete y esquinas de 8px; encabezados en rótulo tinta suave con línea de filete fuerte debajo; filas separadas por filete, 12px por 16px de relleno; sin cebra. En celular cada fila es una ficha de rótulo y valor.

### Cifras
Fila de celdas en papel separadas por filetes: rótulo arriba, cifra titular en tinta y un detalle opcional de 13px. Encabezan el resumen, Asistencia y los aspirantes.

### Desglose (plantel)
Lista de aspirantes: la cabeza de la campaña primero y aparte, en mayúsculas de peso 800, separada por un filete fuerte; luego el resto por aporte, bajo un rótulo de grupo. Cada fila lleva nombre, cifra a 1.625rem con porcentaje y una barra en tinta de 8px sobre tinta al 7%, que crece en 700ms.

### Navigation (Pendón)
- **Style:** franja en color de campaña, texto blanco; arriba el nombre del aspirante principal en Display mayúscula, el nombre de la campaña (15px, 650) y tipo y territorio (13px, blanco al 80%).
- **Opciones:** 44px de alto, ícono de 17px y texto a 15px y 620; inactivas en blanco al 88% con hover de blanco al 12%; la activa se invierte en placa blanca con texto en color de campaña.
- **Pie:** usuario y cargo sobre un filete blanco al 25%, "Cerrar sesión" fantasma, y la firma "Dynamic Electoral" con el logo a 16px en blanco al 65%, solo cuando el pendón es de una campaña.
- **Movimiento:** al entrar o cambiar de campaña el pendón se iza (la franja se despliega de arriba abajo, 450ms, curva de pendón); igual al abrir el menú del celular. Sin movimiento con movimiento reducido.
- **Celular:** banda de 56px con menú y nombre en mayúsculas a 1.125rem; el menú ocupa la pantalla completa.

### Modal
`<dialog>` nativo sobre velo de tinta al 55%; en escritorio centrado con 12px de esquina, en celular hoja desde abajo (máximo 92% de alto). Cabecera con título a 1.25rem en peso 800, filete inferior y botón de cerrar fantasma; aparece con escala 0.97 y 4px de subida en 180ms. La confirmación usa un ancho estrecho con acciones en columna invertida en celular.

### Placa "VOTÓ"
La confirmación de asistencia: placa amarilla voto de 8px con el pendón con visto en tinta, "VOTÓ" en mayúsculas de peso 800 a 2.375rem, el nombre del votante y el número de asistencia en cifra. Es la única superficie amarilla de la app.

## Do's and Don'ts

### Do:
- **Do** limitar el color de campaña al pendón, el botón principal y el foco (anillo, cursor y casilla).
- **Do** encabezar cada pantalla con un título en peso 800 y, cuando haya números, con la fila de cifras titulares en tinta.
- **Do** separar láminas, tablas y cifras con filetes de 1px sobre papel.
- **Do** dejar eliminar como ícono rojo discreto, último en la fila y separado 16px de editar; el rojo sólido solo en la confirmación.
- **Do** mantener 44px de alto táctil y 16px mínimos de letra en campos.
- **Do** dar a cada dato de tabla su rótulo para la ficha del celular.
- **Do** usar el amarillo voto solo como placa con tinta encima.

### Don't:
- **Don't** usar el color de campaña en títulos, cifras, insignias, barras, enlaces ni fondos de sección.
- **Don't** pintar cifras con color; las cifras van en tinta.
- **Don't** usar tarjetas de colores, tablas en cebra ni gráficas decorativas.
- **Don't** poner amarillo voto como texto sobre papel ni como acento decorativo.
- **Don't** agrupar eliminar con las demás acciones ni darle fondo rojo sólido fuera de la confirmación.
- **Don't** mostrar al superadmin un pendón de campaña ni datos de campañas; su pendón es Dynamic en tinta.
- **Don't** poner rótulos en mayúsculas encima de los títulos de pantalla o de sección.
