import { listCopies } from "@/lib/db/queries";

export const dynamic = "force-dynamic";

export default async function DebugPage() {
  const rows = await listCopies();

  return (
    <main className="mx-auto max-w-3xl p-8 font-mono text-sm">
      <h1 className="mb-2 text-2xl font-bold">debug — owned_copies</h1>
      <p className="mb-4 text-gray-600">
        Total: <strong>{rows.length}</strong>
      </p>
      <pre className="overflow-auto rounded bg-gray-100 p-4 text-xs">
        {JSON.stringify(rows, null, 2)}
      </pre>
    </main>
  );
}
