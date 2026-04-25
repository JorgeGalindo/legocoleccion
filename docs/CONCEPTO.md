# Concepto — Catalogador LEGO (fase 1)

> Documento vivo. Pensado para discutir y editar antes de escribir una sola línea de código.

## 1. Objetivo

Catalogar la colección física existente con el detalle suficiente para:

- Saber **qué tengo** (sets, número de copias, estado de cada una).
- Encontrar rápido **un set concreto** (búsqueda) o **un subconjunto** (filtros).
- Tener una base de datos limpia y exportable que aguante crecer en fases posteriores.

**No-objetivo en fase 1**: comprar/vender, gestión de piezas sueltas, valor de mercado, wishlist, multiusuario, fotos.

---

## 2. Modelo de datos

**Decisión clave 1**: una fila = **una copia física**. Si tengo dos veces el mismo set, son dos filas con el mismo `set_code` pero estados independientes.

**Decisión clave 2**: separamos en **dos tablas**:

- `lego_sets` → catálogo de sets que existen en el mundo (datos oficiales de Rebrickable). Compartido entre todas las copias.
- `owned_copies` → mis copias físicas. Apunta a `lego_sets` por `set_code`.

Esto evita duplicar nombre/tema/año cada vez que añado una copia, permite búsqueda rápida sobre el catálogo cacheado, y prepara el terreno para una futura wishlist (sets que existen pero no tengo).

### 2.1. Tabla `lego_sets` (catálogo, datos oficiales)

| Campo | Tipo | Origen | Notas |
|---|---|---|---|
| `set_code` | string (PK) | Rebrickable | ej. `10497` |
| `set_name` | string | Rebrickable | ej. "Galaxy Explorer" |
| `theme` | string | Rebrickable | clasificación oficial LEGO |
| `year` | int | Rebrickable | año de salida |
| `pieces` | int | Rebrickable | nº de piezas oficial |
| `image_url` | string | Rebrickable | portada del set |
| `last_synced_at` | timestamp | auto | última vez que refrescamos desde la API |

### 2.2. Tabla `owned_copies` (mis copias)

| Campo | Tipo | Origen | Notas |
|---|---|---|---|
| `id` | uuid | auto | interno |
| `set_code` | string (FK → `lego_sets`) | manual | clave del set |
| `discontinued` | bool | manual | descatalogado sí/no |
| `box_opened` | bool | manual | caja abierta sí/no |
| `complete` | enum | manual | `complete` / `missing_pieces` / `unknown` |
| `purchase_price` | decimal € | manual | precio de **esta** copia |
| `purchase_date` | date | manual, opcional | _añadido por mí, a confirmar_ |
| `notes` | text | manual | el "campo abierto" |
| `created_at` / `updated_at` | timestamp | auto | auditoría básica |

---

## 3. Integración Rebrickable

