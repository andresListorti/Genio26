"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, Clock3, Loader2, XCircle } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { api } from "@/lib/api";
import { formatMoney } from "@/lib/format";
import type { Order } from "@/lib/types";

export type CheckoutVariant = "success" | "failure" | "pending";

const COPY: Record<
  CheckoutVariant,
  {
    eyebrow: string;
    title: string;
    body: string;
    Icon: typeof CheckCircle2;
    accent: string;
  }
> = {
  success: {
    eyebrow: "Pago aprobado",
    title: "¡Gracias por tu compra!",
    body: "Tu pago se procesó correctamente. Te enviamos la confirmación del pedido por correo y preparamos tu envío.",
    Icon: CheckCircle2,
    accent: "text-green-700",
  },
  pending: {
    eyebrow: "Pago pendiente",
    title: "Estamos confirmando tu pago",
    body: "Mercado Pago aún está procesando la operación. En cuanto se acredite te enviaremos la confirmación por correo.",
    Icon: Clock3,
    accent: "text-amber-600",
  },
  failure: {
    eyebrow: "Pago rechazado",
    title: "No pudimos procesar tu pago",
    body: "El pago no se completó. No se realizó ningún cargo. Podés volver a tu bolsa e intentar con otro medio de pago.",
    Icon: XCircle,
    accent: "text-red-600",
  },
};

export default function CheckoutResult({ variant }: { variant: CheckoutVariant }) {
  const params = useSearchParams();
  const { resetCart } = useCart();

  // Mercado Pago appends these on the redirect; the Brick path passes `order`.
  const orderId =
    params.get("external_reference") ?? params.get("order") ?? null;
  const paymentId = params.get("payment_id") ?? params.get("collection_id");

  const [order, setOrder] = useState<Order | null>(null);
  const clearedRef = useRef(false);

  // Clear the local bag exactly once when a purchase completes.
  useEffect(() => {
    if (variant === "success" && !clearedRef.current) {
      clearedRef.current = true;
      resetCart();
    }
  }, [variant, resetCart]);

  // Best-effort: confirm the order so we can show its total and items.
  useEffect(() => {
    if (!orderId) return;
    let active = true;
    api.checkout
      .getOrder(orderId)
      .then((o) => {
        if (active) setOrder(o);
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, [orderId]);

  const { eyebrow, title, body, Icon, accent } = COPY[variant];

  return (
    <section className="max-w-2xl mx-auto px-4 sm:px-6 py-20 sm:py-28 text-center">
      <Icon size={56} className={`mx-auto ${accent}`} strokeWidth={1.5} />
      <p className="eyebrow mt-8">{eyebrow}</p>
      <h1 className="heading-display text-3xl sm:text-4xl md:text-5xl mt-4">
        {title}
      </h1>
      <p className="text-muted text-sm sm:text-base mt-5 leading-relaxed">
        {body}
      </p>

      {(order || paymentId) && (
        <div className="mt-10 border border-line p-6 text-left text-sm space-y-3 max-w-md mx-auto">
          {order && (
            <>
              <div className="flex justify-between">
                <span className="text-muted">Pedido</span>
                <span className="font-medium tabular-nums">
                  {order.id.slice(0, 8).toUpperCase()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Total</span>
                <span className="font-medium">
                  {formatMoney(order.subtotal, order.currency)}
                </span>
              </div>
            </>
          )}
          {paymentId && (
            <div className="flex justify-between">
              <span className="text-muted">Pago</span>
              <span className="font-medium tabular-nums">{paymentId}</span>
            </div>
          )}
        </div>
      )}

      <div className="mt-10 flex items-center justify-center gap-4">
        {variant === "failure" ? (
          <Link
            href="/cart"
            className="bg-foreground text-background px-7 py-3.5 text-xs uppercase tracking-[0.2em] hover:opacity-90 transition"
          >
            Volver a la bolsa
          </Link>
        ) : (
          <Link
            href="/"
            className="bg-foreground text-background px-7 py-3.5 text-xs uppercase tracking-[0.2em] hover:opacity-90 transition"
          >
            Seguir comprando
          </Link>
        )}
        <Link
          href="/collections/men"
          className="border border-foreground px-7 py-3.5 text-xs uppercase tracking-[0.2em] hover:bg-foreground hover:text-background transition"
        >
          Ver colección
        </Link>
      </div>
    </section>
  );
}

/** Suspense fallback while `useSearchParams` resolves on the client. */
export function CheckoutResultFallback() {
  return (
    <section className="max-w-2xl mx-auto px-4 py-28 text-center">
      <Loader2 size={28} className="mx-auto animate-spin text-muted" />
    </section>
  );
}
