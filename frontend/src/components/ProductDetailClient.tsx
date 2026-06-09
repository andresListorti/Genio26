"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ShoppingBag, ShieldCheck, Truck } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { formatMoney } from "@/lib/format";
import type { Shoe } from "@/lib/types";
import ProfileRequiredModal from "@/components/ProfileRequiredModal";

export default function ProductDetailClient({ shoe }: { shoe: Shoe }) {
  const { addItem, loading, error, cart } = useCart();
  const { user, profile } = useAuth();
  const router = useRouter();
  const [localError, setLocalError] = useState<string | null>(null);
  const [profileModal, setProfileModal] = useState<
    "not-logged-in" | "incomplete-profile" | null
  >(null);

  // Determines whether the current user is cleared to add items to the cart.
  function getProfileBlock(): "not-logged-in" | "incomplete-profile" | null {
    if (!user) return "not-logged-in";
    if (!profile?.address?.trim() || !profile?.phone?.trim())
      return "incomplete-profile";
    return null;
  }

  const colors = useMemo(
    () => Array.from(new Set(shoe.variants.map((v) => v.color))),
    [shoe.variants],
  );

  const [selectedColor, setSelectedColor] = useState<string | null>(
    colors[0] ?? null,
  );

  const sizesForColor = useMemo(
    () =>
      shoe.variants
        .filter((v) => v.color === selectedColor)
        .sort((a, b) => a.size - b.size),
    [shoe.variants, selectedColor],
  );

  const [selectedSize, setSelectedSize] = useState<number | null>(null);

  const handleAdd = async () => {
    setLocalError(null);
    const block = getProfileBlock();
    if (block) {
      setProfileModal(block);
      return;
    }
    if (!selectedColor || !selectedSize) {
      setLocalError("Seleccioná color y talle");
      return;
    }
    await addItem({
      shoeId: shoe.id,
      size: selectedSize,
      color: selectedColor,
      quantity: 1,
    });
  };

  const handleCheckout = async () => {
    setLocalError(null);
    const block = getProfileBlock();
    if (block) {
      setProfileModal(block);
      return;
    }
    if (!selectedColor || !selectedSize) {
      setLocalError("Seleccioná color y talle");
      return;
    }
    // Payment lives exclusively on /cart — here we only add and route there.
    await addItem(
      {
        shoeId: shoe.id,
        size: selectedSize,
        color: selectedColor,
        quantity: 1,
      },
      { open: false },
    );
    router.push("/cart");
  };

  return (
    <>
    <div className="space-y-8">
      <div>
        <p className="eyebrow">{shoe.brand}</p>
        <h1 className="heading-display text-4xl md:text-5xl mt-3">
          {shoe.model}
        </h1>
        <p className="mt-4 text-2xl font-light">
          {formatMoney(shoe.price, shoe.currency)}{" "}
          <span className="text-xs uppercase tracking-widest text-muted">
            {shoe.currency}
          </span>
        </p>
      </div>

      <p className="text-foreground/75 leading-relaxed">{shoe.description}</p>

      {colors.length > 0 && (
        <div>
          <div className="flex justify-between items-baseline mb-3">
            <p className="eyebrow">Color</p>
            <p className="text-xs text-muted capitalize">
              {selectedColor ?? "—"}
            </p>
          </div>
          <div className="flex gap-3 flex-wrap">
            {colors.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => {
                  setSelectedColor(color);
                  setSelectedSize(null);
                }}
                className={`px-4 py-2 text-xs uppercase tracking-wider border transition ${
                  selectedColor === color
                    ? "border-foreground bg-foreground text-background"
                    : "border-line hover:border-foreground"
                }`}
              >
                {color}
              </button>
            ))}
          </div>
        </div>
      )}

      <div>
        <div className="flex justify-between items-baseline mb-3">
          <p className="eyebrow">Talle</p>
          <button
            type="button"
            className="text-xs text-muted hover:text-foreground underline-offset-4 hover:underline"
          >
            Guía de talles
          </button>
        </div>
        <div className="grid grid-cols-5 sm:grid-cols-6 gap-2">
          {sizesForColor.length === 0 ? (
            <p className="col-span-full text-sm text-muted">
              Seleccioná un color para ver los talles disponibles.
            </p>
          ) : (
            sizesForColor.map((variant) => {
              const available = variant.stock - (variant.reserved ?? 0);
              const out = available <= 0;
              const active = selectedSize === variant.size;
              return (
                <button
                  key={variant.size}
                  type="button"
                  disabled={out}
                  onClick={() => setSelectedSize(variant.size)}
                  className={`relative py-3 text-sm border transition ${
                    active
                      ? "border-foreground bg-foreground text-background"
                      : out
                        ? "border-line text-muted line-through cursor-not-allowed"
                        : "border-line hover:border-foreground"
                  }`}
                >
                  {variant.size}
                </button>
              );
            })
          )}
        </div>
      </div>

      {(localError || error) && (
        <p className="text-sm text-red-600">{localError ?? error}</p>
      )}

      <div className="space-y-3 pt-2">
        <button
          type="button"
          onClick={handleCheckout}
          disabled={loading}
          className="w-full bg-foreground text-background py-4 text-sm tracking-[0.25em] uppercase hover:opacity-90 transition disabled:opacity-50 inline-flex items-center justify-center gap-3"
        >
          {loading ? (
            <Loader2 className="animate-spin" size={16} />
          ) : (
            <ShieldCheck size={16} />
          )}
          Finalizar compra
        </button>
        <button
          type="button"
          onClick={handleAdd}
          disabled={loading}
          className="w-full bg-background text-foreground border border-foreground py-4 text-sm tracking-[0.25em] uppercase hover:bg-foreground hover:text-background transition disabled:opacity-50 inline-flex items-center justify-center gap-3"
        >
          <ShoppingBag size={16} />
          Agregar a la bolsa
        </button>
      </div>

      <ul className="grid grid-cols-2 gap-4 text-xs text-muted pt-6 border-t border-line">
        <li className="flex items-center gap-2">
          <Truck size={14} /> Envío gratis +$150
        </li>
        <li className="flex items-center gap-2">
          <ShieldCheck size={14} /> 30 días de cambio
        </li>
      </ul>

      {cart && cart.items.length > 0 && (
        <p className="text-xs text-muted">
          Tu bolsa tiene {cart.items.length}{" "}
          {cart.items.length === 1 ? "artículo" : "artículos"}.
        </p>
      )}
    </div>

    {profileModal && (
      <ProfileRequiredModal
        reason={profileModal}
        onClose={() => setProfileModal(null)}
      />
    )}
    </>
  );
}
