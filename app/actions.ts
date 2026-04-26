"use server";

import { revalidatePath } from "next/cache";
import { deleteCopy, updateCopy } from "@/lib/db/queries";

export type UpdateCopyState = {
  ok: boolean;
  error?: string;
};

const COMPLETE_VALUES = ["complete", "missing_pieces", "unknown"] as const;
type CompleteValue = (typeof COMPLETE_VALUES)[number];

function parseComplete(raw: unknown): CompleteValue {
  return COMPLETE_VALUES.includes(raw as CompleteValue)
    ? (raw as CompleteValue)
    : "unknown";
}

export async function updateCopyAction(
  id: string,
  _prev: UpdateCopyState,
  formData: FormData,
): Promise<UpdateCopyState> {
  const priceRaw = String(formData.get("purchase_price") ?? "").trim();
  const monthRaw = String(formData.get("purchase_date") ?? "").trim();
  const dateRaw = /^\d{4}-\d{2}$/.test(monthRaw) ? `${monthRaw}-01` : "";
  const notesRaw = String(formData.get("notes") ?? "").trim();

  await updateCopy(id, {
    boxOpened: formData.get("box_opened") === "on",
    discontinued: formData.get("discontinued") === "on",
    complete: parseComplete(formData.get("complete")),
    purchasePrice: priceRaw || null,
    purchaseDate: dateRaw || null,
    notes: notesRaw || null,
  });

  revalidatePath("/");
  return { ok: true };
}

export async function deleteCopyAction(id: string) {
  await deleteCopy(id);
  revalidatePath("/");
}
