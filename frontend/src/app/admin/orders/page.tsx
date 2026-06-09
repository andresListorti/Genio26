"use client";

import {
  collection,
  doc,
  getDocs,
  getDoc,
  updateDoc,
  where,
  query,
} from "firebase/firestore";
import {
  Loader2,
  Pencil,
  Trash2,
  X,
  Package,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import type { Order, OrderStatus } from "@/lib/types";
import AdminNav from "@/components/AdminNav";
import type { UserProfile } from "@/context/AuthContext";

// ─── Edit form state ─────────────────────────────────────────────────────────

interface OrderEditForm {
  status: OrderStatus;
  payerEmail: string;
  shippingAddress: string;
  shippingPhone: string;
}

function orderToForm(order: Order): OrderEditForm {
  return {
    status: order.status,
    payerEmail: order.payerEmail ?? "",
    shippingAddress: order.shippingAddress ?? "",
    shippingPhone: order.shippingPhone ?? "",
  };
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const STATUS_LABELS: Partial<Record<OrderStatus, string>> = {
  COMPLETED: "Pagada",
  CANCELLED: "Cancelada",
  REFUNDED: "Reembolsada",
  APPROVED: "En proceso",
};

const STATUS_COLORS: Partial<Record<OrderStatus, string>> = {
  COMPLETED: "bg-green-50 text-green-700 border border-green-200",
  CANCELLED: "bg-red-50 text-red-600 border border-red-200",
  REFUNDED: "bg-orange-50 text-orange-600 border border-orange-200",
  APPROVED: "bg-blue-50 text-blue-600 border border-blue-200",
};

const EDITABLE_STATUSES: OrderStatus[] = [
  "COMPLETED",
  "CANCELLED",
  "REFUNDED",
];

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function fmtCurrency(amount: number, currency: string) {
  return `${currency === "ARS" ? "$" : currency + " "}${amount.toLocaleString("es-AR")}`;
}

// ─── Auth guard ───────────────────────────────────────────────────────────────

export default function AdminOrdersPage() {
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

  return <OrdersDashboard />;
}

// ─── Dashboard ───────────────────────────────────────────────────────────────

function OrdersDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [userNames, setUserNames] = useState<Record<string, string>>({});
  const [fetchLoading, setFetchLoading] = useState(true);
  const [pageError, setPageError] = useState<string | null>(null);

  const [editTarget, setEditTarget] = useState<Order | null>(null);
  const [form, setForm] = useState<OrderEditForm>({ status: "COMPLETED", payerEmail: "", shippingAddress: "", shippingPhone: "" });
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<Order | null>(null);
  const [deleting, setDeleting] = useState(false);

  // ── Fetch paid orders ──────────────────────────────────────────────────────

  useEffect(() => {
    void (async () => {
      try {
        const q = query(
          collection(db, "orders"),
          where("status", "==", "COMPLETED"),
        );
        const snap = await getDocs(q);
        const fetched = snap.docs.map((d) => d.data() as Order);
        fetched.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
        setOrders(fetched);

        // Batch-fetch user display names for orders that have a userId
        const uids = [...new Set(fetched.map((o) => o.userId).filter(Boolean))] as string[];
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
                // ignore individual user fetch errors
              }
            }),
          );
          setUserNames(nameMap);
        }
      } catch {
        setPageError("No se pudieron cargar las órdenes. Verificá la conexión.");
      } finally {
        setFetchLoading(false);
      }
    })();
  }, []);

  // ── Edit helpers ───────────────────────────────────────────────────────────

  const openEdit = (order: Order) => {
    setEditTarget(order);
    setForm(orderToForm(order));
    setFormError(null);
  };

  const closeEdit = () => {
    setEditTarget(null);
    setFormError(null);
  };

  const setField = <K extends keyof OrderEditForm>(key: K, value: OrderEditForm[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const handleSave = async () => {
    if (!editTarget) return;
    setFormError(null);
    setSaving(true);
    try {
      const updates: Partial<Order> = {
        status: form.status,
        payerEmail: form.payerEmail.trim() || undefined,
        shippingAddress: form.shippingAddress.trim() || undefined,
        shippingPhone: form.shippingPhone.trim() || undefined,
        updatedAt: new Date().toISOString(),
      };
      await updateDoc(doc(db, "orders", editTarget.id), updates);
      setOrders((prev) =>
        // If status changed away from COMPLETED, remove from this view
        form.status !== "COMPLETED"
          ? prev.filter((o) => o.id !== editTarget.id)
          : prev.map((o) => (o.id === editTarget.id ? { ...o, ...updates } : o)),
      );
      closeEdit();
    } catch {
      setFormError("Error al guardar. Intentá de nuevo.");
    } finally {
      setSaving(false);
    }
  };

  // ── Delete helpers ─────────────────────────────────────────────────────────

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      // Mark as CANCELLED instead of deleting so the order moves to the
      // archive (/admin/archive) and the history is preserved.
      await updateDoc(doc(db, "orders", deleteTarget.id), {
        status: "CANCELLED",
        updatedAt: new Date().toISOString(),
      });
      setOrders((prev) => prev.filter((o) => o.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch {
      setPageError("No se pudo archivar la orden. Intentá de nuevo.");
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="bg-surface min-h-full">
      <AdminNav />

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10 py-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="heading-display text-2xl mb-1">Órdenes pagadas</h1>
            <p className="text-sm text-muted">
              {fetchLoading ? "Cargando…" : `${orders.length} orden${orders.length !== 1 ? "es" : ""} completada${orders.length !== 1 ? "s" : ""}`}
            </p>
          </div>
        </div>

        {/* Page error */}
        {pageError && (
          <div className="mb-6 px-4 py-3 border border-red-200 bg-red-50 text-red-700 text-sm flex items-center justify-between gap-4">
            <span>{pageError}</span>
            <button
              type="button"
              onClick={() => setPageError(null)}
              className="shrink-0"
              aria-label="Cerrar"
            >
              <X size={14} />
            </button>
          </div>
        )}

        {/* Table */}
        {fetchLoading ? (
          <div className="flex justify-center py-24">
            <Loader2 className="animate-spin text-muted" size={22} />
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <CheckCircle2 className="text-muted" size={28} />
            <p className="text-muted text-sm">No hay órdenes pagadas por el momento.</p>
          </div>
        ) : (
          <div className="bg-background border border-line overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-line">
                    <th className="text-left px-4 py-3 eyebrow">Fecha</th>
                    <th className="text-left px-4 py-3 eyebrow">Cliente</th>
                    <th className="text-left px-4 py-3 eyebrow hidden md:table-cell">Envío</th>
                    <th className="text-left px-4 py-3 eyebrow">Productos</th>
                    <th className="text-left px-4 py-3 eyebrow">Total</th>
                    <th className="text-left px-4 py-3 eyebrow hidden lg:table-cell">Estado</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => {
                    const customerName = order.userId
                      ? (userNames[order.userId] ?? "—")
                      : "—";
                    const statusLabel = STATUS_LABELS[order.status] ?? order.status;
                    const statusColor = STATUS_COLORS[order.status] ?? "bg-surface text-muted";
                    return (
                      <tr
                        key={order.id}
                        className="border-b border-line last:border-0 hover:bg-surface/60 transition-colors"
                      >
                        <td className="px-4 py-3 text-muted whitespace-nowrap">
                          {fmtDate(order.createdAt)}
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-medium">{customerName}</span>
                          {order.payerEmail && (
                            <div className="text-muted text-xs truncate max-w-[160px]">
                              {order.payerEmail}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-muted hidden md:table-cell">
                          <div className="text-xs leading-relaxed max-w-[180px]">
                            {order.shippingAddress ? (
                              <span>{order.shippingAddress}</span>
                            ) : (
                              <span className="text-muted/60">—</span>
                            )}
                            {order.shippingPhone && (
                              <div>{order.shippingPhone}</div>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <ul className="space-y-0.5">
                            {order.items.map((item, i) => (
                              <li key={i} className="flex items-center gap-1.5 text-xs">
                                <Package size={11} className="text-muted shrink-0" />
                                <span className="font-medium">{item.model}</span>
                                <span className="text-muted">T.{item.size} · ×{item.quantity}</span>
                              </li>
                            ))}
                          </ul>
                        </td>
                        <td className="px-4 py-3 font-medium whitespace-nowrap">
                          {fmtCurrency(order.subtotal, order.currency)}
                        </td>
                        <td className="px-4 py-3 hidden lg:table-cell">
                          <span className={`inline-block text-xs px-2 py-0.5 rounded-sm ${statusColor}`}>
                            {statusLabel}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-4 justify-end">
                            <button
                              type="button"
                              onClick={() => openEdit(order)}
                              className="text-muted hover:text-foreground transition-colors"
                              aria-label="Editar orden"
                            >
                              <Pencil size={14} />
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteTarget(order)}
                              className="text-muted hover:text-red-600 transition-colors"
                              aria-label="Eliminar orden"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* ── Edit modal ──────────────────────────────────────────────────────── */}
      {editTarget && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center p-4 sm:p-10 bg-foreground/40 overflow-y-auto"
          onClick={(e) => e.target === e.currentTarget && closeEdit()}
        >
          <div className="bg-background w-full max-w-lg border border-line my-auto">
            <div className="sticky top-0 bg-background border-b border-line px-6 py-4 flex items-center justify-between z-10">
              <h2 className="heading-display text-lg">Editar orden</h2>
              <button
                type="button"
                onClick={closeEdit}
                className="text-muted hover:text-foreground"
                aria-label="Cerrar"
              >
                <X size={18} />
              </button>
            </div>

            <div className="px-6 py-6 flex flex-col gap-5">
              {formError && (
                <div className="px-4 py-3 border border-red-200 bg-red-50 text-red-700 text-sm">
                  {formError}
                </div>
              )}

              {/* Order summary */}
              <div className="bg-surface p-4 text-sm">
                <p className="text-muted eyebrow mb-2">Resumen</p>
                <div className="flex justify-between">
                  <span className="text-muted">ID</span>
                  <span className="font-mono text-xs">{editTarget.id.slice(0, 16)}…</span>
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-muted">Fecha</span>
                  <span>{fmtDate(editTarget.createdAt)}</span>
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-muted">Total</span>
                  <span className="font-medium">{fmtCurrency(editTarget.subtotal, editTarget.currency)}</span>
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-muted">Proveedor</span>
                  <span className="capitalize">{editTarget.provider ?? "—"}</span>
                </div>
              </div>

              {/* Products list */}
              <div>
                <p className="eyebrow mb-2">Productos</p>
                <ul className="border border-line divide-y divide-line">
                  {editTarget.items.map((item, i) => (
                    <li key={i} className="px-3 py-2 flex items-center justify-between text-sm">
                      <div>
                        <span className="font-medium">{item.model}</span>
                        <span className="text-muted ml-2">T.{item.size} · {item.color}</span>
                      </div>
                      <div className="text-muted">
                        ×{item.quantity} · {fmtCurrency(item.unitPrice * item.quantity, editTarget.currency)}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Editable fields */}
              <div>
                <label className="eyebrow block mb-2">Estado</label>
                <select
                  value={form.status}
                  onChange={(e) => setField("status", e.target.value as OrderStatus)}
                  className="w-full border border-line px-3 py-2.5 text-sm bg-background focus:outline-none focus:ring-1 focus:ring-foreground"
                >
                  {EDITABLE_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {STATUS_LABELS[s] ?? s}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="eyebrow block mb-2">Email del comprador</label>
                <input
                  type="email"
                  value={form.payerEmail}
                  onChange={(e) => setField("payerEmail", e.target.value)}
                  className="w-full border border-line px-3 py-2.5 text-sm bg-background focus:outline-none focus:ring-1 focus:ring-foreground"
                  placeholder="cliente@ejemplo.com"
                />
              </div>

              <div>
                <label className="eyebrow block mb-2">Dirección de envío</label>
                <input
                  type="text"
                  value={form.shippingAddress}
                  onChange={(e) => setField("shippingAddress", e.target.value)}
                  className="w-full border border-line px-3 py-2.5 text-sm bg-background focus:outline-none focus:ring-1 focus:ring-foreground"
                  placeholder="Av. Corrientes 1234, CABA"
                />
              </div>

              <div>
                <label className="eyebrow block mb-2">Teléfono de contacto</label>
                <input
                  type="tel"
                  value={form.shippingPhone}
                  onChange={(e) => setField("shippingPhone", e.target.value)}
                  className="w-full border border-line px-3 py-2.5 text-sm bg-background focus:outline-none focus:ring-1 focus:ring-foreground"
                  placeholder="+54 9 11 1234-5678"
                />
              </div>
            </div>

            <div className="sticky bottom-0 bg-background border-t border-line px-6 py-4 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={closeEdit}
                className="text-sm text-muted hover:text-foreground px-4 py-2"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => void handleSave()}
                disabled={saving}
                className="flex items-center gap-2 bg-foreground text-background text-sm tracking-widest uppercase px-6 py-2.5 hover:opacity-80 transition-opacity disabled:opacity-50"
              >
                {saving && <Loader2 size={14} className="animate-spin" />}
                Guardar cambios
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete confirmation ────────────────────────────────────────────── */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/40">
          <div className="bg-background w-full max-w-sm p-6 border border-line">
            <h3 className="heading-display text-lg mb-2 flex items-center gap-2">
              <XCircle size={18} className="text-muted shrink-0" />
              Archivar orden
            </h3>
            <p className="text-sm text-muted mb-1">
              ¿Confirmás el archivado de la orden de{" "}
              <strong className="text-foreground">
                {deleteTarget.payerEmail ?? "este cliente"}
              </strong>
              ?
            </p>
            <p className="text-xs text-muted mb-6">
              La orden pasará a estado <strong>Cancelada</strong> y quedará visible en el Archivo para consulta histórica. No se borra ningún dato.
            </p>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="text-sm text-muted hover:text-foreground px-4 py-2"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => void handleDelete()}
                disabled={deleting}
                className="flex items-center gap-2 bg-foreground text-background text-sm uppercase tracking-widest px-5 py-2.5 hover:opacity-80 transition-opacity disabled:opacity-50"
              >
                {deleting && <Loader2 size={14} className="animate-spin" />}
                Archivar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
