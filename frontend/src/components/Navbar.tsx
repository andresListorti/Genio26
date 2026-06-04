"use client";

import Link from "next/link";
import Image from "next/image";
import { ShoppingBag, Search, User, X, Menu, LogOut, UserCircle } from "lucide-react";
import { Suspense, useEffect, useRef, useState } from "react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import SearchBar from "./SearchBar";

const searchFallback = (
  <div className="w-full h-9 bg-surface" aria-hidden="true" />
);

export default function Navbar() {
  const { itemCount, openCart } = useCart();
  const { user, profile, loading, logout } = useAuth();
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const initials = profile?.displayName
    ? profile.displayName[0].toUpperCase()
    : profile?.email
      ? profile.email[0].toUpperCase()
      : "U";

  return (
    <header className="sticky top-0 z-40 bg-background/85 backdrop-blur-md border-b border-line">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10 h-16 flex items-center justify-between gap-3">
        <nav className="hidden md:flex items-center gap-7 text-sm tracking-wide text-foreground/80 shrink-0">
          <Link href="/collections/men" className="hover:text-foreground">
            Hombre
          </Link>
          <Link href="/collections/women" className="hover:text-foreground">
            Mujer
          </Link>
          <Link href="/" className="hover:text-foreground">
            Colección
          </Link>
        </nav>

        <button
          type="button"
          className="md:hidden text-foreground/70 hover:text-foreground"
          aria-label="Menu"
        >
          <Menu size={20} />
        </button>

        <Link
          href="/"
          className="absolute left-1/2 -translate-x-1/2 heading-display text-2xl tracking-[0.3em] whitespace-nowrap"
        >
          GENARO
        </Link>

        <div className="flex items-center gap-3 md:gap-5 ml-auto md:ml-0">
          <Suspense fallback={searchFallback}>
            <SearchBar className="hidden lg:flex w-64" />
          </Suspense>
          <button
            type="button"
            onClick={() => setMobileSearchOpen((v) => !v)}
            className="lg:hidden text-foreground/70 hover:text-foreground"
            aria-label="Toggle search"
            aria-expanded={mobileSearchOpen}
          >
            {mobileSearchOpen ? <X size={18} /> : <Search size={18} />}
          </button>

          {/* Auth area */}
          {loading ? (
            <div className="hidden sm:block w-5 h-5" />
          ) : user ? (
            <div ref={menuRef} className="relative hidden sm:block">
              <button
                type="button"
                onClick={() => setUserMenuOpen((v) => !v)}
                className="flex items-center gap-2 text-foreground/70 hover:text-foreground"
                aria-label="Menú de usuario"
                aria-expanded={userMenuOpen}
              >
                {profile?.photoURL ? (
                  <Image
                    src={profile.photoURL}
                    alt=""
                    width={28}
                    height={28}
                    className="rounded-full object-cover"
                  />
                ) : (
                  <span className="w-7 h-7 rounded-full bg-foreground text-background text-xs flex items-center justify-center font-medium select-none">
                    {initials}
                  </span>
                )}
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-52 bg-background border border-line shadow-md z-50">
                  <div className="px-4 py-3 text-sm text-muted border-b border-line truncate">
                    {profile?.displayName ?? profile?.email}
                  </div>
                  <Link
                    href="/profile"
                    onClick={() => setUserMenuOpen(false)}
                    className="w-full text-left px-4 py-2.5 text-sm hover:bg-surface flex items-center gap-2"
                  >
                    <UserCircle size={14} />
                    Mi perfil
                  </Link>
                  <button
                    type="button"
                    onClick={async () => {
                      await logout();
                      setUserMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-2.5 text-sm hover:bg-surface flex items-center gap-2"
                  >
                    <LogOut size={14} />
                    Cerrar sesión
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/login"
              className="hidden sm:block text-foreground/70 hover:text-foreground"
              aria-label="Iniciar sesión"
            >
              <User size={18} />
            </Link>
          )}

          <button
            type="button"
            onClick={openCart}
            className="relative text-foreground/70 hover:text-foreground"
            aria-label="Open cart"
          >
            <ShoppingBag size={18} />
            {itemCount > 0 && (
              <span className="absolute -top-2 -right-3 bg-foreground text-background text-[10px] font-medium rounded-full h-5 min-w-5 px-1 flex items-center justify-center">
                {itemCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {mobileSearchOpen && (
        <div className="lg:hidden border-t border-line px-4 sm:px-6 py-3">
          <Suspense fallback={searchFallback}>
            <SearchBar />
          </Suspense>
        </div>
      )}
    </header>
  );
}
