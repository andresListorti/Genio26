"use client";

import { Search, X } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export default function SearchBar({ className = "" }: { className?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const initial = searchParams.get("q") ?? "";
  const [value, setValue] = useState(initial);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const userChanged = useRef(false);

  useEffect(() => {
    userChanged.current = false;
    setValue(searchParams.get("q") ?? "");
  }, [searchParams, pathname]);

  useEffect(() => {
    if (!userChanged.current) return;
    const handle = window.setTimeout(() => {
      const trimmed = value.trim();
      const params = new URLSearchParams();
      if (trimmed) params.set("q", trimmed);
      const query = params.toString();
      const target = query ? `/?${query}` : "/";
      router.replace(target, { scroll: false });
    }, 200);
    return () => window.clearTimeout(handle);
  }, [value, router]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    inputRef.current?.blur();
  };

  return (
    <form
      onSubmit={onSubmit}
      className={`relative flex items-center group ${className}`}
    >
      <Search
        size={16}
        className="absolute left-3 text-foreground/50 pointer-events-none"
      />
      <input
        ref={inputRef}
        type="search"
        value={value}
        onChange={(e) => {
          userChanged.current = true;
          setValue(e.target.value);
        }}
        placeholder="Buscar productos"
        aria-label="Buscar productos"
        className="w-full pl-9 pr-9 py-2 text-sm bg-surface border border-transparent focus:border-line focus:bg-background outline-none transition placeholder:text-muted"
      />
      {value && (
        <button
          type="button"
          onClick={() => {
            userChanged.current = true;
            setValue("");
          }}
          aria-label="Clear search"
          className="absolute right-2 text-muted hover:text-foreground p-1"
        >
          <X size={14} />
        </button>
      )}
    </form>
  );
}
