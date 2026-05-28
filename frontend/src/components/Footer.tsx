export default function Footer() {
  return (
    <footer className="mt-auto border-t border-line bg-surface">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-14 grid gap-10 md:grid-cols-4 text-sm">
        <div>
          <p className="heading-display text-2xl tracking-[0.3em]">GENARO</p>
          <p className="mt-3 text-muted">
            Calzado artesanal desde 1962. Hecho en Argentina.
          </p>
        </div>
        <div>
          <p className="eyebrow mb-3">Tienda</p>
          <ul className="space-y-2 text-foreground/80">
            <li>Hombre</li>
            <li>Mujer</li>
            <li>Niños</li>
            <li>Outlet</li>
          </ul>
        </div>
        <div>
          <p className="eyebrow mb-3">Ayuda</p>
          <ul className="space-y-2 text-foreground/80">
            <li>Envíos</li>
            <li>Cambios</li>
            <li>Guía de talles</li>
            <li>Contacto</li>
          </ul>
        </div>
        <div>
          <p className="eyebrow mb-3">Newsletter</p>
          <p className="text-muted text-xs mb-3">
            Recibí las novedades y un 10% en tu primera compra.
          </p>
          <form className="flex border border-line bg-background">
            <input
              type="email"
              placeholder="tu@email.com"
              className="flex-1 px-3 py-2 text-xs outline-none bg-transparent"
            />
            <button
              type="button"
              className="px-4 text-xs uppercase tracking-wider bg-foreground text-background"
            >
              Unirme
            </button>
          </form>
        </div>
      </div>
      <div className="border-t border-line py-5 text-center text-[11px] tracking-[0.2em] uppercase text-muted">
        © {new Date().getFullYear()} Zapatería Genaro
      </div>
    </footer>
  );
}
