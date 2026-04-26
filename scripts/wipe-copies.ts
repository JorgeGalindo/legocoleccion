import "./_env";

import { db } from "../lib/db";
import { ownedCopies } from "../lib/db/schema";

async function main() {
  const before = await db.select({ id: ownedCopies.id }).from(ownedCopies);
  console.log(`Encontradas ${before.length} copias. Borrando todas…`);
  await db.delete(ownedCopies);
  const after = await db.select({ id: ownedCopies.id }).from(ownedCopies);
  console.log(`Hecho. Quedan ${after.length}.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
