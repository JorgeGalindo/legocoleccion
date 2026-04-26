# legocoleccion

App web personal para catalogar una colección física de LEGO. En castellano, hecha a medida, no comercial.

Live: <https://legocoleccion.vercel.app>

## Documentación de diseño

- [`docs/CONCEPTO.md`](./docs/CONCEPTO.md) — concepto, modelo de datos, integración con Rebrickable, paleta y stack.
- [`docs/PLAN.md`](./docs/PLAN.md) — hoja de ruta en sprints. Fase 1 cerrada salvo Sprint 7 (seed desde libreta).

## Stack

- Next.js 16 (App Router) + React 19 + TypeScript
- Tailwind CSS v4 (paleta tipo EsadeEcPol + amarillo cálido `#EBA605`, tema oscuro fijo)
- Drizzle ORM + Postgres en Neon (servido por Vercel)
- Rebrickable: dumps semanales como fuente primaria del catálogo, API REST como fallback
- Deploy continuo en Vercel con cada push a `main`

## Modelo de datos

Dos tablas. Una fila en `owned_copies` = una copia física. Una fila en `lego_sets` = un set del catálogo (compartido entre copias).

- `lego_sets`: `set_code` (PK), `set_name`, `theme`, `year`, `pieces`, `image_url`, `last_synced_at`
- `owned_copies`: `id` (uuid), `set_code` (FK), `box_opened`, `complete` (`complete | missing_pieces | unknown`), `discontinued`, `purchase_price`, `purchase_date`, `notes`, timestamps

## Variables de entorno

| Variable | Dónde | Para qué |
|---|---|---|
| `POSTGRES_URL` (o `DATABASE_URL`) | Vercel + `.env.local` | runtime de la app |
| `POSTGRES_URL_NON_POOLING` (o `DATABASE_URL_UNPOOLED`) | `.env.local` | migraciones drizzle-kit |
| `REBRICKABLE_API_KEY` | Vercel + `.env.local` | fallback API y resolución de temas |

## Setup local

```bash
# 1. Trae el .env.local desde Vercel (Settings → Environment Variables)
# 2. Instala
npm install

# 3. Aplica el schema a Postgres (idempotente)
npm run db:push

# 4. Pobla el catálogo de sets desde los dumps de Rebrickable (~26.500 filas, 1-3 min)
npm run sync:rebrickable

# 5. Dev server
npm run dev
```

## Scripts disponibles

| Script | Para qué |
|---|---|
| `npm run dev` | servidor de desarrollo |
| `npm run build` / `npm start` | producción local |
| `npm run lint` | ESLint |
| `npm run db:push` | aplica el schema actual a Postgres |
| `npm run db:generate` | genera ficheros de migración SQL |
| `npm run db:studio` | UI web de Drizzle Studio sobre la DB |
| `npm run sync:rebrickable` | descarga dumps y popula `lego_sets` |
| `npm run db:wipe-copies` | borra todas las filas de `owned_copies` (no toca `lego_sets`) |

## Rutas

- `/` — vista de colección (filtros + sort + grid/lista + drawer de edición)
- `/add` — formulario de alta con typeahead (lookup local → fallback API → entrada manual)
- `/api/export?format=json|csv` — descarga del estado completo

## Cómo se actualiza el catálogo

`npm run sync:rebrickable` descarga los dumps semanales (`sets.csv.gz`, `themes.csv.gz`), resuelve la jerarquía de temas y hace `INSERT ... ON CONFLICT DO UPDATE`. Idempotente: ejecutarlo varias veces es seguro.

Para sets que no estén en el dump, hay dos rutas en el typeahead:
1. **Fallback automático** a la API REST de Rebrickable cuando la búsqueda local devuelve 0 resultados.
2. **Entrada manual** desde el panel "Añadirlo a mano +" para MOCs, polybags raros o cualquier código que ni Rebrickable conozca.
