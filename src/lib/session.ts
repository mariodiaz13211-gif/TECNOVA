import "server-only";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const COOKIE = "tecnova_admin";
const DURATION_MS = 8 * 60 * 60 * 1000; // 8 horas

function getKey() {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error(
      "SESSION_SECRET no está configurada o tiene menos de 32 caracteres.",
    );
  }
  return new TextEncoder().encode(secret);
}

export async function createSession(user: string) {
  const expiresAt = new Date(Date.now() + DURATION_MS);
  const token = await new SignJWT({ user, role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expiresAt)
    .sign(getKey());

  const store = await cookies();
  store.set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

export async function readSession() {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getKey(), {
      algorithms: ["HS256"],
    });
    if (payload.role !== "admin") return null;
    return { user: String(payload.user) };
  } catch {
    return null;
  }
}

export async function destroySession() {
  (await cookies()).delete(COOKIE);
}

export const SESSION_COOKIE = COOKIE;
