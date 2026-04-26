# Plan de implementación — fase 1

> Cada sprint es pequeño y termina con algo desplegado en Vercel que se puede ver en el navegador. Avanzamos sprint a sprint, confirmando antes de pasar al siguiente.

**Stack confirmado**: Next.js 16 (App Router) + TypeScript + Tailwind v4 + Drizzle ORM + Postgres en Neon + Rebrickable (dumps + API REST como fallback) + deploy en Vercel.

**Auth**: ninguna. URL pública. Anotar para fase 2: si la URL se filtra, alguien podría editar la colección. En fase 1 vivimos con eso (security through obscurity).

## Estado actual (26-abr-2026)

✅ **Sprints 0-6 cerrados.** App desplegada en `legocoleccion.vercel.app` con catálogo de 26.533 sets, formulario de alta con typeahead y entrada manual, vista de colección con filtros + sort + drawer de edición, exportación JSON/CSV, paleta dark con paleta EsadeEcPol + amarillo `#EBA605`.

🟡 **Sprint 7 pendiente**: transcripción de la libreta de Julia y Víctor. Empieza cuando el usuario suba fotos al chat.

### Decisiones tomadas sobre la marcha (fuera del plan original)

- **shadcn/ui descartado** en fase 1: los pocos componentes (`<TileCard>`, `<ChunkyBadge>`, `<StudPattern>`, `<Select>`) se construyeron a mano. shadcn queda disponible para fase 2 si entran primitivos más complejos.
- **Estética flipada a dark**: el plan original era "LEGO retro" en crema. Tras la primera versión se rediseñó a fondo casi-negro con acentos LEGO. La paleta final es EsadeEcPol + amarillo `#EBA605` específicamente elegido por el usuario.
- **Badges semánticos en vez de literales**: variantes `theme | good | bad | info | neutral`. El color no se elige por estética sino por significado: malo→rojo suave, bueno→verde suave.
- **`complete` simplificado a checkbox**: el enum sigue siendo `complete | missing_pieces | unknown` en DB pero la UI solo expone "faltan piezas" como check. `unknown` solo es alcanzable por seed/migration.
- **API fallback + entrada manual** añadidos a sprints 4-5: cuando un set no está en el dump, se llama a la API REST. Si tampoco está allí, panel "Añadirlo a mano +" para MOCs y customs.
- **`db:wipe-copies` añadido**: utilidad para borrar todas las copias durante pruebas.

---

## Sprint 0 — Setup base ✋ requiere acciones tuyas

**Objetivo**: tener el esqueleto deplegado en una URL de Vercel, vacío pero vivo.

