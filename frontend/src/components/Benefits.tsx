import { CreditCard, MapPin, ShieldCheck, Sparkles } from "lucide-react";
import { INTEREST_FREE_INSTALLMENTS } from "@/lib/payments";

const BENEFITS = [
  {
    icon: CreditCard,
    title: `${INTEREST_FREE_INSTALLMENTS} cuotas sin interés`,
    text: "Con Visa y Mastercard",
  },
  {
    icon: ShieldCheck,
    title: "Pago seguro",
    text: "Procesado por Mercado Pago",
  },
  {
    icon: Sparkles,
    title: "Cuero genuino",
    text: "Costura artesanal",
  },
  {
    icon: MapPin,
    title: "Hecho en Argentina",
    text: "Desde 1962",
  },
];

export default function Benefits() {
  return (
    <section aria-label="Beneficios" className="border-y border-line bg-background">
      <ul className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-4 divide-line lg:divide-x">
        {BENEFITS.map(({ icon: Icon, title, text }) => (
          <li
            key={title}
            className="flex items-center gap-3 px-4 sm:px-6 lg:px-8 py-5 sm:py-6"
          >
            <Icon size={20} strokeWidth={1.4} className="shrink-0 text-foreground/70" />
            <div className="min-w-0">
              <p className="text-[11px] sm:text-xs uppercase tracking-[0.14em] font-medium">
                {title}
              </p>
              <p className="text-xs text-muted mt-0.5">{text}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
