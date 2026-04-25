import "./_env";

import { gunzipSync } from "node:zlib";
import { parse } from "csv-parse/sync";
import { sql } from "drizzle-orm";
import { db } from "../lib/db";
import { legoSets, type NewLegoSet } from "../lib/db/schema";

const SETS_URL = "https://cdn.rebrickable.com/media/downloads/sets.csv.gz";
const THEMES_URL = "https://cdn.rebrickable.com/media/downloads/themes.csv.gz";
const BATCH_SIZE = 500;

interface RawTheme {
  id: string;
  parent_id: string;
  name: string;
}

interface RawSet {
  set_num: string;
  name: string;
  year: string;
  theme_id: string;
  num_parts: string;
  img_url: string;
}

async function fetchGzCsv<T extends Record<string, string>>(
  url: string,
): Promise<T[]> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${url} → HTTP ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  const csv = gunzipSync(buf).toString("utf-8");
  return parse(csv, { columns: true, skip_empty_lines: true }) as T[];
}

function buildThemeNameMap(themes: RawTheme[]): Map<string, string> {
  const byId = new Map(themes.map((t) => [t.id, t]));
  const memo = new Map<string, string>();

  const fullName = (id: string): string => {
    if (memo.has(id)) return memo.get(id)!;
    const t = byId.get(id);
    if (!t) return "Unknown";
    const name = t.parent_id
      ? `${fullName(t.parent_id)} / ${t.name}`
      : t.name;
    memo.set(id, name);
    return name;
  };

  return new Map(themes.map((t) => [t.id, fullName(t.id)]));
}

async function main() {
  console.log("[1/4] Downloading themes.csv.gz…");
  const rawThemes = await fetchGzCsv<RawTheme>(THEMES_URL);
  console.log(`      ${rawThemes.length} themes`);

  console.log("[2/4] Downloading sets.csv.gz…");
  const rawSets = await fetchGzCsv<RawSet>(SETS_URL);
  console.log(`      ${rawSets.length} sets`);

  console.log("[3/4] Resolving theme names…");
  const themeMap = buildThemeNameMap(rawThemes);

  const records: NewLegoSet[] = rawSets.map((s) => ({
    setCode: s.set_num,
    setName: s.name,
    theme: themeMap.get(s.theme_id) ?? "Unknown",
    year: s.year ? Number.parseInt(s.year, 10) : null,
    pieces: s.num_parts ? Number.parseInt(s.num_parts, 10) : null,
    imageUrl: s.img_url || null,
    lastSyncedAt: new Date(),
  }));

  console.log(
    `[4/4] Upserting ${records.length} rows in batches of ${BATCH_SIZE}…`,
  );
  for (let i = 0; i < records.length; i += BATCH_SIZE) {
    const slice = records.slice(i, i + BATCH_SIZE);
    await db
      .insert(legoSets)
      .values(slice)
      .onConflictDoUpdate({
        target: legoSets.setCode,
        set: {
          setName: sql`excluded.set_name`,
          theme: sql`excluded.theme`,
          year: sql`excluded.year`,
          pieces: sql`excluded.pieces`,
          imageUrl: sql`excluded.image_url`,
          lastSyncedAt: sql`excluded.last_synced_at`,
        },
      });
    process.stdout.write(
      `\r      ${Math.min(i + BATCH_SIZE, records.length)}/${records.length}`,
    );
  }
  console.log("\nDone.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
