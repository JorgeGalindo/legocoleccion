import Link from "next/link";
import { CollectionFilters } from "@/components/CollectionFilters";
import { CopyCard, CopyRow } from "@/components/CopyCard";
import { CopyDrawer } from "@/components/CopyDrawer";
import { SortToggle } from "@/components/SortToggle";
import { ViewToggle } from "@/components/ViewToggle";
import {
  getCopyById,
  listCopiesFiltered,
  listOwnedThemes,
  type CompleteValue,
  type CopiesFilter,
  type SortValue,
} from "@/lib/db/queries";

export const dynamic = "force-dynamic";

type Params = {
  q?: string;
  themes?: string;
  box?: string;
  pieces?: string;
  disc?: string;
  year_min?: string;
  year_max?: string;
  view?: string;
  sort?: string;
  copy?: string;
};

const VALID_SORTS: SortValue[] = [
  "recent",
  "year_desc",
  "year_asc",
  "price_desc",
  "price_asc",
  "name_asc",
];

function parseSort(raw: string | undefined): SortValue {
  return raw && (VALID_SORTS as string[]).includes(raw)
    ? (raw as SortValue)
    : "recent";
}

function parseFilters(sp: Params): CopiesFilter {
  const themes = sp.themes ? sp.themes.split(",").filter(Boolean) : undefined;
  const validComplete: CompleteValue[] = ["complete", "missing_pieces", "unknown"];
  return {
    q: sp.q,
    themes,
    box: sp.box === "open" || sp.box === "closed" ? sp.box : undefined,
    pieces:
      sp.pieces && validComplete.includes(sp.pieces as CompleteValue)
        ? (sp.pieces as CompleteValue)
        : undefined,
    disc: sp.disc === "yes" || sp.disc === "no" ? sp.disc : undefined,
    yearMin: sp.year_min ? Number.parseInt(sp.year_min, 10) || undefined : undefined,
    yearMax: sp.year_max ? Number.parseInt(sp.year_max, 10) || undefined : undefined,
    sort: parseSort(sp.sort),
  };
}

function buildBaseSearch(sp: Params): string {
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(sp)) {
    if (k === "copy") continue;
    if (typeof v === "string" && v) params.set(k, v);
  }
  return params.toString();
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<Params>;
}) {
  const sp = await searchParams;
  const filters = parseFilters(sp);
  const view = sp.view === "list" ? "list" : "grid";

  const [rows, ownedThemes, drawerData] = await Promise.all([
    listCopiesFiltered(filters),
    listOwnedThemes(),
    sp.copy ? getCopyById(sp.copy) : Promise.resolve(null),
  ]);

  const baseSearch = buildBaseSearch(sp);

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <h2 className="font-display text-3xl text-fg">Tu colección</h2>
        {rows.length > 0 && (
          <div className="flex gap-2 text-xs uppercase tracking-wide">
            <a
              href="/api/export?format=json"
              className="text-fg-muted underline hover:text-fg"
            >
              Exportar JSON
            </a>
            <span className="text-fg-dim">·</span>
            <a
              href="/api/export?format=csv"
              className="text-fg-muted underline hover:text-fg"
            >
              Exportar CSV
            </a>
          </div>
        )}
      </div>

      <CollectionFilters availableThemes={ownedThemes} />

      <div className="mt-6 mb-3 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-fg-muted">
          {rows.length} {rows.length === 1 ? "copia" : "copias"}
        </p>
        <div className="flex items-center gap-2">
          <SortToggle current={parseSort(sp.sort)} />
          <ViewToggle current={view} />
        </div>
      </div>

      {rows.length === 0 ? (
        <EmptyState hasFilters={baseSearch.length > 0} />
      ) : view === "list" ? (
        <ul className="divide-y divide-line overflow-hidden rounded-lg border border-line bg-surface-2">
          {rows.map(({ copy, set }) => (
            <li key={copy.id}>
              <CopyRow copy={copy} set={set} baseSearch={baseSearch} />
            </li>
          ))}
        </ul>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map(({ copy, set }) => (
            <CopyCard
              key={copy.id}
              copy={copy}
              set={set}
              baseSearch={baseSearch}
            />
          ))}
        </div>
      )}

      {drawerData && (
        <CopyDrawer copy={drawerData.copy} set={drawerData.set} />
      )}
    </div>
  );
}

function EmptyState({ hasFilters }: { hasFilters: boolean }) {
  return (
    <div className="rounded-lg border border-line bg-surface-2 p-10 text-center">
      <p className="font-display text-xl text-fg">
        {hasFilters ? "Nada con esos filtros" : "Aún no hay copias"}
      </p>
      <p className="mt-2 text-sm text-fg-muted">
        {hasFilters
          ? "Prueba a aflojar algún filtro o limpiarlos."
          : "Empieza con el botón de añadir."}
      </p>
      {!hasFilters && (
        <Link
          href="/add"
          className="mt-4 inline-block rounded bg-lego-yellow px-4 py-2 font-bold uppercase tracking-wide text-surface hover:opacity-90"
        >
          + Añadir primera copia
        </Link>
      )}
    </div>
  );
}
