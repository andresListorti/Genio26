"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { api } from "@/lib/api";
import type { OrderStatus } from "@/lib/types";

/* eslint-disable @typescript-eslint/no-explicit-any */
declare global {
  interface Window {
    MercadoPago?: any;
  }
}

const SDK_SRC = "https://sdk.mercadopago.com/js/v2";

function loadMercadoPagoSdk(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.MercadoPago) return Promise.resolve();
  const existing = document.querySelector<HTMLScriptElement>(
    "script[data-mp-sdk]",
  );
  if (existing) {
    return new Promise((resolve, reject) => {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () =>
        reject(new Error("No se pudo cargar el SDK de Mercado Pago")),
      );
    });
  }
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = SDK_SRC;
    script.async = true;
    script.dataset.mpSdk = "true";
    script.onload = () => resolve();
    script.onerror = () =>
      reject(new Error("No se pudo cargar el SDK de Mercado Pago"));
    document.body.appendChild(script);
  });
}

interface MercadoPagoBrickProps {
  publicKey: string;
  preferenceId: string;
  amount: number;
  orderId: string;
  onApproved: (status: OrderStatus) => void;
  onRejected: (status: OrderStatus) => void;
}

const CONTAINER_ID = "genaro-mp-brick";

export default function MercadoPagoBrick({
  publicKey,
  preferenceId,
  amount,
  orderId,
  onApproved,
  onRejected,
}: MercadoPagoBrickProps) {
  const controllerRef = useRef<any>(null);
  const [phase, setPhase] = useState<"loading" | "ready" | "error">("loading");
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      try {
        await loadMercadoPagoSdk();
        if (cancelled || !window.MercadoPago) return;
        if (!publicKey) {
          throw new Error(
            "Falta la clave pública de Mercado Pago (MERCADOPAGO_PUBLIC_KEY).",
          );
        }

        const mp = new window.MercadoPago(publicKey, { locale: "es-AR" });
        const builder = mp.bricks();

        controllerRef.current = await builder.create(
          "payment",
          CONTAINER_ID,
          {
            initialization: { amount, preferenceId },
            customization: {
              visual: { style: { theme: "default" } },
              paymentMethods: {
                creditCard: "all",
                debitCard: "all",
                mercadoPago: "all",
              },
            },
            callbacks: {
              onReady: () => {
                if (!cancelled) setPhase("ready");
              },
              onError: (error: any) => {
                if (cancelled) return;
                setPhase("error");
                setMessage(
                  error?.message ?? "Ocurrió un error con Mercado Pago.",
                );
              },
              // Seamless: the brick collects the data, we create the payment
              // server-side and resolve once it is processed (no redirect).
              onSubmit: ({ formData }: any) =>
                api.checkout.mercadopago
                  .process(orderId, formData)
                  .then((res) => {
                    if (
                      res.status === "COMPLETED" ||
                      res.status === "APPROVED"
                    ) {
                      onApproved(res.status);
                    } else {
                      onRejected(res.status);
                    }
                  })
                  .catch((err) => {
                    setMessage(
                      err instanceof Error ? err.message : "Pago rechazado.",
                    );
                    onRejected("FAILED");
                    throw err;
                  }),
            },
          },
        );
      } catch (err) {
        if (cancelled) return;
        setPhase("error");
        setMessage(
          err instanceof Error
            ? err.message
            : "No se pudo iniciar Mercado Pago.",
        );
      }
    }

    init();

    return () => {
      cancelled = true;
      try {
        controllerRef.current?.unmount?.();
      } catch {
        /* noop */
      }
    };
  }, [publicKey, preferenceId, amount, orderId, onApproved, onRejected]);

  return (
    <div className="space-y-3">
      {phase === "loading" && (
        <p className="inline-flex items-center gap-2 text-xs text-muted">
          <Loader2 size={14} className="animate-spin" /> Cargando Mercado Pago…
        </p>
      )}
      {phase === "error" && message && (
        <p className="text-xs text-red-600">{message}</p>
      )}
      <div id={CONTAINER_ID} />
    </div>
  );
}
