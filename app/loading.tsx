export default function Loading() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <div className="mb-4 h-9 w-48 animate-pulse rounded bg-surface-2" />
      <div className="h-36 animate-pulse rounded-lg bg-surface-2" />
      <div className="mt-6 mb-3 flex items-center justify-between">
        <div className="h-5 w-24 animate-pulse rounded bg-surface-2" />
        <div className="flex gap-2">
          <div className="h-9 w-44 animate-pulse rounded bg-surface-2" />
          <div className="h-9 w-28 animate-pulse rounded bg-surface-2" />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-72 animate-pulse rounded-lg bg-surface-2"
          />
        ))}
      </div>
    </div>
  );
}
