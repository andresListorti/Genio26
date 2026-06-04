"use client";

import {
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { CheckCircle, Clock, Loader2, Package, XCircle } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { type User } from "firebase/auth";
import { useAuth, type UserProfile } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { formatMoney } from "@/lib/format";
import type { Order, OrderStatus } from "@/lib/types";

// ─── Status helpers ───────────────────────────────────────────────────────────

function statusLabel(s: OrderStatus): string {
  const map: Record<OrderStatus, string> = {
    CREATED: "Pendiente",
    APPROVED: "Aprobado",
    COMPLETED: "Completado",
    CANCELLED: "Cancelado",
    FAILED: "Fallido",
    REFUNDED: "Reembolsado",
  };
  return map[s] ?? s;
}

function StatusBadge({ status }: { status: OrderStatus }) {
  const base = "inline-flex items-center gap-1.5 border text-xs px-2.5 py-1";
  const styles: Record<OrderStatus, string> = {
    CREATED: "bg-surface text-muted border-line",
    APPROVED: "bg-green-50 text-green-700 border-green-200",
    COMPLETED: "bg-green-50 text-green-700 border-green-200",
    CANCELLED: "bg-red-50 text-red-600 border-red-200",
    FAILED: "bg-red-50 text-red-600 border-red-200",
    REFUNDED: "bg-amber-50 text-amber-700 border-amber-200",
  };
  const Icon =
    status === "COMPLETED" || status === "APPROVED"
      ? CheckCircle
      : status === "CANCELLED" || status === "FAILED"
        ? XCircle
        : status === "REFUNDED"
          ? Package
          : Clock;

  return (
    <span className={`${base} ${styles[status] ?? styles.CREATED}`}>
      <Icon size={11} />
      {statusLabel(status)}
    </span>
  );
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

// ─── Auth guard shell ─────────────────────────────────────────────────────────
// Keeps all hooks unconditional; renders the inner component only once profile
// is confirmed so it can safely initialize form state without a sync effect.

export default function ProfilePage() {
  const { user, profile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [user, loading, router]);

  if (loading || !user || !profile) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="animate-spin text-muted" size={22} />
      </div>
    );
  }

  return <ProfileContent user={user} profile={profile} />;
}

// ─── Profile content ──────────────────────────────────────────────────────────

