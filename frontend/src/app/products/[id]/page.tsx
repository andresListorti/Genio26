import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { api } from "@/lib/api";
import { shoeImage } from "@/lib/images";
import ProductDetailClient from "@/components/ProductDetailClient";

export const dynamic = "force-dynamic";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  let shoe;
  try {
    shoe = await api.shoes.get(id);
  } catch {
    notFound();
  }
  if (!shoe) notFound();

  const img = shoeImage({
    imageUrl: shoe.imageUrl,
    model: shoe.model,
    category: shoe.category,
    width: 1400,
  });

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-10 py-10 lg:py-16">
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-xs uppercase tracking-[0.2em] text-muted hover:text-foreground mb-10"
      >
        <ChevronLeft size={14} /> Volver
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-20">
        <div className="space-y-4">
          <div className="relative aspect-[4/5] w-full bg-surface overflow-hidden">
            <Image
              src={img}
              alt={`${shoe.brand} ${shoe.model}`}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[800, 600, 500].map((w, i) => (
              <div
                key={i}
                className="relative aspect-square bg-surface overflow-hidden"
              >
                <Image
                  src={shoeImage({
                    imageUrl: shoe.imageUrl,
                    model: shoe.model,
                    category: shoe.category,
                    width: w,
                  })}
                  alt=""
                  fill
                  sizes="200px"
                  className="object-cover opacity-90"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="lg:pt-6">
          <ProductDetailClient shoe={shoe} />
        </div>
      </div>
    </div>
  );
}
