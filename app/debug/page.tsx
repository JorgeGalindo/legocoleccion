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
      <h2 className="font-display text-3xl text-lego-black">debug</h2>

      <section>
        <h3 className="mb-3 font-display text-xl">searchSets</h3>
        <form className="mb-4 flex gap-2">
          <input
            name="q"
            defaultValue={q}
            placeholder="busca por código o nombre…"
            className="flex-1 rounded border-[3px] border-lego-black bg-white px-3 py-2 text-lego-black placeholder:text-lego-stone focus:outline-none focus:ring-2 focus:ring-lego-blue"
          />
          <button
            type="submit"
            className="rounded border-[3px] border-lego-black bg-lego-yellow px-4 py-2 font-bold uppercase tracking-wide text-lego-black hover:bg-yellow-300"
          >
            Buscar
          </button>
        </form>
        <p className="mb-2 text-sm text-lego-stone">
          Resultados: <strong className="text-lego-black">{matches.length}</strong>
        </p>
        <pre className="overflow-auto rounded border-2 border-lego-black bg-white p-4 text-xs">
          {JSON.stringify(matches, null, 2)}
        </pre>
      </section>

      <section>
        <h3 className="mb-3 font-display text-xl">listCopies</h3>
        <p className="mb-2 text-sm text-lego-stone">
          Total: <strong className="text-lego-black">{rows.length}</strong>
        </p>
        <pre className="overflow-auto rounded border-2 border-lego-black bg-white p-4 text-xs">
          {JSON.stringify(rows, null, 2)}
        </pre>
      </section>
    </div>
  );
}
