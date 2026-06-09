"use client";

import {
  collection,
  doc,
  getDoc,
  getDocs,
} from "firebase/firestore";
import {
  Archive,
  CheckCircle2,
  Loader2,
  Search,
  XCircle,
  RefreshCcw,
  Package,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import type { UserProfile } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { formatMoney } from "@/lib/format";
import type { Order, OrderStatus } from "@/lib/types";
import AdminNav from "@/components/AdminNav";

// ─── Statuses included in the archive (not active / in-flight) ───────────────
const ARCHIVE_STATUSES: OrderStatus[] = [
  "COMPLETED",
  "CANCELLED",
  "FAILED",
  "REFUNDED",
];

// ─── Display helpers ──────────────────────────────────────────────────────────

const STATUS_LABEL: Record<OrderStatus, string> = {
  CREATED: "Pendiente",
  APPROVED: "En proceso",
  COMPLETED: "Pagada",
  CANCELLED: "Cancelada",
  FAILED: "Fallida",
  REFUNDED: "Reembolsada",
};

const STATUS_STYLE: Record<OrderStatus, string> = {
  CREATED: "bg-surface text-muted border-line",
  APPROVED: "bg-blue-50 text-blue-600 border-blue-200",
  COMPLETED: "bg-green-50 text-green-700 border-green-200",
  CANCELLED: "bg-red-50 text-red-600 border-red-200",
  FAILED: "bg-red-50 text-red-600 border-red-200",
  REFUNDED: "bg-amber-50 text-amber-700 border-amber-200",
};

function StatusBadge({ status }: { status: OrderStatus }) {
  const Icon =
    status === "COMPLETED"
      ? CheckCircle2
      : status === "REFUNDED"
        ? RefreshCcw
        : status === "CANCELLED" || status === "FAILED"
          ? XCircle
          : Package;
  return (
    <span
      className={`inline-flex items-center gap-1.5 border text-xs px-2.5 py-1 ${STATUS_STYLE[status] ?? STATUS_STYLE.CREATED}`}
    >
      <Icon size={11} />
      {STATUS_LABEL[status] ?? status}
    </span>
  );
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ─── Auth guard ───────────────────────────────────────────────────────────────

export default function AdminArchivePage() {
  const { user, profile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) { router.replace("/login"); return; }
    if (profile && profile.role !== "admin") router.replace("/");
  }, [user, profile, loading, router]);

  if (loading || !user || !profile) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="animate-spin text-muted" size={22} />
      </div>
    );
  }

  if (profile.role !== "admin") return null;

  return <ArchiveDashboard />;
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

function ArchiveDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [userNames, setUserNames] = useState<Record<string, string>>({});
  const [fetchLoading, setFetchLoading] = useState(true);
  const [pageError, setPageError] = useState<string | null>(null);

  // Search + filter state
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "ALL">("ALL");

  // ── Fetch all archived orders on mount ────────────────────────────────────

  useEffect(() => {
    void (async () => {
      try {
        const snap = await getDocs(collection(db, "orders"));
        const all = snap.docs.map((d) => d.data() as Order);
        const archived = all
          .filter((o) => ARCHIVE_STATUSES.includes(o.status))
          .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
        setOrders(archived);

        // Batch-fetch user display names
        const uids = [
          ...new Set(archived.map((o) => o.userId).filter(Boolean)),
        ] as string[];
        if (uids.length > 0) {
          const nameMap: Record<string, string> = {};
          await Promise.all(
            uids.map(async (uid) => {
              try {
                const snap = await getDoc(doc(db, "users", uid));
                if (snap.exists()) {
                  const p = snap.data() as UserProfile;
                  nameMap[uid] = p.displayName ?? p.email ?? uid;
                }
              } catch {
                // non-critical
              }
            }),
          );
          setUserNames(nameMap);
        }
      } catch {
        setPageError(
          "No se pudieron cargar las órdenes archivadas. Verificá la conexión.",
        );
      } finally {
        setFetchLoading(false);
      }
    })();
  }, []);

  // ── Client-side filter ────────────────────────────────────────────────────

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return orders.filter((o) => {
      if (statusFilter !== "ALL" && o.status !== statusFilter) return false;
      if (!q) return true;
      const email = (o.payerEmail ?? "").toLowerCase();
      const id = o.id.toLowerCase();
      const name = (o.userId ? (userNames[o.userId] ?? "") : "").toLowerCase();
      const models = o.items.map((i) => i.model.toLowerCase()).join(" ");
      return (
        email.includes(q) ||
        id.includes(q) ||
        name.includes(q) ||
        models.includes(q)
      );
    });
  }, [orders, search, statusFilter, userNames]);

  // ── Summary stats ─────────────────────────────────────────────────────────

  const totalRevenue = useMemo(
    () =>
      orders
        .filter((o) => o.status === "COMPLETED")
        .reduce((s, o) => s + o.subtotal, 0),
    [orders],
  );
  const currency = orders[0]?.currency ?? "ARS";

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="bg-surface min-h-full">
      <AdminNav />

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10 py-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <Archive size={20} className="text-muted" />
              <h1 className="heading-display text-2xl">Archivo de órdenes</h1>
            </div>
            <p className="text-sm text-muted pl-8">
              {fetchLoading
                ? "Cargando…"
                : `${orders.length} órdenes históricas · ingresos pagados: ${formatMoney(totalRevenue, currency)}`}
            </p>
          </div>
        </div>

        {/* Error */}
        {pageError && (
          <div className="mb-6 px-4 py-3 border border-red-200 bg-red-50 text-red-700 text-sm flex items-center justify-between gap-4">
            <span>{pageError}</span>
            <button
              type="button"
              onClick={() => setPageError(null)}
              aria-label="Cerrar"
            >
              <X size={14} />
            </button>
          </div>
        )}

        {/* Search + filter toolbar */}
        {!fetchLoading && orders.length > 0 && (
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none"
              />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por email, nombre, modelo o ID de orden…"
                className="w-full border border-line bg-background pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-foreground"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-foreground"
                  aria-label="Limpiar búsqueda"
                >
                  <X size={13} />
                </button>
              )}
            </div>
            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value as OrderStatus | "ALL")
              }
              className="border border-line bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-foreground sm:w-44"
            >
              <option value="ALL">Todos los estados</option>
              {ARCHIVE_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {STATUS_LABEL[s]}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Content */}
        {fetchLoading ? (
          <div className="flex justify-center py-24">
            <Loader2 className="animate-spin text-muted" size={22} />
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3 border border-line bg-background">
            <Archive className="text-muted" size={28} />
            <p className="text-muted text-sm">
              El archivo está vacío. Las órdenes completadas, canceladas y
              reembolsadas aparecerán aquí.
            </p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-2">
            <Search className="text-muted" size={22} />
            <p className="text-muted text-sm">
              Sin resultados para &ldquo;{search}&rdquo;
            </p>
            <button
              type="button"
              onClick={() => { setSearch(""); setStatusFilter("ALL"); }}
              className="text-xs text-muted hover:text-foreground underline underline-offset-2 mt-1"
            >
              Limpiar filtros
            </button>
          </div>
        ) : (
          <div className="bg-background border border-line overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-line">
                    <th className="text-left px-4 py-3 eyebrow">Fecha</th>
                    <th className="text-left px-4 py-3 eyebrow">Cliente</th>
                    <th className="text-left px-4 py-3 eyebrow hidden md:table-cell">
                      Productos
                    </th>
                    <th className="text-left px-4 py-3 eyebrow">Total</th>
                    <th className="text-left px-4 py-3 eyebrow hidden sm:table-cell">
                      Estado
                    </th>
                    <th className="text-left px-4 py-3 eyebrow hidden lg:table-cell">
                      Proveedor
                    </th>
                    <th className="text-left px-4 py-3 eyebrow hidden xl:table-cell">
                      Últ. actualización
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((order) => {
                    const customerName = order.userId
                      ? (userNames[order.userId] ?? "—")
                      : "—";
                    return (
                      <tr
                        key={order.id}
                        className="border-b border-line last:border-0 hover:bg-surface/60 transition-colors"
                      >
                        <td className="px-4 py-3 text-muted whitespace-nowrap text-xs">
                          {fmtDate(order.createdAt)}
                        </td>

                        <td className="px-4 py-3">
                          <p className="font-medium text-sm">{customerName}</p>
                          {order.payerEmail && (
                            <p className="text-muted text-xs truncate max-w-[160px]">
                              {order.payerEmail}
                            </p>
                          )}
                          {order.shippingAddress && (
                            <p className="text-muted text-xs truncate max-w-[160px]">
                              {order.shippingAddress}
                            </p>
                          )}
                          {order.shippingPhone && (
                            <p className="text-muted text-xs">
                              {order.shippingPhone}
                            </p>
                          )}
                        </td>

                        <td className="px-4 py-3 hidden md:table-cell">
                          <ul className="space-y-0.5">
                            {order.items.map((item, i) => (
                              <li
                                key={i}
                                className="flex items-center gap-1.5 text-xs"
                              >
                                <Package
                                  size={11}
                                  className="text-muted shrink-0"
                                />
                                <span className="font-medium">
                                  {item.model}
                                </span>
                                <span className="text-muted">
                                  T.{item.size} · ×{item.quantity}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </td>

                        <td className="px-4 py-3 font-medium whitespace-nowrap">
                          {formatMoney(order.subtotal, order.currency)}
                        </td>

                        <td className="px-4 py-3 hidden sm:table-cell">
                          <StatusBadge status={order.status} />
                        </td>

                        <td className="px-4 py-3 text-muted text-xs capitalize hidden lg:table-cell">
                          {order.provider === "mercadopago"
                            ? "Mercado Pago"
                            : order.provider === "paypal"
                              ? "PayPal"
                              : "—"}
                        </td>

                        <td className="px-4 py-3 text-muted text-xs whitespace-nowrap hidden xl:table-cell">
                          {fmtDate(order.updatedAt)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="px-4 py-3 border-t border-line bg-surface flex items-center justify-between text-xs text-muted">
              <span>
                Mostrando {filtered.length} de {orders.length} órdenes
              </span>
              {search || statusFilter !== "ALL" ? (
                <button
                  type="button"
                  onClick={() => { setSearch(""); setStatusFilter("ALL"); }}
                  className="hover:text-foreground underline underline-offset-2"
                >
                  Limpiar filtros
                </button>
              ) : null}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
