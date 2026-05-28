"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import type { Shoe } from "@/lib/types";
import ProductCard from "./ProductCard";

function matches(shoe: Shoe, query: string): boolean {
  const q = query.toLowerCase();
  return (
    shoe.brand.toLowerCase().includes(q) ||
    shoe.model.toLowerCase().includes(q) ||
    (shoe.category ?? "").toLowerCase().includes(q) ||
    (shoe.description ?? "").toLowerCase().includes(q)
  );
}

export default function CatalogClient({ shoes }: { shoes: Shoe[] }) {
  const searchParams = useSearchParams();
  const q = (searchParams.get("q") ?? "").trim();

  const filtered = useMemo(() => {
    if (!q) return shoes;
    return shoes.filter((s) => matches(s, q));
  }, [shoes, q]);

  return (
    <section
      id="catalogo"
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-16 sm:py-20 lg:py-24"
    >
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 sm:mb-14">
        <div>
          <p className="eyebrow">
            {q ? `Resultados para "${q}"` : "Lo último"}
          </p>
          <h2 className="heading-display text-3xl sm:text-4xl md:text-5xl mt-3">
            {q ? `${filtered.length} producto${filtered.length === 1 ? "" : "s"}` : "Nuevos ingresos"}
          </h2>
        </div>
        {!q && (
          <p className="text-muted max-w-md text-sm md:text-base">
            Modelos seleccionados de nuestra colección Otoño Invierno. Hechos
            para durar, pensados para el día a día.
          </p>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="py-20 text-center">
          <p className="heading-display text-2xl mb-3">Sin resultados</p>
          <p className="text-muted text-sm">
            {q
              ? `No encontramos productos para "${q}". Probá con otro término.`
              : "No hay productos disponibles. Asegurate de que la API esté corriendo."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-x-4 sm:gap-x-6 gap-y-10 sm:gap-y-14">
          {filtered.map((shoe) => (
            <ProductCard key={shoe.id} shoe={shoe} />
          ))}
        </div>
      )}
    </section>
  );
}
