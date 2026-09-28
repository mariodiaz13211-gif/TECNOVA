import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-line/80 bg-ink/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="group flex items-center gap-2">
          <span className="relative font-display text-xl font-medium tracking-tight text-paper">
            <span className="relative z-10">tec</span>
            <span className="relative z-10 text-cyan">nova</span>
            <span className="beam absolute -bottom-0.5 left-0 h-[3px] w-full origin-left scale-x-75 transition-transform duration-300 group-hover:scale-x-100" />
          </span>
        </Link>

        <nav className="hidden items-center gap-8 text-sm text-silver md:flex">
          <Link href="/catalogo" className="transition-colors hover:text-paper">
            Catálogo
          </Link>
          <Link
            href="/categorias"
            className="transition-colors hover:text-paper"
          >
            Categorías
          </Link>
          <Link href="/nosotros" className="transition-colors hover:text-paper">
            Nosotros
          </Link>
        </nav>

        <Link
          href="/cotizacion"
          className="rounded-sm border border-electric/60 bg-electric/10 px-4 py-2 text-sm font-medium text-paper transition-colors hover:bg-electric/20"
        >
          Mi cotización
        </Link>
      </div>
    </header>
  );
}
