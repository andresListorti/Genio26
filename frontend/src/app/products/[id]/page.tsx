import { cache } from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ChevronLeft } from "lucide-react";
import { api } from "@/lib/api";
import { shoeImage } from "@/lib/images";
import ProductDetailClient from "@/components/ProductDetailClient";

export const dynamic = "force-dynamic";

// Deduplicated within a single render cycle so generateMetadata and the page
// component share the same fetch result instead of hitting the API twice.
const getShoe = cache((id: string) => api.shoes.get(id));

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  try {
    const shoe = await getShoe(id);
    const img = shoeImage({
      imageUrl: shoe.imageUrl,
      model: shoe.model,
      category: shoe.category,
      width: 1200,
    });
    const description = shoe.description.slice(0, 155);
    const titleFull = `${shoe.brand} ${shoe.model}`;
    return {
      title: titleFull,
      description,
      openGraph: {
        type: "website",
        title: titleFull,
        description,
        images: [{ url: img, width: 1200, height: 900, alt: titleFull }],
      },
      twitter: {
        card: "summary_large_image",
        title: titleFull,
        description,
        images: [img],
      },
    };
  } catch {
    return { title: "Producto" };
  }
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  let shoe;
  try {
    shoe = await getShoe(id);
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-8 sm:py-10 lg:py-16">
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-xs uppercase tracking-[0.2em] text-muted hover:text-foreground mb-8 sm:mb-10"
      >
        <ChevronLeft size={14} /> Volver
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-10 lg:gap-20">
        {/* Images */}
        <div className="space-y-3 sm:space-y-4">
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
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
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
                  sizes="(max-width: 640px) 30vw, 200px"
                  className="object-cover opacity-90"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Detail */}
        <div className="lg:pt-6">
          <ProductDetailClient shoe={shoe} />
        </div>
      </div>
    </div>
  );
}
