import {
  and,
  asc,
  desc,
  eq,
  gte,
  ilike,
  inArray,
  lte,
  or,
  type SQL,
} from "drizzle-orm";
import { db } from "./index";
import {
  legoSets,
  ownedCopies,
  type NewLegoSet,
  type NewOwnedCopy,
} from "./schema";

export type CompleteValue = "complete" | "missing_pieces" | "unknown";

export type SortValue =
  | "recent"
  | "year_desc"
  | "year_asc"
  | "price_desc"
  | "price_asc"
  | "name_asc";

export type CopiesFilter = {
  q?: string;
  themes?: string[];
  box?: "open" | "closed";
  pieces?: CompleteValue;
  disc?: "yes" | "no";
  yearMin?: number;
  yearMax?: number;
  sort?: SortValue;
};

// lego_sets

export async function getSetByCode(code: string) {
  const [set] = await db
    .select()
    .from(legoSets)
    .where(eq(legoSets.setCode, code));
  return set ?? null;
}

export async function searchSets(query: string, limit = 20) {
  const q = query.trim();
  if (!q) return [];
  return db
    .select()
    .from(legoSets)
    .where(
      or(ilike(legoSets.setName, `%${q}%`), ilike(legoSets.setCode, `${q}%`)),
    )
    .orderBy(desc(legoSets.year))
    .limit(limit);
}

export async function upsertSet(input: NewLegoSet) {
  const [row] = await db
    .insert(legoSets)
    .values(input)
    .onConflictDoUpdate({
      target: legoSets.setCode,
      set: {
        setName: input.setName,
        theme: input.theme,
        year: input.year,
        pieces: input.pieces,
        imageUrl: input.imageUrl,
        lastSyncedAt: new Date(),
      },
    })
    .returning();
  return row;
}

// owned_copies

export async function listCopies() {
  return db
    .select({
      copy: ownedCopies,
      set: legoSets,
    })
    .from(ownedCopies)
    .leftJoin(legoSets, eq(ownedCopies.setCode, legoSets.setCode));
}

export async function listCopiesFiltered(f: CopiesFilter = {}) {
  const conds: SQL[] = [];

  if (f.q?.trim()) {
    const q = f.q.trim();
    const expr = or(
      ilike(legoSets.setName, `%${q}%`),
      ilike(legoSets.setCode, `${q}%`),
    );
    if (expr) conds.push(expr);
  }
  if (f.themes?.length) {
    conds.push(inArray(legoSets.theme, f.themes));
  }
  if (f.box === "open") conds.push(eq(ownedCopies.boxOpened, true));
  if (f.box === "closed") conds.push(eq(ownedCopies.boxOpened, false));
  if (f.pieces) conds.push(eq(ownedCopies.complete, f.pieces));
  if (f.disc === "yes") conds.push(eq(ownedCopies.discontinued, true));
  if (f.disc === "no") conds.push(eq(ownedCopies.discontinued, false));
  if (f.yearMin !== undefined) conds.push(gte(legoSets.year, f.yearMin));
  if (f.yearMax !== undefined) conds.push(lte(legoSets.year, f.yearMax));

  const orderBy = (() => {
    switch (f.sort) {
      case "year_desc":
        return [desc(legoSets.year), desc(ownedCopies.createdAt)];
      case "year_asc":
        return [asc(legoSets.year), desc(ownedCopies.createdAt)];
      case "price_desc":
        return [desc(ownedCopies.purchasePrice), desc(ownedCopies.createdAt)];
      case "price_asc":
        return [asc(ownedCopies.purchasePrice), desc(ownedCopies.createdAt)];
      case "name_asc":
        return [asc(legoSets.setName), desc(ownedCopies.createdAt)];
      default:
        return [desc(ownedCopies.createdAt)];
    }
  })();

  return db
    .select({ copy: ownedCopies, set: legoSets })
    .from(ownedCopies)
    .innerJoin(legoSets, eq(ownedCopies.setCode, legoSets.setCode))
    .where(conds.length ? and(...conds) : undefined)
    .orderBy(...orderBy);
}

export async function listOwnedThemes() {
  const rows = await db
    .selectDistinct({ theme: legoSets.theme })
    .from(ownedCopies)
    .innerJoin(legoSets, eq(ownedCopies.setCode, legoSets.setCode))
    .orderBy(asc(legoSets.theme));
  return rows.map((r) => r.theme);
}

export async function getCopyById(id: string) {
  const [row] = await db
    .select({ copy: ownedCopies, set: legoSets })
    .from(ownedCopies)
    .innerJoin(legoSets, eq(ownedCopies.setCode, legoSets.setCode))
    .where(eq(ownedCopies.id, id))
    .limit(1);
  return row ?? null;
}

export async function createCopy(input: NewOwnedCopy) {
  const [row] = await db.insert(ownedCopies).values(input).returning();
  return row;
}

export async function updateCopy(
  id: string,
  patch: Partial<NewOwnedCopy>,
) {
  const [row] = await db
    .update(ownedCopies)
    .set({ ...patch, updatedAt: new Date() })
    .where(eq(ownedCopies.id, id))
    .returning();
  return row;
}

export async function deleteCopy(id: string) {
  await db.delete(ownedCopies).where(eq(ownedCopies.id, id));
}
