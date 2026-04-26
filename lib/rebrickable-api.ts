const BASE = "https://rebrickable.com/api/v3/lego";

function authHeaders() {
  const key = process.env.REBRICKABLE_API_KEY;
  if (!key) {
    throw new Error("REBRICKABLE_API_KEY no está definida en el entorno.");
  }
  return { Authorization: `key ${key}` };
}

export type RebrickableSet = {
  set_num: string;
  name: string;
  year: number | null;
  theme_id: number;
  num_parts: number | null;
  set_img_url: string | null;
};

const themeCache = new Map<
  number,
  { name: string; parentId: number | null }
>();

async function fetchTheme(id: number) {
  if (themeCache.has(id)) return themeCache.get(id)!;
  const res = await fetch(`${BASE}/themes/${id}/`, {
    headers: authHeaders(),
    next: { revalidate: 60 * 60 * 24 }, // 24h cache
  });
  if (!res.ok) {
    throw new Error(`Rebrickable themes/${id}: HTTP ${res.status}`);
  }
  const data = (await res.json()) as {
    id: number;
    parent_id: number | null;
    name: string;
  };
  const entry = { name: data.name, parentId: data.parent_id ?? null };
  themeCache.set(id, entry);
  return entry;
}

export async function resolveThemePath(id: number): Promise<string> {
  const parts: string[] = [];
  let cur: number | null = id;
  let safety = 8; // hard stop in case of cycles
  while (cur !== null && safety-- > 0) {
    const t = await fetchTheme(cur);
    parts.unshift(t.name);
    cur = t.parentId;
  }
  return parts.join(" / ");
}

export async function searchSetsRebrickable(
  query: string,
): Promise<RebrickableSet[]> {
  const url = new URL(`${BASE}/sets/`);
  url.searchParams.set("search", query);
  url.searchParams.set("page_size", "10");
  const res = await fetch(url.toString(), {
    headers: authHeaders(),
    next: { revalidate: 60 * 60 }, // 1h cache for searches
  });
  if (!res.ok) {
    throw new Error(`Rebrickable sets search: HTTP ${res.status}`);
  }
  const data = (await res.json()) as { results: RebrickableSet[] };
  return data.results;
}