- [x] Crear repo `legocoleccion` en GitHub (vacío).
- [x] `npx create-next-app@latest legocoleccion` (TypeScript, Tailwind, App Router, sin src/, sin ESLint custom).
- [x] Push inicial al repo.
- [x] En Vercel: "Import project" desde el repo de GitHub.
- [x] En Vercel → Storage: crear Postgres (Neon). Autoinyecta `DATABASE_URL`.
- [x] Conseguir API key de [Rebrickable](https://rebrickable.com/users/profile/) y añadirla como `REBRICKABLE_API_KEY` en env vars de Vercel.
- [x] Primer deploy. URL pública funcionando.

**DoD**: `https://legocoleccion-xxx.vercel.app` carga la página por defecto de Next.

---

## Sprint 1 — Modelo de datos

**Objetivo**: tablas creadas en Neon, helpers básicos para leer/escribir.

- [x] Instalar Drizzle ORM + drizzle-kit.
- [x] Definir schema en `db/schema.ts`: `lego_sets`, `owned_copies` (campos del CONCEPTO §2).
- [x] Configurar `drizzle.config.ts` apuntando a `DATABASE_URL`.
- [x] Generar y aplicar primera migración a Neon.
- [x] Helpers en `db/queries.ts`: `getSetByCode`, `upsertSet`, `listCopies`, `createCopy`, `updateCopy`, `deleteCopy`.

**DoD**: una página `/debug` (temporal) muestra `listCopies()` (vacío). Confirma que la conexión funciona en producción.

---

## Sprint 2 — Bootstrap del catálogo desde Rebrickable dumps

**Objetivo**: tener `lego_sets` poblado con todos los sets oficiales (~25k) listos para typeahead instantáneo, sin depender de la API en runtime.

- [x] `scripts/sync-rebrickable-dumps.ts`:
  - Descarga `sets.csv.gz` y `themes.csv.gz` de https://rebrickable.com/downloads/.
  - Descomprime y parsea (CSV streaming para no cargar todo en memoria).
  - Resuelve `theme_id` → nombre del tema (lookup contra `themes.csv`).
  - `INSERT ... ON CONFLICT (set_code) DO UPDATE` sobre `lego_sets`.
- [x] Endpoint admin oculto `POST /api/admin/sync-rebrickable` que ejecuta el script. Sin UI por ahora — se invoca con curl/Postman.
- [x] Función `searchSets(query)`: `ILIKE` sobre `set_name` + prefix match sobre `set_code`. Solo SQL local, sin red.
- [x] (Opcional, aplazable a sprint posterior) Wrapper API REST como fallback: `lib/rebrickable-api.ts` con `getSetByCodeFromAPI` para cuando un set no esté en el dump.

**DoD**: tras invocar `/api/admin/sync-rebrickable`, `lego_sets` tiene ~25k filas. En `/debug`, un input typeahead que llama a `searchSets("galax")` muestra resultados al instante.

---

## Sprint 3 — Estética y componentes base

**Objetivo**: la app ya parece "LEGO retro", aunque esté vacía.

- [x] Instalar shadcn/ui y configurar.
- [x] Extender `tailwind.config` con la paleta LEGO (variables CSS).
- [x] Importar fuentes (Inter + Bungee/Lilita One para títulos).
- [x] Componentes base: `<TileCard>`, `<ChunkyBadge>`, `<StudPattern>` (decoración de header).
- [x] Layout root con header (studs visibles), fondo crema, footer mínimo.

**DoD**: la home muestra el chrome estilizado. Sin datos todavía.

---

## Sprint 4 — Formulario de alta

**Objetivo**: poder añadir copias a la colección desde el navegador (también móvil).

- [x] Ruta `/add` (o sheet desde la home).
- [x] Combobox typeahead: busca por código o nombre, muestra sugerencias con portada.
- [x] Al elegir un set: autorrelleno visible (read-only) de nombre/tema/año/piezas.
- [x] Campos manuales: caja abierta, completo, descatalogado, precio, fecha, notas.
- [x] Server Action `createCopyAction`.
- [x] Botón "Guardar" y "Guardar y añadir otra" (limpia form).

**DoD**: meto 3 sets distintos desde móvil sin teclear sus datos oficiales. Aparecen en `/debug`.

---

## Sprint 5 — Vista principal: colección

**Objetivo**: la home es la vista de colección, con búsqueda y filtros.

- [x] Página `/` lista todas las copias en grid de `<TileCard>`.
- [x] Búsqueda local (input arriba) por código o nombre **dentro de mi colección**.
- [x] Filtros: tema, caja, estado piezas, descatalogado, rango año.
- [x] Toggle grid / lista densa.
- [x] Click en tarjeta → drawer con todos los campos, editable.
- [x] Server Action `updateCopyAction` y `deleteCopyAction`.

**DoD**: filtro por tema "Icons" + caja cerrada + completo y veo solo lo que cuadra.

---

## Sprint 6 — Pulido y export

**Objetivo**: dejarlo presentable y con escapatoria de datos.

- [x] Empty states (colección vacía, sin resultados de filtro).
- [x] Estados de carga (skeleton en grid, spinner en typeahead).
- [x] Responsive cuidado (filtros como sheet en móvil).
- [x] Export a JSON y CSV.
- [x] Borrar `/debug`.

**DoD**: la app es usable de verdad.

---

## Sprint 7 — Seed desde libreta (transcripción asistida)

**Objetivo**: cargar la colección real partiendo de las fotos de la libreta donde el usuario ya tiene la info anotada.

- [ ] Usuario sube fotos de la libreta (en chat, no en la app).
- [ ] Yo transcribo cada página a una tabla intermedia (markdown o JSON) con: `set_code`, estado de caja, completo/incompleto, precio, descatalogado, notas. Si hay datos ambiguos en la libreta, se marcan para revisión y no se inventan.
- [ ] Usuario revisa la transcripción y corrige errores antes de cargar.
- [ ] Script de import que lee el JSON revisado y crea las `owned_copies` (autorrelleno de `lego_sets` vía Rebrickable según se importan).
- [ ] Verificación final: `listCopies()` cuadra con lo transcrito.

**DoD**: la colección real está en la DB, partiendo de la libreta, con el usuario habiendo validado la transcripción antes del import.

**Notas**:
- Si una página tiene mucho contenido o letra difícil, mejor dividir en varios mensajes.
- Yo transcribo lo que se ve; lo que no se vea claro lo marco como `???` para que tú decidas.
- El import puede ir por lotes (página a página) en lugar de todo de golpe — más fácil de revisar.

---

## Después de fase 1

Candidatos a fase 2 (no decidir aún):

- Auth ligera si la URL se filtra.
- Wishlist (ya tenemos `lego_sets`, solo falta una tabla `wishlist`).
- Importación CSV (si tienes hoja previa).
- Fotos propias.
- Tracking de valor de mercado (BrickLink price guide).
- Estadísticas (gasto total, distribución por tema, etc.).

---

## Cómo trabajamos

Sprint a sprint. Yo te aviso al empezar cada uno qué voy a tocar, ejecuto, y al terminar te doy el commit + URL para que valides. Si algo no te gusta, retrocedemos sin drama.
