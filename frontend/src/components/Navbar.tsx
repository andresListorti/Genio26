"use client";

import Link from "next/link";
import Image from "next/image";
import {
  LogOut,
  Menu,
  Search,
  ShoppingBag,
  User,
  UserCircle,
  X,
} from "lucide-react";
import { Suspense, useEffect, useRef, useState } from "react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import SearchBar from "./SearchBar";

const searchFallback = (
  <div className="w-full h-9 bg-surface" aria-hidden="true" />
);

const NAV_LINKS = [
  { href: "/collections/men", label: "Hombre" },
  { href: "/collections/women", label: "Mujer" },
  { href: "/", label: "Colección" },
];

export default function Navbar() {
  const { itemCount, openCart } = useCart();
  const { user, profile, loading, logout } = useAuth();
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close user dropdown when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(e.target as Node)
      ) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Close mobile menu when viewport widens to desktop
  useEffect(() => {
    const handler = () => {
      if (window.innerWidth >= 768) setMobileMenuOpen(false);
    };
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  // Prevent body scroll while mobile menu is open
  useEffect(() => {
    if (typeof document === "undefined") return;
    document.body.style.overflow = mobileMenuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  const closeMenu = () => setMobileMenuOpen(false);

  const initials = profile?.displayName
    ? profile.displayName[0].toUpperCase()
    : (profile?.email ?? "U")[0].toUpperCase();

  return (
    <>
      <header className="sticky top-0 z-40 bg-background/85 backdrop-blur-md border-b border-line">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10 h-16 flex items-center justify-between gap-3">

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-7 text-sm tracking-wide text-foreground/80 shrink-0">
            {NAV_LINKS.map(({ href, label }) => (
              <Link key={href} href={href} className="hover:text-foreground">
                {label}
              </Link>
            ))}
          </nav>

          {/* Hamburger — mobile only */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="md:hidden text-foreground/70 hover:text-foreground"
            aria-label="Abrir menú"
            aria-expanded={mobileMenuOpen}
          >
            <Menu size={20} />
          </button>

          {/* Logo — centred absolutely */}
          <Link
            href="/"
            className="absolute left-1/2 -translate-x-1/2 heading-display text-2xl tracking-[0.3em] whitespace-nowrap"
          >
            GENARO
          </Link>

          {/* Right cluster */}
          <div className="flex items-center gap-3 md:gap-5 ml-auto md:ml-0">
            <Suspense fallback={searchFallback}>
              <SearchBar className="hidden lg:flex w-64" />
            </Suspense>

            {/* Mobile search toggle */}
            <button
              type="button"
              onClick={() => setMobileSearchOpen((v) => !v)}
              className="lg:hidden text-foreground/70 hover:text-foreground"
              aria-label="Buscar"
              aria-expanded={mobileSearchOpen}
            >
              {mobileSearchOpen ? <X size={18} /> : <Search size={18} />}
            </button>

            {/* Auth area */}
            {loading ? (
              <div className="hidden sm:block w-5 h-5" />
            ) : user ? (
              <div ref={userMenuRef} className="relative hidden sm:block">
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

            {/* Cart */}
            <button
              type="button"
              onClick={openCart}
              className="relative text-foreground/70 hover:text-foreground"
              aria-label="Abrir bolsa"
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

        {/* Mobile search bar */}
        {mobileSearchOpen && (
          <div className="lg:hidden border-t border-line px-4 sm:px-6 py-3">
            <Suspense fallback={searchFallback}>
              <SearchBar />
            </Suspense>
          </div>
        )}
      </header>

      {/* ── Mobile navigation drawer ──────────────────────────────────────── */}
      {/* Backdrop */}
      <div
        aria-hidden="true"
        onClick={closeMenu}
        className={`fixed inset-0 z-50 bg-black/40 transition-opacity duration-300 md:hidden ${
          mobileMenuOpen
            ? "opacity-100"
            : "opacity-0 pointer-events-none"
        }`}
      />

      {/* Drawer panel */}
      <nav
        aria-label="Menú principal"
        aria-hidden={!mobileMenuOpen}
        className={`fixed top-0 left-0 z-50 h-full w-72 bg-background border-r border-line flex flex-col transform transition-transform duration-300 ease-out md:hidden ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-line">
          <Link
            href="/"
            onClick={closeMenu}
            className="heading-display text-xl tracking-[0.3em]"
          >
            GENARO
          </Link>
          <button
            type="button"
            onClick={closeMenu}
            className="p-1 -mr-1 text-foreground/70 hover:text-foreground"
            aria-label="Cerrar menú"
          >
            <X size={20} />
          </button>
        </div>

        {/* Nav links */}
        <div className="flex-1 overflow-y-auto px-6 pt-8 pb-6">
          <ul className="space-y-1">
            {NAV_LINKS.map(({ href, label }) => (
              <li key={href}>
                <Link
                  href={href}
                  onClick={closeMenu}
                  className="block py-3 heading-display text-3xl hover:text-muted transition-colors"
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Auth section at bottom */}
        <div className="border-t border-line px-6 py-6">
          {loading ? null : user ? (
            <div className="space-y-3">
              {/* Avatar + name */}
              <div className="flex items-center gap-3">
                {profile?.photoURL ? (
                  <Image
                    src={profile.photoURL}
                    alt=""
                    width={32}
                    height={32}
                    className="rounded-full object-cover"
                  />
                ) : (
                  <span className="w-8 h-8 rounded-full bg-foreground text-background text-xs flex items-center justify-center font-medium select-none shrink-0">
                    {initials}
                  </span>
                )}
                <p className="text-sm text-muted truncate">
                  {profile?.displayName ?? profile?.email}
                </p>
              </div>
              <Link
                href="/profile"
                onClick={closeMenu}
                className="flex items-center gap-2 text-sm py-1 text-foreground/80 hover:text-foreground"
              >
                <UserCircle size={14} />
                Mi perfil
              </Link>
              <button
                type="button"
                onClick={async () => {
                  await logout();
                  closeMenu();
                }}
                className="flex items-center gap-2 text-sm py-1 text-muted hover:text-foreground w-full text-left"
              >
                <LogOut size={14} />
                Cerrar sesión
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              onClick={closeMenu}
              className="flex items-center gap-2 text-sm text-foreground/80 hover:text-foreground"
            >
              <User size={14} />
              Iniciar sesión
            </Link>
          )}
        </div>
      </nav>
    </>
  );
}
