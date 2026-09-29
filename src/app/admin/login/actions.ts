"use server";

import { createHash, timingSafeEqual } from "node:crypto";
import { redirect } from "next/navigation";
import { createSession, destroySession } from "@/lib/session";

export type LoginState = { error?: string };

function safeEqual(a: string, b: string) {
  const ha = createHash("sha256").update(a).digest();
  const hb = createHash("sha256").update(b).digest();
  return timingSafeEqual(ha, hb);
}

export async function login(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const user = String(formData.get("usuario") ?? "");
  const password = String(formData.get("contrasena") ?? "");

  const expectedUser = process.env.ADMIN_USER;
  const expectedPassword = process.env.ADMIN_PASSWORD;
  if (!expectedUser || !expectedPassword) {
    return { error: "El acceso de administración aún no está configurado." };
  }

  const okUser = safeEqual(user, expectedUser);
  const okPass = safeEqual(password, expectedPassword);

  if (!(okUser && okPass)) {
    // Pequeña espera para frenar intentos repetidos.
    await new Promise((r) => setTimeout(r, 800));
    return { error: "Usuario o contraseña incorrectos." };
  }

  await createSession(expectedUser);
  redirect("/admin");
}

export async function logout() {
  await destroySession();
  redirect("/admin/login");
}
