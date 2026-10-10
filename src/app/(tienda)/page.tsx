import Link from "next/link";

const categorias = [
  { nombre: "Audífonos", nota: "Con y sin cable" },
  { nombre: "Bocinas", nota: "Portátiles y de escritorio" },
  { nombre: "Soportes para celular", nota: "Auto, escritorio y trípode" },
  { nombre: "Cargadores y cables", nota: "USB-C, Lightning y más" },
  { nombre: "Luces LED", nota: "Ambientales y para escritorio" },
  { nombre: "Accesorios gaming", nota: "Mouse, teclados y audífonos" },
];

const valores = [
  {
    titulo: "Envío gratis desde $30.00",
    detalle: "Pedidos menores tienen un envío plano de $3.00 a nivel nacional.",
  },
  {
    titulo: "Cotización sin crear cuenta",
    detalle: "Arma tu pedido y recibe el precio exacto según la cantidad.",
  },
  {
    titulo: "Confirmación por WhatsApp",
    detalle: "Enviamos el resumen directo a tu WhatsApp para cerrar la compra.",
  },
];

export default function Home() {
  return (
    <>
      <div className="mx-auto max-w-6xl px-6 pt-6">
        <div className="group inline-flex items-center gap-2">
          <span className="relative font-display text-xl font-medium tracking-tight text-paper">
            <span className="relative z-10">tec</span>
            <span className="relative z-10 text-cyan">nova</span>
            <span className="beam absolute -bottom-0.5 left-0 h-[3px] w-full origin-left scale-x-75 transition-transform duration-300 group-hover:scale-x-100" />
          </span>
        </div>
      </div>

      <section className="relative overflow-hidden border-b border-line/80">
        <div className="beam absolute -right-24 top-0 h-[520px] w-[420px] rotate-12 opacity-20 blur-3xl" />

        <div className="relative mx-auto grid max-w-6xl gap-10 px-6 py-20 md:grid-cols-[1.1fr_0.9fr] md:py-28">
          <div>
            <h1 className="font-display text-4xl leading-[1.1] tracking-tight text-paper md:text-6xl">
              Innovación en tecnología
              <br />
              para tu día a día.
            </h1>
            <p className="mt-6 max-w-md text-base leading-relaxed text-silver">
              Audífonos, bocinas, cargadores y accesorios gaming, con precios
              especiales por cantidad y cotización directa a tu WhatsApp.
            </p>

            <div className="mt-9 flex flex-wrap gap-4">
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
                Solicitar cotización
              </Link>
            </div>
          </div>

          <div className="relative hidden md:block">
            <div className="corner-cut absolute inset-0 border border-line bg-panel/60" />
            <div className="absolute left-8 top-8 h-16 w-16 rounded-full border border-cyan/40" />
            <div className="beam absolute bottom-10 right-10 h-24 w-1 rotate-12 rounded-full" />
          </div>
        </div>
      </section>

      <section className="border-b border-line/80 bg-ink-soft">
        <div className="mx-auto grid max-w-6xl gap-8 px-6 py-14 md:grid-cols-3">
          {valores.map((valor) => (
            <div key={valor.titulo}>
              <p className="text-sm font-medium text-paper">{valor.titulo}</p>
              <p className="mt-2 text-sm leading-relaxed text-silver">
                {valor.detalle}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="flex items-end justify-between gap-4">
          <h2 className="font-display text-2xl text-paper md:text-3xl">
            Categorías
          </h2>
          <Link
            href="/catalogo"
            className="text-sm text-silver transition-colors hover:text-paper"
          >
            Ver todo el catálogo
          </Link>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categorias.map((categoria, i) => (
            <Link
              key={categoria.nombre}
              href="/catalogo"
              className="corner-cut group relative border border-line bg-panel/70 p-6 transition-colors hover:border-electric/60"
            >
              <div
                className={`h-1.5 w-10 rounded-full ${
                  i % 2 === 0 ? "bg-electric" : "bg-cyan"
                }`}
              />
              <p className="mt-5 font-display text-lg text-paper">
                {categoria.nombre}
              </p>
              <p className="mt-1 text-sm text-silver">{categoria.nota}</p>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
