"use client";

import Link from "next/link";
import { ShoppingBag, Search, User, X, Menu } from "lucide-react";
import { Suspense, useState } from "react";
import { useCart } from "@/context/CartContext";
import SearchBar from "./SearchBar";

const searchFallback = (
  <div className="w-full h-9 bg-surface" aria-hidden="true" />
);

export default function Navbar() {
  const { itemCount, openCart } = useCart();
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

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
          <button
            type="button"
            className="hidden sm:block text-foreground/70 hover:text-foreground"
            aria-label="Account"
          >
            <User size={18} />
          </button>
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
