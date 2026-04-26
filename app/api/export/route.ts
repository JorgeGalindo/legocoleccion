import type { NextRequest } from "next/server";
import { listCopies } from "@/lib/db/queries";

export const dynamic = "force-dynamic";

type Row = Awaited<ReturnType<typeof listCopies>>[number];

const HEADERS = [
  "set_code",
  "set_name",
  "theme",
  "year",
  "pieces",
  "box_opened",
  "complete",
  "discontinued",
  "purchase_price",
  "purchase_month",
  "notes",
  "created_at",
  "updated_at",
] as const;

function timestamp() {
  return new Date().toISOString().split("T")[0];
}

function csvEscape(value: unknown): string {
  if (value === null || value === undefined) return "";
  const s = String(value);
  if (/[,"\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function rowToCells(r: Row) {
  const { copy, set } = r;
  return [
    copy.setCode,
    set?.setName ?? "",
    set?.theme ?? "",
    set?.year ?? "",
    set?.pieces ?? "",
    copy.boxOpened ? "yes" : "no",
    copy.complete,
    copy.discontinued ? "yes" : "no",
    copy.purchasePrice ?? "",
    copy.purchaseDate ? copy.purchaseDate.slice(0, 7) : "",
    copy.notes ?? "",
    copy.createdAt instanceof Date
      ? copy.createdAt.toISOString()
      : (copy.createdAt ?? ""),
    copy.updatedAt instanceof Date
      ? copy.updatedAt.toISOString()
      : (copy.updatedAt ?? ""),
  ];
}

function toCsv(rows: Row[]): string {
  const lines = [HEADERS.join(",")];
  for (const r of rows) {
    lines.push(rowToCells(r).map(csvEscape).join(","));
  }
  return lines.join("\n");
}

export async function GET(req: NextRequest) {
  const format = req.nextUrl.searchParams.get("format") ?? "json";
  const rows = await listCopies();

  if (format === "csv") {
    return new Response(toCsv(rows), {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="legocoleccion-${timestamp()}.csv"`,
      },
    });
  }

  return new Response(JSON.stringify(rows, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="legocoleccion-${timestamp()}.json"`,
    },
  });
}
