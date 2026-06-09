"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Archive, ChevronLeft, LogOut, Package, ShoppingBag } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const TABS = [
  { href: "/admin", label: "Productos", icon: Package },
  { href: "/admin/orders", label: "Órdenes", icon: ShoppingBag },
  { href: "/admin/archive", label: "Archivo", icon: Archive },
];

export default function AdminNav() {
  const { profile, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  return (
    <div className="bg-background border-b border-line">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10 h-14 flex items-center justify-between">
        <span className="eyebrow text-foreground">Panel de administración</span>
        <div className="flex items-center gap-5">
          <Link
            href="/"
            className="flex items-center gap-1 text-sm text-muted hover:text-foreground"
          >
            <ChevronLeft size={14} />
            Ver tienda
          </Link>
          <button
            type="button"
            onClick={async () => {
              await logout();
              router.replace("/");
            }}
            className="flex items-center gap-1.5 text-sm text-muted hover:text-foreground"
          >
            <LogOut size={14} />
            <span className="hidden sm:inline">{profile?.email ?? "Salir"}</span>
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10 flex">
        {TABS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-2 px-5 py-2.5 text-sm transition-colors border-b-2 ${
                active
                  ? "border-foreground text-foreground font-medium"
                  : "border-transparent text-muted hover:text-foreground"
              }`}
            >
              <Icon size={13} />
              {label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
