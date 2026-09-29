import "server-only";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

const globalForDb = globalThis as unknown as { pool?: Pool };

function getPool() {
  if (!globalForDb.pool) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error("Falta la variable DATABASE_URL.");
    }
    globalForDb.pool = new Pool({ connectionString, max: 5 });
  }
  return globalForDb.pool;
}

export const db = drizzle({ client: getPool(), schema });