function ProfileContent({
  user,
  profile,
}: {
  user: User;
  profile: UserProfile;
}) {
  const { updateUserProfile } = useAuth();

  // Form — initialised directly from the loaded profile (no sync effect needed)
  const [displayName, setDisplayName] = useState(profile.displayName ?? "");
  const [address, setAddress] = useState(profile.address ?? "");
  const [phone, setPhone] = useState(profile.phone ?? "");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Orders
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

  useEffect(() => {
    void (async () => {
      try {
        const q = query(
          collection(db, "orders"),
          where("userId", "==", user.uid),
        );
        const snap = await getDocs(q);
        const fetched = snap.docs
          .map((d) => d.data() as Order)
          .sort(
            (a, b) =>
              new Date(b.createdAt).getTime() -
              new Date(a.createdAt).getTime(),
          );
        setOrders(fetched);
      } catch {
        // non-critical — empty state shown
      } finally {
        setOrdersLoading(false);
      }
    })();
  }, [user.uid]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveError(null);
    setSaveSuccess(false);
    setSaving(true);
    try {
      await updateUserProfile({
        displayName: displayName.trim() || null,
        address: address.trim(),
        phone: phone.trim(),
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch {
      setSaveError("No se pudo guardar. Intentá de nuevo.");
    } finally {
      setSaving(false);
    }
  };

  const initials = profile.displayName
    ? profile.displayName[0].toUpperCase()
    : (profile.email ?? "U")[0].toUpperCase();

  const completedOrders = orders.filter(
    (o) => o.status === "COMPLETED" || o.status === "APPROVED",
  );
  const totalSpent = completedOrders.reduce((acc, o) => acc + o.subtotal, 0);
  const currency = orders[0]?.currency ?? "ARS";

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 py-12 sm:py-16">
      {/* ── Avatar header ─────────────────────────────────────────────────── */}
      <div className="flex items-center gap-5 mb-12">
        {profile.photoURL ? (
          <Image
            src={profile.photoURL}
            alt=""
            width={64}
            height={64}
            className="rounded-full object-cover"
          />
        ) : (
          <span className="w-16 h-16 rounded-full bg-foreground text-background text-xl flex items-center justify-center font-medium select-none shrink-0">
            {initials}
          </span>
        )}
        <div>
          <h1 className="heading-display text-2xl">
            {profile.displayName ?? "Mi cuenta"}
          </h1>
          <p className="text-sm text-muted mt-0.5">{profile.email}</p>
        </div>
      </div>

      {/* ── Personal data form ────────────────────────────────────────────── */}
      <section className="mb-14">
        <h2 className="eyebrow mb-6">Datos personales</h2>

        {saveError && (
          <div className="mb-4 px-4 py-3 border border-red-200 bg-red-50 text-red-700 text-sm">
            {saveError}
          </div>
        )}
        {saveSuccess && (
          <div className="mb-4 px-4 py-3 border border-green-200 bg-green-50 text-green-700 text-sm flex items-center gap-2">
            <CheckCircle size={14} />
            Cambios guardados correctamente.
          </div>
        )}

        <form
          onSubmit={(e) => void handleSave(e)}
          className="flex flex-col gap-5"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="displayName" className="eyebrow block mb-2">
                Nombre
              </label>
              <input
                id="displayName"
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full border border-line bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-foreground"
                placeholder="Tu nombre"
              />
            </div>
            <div>
              <label className="eyebrow block mb-2">Email</label>
              <input
                type="email"
                value={profile.email ?? ""}
                readOnly
                className="w-full border border-line bg-surface px-3 py-2.5 text-sm text-muted cursor-not-allowed"
              />
            </div>
          </div>

          <div>
            <label htmlFor="address" className="eyebrow block mb-2">
              Domicilio
            </label>
            <input
              id="address"
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full border border-line bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-foreground"
              placeholder="Av. Corrientes 1234, Buenos Aires"
            />
          </div>

          <div>
            <label htmlFor="phone" className="eyebrow block mb-2">
              Teléfono
            </label>
            <input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full border border-line bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-foreground"
              placeholder="+54 9 11 1234-5678"
            />
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 bg-foreground text-background text-sm tracking-widest uppercase px-6 py-2.5 hover:opacity-80 transition-opacity disabled:opacity-50"
            >
              {saving && <Loader2 size={13} className="animate-spin" />}
              Guardar cambios
            </button>
          </div>
        </form>
      </section>

      {/* ── Order history ─────────────────────────────────────────────────── */}
      <section>
        <div className="flex items-baseline justify-between mb-6">
          <h2 className="eyebrow">Mis pedidos</h2>
          {completedOrders.length > 0 && (
            <span className="text-xs text-muted">
              Total gastado:{" "}
              <strong className="text-foreground">
                {formatMoney(totalSpent, currency)}
              </strong>
            </span>
          )}
        </div>

        {ordersLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="animate-spin text-muted" size={20} />
          </div>
        ) : orders.length === 0 ? (
          <div className="border border-line py-12 text-center">
            <Package className="mx-auto mb-3 text-muted" size={28} />
            <p className="text-sm text-muted">
              Todavía no tenés pedidos asociados a esta cuenta.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {orders.map((order) => (
              <div
                key={order.id}
                className="border border-line bg-background p-4 sm:p-5"
              >
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <p className="text-xs text-muted font-mono">
                      #{order.id.slice(0, 8).toUpperCase()}
                    </p>
                    <p className="text-xs text-muted mt-0.5">
                      {fmtDate(order.createdAt)}
                      {order.provider && (
                        <span className="ml-2 capitalize">
                          ·{" "}
                          {order.provider === "mercadopago"
                            ? "Mercado Pago"
                            : "PayPal"}
                        </span>
                      )}
                    </p>
                  </div>
                  <StatusBadge status={order.status} />
                </div>

                {order.items.length > 0 && (
                  <ul className="text-sm text-muted space-y-0.5 mb-3">
                    {order.items.map((item, i) => (
                      <li
                        key={i}
                        className="flex items-center justify-between gap-2"
                      >
                        <span>
                          {item.brand} {item.model}
                          <span className="text-xs ml-1">
                            · T.{item.size} {item.color} ×{item.quantity}
                          </span>
                        </span>
                        <span className="shrink-0 text-foreground">
                          {formatMoney(
                            item.unitPrice * item.quantity,
                            order.currency,
                          )}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}

                <div className="border-t border-line pt-3 flex items-center justify-between gap-2">
                  <span className="text-xs text-muted">
                    {order.items.reduce((n, i) => n + i.quantity, 0)}{" "}
                    {order.items.reduce((n, i) => n + i.quantity, 0) === 1
                      ? "artículo"
                      : "artículos"}
                  </span>
                  <span className="text-sm font-medium">
                    {formatMoney(order.subtotal, order.currency)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
