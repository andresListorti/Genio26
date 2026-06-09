"use client";

import Link from "next/link";
import { MapPin, X, UserCircle } from "lucide-react";

interface Props {
  reason: "not-logged-in" | "incomplete-profile";
  onClose: () => void;
}

export default function ProfileRequiredModal({ reason, onClose }: Props) {
  const isAuth = reason === "incomplete-profile";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/40"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-background w-full max-w-sm border border-line p-7 relative">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-muted hover:text-foreground"
          aria-label="Cerrar"
        >
          <X size={16} />
        </button>

        <div className="flex items-center justify-center w-12 h-12 bg-surface border border-line mb-5">
          {isAuth ? (
            <MapPin size={20} className="text-foreground" />
          ) : (
            <UserCircle size={20} className="text-foreground" />
          )}
        </div>

        <h2 className="heading-display text-xl mb-2">
          {isAuth ? "Completá tu perfil" : "Iniciá sesión"}
        </h2>

        <p className="text-sm text-muted leading-relaxed mb-7">
          {isAuth
            ? "Para agregar productos al carrito necesitás tener una dirección de envío y un teléfono de contacto guardados en tu perfil."
            : "Necesitás iniciar sesión para agregar artículos al carrito y acceder a tu historial de pedidos."}
        </p>

        <div className="flex flex-col gap-2">
          <Link
            href={isAuth ? "/profile" : "/login"}
            onClick={onClose}
            className="w-full bg-foreground text-background text-sm tracking-[0.18em] uppercase py-3 text-center hover:opacity-80 transition-opacity"
          >
            {isAuth ? "Ir a mi perfil" : "Iniciar sesión"}
          </Link>
          <button
            type="button"
            onClick={onClose}
            className="w-full text-sm text-muted hover:text-foreground py-2 transition-colors"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
