import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { readSession } from "@/lib/session";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Administración — TECNOVA",
  robots: { index: false, follow: false },
};

export default async function LoginPage() {
  if (await readSession()) redirect("/admin");
  return (
    <main className="flex flex-1 items-center justify-center px-6 py-20">
      <div className="w-full max-w-sm">
        <p className="font-display text-2xl text-paper">
          tec<span className="text-cyan">nova</span>
        </p>
        <h1 className="mt-6 text-lg font-medium text-paper">
          Acceso de administración
        </h1>
        <LoginForm />
      </div>
    </main>
  );
}
