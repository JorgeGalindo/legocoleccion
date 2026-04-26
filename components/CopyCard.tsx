import Link from "next/link";
import { ChunkyBadge } from "@/components/ChunkyBadge";
import { TileCard } from "@/components/TileCard";
import type { LegoSet, OwnedCopy } from "@/lib/db/schema";

function buildHref(baseSearch: string, copyId: string) {
  const next = new URLSearchParams(baseSearch);
  next.set("copy", copyId);
  return `/?${next.toString()}`;
}

export function CopyCard({
  copy,
  set,
  baseSearch,
}: {
  copy: OwnedCopy;
  set: LegoSet;
  baseSearch: string;
}) {
  return (
    <Link
      href={buildHref(baseSearch, copy.id)}
      className="block focus:outline-none focus:ring-2 focus:ring-lego-yellow"
      scroll={false}
    >
      <TileCard className="flex h-full flex-col gap-3">
        {set.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={set.imageUrl}
            alt=""
            className="h-32 w-full rounded bg-surface object-contain"
          />
        ) : (
          <div className="h-32 w-full rounded bg-surface" />
        )}

        <div className="flex flex-wrap gap-1.5">
          <ChunkyBadge variant="theme">{set.theme}</ChunkyBadge>
          {copy.complete === "complete" && (
            <ChunkyBadge variant="good">Completo</ChunkyBadge>
          )}
          {copy.complete === "missing_pieces" && (
            <ChunkyBadge variant="bad">Faltan piezas</ChunkyBadge>
          )}
          {copy.boxOpened ? (
            <ChunkyBadge variant="bad">Caja abierta</ChunkyBadge>
          ) : (
            <ChunkyBadge variant="good">Caja cerrada</ChunkyBadge>
          )}
          {copy.discontinued && (
            <ChunkyBadge variant="bad">Descatalogado</ChunkyBadge>
          )}
        </div>

        <div className="mt-auto">
          <h3 className="font-display text-base leading-tight text-fg">
            {set.setName}
          </h3>
          <p className="text-xs text-fg-muted">
            {set.setCode}
            {set.year ? ` · ${set.year}` : ""}
            {set.pieces ? ` · ${set.pieces} pz` : ""}
          </p>
        </div>
      </TileCard>
    </Link>
  );
}

export function CopyRow({
  copy,
  set,
  baseSearch,
}: {
  copy: OwnedCopy;
  set: LegoSet;
  baseSearch: string;
}) {
  return (
    <Link
      href={buildHref(baseSearch, copy.id)}
      className="flex items-center gap-3 px-4 py-3 hover:bg-surface-3 focus:bg-surface-3 focus:outline-none"
      scroll={false}
    >
      {set.imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={set.imageUrl}
          alt=""
          className="h-10 w-10 shrink-0 rounded bg-surface object-contain"
        />
      ) : (
        <div className="h-10 w-10 shrink-0 rounded bg-surface" />
      )}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm leading-tight text-fg">{set.setName}</p>
        <p className="truncate text-xs text-fg-dim">
          {set.setCode} · {set.theme}
          {set.year ? ` · ${set.year}` : ""}
        </p>
      </div>
      <div className="hidden shrink-0 gap-1 sm:flex">
        {copy.complete === "complete" && (
          <ChunkyBadge variant="good">OK</ChunkyBadge>
        )}
        {copy.complete === "missing_pieces" && (
          <ChunkyBadge variant="bad">Faltan</ChunkyBadge>
        )}
        {copy.boxOpened ? (
          <ChunkyBadge variant="bad">Abierta</ChunkyBadge>
        ) : (
          <ChunkyBadge variant="good">Cerrada</ChunkyBadge>
        )}
        {copy.discontinued && <ChunkyBadge variant="bad">Descat.</ChunkyBadge>}
      </div>
    </Link>
  );
}