[Rebrickable API](https://rebrickable.com/api/) es gratis con API key. Tiene **dos usos** que cubren todo lo que necesitamos sin scraping:

### 3.1. Lookup por código

`GET /lego/sets/{set_num}/` → devuelve todos los datos del set. Se usa cuando ya tienes el código en la mano: lo metes en el form, autorrellenamos `lego_sets` y ya tienes nombre/tema/año/piezas/portada sin teclear nada.

### 3.2. Búsqueda rápida (typeahead) — para llenado rápido

`GET /lego/sets/?search=galaxy+explorer` → devuelve sets que coincidan parcialmente. Esto habilita un campo "busca un set" que ofrece sugerencias mientras escribes. Útil cuando **no recuerdas el código** pero sí el nombre, o solo una parte.

Flujo: tecleas "galax" → dropdown con "10497 Galaxy Explorer (Icons, 2022)" / "928 Galaxy Explorer (Space, 1979)" → eliges → todo autorrellenado.

### 3.3. Por qué no scraping

- Los TOS de Rebrickable lo prohíben cuando hay API disponible.
- LEGO.com es frágil (cambian HTML, anti-bot) y los TOS también lo restringen.
- BrickLink y Brickset tienen API oficial — sirven como fallback si algún set rarísimo falta en Rebrickable.

Conclusión: API oficial para todo. Scraping no aporta nada y trae fragilidad y riesgo legal.

### 3.4. Arquitectura (importante por móvil + Vercel)

- La API key de Rebrickable vive en variables de entorno del servidor (Route Handler / Server Action de Next.js). **Nunca en el cliente**.
- **Cache en Postgres**: la primera vez que tocamos un set lo guardamos en `lego_sets`. La segunda vez (otra copia del mismo set, otra búsqueda) servimos desde Postgres → instantáneo.
- Búsquedas rápidas: primero contra Postgres (`ILIKE` sobre `set_name`); si no hay resultados o son pocos, caemos a Rebrickable y cacheamos lo nuevo.
- Refresh manual disponible (botón "actualizar datos del catálogo") por si Rebrickable corrige algo — no automático.

---

## 4. Interacción / vistas

Propongo **una sola vista principal** + **un formulario de alta**. Nada más en fase 1.

### 4.1. Vista principal: Colección

- **Barra de búsqueda** arriba: por código o nombre, sobre **mi colección**.
- **Filtros** (sidebar en desktop, chips arriba en móvil):
  - Tema (multi-select).
  - Estado caja: abierta / cerrada.
  - Estado piezas: completo / incompleto / desconocido.
  - Descatalogado: sí / no.
  - Rango de año.
- **Resultados en grid** de tarjetas estilo "tile" LEGO: portada, código, nombre, badges de estado. Toggle a vista de lista densa para revisión rápida.
- **Click en tarjeta** → drawer lateral con todos los campos editables. No necesita página propia en fase 1.

### 4.2. Formulario de alta

- Botón "Añadir copia" siempre visible.
- **Campo combinado**: typeahead que busca tanto por código como por nombre (usa Rebrickable + cache local). Eliges una sugerencia → autorrelleno de `lego_sets`.
- El resto a mano: estado de caja, completo/incompleto, descatalogado, precio, fecha, notas.
- Botón "**Guardar y añadir otra**" para meter en lote varios sets — clave para fase 1.

### 4.3. Búsqueda vs filtros

Las dos. La búsqueda resuelve "tengo el set en la mano"; los filtros resuelven "quiero ver todos los City descatalogados con caja abierta". Son ejes distintos del mismo problema y conviven en la misma vista.

---

## 5. Estética: LEGO retro

Paleta basada en colores oficiales LEGO clásicos:

| Color | Hex | Uso |
|---|---|---|
| Rojo clásico | `#D01012` | acentos primarios, CTAs |
| Amarillo | `#F2CD37` | highlights, "completo" |
| Azul | `#0055BF` | navegación, links |
| Verde | `#237841` | éxito |
| Gris piedra | `#A0A5A9` | neutros |
| Negro | `#1B2A34` | texto, bordes |
| Crema | `#F4EFE6` | fondo (no blanco puro, da vibe retro) |

**Componentes**:

- Tarjetas con bordes gruesos (~3px) y esquinas redondeadas tipo "tile".
- Patrón sutil de studs (círculos) en headers / footers.
- Badges chunky (rectangulares con borde) para estados.
- Tipografía: una sans con carácter (Inter, Work Sans) + display retro opcional para títulos (Bungee o Lilita One — la fuente oficial LEGO no es libre).
- Sin sombras flotantes modernas. Bordes plenos y planos hacen el trabajo.

---

## 6. Stack técnico

- **Next.js 16** (App Router) + TypeScript.
- **Tailwind + shadcn/ui** customizados con la paleta LEGO.
- **Postgres en Neon** (free tier) vía Drizzle ORM.
- **Rebrickable API** integrada server-side, con cache en Postgres.
- **Despliegue en Vercel** desde el día uno (decisión 1: móvil desde ya).
- **Auth**: pendiente de decidir si la app va a ser pública o privada (ver decisiones tomadas más abajo). Si privada, basta con Clerk free tier o auth básica con email + magic link.

---

## 7. Fuera de alcance de fase 1

- Minifigs sueltas o piezas sueltas.
- Wishlist / sets que quiero comprar.
- Valor de mercado / tracking de precios.
- Multiusuario o colección compartida.
- Fotos (ni propias ni catalogadas más allá del thumbnail oficial cacheado).
- Importación masiva desde CSV.

---

## 8. Decisiones tomadas

1. ✅ **Móvil desde ya** → Vercel + Postgres (Neon).
2. ✅ **Rebrickable integrado** (lookup + búsqueda rápida, sin scraping).
3. ✅ **Sin `location`** (ubicación física fuera de fase 1).
4. ✅ **Sin fotos** propias.
5. ✅ **Descatalogado a mano**.
6. ✅ **Sin campos extra** por ahora.

## 9. Decisiones nuevas a confirmar

1. **¿La app es solo para ti o pública (read-only)?** Si solo tú escribes, necesitamos una auth simple. Si es solo lectura para otros, podemos hacer pública la vista de colección y proteger el alta/edición.
2. **¿Tienes ya cuenta en Vercel y Neon, o las creamos?**
3. **Próximo paso**: ¿pasamos a un plan de implementación (estructura de carpetas, migrations, primeros sprints) o queremos antes hacer un wireframe rápido de la vista principal?
