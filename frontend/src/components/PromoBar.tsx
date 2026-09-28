"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import CardBrands from "./CardBrands";
import { INTEREST_FREE_INSTALLMENTS } from "@/lib/payments";

const SLIDES: React.ReactNode[] = [
  <>
    <span>
      <strong className="font-medium">{INTEREST_FREE_INSTALLMENTS} cuotas sin interés</strong>{" "}
      con
    </span>
    <CardBrands className="text-background" />
  </>,
  <>Pagá seguro con Mercado Pago</>,
  <>Hecho en Argentina desde 1962</>,
];

const INTERVAL_MS = 4500;

export default function PromoBar() {
  const [index, setIndex] = useState(0);
  // `paused` follows hover/focus; `stopped` is the explicit pause button.
  const [paused, setPaused] = useState(false);
  const [stopped, setStopped] = useState(false);

  useEffect(() => {
    if (paused || stopped) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(
      () => setIndex((i) => (i + 1) % SLIDES.length),
      INTERVAL_MS
    );
    return () => clearInterval(id);
  }, [paused, stopped]);

  const go = (step: number) =>
    setIndex((i) => (i + step + SLIDES.length) % SLIDES.length);

  return (
    <section
      aria-roledescription="carrusel"
      aria-label="Promociones"
      className="bg-foreground text-background"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div className="relative max-w-7xl mx-auto h-9 flex items-center px-10 sm:px-16">
        <button
          type="button"
          onClick={() => setStopped((s) => !s)}
          aria-label={stopped ? "Reanudar promociones" : "Pausar promociones"}
          aria-pressed={stopped}
          className="absolute left-2 p-1 opacity-60 hover:opacity-100 transition-opacity"
        >
          {stopped ? <Play size={12} /> : <Pause size={12} />}
        </button>
        <button
          type="button"
          onClick={() => go(-1)}
          aria-label="Promoción anterior"
          className="hidden sm:block absolute left-8 p-1 opacity-60 hover:opacity-100 transition-opacity"
        >
          <ChevronLeft size={14} />
        </button>

        <div className="relative flex-1 h-full overflow-hidden" aria-live={paused || stopped ? "polite" : "off"}>
          {SLIDES.map((slide, i) => (
            <p
              key={i}
              aria-hidden={i !== index}
              className={`absolute inset-0 flex items-center justify-center gap-2 text-[11px] sm:text-xs tracking-[0.08em] sm:tracking-[0.14em] uppercase whitespace-nowrap transition-all duration-300 motion-reduce:transition-none ${
                i === index
                  ? "opacity-100 translate-y-0 delay-300"
                  : "opacity-0 -translate-y-2 pointer-events-none"
              }`}
            >
              {slide}
            </p>
          ))}
        </div>

        <button
          type="button"
          onClick={() => go(1)}
          aria-label="Promoción siguiente"
          className="absolute right-2 p-1 opacity-60 hover:opacity-100 transition-opacity"
        >
          <ChevronRight size={14} />
        </button>
      </div>
    </section>
  );
}
