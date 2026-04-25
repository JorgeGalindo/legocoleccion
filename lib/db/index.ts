import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

const connectionString =
  process.env.DATABASE_URL ?? process.env.POSTGRES_URL;

if (!connectionString) {
  throw new Error(
    "Falta DATABASE_URL (o POSTGRES_URL). Comprueba .env.local en local o las env vars de Vercel en producción.",
  );
}

const sql = neon(connectionString);
export const db = drizzle(sql, { schema });
