import { Suspense } from "react";
import type { Metadata } from "next";
import CollectionView from "@/components/CollectionView";
import { api } from "@/lib/api";
import type { Shoe } from "@/lib/types";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Colección Hombre",
  description:
    "Calzado Genaro para hombre: zapatos, mocasines, zapatillas y botas en cuero genuino. Construcción artesanal, envíos a todo el país.",
  openGraph: {
    title: "Colección Hombre | Genaro Calzado",
    description:
      "Zapatos, mocasines, zapatillas y botas artesanales para hombre. Cuero genuino, hecho en Argentina.",
    images: [{ url: "/resources/Men.jpg", width: 1200, height: 900, alt: "Colección Hombre Genaro" }],
  },
};

export default async function MenCollectionPage() {
  let shoes: Shoe[] = [];
  try {
    shoes = await api.shoes.list({ gender: "men" });
  } catch (err) {
    console.error("Failed to load men's shoes from API:", err);
  }

  return (
    <Suspense fallback={null}>
      <CollectionView
        shoes={shoes}
        eyebrow="Colección Hombre"
        title="Hombre"
        description="Calzado Genaro para hombre. Cuero genuino y construcción artesanal, pensado para el día a día y las ocasiones que importan."
      />
    </Suspense>
  );
}
