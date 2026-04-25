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

## 3. Integración con Rebrickable

[Rebrickable](https://rebrickable.com) ofrece dos formas de obtener sus datos. Combinamos ambas: **dumps como fuente primaria, API como fallback**.

### 3.1. Dumps semanales (fuente primaria)

[`https://rebrickable.com/downloads/`](https://rebrickable.com/downloads/) publica CSV gzipped actualizados semanalmente. Para fase 1 solo descargamos dos:

- **`sets.csv.gz`** (~25k filas, pocos MB): `set_num`, `name`, `year`, `theme_id`, `num_parts`, `img_url`.
- **`themes.csv.gz`** (~cientos de filas): `id`, `parent_id`, `name`. La usamos en el import para resolver `theme_id` al nombre del tema y guardarlo desnormalizado en `lego_sets`.

**Flujo**:
1. **Bootstrap**: en el primer setup, un script descarga los CSV, parsea y popula `lego_sets`.
2. **Refresh**: a mano mediante un endpoint admin oculto (`POST /api/admin/sync-rebrickable`) cuando quieras tener sets nuevos. Cron semanal queda para fase 2.

**Ventajas sobre llamar a la API en cada búsqueda**:
- Typeahead instantáneo (SQL local, sin latencia de red).
- App no depende de Rebrickable estando arriba en runtime.
- Sin gestión de rate limits.

### 3.2. API REST (fallback)

La API key vive como `REBRICKABLE_API_KEY` en variables de entorno **server-side** (Route Handler / Server Action). **Nunca en el cliente**. Se usa solo en casos puntuales:

- Set raro no presente en el dump (poco probable, ~25k cubre prácticamente todo).
- Forzar refresh de un set concreto sin re-importar todo.
- Features futuras: price guide, minifigs, instrucciones de montaje.

### 3.3. Sin scraping

Los TOS de Rebrickable lo prohíben cuando hay alternativas oficiales. Con dumps + API ya está cubierto todo. LEGO.com es frágil (HTML cambiante, anti-bot) y tampoco aporta.

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
- **Campo combinado**: typeahead que busca tanto por código como por nombre directamente sobre `lego_sets` local (instantáneo). Eliges una sugerencia → autorrelleno.
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
