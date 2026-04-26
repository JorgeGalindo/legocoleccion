import Link from "next/link";
import { AsciiBrick } from "@/components/AsciiBrick";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center px-6 py-20 text-center">
      <AsciiBrick size="lg" />
      <h2 className="mt-8 font-display text-3xl text-fg">
        Esta pieza no encaja
      </h2>
      <p className="mt-3 text-sm text-fg-muted">
        La página que buscas no existe. Puede que la hayas escrito mal o que se
        haya perdido bajo el sofá.
      </p>
      <Link
        href="/"
        className="mt-6 inline-block rounded bg-lego-yellow px-4 py-2 text-sm font-bold uppercase tracking-wide text-surface hover:bg-lego-yellow-deep"
      >
        Volver a la colección
      </Link>
    </div>
  );
}
