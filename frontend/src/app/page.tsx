import { Suspense } from "react";
import Hero from "@/components/Hero";
import CatalogClient from "@/components/CatalogClient";
import { api } from "@/lib/api";
import type { Shoe } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function Home() {
  let shoes: Shoe[] = [];
  try {
    shoes = await api.shoes.list();
  } catch (err) {
    console.error("Failed to load shoes from API:", err);
  }

  return (
    <>
      <Hero />
      <Suspense fallback={null}>
        <CatalogClient shoes={shoes} />
      </Suspense>
    </>
  );
}
