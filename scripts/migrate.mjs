// Crea o actualiza las tablas de la base de datos antes de publicar el sitio.
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import pg from "pg";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error(
    "\n[TECNOVA] Falta la variable DATABASE_URL en Vercel (Settings > Environment Variables).\n",
  );
  process.exit(1);
}

const pool = new pg.Pool({ connectionString: url, max: 1 });
try {
  await migrate(drizzle({ client: pool }), { migrationsFolder: "./drizzle" });
  console.log("[TECNOVA] Base de datos al día.");
} catch (error) {
  console.error("[TECNOVA] Error al preparar la base de datos:", error);
  process.exit(1);
} finally {
  await pool.end();
}
