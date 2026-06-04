"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Loader2,
  Minus,
  Plus,
  ShieldCheck,
  Trash2,
  Truck,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { shoeImage } from "@/lib/images";
import { formatMoney } from "@/lib/format";
import { api } from "@/lib/api";
import type {
  MercadoPagoPreference,
  OrderStatus,
  PaymentProvider,
} from "@/lib/types";
import MercadoPagoBrick from "@/components/MercadoPagoBrick";

export default function CartPage() {
  const router = useRouter();
  const {
    cart,
    loading,
    error,
    itemCount,
    removeItem,
    updateQuantity,
    clear,
    checkout,
  } = useCart();
  const { user, profile } = useAuth();

  const isEmpty = !cart || cart.items.length === 0;
  const currency = cart?.currency ?? "ARS";

  // Dual payment: user picks Mercado Pago (Bricks, seamless) or PayPal.
  const [method, setMethod] = useState<PaymentProvider>("mercadopago");
  const [mpPref, setMpPref] = useState<MercadoPagoPreference | null>(null);
  const [mpLoading, setMpLoading] = useState(false);
  const [mpError, setMpError] = useState<string | null>(null);

  const selectMethod = (next: PaymentProvider) => {
    setMethod(next);
    setMpError(null);
    if (next !== "mercadopago") setMpPref(null);
  };

  // "Pagar ahora" fires the flow for the selected provider.
  const handlePay = async () => {
    if (!cart || isEmpty) return;
    if (method === "paypal") {
      await checkout();
      return;
    }
    // Mercado Pago: create the order + preference, then mount the brick.
    setMpError(null);
    setMpLoading(true);
    try {
      setMpPref(
        await api.checkout.mercadopago.createPreference({
          cartId: cart.id,
          userId: user?.uid,
          payerEmail: user?.email ?? undefined,
          payerName: profile?.displayName ?? undefined,
          shippingAddress: profile?.address,
          shippingPhone: profile?.phone,
        }),
      );
    } catch (err) {
      setMpError(
        err instanceof Error ? err.message : "No se pudo iniciar Mercado Pago.",
      );
    } finally {
      setMpLoading(false);
    }
  };

  // After the Brick resolves, hand off to the dedicated result page (which
  // shows the "thank you" / status copy and clears the local bag on success).
  const goToResult = useCallback(
    (variant: "success" | "pending" | "failure", status: OrderStatus) => {
      const orderId = mpPref?.order.id;
      setMpPref(null);
      const qs = new URLSearchParams({ status: status.toLowerCase() });
      if (orderId) qs.set("order", orderId);
      router.push(`/checkout/${variant}?${qs.toString()}`);
    },
    [mpPref, router],
  );

  const onApproved = useCallback(
    (status: OrderStatus) => {
      // COMPLETED → paid & fulfilled; APPROVED → accredited but still pending.
      goToResult(status === "COMPLETED" ? "success" : "pending", status);
    },
    [goToResult],
  );

  const onRejected = useCallback(
    (status: OrderStatus) => {
      goToResult("failure", status);
    },
    [goToResult],
  );

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-12 sm:py-16 lg:py-20">
      <div className="mb-10">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-muted hover:text-foreground"
        >
          <ArrowLeft size={14} /> Seguir comprando
        </Link>
        <h1 className="heading-display text-3xl sm:text-4xl md:text-5xl mt-5">
          Tu bolsa
        </h1>
        <p className="text-muted text-sm mt-2">
          {itemCount} {itemCount === 1 ? "artículo" : "artículos"} · Genaro
        </p>
      </div>

      {isEmpty ? (
        <div className="py-24 text-center border-t border-line">
          <p className="heading-display text-2xl mb-3">Tu bolsa está vacía</p>
          <p className="text-muted text-sm mb-8">
            Descubrí la nueva colección Otoño / Invierno de Genaro.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link
              href="/collections/men"
              className="border border-foreground px-6 py-3 text-xs uppercase tracking-[0.2em] hover:bg-foreground hover:text-background transition"
            >
              Hombre
            </Link>
            <Link
              href="/collections/women"
              className="border border-foreground px-6 py-3 text-xs uppercase tracking-[0.2em] hover:bg-foreground hover:text-background transition"
            >
              Mujer
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-10 lg:gap-16">
          {/* Line items */}
          <div className="border-t border-line">
            {cart.items.map((item) => (
              <div
                key={`${item.shoeId}-${item.size}-${item.color}`}
                className="flex gap-5 py-6 border-b border-line"
              >
                <Link
                  href={`/products/${item.shoeId}`}
                  className="relative h-28 w-28 sm:h-32 sm:w-32 shrink-0 overflow-hidden bg-surface"
                >
                  <Image
                    src={shoeImage({ model: item.model, width: 320 })}
                    alt={`${item.brand} ${item.model}`}
                    fill
                    sizes="128px"
                    className="object-cover"
                  />
                </Link>

                <div className="flex-1 min-w-0 flex flex-col">
                  <div className="flex justify-between gap-4">
                    <div className="min-w-0">
                      <p className="eyebrow">{item.brand}</p>
                      <Link
                        href={`/products/${item.shoeId}`}
                        className="block heading-display text-lg leading-tight mt-1 hover:underline underline-offset-4"
                      >
                        {item.model}
                      </Link>
                      <p className="text-xs text-muted mt-2">
                        Talle {item.size} · <span className="capitalize">{item.color}</span>
                      </p>
                    </div>
                    <p className="text-sm font-medium whitespace-nowrap">
                      {formatMoney(item.unitPrice * item.quantity, currency)}
                    </p>
                  </div>

                  <div className="mt-auto pt-4 flex items-center justify-between">
                    <div className="inline-flex items-center border border-line">
                      <button
                        type="button"
                        aria-label="Quitar una unidad"
                        disabled={loading}
                        onClick={() => updateQuantity(item, item.quantity - 1)}
                        className="px-3 py-2 text-foreground/70 hover:text-foreground disabled:opacity-40"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="px-4 text-sm tabular-nums select-none">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        aria-label="Agregar una unidad"
                        disabled={loading}
                        onClick={() => updateQuantity(item, item.quantity + 1)}
                        className="px-3 py-2 text-foreground/70 hover:text-foreground disabled:opacity-40"
                      >
                        <Plus size={14} />
                      </button>
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
                      className="inline-flex items-center gap-1.5 text-xs text-muted hover:text-foreground"
                    >
                      <Trash2 size={13} /> Eliminar
                    </button>
                  </div>
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={clear}
              disabled={loading}
              className="mt-6 text-xs uppercase tracking-[0.2em] text-muted hover:text-foreground disabled:opacity-40"
            >
              Vaciar bolsa
            </button>
          </div>

          {/* Order summary + payment (exclusive to this page) */}
          <aside className="lg:sticky lg:top-24 h-fit">
            <div className="border border-line p-6 sm:p-7 space-y-5">
              <h2 className="heading-display text-xl">Resumen del pedido</h2>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted">Subtotal</span>
                  <span className="font-medium">
                    {formatMoney(cart.subtotal, currency)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Envío</span>
                  <span className="text-muted">A calcular</span>
                </div>
                <div className="flex justify-between pt-3 border-t border-line text-base">
                  <span className="font-medium">Total</span>
                  <span className="font-medium">
                    {formatMoney(cart.subtotal, currency)}
                  </span>
                </div>
              </div>

              <>
                  {/* Payment method selector */}
                  <div>
                    <p className="eyebrow mb-3">Medio de pago</p>
                    <div className="grid grid-cols-2 gap-2">
                      {(
                        [
                          { id: "mercadopago", label: "Mercado Pago" },
                          { id: "paypal", label: "PayPal" },
                        ] as { id: PaymentProvider; label: string }[]
                      ).map((opt) => {
                        const active = method === opt.id;
                        return (
                          <button
                            key={opt.id}
                            type="button"
                            role="radio"
                            aria-checked={active}
                            onClick={() => selectMethod(opt.id)}
                            className={`py-3 text-xs uppercase tracking-[0.15em] border transition ${
                              active
                                ? "border-foreground bg-foreground text-background"
                                : "border-line hover:border-foreground"
                            }`}
                          >
                            {opt.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {(error || mpError) && (
                    <p className="text-xs text-red-600">{error ?? mpError}</p>
                  )}

                  {/* Mercado Pago brick renders here once the preference exists */}
                  {method === "mercadopago" && mpPref ? (
                    <MercadoPagoBrick
                      publicKey={mpPref.publicKey}
                      preferenceId={mpPref.preferenceId}
                      amount={cart.subtotal}
                      orderId={mpPref.order.id}
                      onApproved={onApproved}
                      onRejected={onRejected}
                    />
                  ) : (
                    <button
                      type="button"
                      disabled={loading || mpLoading || isEmpty}
                      onClick={handlePay}
                      className="w-full bg-foreground text-background py-4 text-sm tracking-[0.25em] uppercase hover:opacity-90 transition disabled:opacity-50 inline-flex items-center justify-center gap-3"
                    >
                      {loading || mpLoading ? (
                        <Loader2 className="animate-spin" size={16} />
                      ) : (
                        <ShieldCheck size={16} />
                      )}
                      Pagar ahora
                    </button>
                  )}

                  <ul className="space-y-2 text-xs text-muted pt-2">
                    <li className="flex items-center gap-2">
                      <Truck size={14} /> Envíos a todo el país
                    </li>
                    <li className="flex items-center gap-2">
                      <ShieldCheck size={14} /> Pago seguro · 30 días de cambio
                    </li>
                  </ul>
              </>
            </div>
          </aside>
        </div>
      )}
    </section>
  );
}
