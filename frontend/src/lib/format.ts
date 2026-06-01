const LOCALE_BY_CURRENCY: Record<string, string> = {
  ARS: "es-AR",
  USD: "en-US",
  EUR: "es-ES",
};

/**
 * Formats a monetary amount using the correct locale for its currency.
 * Genaro prices are stored in ARS (e.g. 180000 -> "$ 180.000").
 */
export function formatMoney(amount: number, currency = "ARS"): string {
  const code = (currency || "ARS").toUpperCase();
  const locale = LOCALE_BY_CURRENCY[code] ?? "es-AR";
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: code,
      minimumFractionDigits: code === "ARS" ? 0 : 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `$${amount.toFixed(2)} ${code}`;
  }
}
