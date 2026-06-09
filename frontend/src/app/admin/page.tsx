"use client";

import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import {
  Loader2,
  Pencil,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import type { Shoe, ShoeStockVariant } from "@/lib/types";
import AdminNav from "@/components/AdminNav";

// ─── Constants ──────────────────────────────────────────────────────────────

const RESOURCE_IMAGES = [
  "/resources/Men.jpg",
  "/resources/IaDama.jpeg",
  "/resources/iadama2.jpeg",
  "/resources/iaHombre.jpeg",
  "/resources/iahombrefondo.jpeg",
  "/resources/hombremoca.jpg",
  "/resources/business-2049312_1280.jpg",
  "/resources/fashion-1284496_1280.jpg",
  "/resources/footwear-1838767_1920.jpg",
  "/resources/shoes-756616_1280.jpg",
  "/resources/woman-2179062_1920.jpg",
];

const CATEGORIES = [
  "zapatillas",
  "zapatos",
  "botas",
  "mocasines",
  "zuecos",
  "borcegos",
  "otros",
];

// ─── Form state ──────────────────────────────────────────────────────────────

interface ProductForm {
  brand: string;
  model: string;
  description: string;
  gender: "men" | "women";
  category: string;
  price: string;
  imageUrl: string;
  variants: ShoeStockVariant[];
}

function blankForm(): ProductForm {
  return {
    brand: "Genaro",
    model: "",
    description: "",
    gender: "men",
    category: "zapatos",
    price: "",
    imageUrl: RESOURCE_IMAGES[0],
    variants: [{ size: 0, color: "", stock: 0, sku: "" }],
  };
}

function shoeToForm(shoe: Shoe): ProductForm {
  return {
    brand: shoe.brand,
    model: shoe.model,
    description: shoe.description,
    gender: shoe.gender,
    category: shoe.category ?? "zapatos",
    price: String(shoe.price),
    imageUrl: shoe.imageUrl ?? RESOURCE_IMAGES[0],
    variants:
      shoe.variants.length > 0
        ? shoe.variants
        : [{ size: 0, color: "", stock: 0, sku: "" }],
  };
}

// ─── Page entry — auth guard ─────────────────────────────────────────────────

export default function AdminPage() {
  const { user, profile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    if (profile && profile.role !== "admin") {
      router.replace("/");
    }
  }, [user, profile, loading, router]);

  if (loading || !user || !profile) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="animate-spin text-muted" size={22} />
      </div>
    );
  }

  if (profile.role !== "admin") return null;

  return <AdminDashboard />;
}

// ─── Dashboard ───────────────────────────────────────────────────────────────

