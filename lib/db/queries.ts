import { desc, eq, ilike, or } from "drizzle-orm";
import { db } from "./index";
import {
  legoSets,
  ownedCopies,
  type NewLegoSet,
  type NewOwnedCopy,
} from "./schema";

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
