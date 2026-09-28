import Link from "next/link";

const categorias = [
  "Audífonos",
  "Bocinas",
  "Soportes para celular",
  "Cargadores y cables",
  "Luces LED",
  "Gaming",
];

export function SiteFooter() {
  return (
    <footer className="border-t border-line/80 bg-ink-soft">
      <div className="mx-auto max-w-6xl px-6 py-14">
        <div className="grid gap-10 md:grid-cols-[1.3fr_1fr_1fr]">
          <div>
            <p className="font-display text-lg text-paper">
              tec<span className="text-cyan">nova</span>
            </p>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-silver">
              Innovación en tecnología para tu día a día. Accesorios
              tecnológicos con envíos a todo El Salvador.
            </p>
          </div>

          <div>
            <p className="text-sm font-medium text-paper">Categorías</p>
            <ul className="mt-3 space-y-2 text-sm text-silver">
              {categorias.map((categoria) => (
                <li key={categoria}>
                  <Link
                    href="/catalogo"
                    className="transition-colors hover:text-paper"
                  >
                    {categoria}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-sm font-medium text-paper">Atención</p>
            <ul className="mt-3 space-y-2 text-sm text-silver">
              <li>Cotización sin necesidad de crear cuenta</li>
              <li>Respuesta directa por WhatsApp</li>
              <li>Envío gratis desde $30.00</li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col-reverse items-center gap-4 border-t border-line/80 pt-6 text-xs text-silver-dim md:flex-row md:justify-between">
          <p>© {new Date().getFullYear()} TECNOVA. Todos los derechos reservados.</p>
          <Link href="/admin" className="hover:text-silver">
            Administración
          </Link>
        </div>
      </div>
    </footer>
  );
}
