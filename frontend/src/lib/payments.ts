// Interest-free installments advertised across the store. The storefront only
// displays this; the offer itself must be enabled in the Mercado Pago account
// ("Cuotas sin interés"), otherwise checkout will charge interest.
export const INTEREST_FREE_INSTALLMENTS = 3;

export function installmentAmount(price: number): number {
  return Math.ceil(price / INTEREST_FREE_INSTALLMENTS);
}
