import Image from "next/image";
import Link from "next/link";
import type { Shoe } from "@/lib/types";
import { shoeImage } from "@/lib/images";
import { formatMoney } from "@/lib/format";

export default function ProductCard({ shoe }: { shoe: Shoe }) {
  const img = shoeImage({
    imageUrl: shoe.imageUrl,
    model: shoe.model,
    category: shoe.category,
    width: 900,
  });

  return (
    <Link
      href={`/products/${shoe.id}`}
      className="group block"
      prefetch={false}
    >
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-surface">
        <Image
          src={img}
          alt={`${shoe.brand} ${shoe.model}`}
          fill
          sizes="(max-width: 768px) 50vw, (max-width: 1280px) 33vw, 25vw"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
        />
      </div>
      <div className="mt-5 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="eyebrow">{shoe.brand}</p>
          <h3 className="mt-1 heading-display text-lg leading-tight">
            {shoe.model}
          </h3>
        </div>
        <p className="text-sm font-medium whitespace-nowrap pt-1">
          {formatMoney(shoe.price, shoe.currency)}
        </p>
      </div>
    </Link>
  );
}
