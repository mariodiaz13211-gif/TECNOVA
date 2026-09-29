import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { readSession } from "./session";

/** Para páginas del panel: si no hay sesión válida, envía al login. */
export const requireAdmin = cache(async () => {
  const session = await readSession();
  if (!session) redirect("/admin/login");
  return session;
});

/** Para acciones (guardar, borrar): si no hay sesión válida, se detiene. */
export async function assertAdmin() {
  const session = await readSession();
  if (!session) throw new Error("No autorizado");
  return session;
}
