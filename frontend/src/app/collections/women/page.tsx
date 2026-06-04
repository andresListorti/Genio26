import { Suspense } from "react";
import type { Metadata } from "next";
import CollectionView from "@/components/CollectionView";
import { api } from "@/lib/api";
import type { Shoe } from "@/lib/types";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Colección Mujer",
  description:
    "Calzado Genaro para mujer: botas, borcegos, mocasines y zapatos en cuero genuino. Diseño atemporal, hecho en Argentina.",
  openGraph: {
    title: "Colección Mujer | Genaro Calzado",
    description:
      "Botas, borcegos, mocasines y zapatos artesanales para mujer. Cuero genuino, hecho en Argentina.",
    images: [{ url: "/resources/IaDama.jpeg", width: 1200, height: 900, alt: "Colección Mujer Genaro" }],
  },
};

export default async function WomenCollectionPage() {
  let shoes: Shoe[] = [];
  try {
    shoes = await api.shoes.list({ gender: "women" });
  } catch (err) {
    console.error("Failed to load women's shoes from API:", err);
  }

  return (
    <Suspense fallback={null}>
      <CollectionView
        shoes={shoes}
        eyebrow="Colección Mujer"
        title="Mujer"
        description="Calzado Genaro para mujer. Diseño atemporal y materiales nobles, del taller a tu andar diario."
      />
    </Suspense>
  );
}
