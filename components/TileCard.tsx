import { cn } from "@/lib/utils";

export function TileCard({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-lg border-[3px] border-lego-black bg-white p-4",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
