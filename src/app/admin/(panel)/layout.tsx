import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/dal";
import { logout } from "../login/actions";

export const metadata: Metadata = {
  title: "Administración — TECNOVA",
  robots: { index: false, follow: false },
};

export default async function PanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();

  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b border-line/80 bg-ink-soft">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-6 py-4">
          <div className="flex items-center gap-8">
            <Link href="/admin" className="font-display text-lg text-paper">
              tec<span className="text-cyan">nova</span>
              <span className="ml-2 text-sm text-silver-dim">admin</span>
            </Link>
            <nav className="flex gap-5 text-sm text-silver">
              <Link href="/admin" className="hover:text-paper">
                Inicio
              </Link>
              <Link href="/admin/categorias" className="hover:text-paper">
                Categorías
              </Link>
              <Link href="/admin/productos" className="hover:text-paper">
                Productos
              </Link>
              <Link href="/admin/cotizaciones" className="hover:text-paper">
                Cotizaciones
              </Link>
              <Link href="/admin/configuracion" className="hover:text-paper">
                Configuración
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-5 text-sm">
            <Link href="/" className="text-silver hover:text-paper">
              Ver tienda
            </Link>
            <form action={logout}>
              <button type="submit" className="text-silver hover:text-paper">
                Cerrar sesión
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-10">
        {children}
      </main>
    </div>
  );
}
