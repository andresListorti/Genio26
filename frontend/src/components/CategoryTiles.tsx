import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

const CATEGORIES = [
  {
    href: "/collections/women",
    label: "Mujer",
    image: "/resources/woman-2179062_1920.jpg",
    alt: "Mujer con borcegos de cuero sentada en la vereda",
  },
  {
    href: "/collections/men",
    label: "Hombre",
    image: "/resources/Men.jpg",
    alt: "Hombre atándose zapatos de cuero negro",
  },
];

export default function CategoryTiles() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 pt-16 sm:pt-20 lg:pt-24">
      <p className="eyebrow">Comprá por categoría</p>
      <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-6">
        {CATEGORIES.map((c) => (
          <Link
            key={c.href}
            href={c.href}
            className="group relative block aspect-[4/5] sm:aspect-[5/4] lg:aspect-[4/3] overflow-hidden bg-surface"
          >
            <Image
              src={c.image}
              alt={c.alt}
              fill
              sizes="(max-width: 768px) 50vw, 45vw"
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-4 sm:p-8 text-white">
              <h2 className="heading-display text-2xl sm:text-4xl">{c.label}</h2>
              <span className="mt-2 inline-flex items-center gap-2 text-[11px] sm:text-xs uppercase tracking-[0.18em]">
                Ver colección
                <ArrowRight size={13} className="transition-transform group-hover:translate-x-1" />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
