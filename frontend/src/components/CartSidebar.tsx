"use client";

import Image from "next/image";
import Link from "next/link";
import { X, Trash2, ArrowRight } from "lucide-react";
import { useEffect } from "react";
import { useCart } from "@/context/CartContext";
import { shoeImage } from "@/lib/images";
import { formatMoney } from "@/lib/format";

export default function CartSidebar() {
  const { cart, isOpen, closeCart, removeItem, itemCount } = useCart();

  useEffect(() => {
    if (typeof document === "undefined") return;
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <>
      <div
        onClick={closeCart}
        aria-hidden={!isOpen}
        className={`fixed inset-0 z-50 bg-black/30 transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      />
      <aside
        aria-hidden={!isOpen}
        className={`fixed top-0 right-0 z-50 h-full w-full max-w-md bg-background shadow-2xl border-l border-line transform transition-transform duration-300 ease-out flex flex-col ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-line">
          <div>
            <p className="eyebrow">Tu bolsa</p>
            <h2 className="heading-display text-xl mt-1">
              {itemCount} {itemCount === 1 ? "artículo" : "artículos"}
            </h2>
          </div>
          <button
            type="button"
            onClick={closeCart}
            className="p-2 -mr-2 text-foreground/70 hover:text-foreground"
            aria-label="Close cart"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-5">
          {!cart || cart.items.length === 0 ? (
            <div className="text-center text-muted py-20">
              <p className="heading-display text-lg text-foreground">
                Tu bolsa está vacía
              </p>
              <p className="mt-2 text-sm">
                Descubrí la nueva colección Otoño / Invierno.
              </p>
            </div>
          ) : (
            cart.items.map((item) => (
              <div
                key={`${item.shoeId}-${item.size}-${item.color}`}
                className="flex gap-4"
              >
                <div className="relative h-24 w-24 shrink-0 overflow-hidden bg-surface">
                  <Image
                    src={shoeImage({ model: item.model, width: 240 })}
                    alt={`${item.brand} ${item.model}`}
                    fill
                    sizes="96px"
                    className="object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-xs uppercase tracking-wider text-muted">
                        {item.brand}
                      </p>
                      <p className="text-sm font-medium truncate">
                        {item.model}
                      </p>
                      <p className="text-xs text-muted mt-1">
                        Talle {item.size} · {item.color}
                      </p>
                      <p className="text-xs text-muted">
                        Cantidad {item.quantity}
                      </p>
                    </div>
                    <p className="text-sm font-medium whitespace-nowrap">
                      {formatMoney(
                        item.unitPrice * item.quantity,
                        cart?.currency,
                      )}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      removeItem({
                        shoeId: item.shoeId,
                        size: item.size,
                        color: item.color,
                      })
                    }
                    className="mt-2 inline-flex items-center gap-1 text-xs text-muted hover:text-foreground"
                  >
                    <Trash2 size={12} /> Eliminar
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="border-t border-line px-6 py-5 space-y-4">
          <div className="flex justify-between text-sm">
            <span className="text-muted">Subtotal</span>
            <span className="font-medium">
              {formatMoney(cart?.subtotal ?? 0, cart?.currency)}
            </span>
          </div>
          <Link
            href="/cart"
            onClick={closeCart}
            aria-disabled={!cart || cart.items.length === 0}
            className={`w-full py-3.5 text-sm tracking-[0.2em] uppercase transition inline-flex items-center justify-center gap-2 ${
              !cart || cart.items.length === 0
                ? "bg-foreground/40 text-background pointer-events-none"
                : "bg-foreground text-background hover:opacity-90"
            }`}
          >
            Finalizar compra
            <ArrowRight size={16} />
          </Link>
          <p className="text-[10px] text-muted text-center tracking-wider uppercase">
            El pago se completa en la página de la bolsa · Envíos a todo el país
          </p>
        </div>
      </aside>
    </>
  );
}
