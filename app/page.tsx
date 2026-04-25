import { ChunkyBadge } from "@/components/ChunkyBadge";
import { TileCard } from "@/components/TileCard";

export default function HomePage() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <h2 className="mb-2 font-display text-4xl text-fg">Tu colección</h2>
      <p className="mb-8 text-fg-muted">
        Aquí vivirá la vista de la colección. De momento, una muestra del estilo.
      </p>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <TileCard>
          <div className="mb-3 flex flex-wrap gap-1.5">
            <ChunkyBadge variant="yellow">Icons</ChunkyBadge>
            <ChunkyBadge variant="green">Completo</ChunkyBadge>
          </div>
          <h3 className="font-display text-lg leading-tight text-fg">
            Galaxy Explorer
          </h3>
          <p className="text-sm text-fg-muted">10497 · 2022 · 1254 piezas</p>
        </TileCard>

        <TileCard>
          <div className="mb-3 flex flex-wrap gap-1.5">
            <ChunkyBadge variant="red">Descatalogado</ChunkyBadge>
            <ChunkyBadge variant="neutral">Caja abierta</ChunkyBadge>
          </div>
          <h3 className="font-display text-lg leading-tight text-fg">
            Café Corner
          </h3>
          <p className="text-sm text-fg-muted">10182 · 2007 · 2056 piezas</p>
        </TileCard>

        <TileCard>
          <div className="mb-3 flex flex-wrap gap-1.5">
            <ChunkyBadge variant="blue">Star Wars</ChunkyBadge>
            <ChunkyBadge variant="neutral">Sin verificar</ChunkyBadge>
          </div>
          <h3 className="font-display text-lg leading-tight text-fg">
            Imperial Star Destroyer
          </h3>
          <p className="text-sm text-fg-muted">75252 · 2019 · 4784 piezas</p>
        </TileCard>
      </div>
    </div>
  );
}
