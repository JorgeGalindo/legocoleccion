import {
  pgTable,
  text,
  integer,
  timestamp,
  boolean,
  decimal,
  date,
  uuid,
  pgEnum,
} from "drizzle-orm/pg-core";

export const completeStatus = pgEnum("complete_status", [
  "complete",
  "missing_pieces",
  "unknown",
]);

export const legoSets = pgTable("lego_sets", {
  setCode: text("set_code").primaryKey(),
  setName: text("set_name").notNull(),
  theme: text("theme").notNull(),
  year: integer("year"),
  pieces: integer("pieces"),
  imageUrl: text("image_url"),
  lastSyncedAt: timestamp("last_synced_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const ownedCopies = pgTable("owned_copies", {
  id: uuid("id").primaryKey().defaultRandom(),
  setCode: text("set_code")
    .notNull()
    .references(() => legoSets.setCode),
  discontinued: boolean("discontinued").notNull().default(false),
  boxOpened: boolean("box_opened").notNull().default(false),
  complete: completeStatus("complete").notNull().default("unknown"),
  purchasePrice: decimal("purchase_price", { precision: 10, scale: 2 }),
  purchaseDate: date("purchase_date"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export type LegoSet = typeof legoSets.$inferSelect;
export type NewLegoSet = typeof legoSets.$inferInsert;
export type OwnedCopy = typeof ownedCopies.$inferSelect;
export type NewOwnedCopy = typeof ownedCopies.$inferInsert;
