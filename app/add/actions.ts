"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createCopy, searchSets } from "@/lib/db/queries";
import type { LegoSet } from "@/lib/db/schema";

export async function searchSetsAction(query: string): Promise<LegoSet[]> {
  return searchSets(query, 10);
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
  revalidatePath("/debug");

  const action = String(formData.get("_action") ?? "save");
  if (action === "save_and_add_another") {
    return { ok: true, resetToken: Date.now() };
  }
  redirect("/debug");
}
