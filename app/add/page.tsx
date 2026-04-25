import { AddCopyForm } from "./AddCopyForm";

export const dynamic = "force-dynamic";

export default function AddPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <h2 className="mb-1 font-display text-3xl text-fg">Añadir copia</h2>
      <p className="mb-8 text-sm text-fg-muted">
        Busca el set por código o nombre y completa el resto.
      </p>
      <AddCopyForm />
    </div>
  );
}
