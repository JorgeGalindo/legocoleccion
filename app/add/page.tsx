import { AddCopyForm } from "./AddCopyForm";

export const dynamic = "force-dynamic";

export default function AddPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <h2 className="mb-8 font-display text-3xl text-fg">Añadir copia</h2>
      <AddCopyForm />
    </div>
  );
}
