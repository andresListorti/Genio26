import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { HERO_IMAGE } from "@/lib/images";

export default function Hero() {
  return (
    <section className="relative w-full overflow-hidden bg-surface">
      <div className="relative h-[78vh] min-h-[520px] max-h-[820px]">
        <Image
          src={HERO_IMAGE}
          alt="Colección Otoño Invierno"
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-black/15 to-transparent" />
        <div className="absolute inset-0 flex items-center">
          <div className="max-w-7xl mx-auto w-full px-6 lg:px-10">
            <div className="max-w-lg text-white">
              <p className="eyebrow text-white/80">Temporada 2026</p>
              <h1 className="heading-display text-5xl md:text-6xl lg:text-7xl mt-4 leading-[1.05]">
                Colección
                <br />
                Otoño Invierno
              </h1>
              <p className="mt-6 text-white/85 text-base md:text-lg max-w-md font-light">
                Cuero genuino, costura artesanal y siluetas atemporales.
                Calzado para acompañar tu día con elegancia.
              </p>
              <div className="mt-10 flex items-center gap-4">
                <Link
                  href="#catalogo"
                  className="group inline-flex items-center gap-3 bg-white text-foreground px-7 py-3.5 text-sm tracking-[0.2em] uppercase hover:bg-white/90 transition"
                >
                  Ver colección
                  <ArrowRight
                    size={16}
                    className="transition-transform group-hover:translate-x-1"
                  />
                </Link>
                <Link
                  href="/collections/men"
                  className="text-sm tracking-[0.2em] uppercase text-white/90 hover:text-white underline-offset-4 hover:underline"
                >
                  Hombre
                </Link>
                <Link
                  href="/collections/women"
                  className="text-sm tracking-[0.2em] uppercase text-white/90 hover:text-white underline-offset-4 hover:underline"
                >
                  Mujer
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
