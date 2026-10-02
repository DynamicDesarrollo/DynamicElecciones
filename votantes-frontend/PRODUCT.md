# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Superadmin (Dynamic):** opera el SaaS. Crea campañas, les asigna tipo y territorio, entrega el usuario administrador al cliente y puede entrar a trabajar en cualquier campaña.
- **Administrador de campaña:** equipo del aspirante principal (alcalde, gobernador, diputado o concejal según el tipo). Ve toda la campaña, crea los aspirantes secundarios y sus usuarios, revisa duplicados e informes.
- **Equipo de un aspirante secundario** (p. ej. un concejal y sus digitadores): registra líderes y prospectos votantes; solo ve lo suyo.
- **Puestos de control el día de la elección:** buscan por cédula y marcan asistencia, con prisa y bajo presión.

Se usa en ambos dispositivos: registro en oficina con computador y en la calle o el puesto de control con celular. Ninguna tarea puede depender de un solo tamaño de pantalla.

## Product Purpose

DynamicElecciones (nombre de producto: Dynamic Electoral) organiza la base de votantes de una campaña política en Colombia: quién la integra, a qué líder y aspirante pertenece cada votante, y quién votó el día de la elección. El éxito es que cada campaña sepa con exactitud con cuántos votos cuenta, de dónde vienen y cuántos salieron a votar.

## Positioning

La jerarquía de la campaña (aspirante principal → secundarios → líderes → votantes) es el centro del producto: el sistema asigna cada votante a su aspirante sin preguntarlo, a partir del líder y del usuario que lo registra, y cada nivel ve solo lo suyo. Los duplicados entre aspirantes de la misma campaña los ve únicamente el aspirante principal.

## Operating Context

- Tipos de campaña: Gobernación (gobernador → diputados), Asamblea (diputado), Alcaldía (alcalde → concejales), Concejo (concejal). Senado y Cámara quedan para después.
- Una sola campaña por tipo y territorio, por privacidad entre rivales.
- Registro diario de líderes y prospectos votantes; exportación a Excel y PDF; dashboard de totales.
- Día de elección: búsqueda por cédula y confirmación de asistencia por puesto de control.
- Datos geográficos y electorales de Colombia: departamentos, municipios, barrios, lugares (puestos) y mesas de votación de la Registraduría.

## Capabilities and Constraints

- Frontend React 19 + Vite, desplegado en Vercel; backend Express + PostgreSQL (Neon) en Render.
- Roles: superadmin, admin, aspirante (equipo de un secundario), user (rol anterior, solo ve lo que registró).
- El admin crea un único usuario por aspirante secundario; ese aspirante crea los demás usuarios de su equipo. Los líderes no tienen usuario.
- Cédula repetida: se bloquea bajo el mismo aspirante; entre aspirantes distintos se permite y solo el admin lo ve.
- Pendiente: catálogo de partidos con eslogan, departamentos/municipios desde la API de la Registraduría, puestos de control configurables por aspirante.

## Brand Commitments

- Cada campaña ve la plataforma con su propia marca (logo y color del candidato o partido); Dynamic Electoral queda discreta. La personalización por campaña aún no existe en datos y debe quedar prevista.
- No hay logo ni identidad de Dynamic: se define una identidad sobria propia.
- Idioma: español de Colombia.

## Evidence on Hand

- Divipole de la Registraduría (Congreso 2022) en `../Dcoumentos/Divipole Elecciones Congreso Definitiva.xlsx`.
- No hay testimonios, clientes ni cifras públicas: no inventarlos.

## Product Principles

1. La jerarquía decide, no el usuario: nunca pedir un dato que el sistema puede deducir.
2. Privacidad entre niveles y entre campañas por encima de la comodidad.
3. Rapidez el día de la elección: la búsqueda por cédula y la confirmación son el camino más corto de la app.
4. El número es lo que importa: totales, avance y duplicados siempre visibles y exactos.
5. La campaña es la protagonista; la plataforma no compite con su marca.

## Accessibility & Inclusion

Usuarios de edades y niveles digitales variados, a menudo en exteriores y con celulares de gama media: contraste alto, objetivos táctiles amplios y textos claros en español.
