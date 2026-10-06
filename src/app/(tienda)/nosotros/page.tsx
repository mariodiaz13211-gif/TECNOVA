import Link from "next/link";

const categorias = [
  "Audífonos",
  "Bocinas",
  "Soportes para celular",
  "Cargadores y cables",
  "Luces LED",
  "Accesorios gaming",
];

export const metadata = {
  title: "Nosotros — TECNOVA",
};

export default function NosotrosPage() {
  return (
    <section className="mx-auto max-w-3xl px-6 py-16 md:py-24">
      <h1 className="font-display text-3xl text-paper md:text-4xl">Nosotros</h1>

      <div className="mt-6 space-y-4 text-sm leading-relaxed text-silver md:text-base">
        <p>
          TECNOVA es una tienda salvadoreña de accesorios tecnológicos.
          Nuestro objetivo es poner a tu alcance productos útiles para el día
          a día, con un catálogo claro y precios especiales según la
          cantidad que necesites.
        </p>
        <p>En nuestro catálogo encontrás:</p>
      </div>

      <ul className="mt-6 grid gap-3 sm:grid-cols-2">
        {categorias.map((categoria, i) => (
          <li
            key={categoria}
            className="corner-cut flex items-center gap-3 border border-line bg-panel/70 px-4 py-3"
          >
            <span
              className={`h-1.5 w-6 flex-shrink-0 rounded-full ${
                i % 2 === 0 ? "bg-electric" : "bg-cyan"
              }`}
            />
            <span className="text-sm text-paper">{categoria}</span>
          </li>
        ))}
      </ul>

      <div className="mt-8 space-y-4 text-sm leading-relaxed text-silver md:text-base">
        <p>
          Podés armar tu cotización sin crear una cuenta, revisar el precio
          según la cantidad que elijas y enviarla directo a nuestro WhatsApp
          para coordinar la compra.
        </p>
      </div>

      <div className="mt-10 flex flex-wrap gap-4">
        <Link
          href="/catalogo"
          className="rounded-sm bg-paper px-6 py-3 text-sm font-medium text-ink transition-opacity hover:opacity-90"
        >
          Ver catálogo
        </Link>
        <Link
          href="/cotizacion"
          className="rounded-sm border border-line px-6 py-3 text-sm font-medium text-paper transition-colors hover:border-silver-dim"
        >
          Mi cotización
        </Link>
      </div>
    </section>
  );
}
