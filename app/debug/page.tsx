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
    <main className="mx-auto max-w-3xl space-y-10 p-8 font-mono text-sm">
      <h1 className="text-2xl font-bold">debug</h1>

      <section>
        <h2 className="mb-2 text-xl font-semibold">searchSets</h2>
        <form className="mb-3 flex gap-2">
          <input
            name="q"
            defaultValue={q}
            placeholder="busca por código o nombre…"
            className="flex-1 rounded border px-3 py-2"
          />
          <button
            type="submit"
            className="rounded border bg-gray-100 px-3 py-2 hover:bg-gray-200"
          >
            Buscar
          </button>
        </form>
        <p className="mb-2 text-gray-600">
          Resultados: <strong>{matches.length}</strong>
        </p>
        <pre className="overflow-auto rounded bg-gray-100 p-4 text-xs">
          {JSON.stringify(matches, null, 2)}
        </pre>
      </section>

      <section>
        <h2 className="mb-2 text-xl font-semibold">listCopies</h2>
        <p className="mb-2 text-gray-600">
          Total: <strong>{rows.length}</strong>
        </p>
        <pre className="overflow-auto rounded bg-gray-100 p-4 text-xs">
          {JSON.stringify(rows, null, 2)}
        </pre>
      </section>
    </main>
  );
}
