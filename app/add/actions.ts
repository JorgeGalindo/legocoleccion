"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createCopy, searchSets, upsertSet } from "@/lib/db/queries";
import {
  resolveThemePath,
  searchSetsRebrickable,
} from "@/lib/rebrickable-api";
import type { LegoSet } from "@/lib/db/schema";

export async function searchSetsAction(query: string): Promise<LegoSet[]> {
  const local = await searchSets(query, 10);
  if (local.length > 0) return local;

  // Fallback: nada en local → preguntar a Rebrickable
  try {
    const remote = await searchSetsRebrickable(query);
    if (!remote.length) return [];

    const upserted: LegoSet[] = [];
    for (const r of remote) {
      const themeName = await resolveThemePath(r.theme_id).catch(
        () => `Theme #${r.theme_id}`,
      );
      const set = await upsertSet({
        setCode: r.set_num,
        setName: r.name,
        theme: themeName,
        year: r.year,
        pieces: r.num_parts,
        imageUrl: r.set_img_url,
      });
      upserted.push(set);
    }
    return upserted;
  } catch (e) {
    console.error("Rebrickable API fallback failed:", e);
    return [];
  }
}

export type ManualSetInput = {
  setCode: string;
  setName: string;
  theme: string;
  year: number | null;
  pieces: number | null;
};

export async function createManualSetAction(
  input: ManualSetInput,
): Promise<LegoSet> {
  const code = input.setCode.trim();
  const name = input.setName.trim();
  if (!code) throw new Error("El código es obligatorio.");
  if (!name) throw new Error("El nombre es obligatorio.");

  return upsertSet({
    setCode: code,
    setName: name,
    theme: input.theme.trim() || "Sin clasificar",
    year: input.year,
    pieces: input.pieces,
    imageUrl: null,
  });
}

export type CreateCopyState = {
  ok: boolean;
  error?: string;
  resetToken?: number;
};

const COMPLETE_VALUES = ["complete", "missing_pieces", "unknown"] as const;
type CompleteValue = (typeof COMPLETE_VALUES)[number];

function parseComplete(raw: unknown): CompleteValue {
  return COMPLETE_VALUES.includes(raw as CompleteValue)
    ? (raw as CompleteValue)
    : "unknown";
}

export async function createCopyAction(
  _prev: CreateCopyState,
  formData: FormData,
): Promise<CreateCopyState> {
  const setCode = String(formData.get("set_code") ?? "").trim();
  if (!setCode) {
    return { ok: false, error: "Selecciona un set primero." };
  }

  const priceRaw = String(formData.get("purchase_price") ?? "").trim();
  const monthRaw = String(formData.get("purchase_date") ?? "").trim();
  const dateRaw = /^\d{4}-\d{2}$/.test(monthRaw) ? `${monthRaw}-01` : "";
  const notesRaw = String(formData.get("notes") ?? "").trim();

  await createCopy({
    setCode,
    boxOpened: formData.get("box_opened") === "on",
    discontinued: formData.get("discontinued") === "on",
    complete: parseComplete(formData.get("complete")),
    purchasePrice: priceRaw || null,
    purchaseDate: dateRaw || null,
    notes: notesRaw || null,
  });

  revalidatePath("/");

  const action = String(formData.get("_action") ?? "save");
  if (action === "save_and_add_another") {
    return { ok: true, resetToken: Date.now() };
  }
  redirect("/");
}
