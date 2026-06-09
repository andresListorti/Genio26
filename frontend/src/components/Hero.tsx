import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative w-full overflow-hidden">
      <div
        className="flex flex-col lg:flex-row"
        style={{ minHeight: "min(88vh, 820px)" }}
      >
        {/* ── Left: editorial copy ────────────────────────────────────────── */}
        <div className="order-2 lg:order-1 flex flex-col justify-center lg:w-[42%] bg-surface px-8 sm:px-14 lg:px-16 xl:px-20 py-14 lg:py-0">
          <p className="eyebrow mb-5">Colección Otoño · Invierno 2026</p>
          <h1
            className="heading-display leading-[1.04] text-foreground"
            style={{ fontSize: "clamp(2.4rem, 4.5vw, 4rem)" }}
          >
            Artesanía
            <br />
            en Cada
            <br />
            Paso
          </h1>
          <p className="mt-7 text-foreground/65 text-[0.95rem] lg:text-base max-w-xs font-light leading-[1.75]">
            Cuero genuino, costura artesanal y siluetas atemporales.
            Calzado para acompañar tu día con elegancia.
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-5">
            <Link
              href="#catalogo"
              className="group inline-flex items-center gap-3 bg-foreground text-background px-7 py-3.5 text-sm tracking-[0.18em] uppercase hover:opacity-80 transition-opacity"
            >
              Ver colección
              <ArrowRight
                size={15}
                className="transition-transform group-hover:translate-x-1"
              />
            </Link>
            <div className="flex items-center gap-3 text-sm tracking-[0.18em] uppercase text-foreground/55">
              <Link
                href="/collections/men"
                className="hover:text-foreground transition-colors underline-offset-4 hover:underline"
              >
                Hombre
              </Link>
              <span className="opacity-40 select-none">|</span>
              <Link
                href="/collections/women"
                className="hover:text-foreground transition-colors underline-offset-4 hover:underline"
              >
                Mujer
              </Link>
            </div>
          </div>
        </div>

        {/* ── Right: footwear image ───────────────────────────────────────── */}
        <div className="order-1 lg:order-2 relative lg:flex-1 h-[58vw] sm:h-[52vw] lg:h-auto">
          <Image
            src="/resources/footwear-1838767_1920.jpg"
            alt="Calzado artesanal Genaro — colección 2026"
            fill
            priority
            className="object-cover object-center"
            sizes="(max-width: 1024px) 100vw, 58vw"
          />
          {/* Gradient blends image into the bg-surface text panel on mobile */}
          <div className="absolute inset-0 lg:hidden bg-gradient-to-b from-transparent via-transparent to-surface/70 pointer-events-none" />
        </div>
      </div>
    </section>
  );
}
