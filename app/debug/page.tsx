import { listCopies, searchSets } from "@/lib/db/queries";

export const dynamic = "force-dynamic";

export default async function DebugPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;
  const [rows, matches] = await Promise.all([
    listCopies(),
    q ? searchSets(q) : Promise.resolve([]),
  ]);

  return (
    <div className="mx-auto max-w-3xl space-y-10 px-6 py-12">
      <h2 className="font-display text-3xl text-fg">debug</h2>

      <section>
        <h3 className="mb-3 font-display text-xl text-fg">searchSets</h3>
        <form className="mb-4 flex gap-2">
          <input
            name="q"
            defaultValue={q}
            placeholder="busca por código o nombre…"
            className="flex-1 rounded border border-line bg-surface-2 px-3 py-2 text-fg placeholder:text-fg-dim focus:border-lego-yellow focus:outline-none"
          />
          <button
            type="submit"
            className="rounded bg-lego-yellow px-4 py-2 font-bold uppercase tracking-wide text-surface hover:opacity-90"
          >
            Buscar
          </button>
        </form>
        <p className="mb-2 text-sm text-fg-muted">
          Resultados: <strong className="text-fg">{matches.length}</strong>
        </p>
        <pre className="overflow-auto rounded border border-line bg-surface-2 p-4 text-xs text-fg-muted">
          {JSON.stringify(matches, null, 2)}
        </pre>
      </section>

      <section>
        <h3 className="mb-3 font-display text-xl text-fg">listCopies</h3>
        <p className="mb-2 text-sm text-fg-muted">
          Total: <strong className="text-fg">{rows.length}</strong>
        </p>
        <pre className="overflow-auto rounded border border-line bg-surface-2 p-4 text-xs text-fg-muted">
          {JSON.stringify(rows, null, 2)}
        </pre>
      </section>
    </div>
  );
}