function AdminDashboard() {
  const [shoes, setShoes] = useState<Shoe[]>([]);
  const [fetchLoading, setFetchLoading] = useState(true); // true on mount so table shows spinner
  const [pageError, setPageError] = useState<string | null>(null);

  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Shoe | null>(null);
  const [form, setForm] = useState<ProductForm>(blankForm());
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<Shoe | null>(null);
  const [deleting, setDeleting] = useState(false);

  // ── Fetch on mount ─────────────────────────────────────────────────────────

  useEffect(() => {
    void (async () => {
      try {
        const q = query(
          collection(db, "shoes"),
          orderBy("createdAt", "desc"),
        );
        const snap = await getDocs(q);
        setShoes(snap.docs.map((d) => d.data() as Shoe));
      } catch {
        setPageError("No se pudieron cargar los productos. Verificá la conexión.");
      } finally {
        setFetchLoading(false);
      }
    })();
  }, []);

  // ── Form helpers ───────────────────────────────────────────────────────────

  const openCreate = () => {
    setEditTarget(null);
    setForm(blankForm());
    setFormError(null);
    setFormOpen(true);
  };

  const openEdit = (shoe: Shoe) => {
    setEditTarget(shoe);
    setForm(shoeToForm(shoe));
    setFormError(null);
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditTarget(null);
    setFormError(null);
  };

  const setField = <K extends keyof ProductForm>(key: K, value: ProductForm[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const addVariant = () =>
    setForm((f) => ({
      ...f,
      variants: [...f.variants, { size: 0, color: "", stock: 0, sku: "" }],
    }));

  const removeVariant = (idx: number) =>
    setForm((f) => ({
      ...f,
      variants: f.variants.filter((_, i) => i !== idx),
    }));

  const patchVariant = (
    idx: number,
    patch: Partial<ShoeStockVariant>,
  ) =>
    setForm((f) => ({
      ...f,
      variants: f.variants.map((v, i) => (i === idx ? { ...v, ...patch } : v)),
    }));

  // ── Save ───────────────────────────────────────────────────────────────────

  const handleSave = async () => {
    const price = parseFloat(form.price);
    if (!form.model.trim()) {
      setFormError("El campo Título / Modelo es obligatorio.");
      return;
    }
    if (!form.description.trim()) {
      setFormError("La descripción es obligatoria.");
      return;
    }
    if (isNaN(price) || price <= 0) {
      setFormError("Ingresá un precio válido.");
      return;
    }

    setFormError(null);
    setSaving(true);
    try {
      const now = new Date().toISOString();
      const cleanVariants = form.variants.filter(
        (v) => v.size > 0 && v.color.trim(),
      );

      if (editTarget) {
        const updates = {
          brand: form.brand.trim(),
          model: form.model.trim(),
          description: form.description.trim(),
          gender: form.gender,
          category: form.category,
          price,
          imageUrl: form.imageUrl,
          variants: cleanVariants,
          updatedAt: now,
        };
        await updateDoc(doc(db, "shoes", editTarget.id), updates);
        setShoes((prev) =>
          prev.map((s) => (s.id === editTarget.id ? { ...s, ...updates } : s)),
        );
      } else {
        const id = crypto.randomUUID();
        const shoe: Shoe = {
          id,
          brand: form.brand.trim(),
          model: form.model.trim(),
          description: form.description.trim(),
          gender: form.gender,
          category: form.category,
          price,
          currency: "ARS",
          imageUrl: form.imageUrl,
          variants: cleanVariants,
          createdAt: now,
          updatedAt: now,
        };
        await setDoc(doc(db, "shoes", id), shoe);
        setShoes((prev) => [shoe, ...prev]);
      }
      closeForm();
    } catch {
      setFormError("Error al guardar. Intentá de nuevo.");
    } finally {
      setSaving(false);
    }
  };

  // ── Delete ─────────────────────────────────────────────────────────────────

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteDoc(doc(db, "shoes", deleteTarget.id));
      setShoes((prev) => prev.filter((s) => s.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch {
      setPageError("No se pudo eliminar el producto. Intentá de nuevo.");
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  const fmtPrice = (p: number) =>
    `$${p.toLocaleString("es-AR")}`;

  return (
    <div className="bg-surface min-h-full">
      <AdminNav />

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10 py-10">
        {/* Section header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="heading-display text-2xl mb-1">Productos</h1>
            <p className="text-sm text-muted">
              {fetchLoading ? "Cargando…" : `${shoes.length} productos en catálogo`}
            </p>
          </div>
          <button
            type="button"
            onClick={openCreate}
            className="flex items-center gap-2 bg-foreground text-background text-sm tracking-widest uppercase px-5 py-2.5 hover:opacity-80 transition-opacity shrink-0"
          >
            <Plus size={14} />
            Agregar
          </button>
        </div>

        {/* Page-level error */}
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

        {/* Product table */}
        {fetchLoading ? (
          <div className="flex justify-center py-24">
            <Loader2 className="animate-spin text-muted" size={22} />
          </div>
        ) : shoes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <p className="text-muted text-sm">No hay productos todavía.</p>
            <button
              type="button"
              onClick={openCreate}
              className="flex items-center gap-2 border border-line text-sm px-5 py-2.5 hover:bg-background transition-colors"
            >
              <Plus size={14} />
              Crear el primer producto
            </button>
          </div>
        ) : (
          <div className="bg-background border border-line overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-line">
                    <th className="text-left px-4 py-3 eyebrow">Img</th>
                    <th className="text-left px-4 py-3 eyebrow">Modelo</th>
                    <th className="text-left px-4 py-3 eyebrow hidden md:table-cell">
                      Colección
                    </th>
                    <th className="text-left px-4 py-3 eyebrow hidden lg:table-cell">
                      Categoría
                    </th>
                    <th className="text-left px-4 py-3 eyebrow">Precio</th>
                    <th className="text-left px-4 py-3 eyebrow hidden lg:table-cell">
                      Talles
                    </th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {shoes.map((shoe) => (
                    <tr
                      key={shoe.id}
                      className="border-b border-line last:border-0 hover:bg-surface/60 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div className="relative w-10 h-10 overflow-hidden bg-surface shrink-0">
                          {shoe.imageUrl && (
                            <Image
                              src={shoe.imageUrl}
                              alt=""
                              fill
                              className="object-cover"
                              sizes="40px"
                            />
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-medium">{shoe.model}</span>
                        <div className="text-muted text-xs">{shoe.brand}</div>
                      </td>
                      <td className="px-4 py-3 text-muted hidden md:table-cell">
                        {shoe.gender === "men" ? "Hombre" : "Mujer"}
                      </td>
                      <td className="px-4 py-3 text-muted capitalize hidden lg:table-cell">
                        {shoe.category ?? "—"}
                      </td>
                      <td className="px-4 py-3 font-medium">
                        {fmtPrice(shoe.price)}
                      </td>
                      <td className="px-4 py-3 text-muted hidden lg:table-cell">
                        {shoe.variants.length > 0
                          ? shoe.variants
                              .map((v) => v.size)
                              .sort((a, b) => a - b)
                              .join(", ")
                          : "—"}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-4 justify-end">
                          <button
                            type="button"
                            onClick={() => openEdit(shoe)}
                            className="text-muted hover:text-foreground transition-colors"
                            aria-label={`Editar ${shoe.model}`}
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(shoe)}
                            className="text-muted hover:text-red-600 transition-colors"
                            aria-label={`Eliminar ${shoe.model}`}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* ── Create / Edit modal ─────────────────────────────────────────────── */}
      {formOpen && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center p-4 sm:p-10 bg-foreground/40 overflow-y-auto"
          onClick={(e) => e.target === e.currentTarget && closeForm()}
        >
          <div className="bg-background w-full max-w-2xl border border-line my-auto">
            {/* Modal header */}
            <div className="sticky top-0 bg-background border-b border-line px-6 py-4 flex items-center justify-between z-10">
              <h2 className="heading-display text-lg">
                {editTarget ? "Editar producto" : "Nuevo producto"}
              </h2>
              <button
                type="button"
                onClick={closeForm}
                className="text-muted hover:text-foreground"
                aria-label="Cerrar"
              >
                <X size={18} />
              </button>
            </div>

            {/* Form body */}
            <div className="px-6 py-6 flex flex-col gap-6">
              {formError && (
                <div className="px-4 py-3 border border-red-200 bg-red-50 text-red-700 text-sm">
                  {formError}
                </div>
              )}

              {/* Brand + Model */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="eyebrow block mb-2">Marca</label>
                  <input
                    type="text"
                    value={form.brand}
                    onChange={(e) => setField("brand", e.target.value)}
                    className="w-full border border-line px-3 py-2.5 text-sm bg-background focus:outline-none focus:ring-1 focus:ring-foreground"
                    placeholder="Genaro"
                  />
                </div>
                <div>
                  <label className="eyebrow block mb-2">
                    Título / Modelo{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.model}
                    onChange={(e) => setField("model", e.target.value)}
                    className="w-full border border-line px-3 py-2.5 text-sm bg-background focus:outline-none focus:ring-1 focus:ring-foreground"
                    placeholder="Zapato Doha"
                    required
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="eyebrow block mb-2">
                  Descripción <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) => setField("description", e.target.value)}
                  rows={4}
                  className="w-full border border-line px-3 py-2.5 text-sm bg-background focus:outline-none focus:ring-1 focus:ring-foreground resize-none"
                  placeholder="Descripción del producto…"
                />
              </div>

              {/* Collection + Category + Price */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="eyebrow block mb-2">Colección</label>
                  <select
                    value={form.gender}
                    onChange={(e) =>
                      setField("gender", e.target.value as "men" | "women")
                    }
                    className="w-full border border-line px-3 py-2.5 text-sm bg-background focus:outline-none focus:ring-1 focus:ring-foreground"
                  >
                    <option value="men">Hombre</option>
                    <option value="women">Mujer</option>
                  </select>
                </div>
                <div>
                  <label className="eyebrow block mb-2">Categoría</label>
                  <select
                    value={form.category}
                    onChange={(e) => setField("category", e.target.value)}
                    className="w-full border border-line px-3 py-2.5 text-sm bg-background focus:outline-none focus:ring-1 focus:ring-foreground"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c} className="capitalize">
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="eyebrow block mb-2">
                    Precio ARS <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={form.price}
                    onChange={(e) => setField("price", e.target.value)}
                    className="w-full border border-line px-3 py-2.5 text-sm bg-background focus:outline-none focus:ring-1 focus:ring-foreground"
                    placeholder="150000"
                    min="1"
                  />
                </div>
              </div>

              {/* Image picker */}
              <div>
                <label className="eyebrow block mb-3">Imagen</label>
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                  {RESOURCE_IMAGES.map((src) => (
                    <button
                      key={src}
                      type="button"
                      onClick={() => setField("imageUrl", src)}
                      className={`relative aspect-square overflow-hidden border-2 transition-colors ${
                        form.imageUrl === src
                          ? "border-foreground"
                          : "border-line hover:border-muted"
                      }`}
                      title={src.split("/").pop()}
                    >
                      <Image
                        src={src}
                        alt=""
                        fill
                        className="object-cover"
                        sizes="80px"
                      />
                    </button>
                  ))}
                </div>
                <p className="mt-2 text-xs text-muted">
                  Seleccionado: {form.imageUrl.split("/").pop()}
                </p>
              </div>

              {/* Variants */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="eyebrow">Talles / Variantes</label>
                  <button
                    type="button"
                    onClick={addVariant}
                    className="flex items-center gap-1 text-xs text-muted hover:text-foreground"
                  >
                    <Plus size={12} />
                    Agregar talle
                  </button>
                </div>

                <div className="border border-line overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-surface border-b border-line">
                          <th className="text-left px-3 py-2 eyebrow text-xs">
                            Talle
                          </th>
                          <th className="text-left px-3 py-2 eyebrow text-xs">
                            Color
                          </th>
                          <th className="text-left px-3 py-2 eyebrow text-xs">
                            Stock
                          </th>
                          <th className="text-left px-3 py-2 eyebrow text-xs hidden sm:table-cell">
                            SKU
                          </th>
                          <th className="px-3 py-2 w-8" />
                        </tr>
                      </thead>
                      <tbody>
                        {form.variants.map((v, i) => (
                          <tr
                            key={i}
                            className="border-b border-line last:border-0"
                          >
                            <td className="px-2 py-1.5">
                              <input
                                type="number"
                                value={v.size || ""}
                                onChange={(e) =>
                                  patchVariant(i, {
                                    size: parseInt(e.target.value) || 0,
                                  })
                                }
                                className="w-16 border border-line px-2 py-1 text-sm bg-background focus:outline-none focus:ring-1 focus:ring-foreground"
                                placeholder="40"
                                min="1"
                              />
                            </td>
                            <td className="px-2 py-1.5">
                              <input
                                type="text"
                                value={v.color}
                                onChange={(e) =>
                                  patchVariant(i, { color: e.target.value })
                                }
                                className="w-24 border border-line px-2 py-1 text-sm bg-background focus:outline-none focus:ring-1 focus:ring-foreground"
                                placeholder="negro"
                              />
                            </td>
                            <td className="px-2 py-1.5">
                              <input
                                type="number"
                                value={v.stock || ""}
                                onChange={(e) =>
                                  patchVariant(i, {
                                    stock: parseInt(e.target.value) || 0,
                                  })
                                }
                                className="w-16 border border-line px-2 py-1 text-sm bg-background focus:outline-none focus:ring-1 focus:ring-foreground"
                                placeholder="10"
                                min="0"
                              />
                            </td>
                            <td className="px-2 py-1.5 hidden sm:table-cell">
                              <input
                                type="text"
                                value={v.sku ?? ""}
                                onChange={(e) =>
                                  patchVariant(i, { sku: e.target.value })
                                }
                                className="w-28 border border-line px-2 py-1 text-sm bg-background focus:outline-none focus:ring-1 focus:ring-foreground"
                                placeholder="GEN-ZT-40"
                              />
                            </td>
                            <td className="px-2 py-1.5">
                              <button
                                type="button"
                                onClick={() => removeVariant(i)}
                                className="text-muted hover:text-red-600 transition-colors"
                                aria-label="Eliminar variante"
                              >
                                <X size={14} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal footer */}
            <div className="sticky bottom-0 bg-background border-t border-line px-6 py-4 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={closeForm}
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
                {editTarget ? "Guardar cambios" : "Crear producto"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete confirmation ─────────────────────────────────────────────── */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/40">
          <div className="bg-background w-full max-w-sm p-6 border border-line">
            <h3 className="heading-display text-lg mb-2">Eliminar producto</h3>
            <p className="text-sm text-muted mb-6">
              ¿Confirmás la eliminación de{" "}
              <strong className="text-foreground">{deleteTarget.model}</strong>?
              Esta acción no se puede deshacer.
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
                className="flex items-center gap-2 bg-red-600 text-white text-sm uppercase tracking-widest px-5 py-2.5 hover:opacity-80 transition-opacity disabled:opacity-50"
              >
                {deleting && <Loader2 size={14} className="animate-spin" />}
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
