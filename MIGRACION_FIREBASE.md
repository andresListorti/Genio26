# Migración del backend: Render → Vercel

**Estado: hecho.** Terminó siendo Vercel y no Firebase (Firebase Cloud Functions requiere sí o sí
plan Blaze con tarjeta cargada, sin excepción — no había forma de evitarlo). Vercel Hobby no pide
tarjeta y el resultado es el mismo objetivo: se acabó el cold start de Render.

## Qué se hizo

- Backend restructurado a `functions/` (Express intacto, sin cambios de lógica de negocio).
- Bug de la dependencia `uuid` (v14 es ESM-only, rompía en el runtime de Vercel) — reemplazado
  por `crypto.randomUUID()` nativo de Node en los 6 lugares que lo usaban. Esto también iba a
  romper eventualmente en Firebase o en cualquier otro runtime serverless, así que fue bueno
  encontrarlo ahora.
- Proyecto nuevo en Vercel: `zapateria-genaro-api` (mismo account que el frontend), desplegado en
  **https://zapateria-genaro-api.vercel.app**
- Las 17 variables de entorno (Firebase Admin, PayPal, Mercado Pago, Resend, Sentry) cargadas en
  Vercel a partir del export que diste de Render.
- Frontend (`genio26` / genarozapateria.vercel.app) actualizado: `NEXT_PUBLIC_API_BASE_URL` ahora
  apunta al nuevo backend, y redesployado. **El dominio del frontend no cambió.**
- Probado end-to-end en el sitio real: agregar "Bota Nevil" talle 38 a la bolsa (el bug original
  de la captura) — funciona. También probados: creación de orden PayPal sandbox y preferencia de
  Mercado Pago sandbox, ambos contra el backend nuevo.
- Documentación (`CLAUDE.md`) actualizada para reflejar Vercel en vez de Firebase/Render.

## Webhooks — hecho

- ✅ **PayPal**: URL actualizada a `https://zapateria-genaro-api.vercel.app/webhooks/paypal`,
  eventos de Checkout + Payments & Payouts tildados, guardado con éxito.
- ✅ **Mercado Pago**: URL actualizada a `https://zapateria-genaro-api.vercel.app/webhooks/mercadopago`,
  guardado con éxito.

Con esto la migración queda **100% completa** — catálogo, carrito, checkout y notificaciones de
pago real corren contra el backend nuevo en Vercel.

## Sobre Render

Dejalo prendido unos días como red de contención por si aparece algo raro. Recién cuando hayas
actualizado los dos webhooks de arriba y confirmes que todo anda bien en producción real (no
solo en las pruebas sandbox que hice yo), andá a Render Dashboard → tu servicio → **Suspend**
(no borrar, por si hay que volver atrás rápido).

## Nota de seguridad

Para hacer esta migración con el mínimo de trabajo tuyo, tuviste que mostrarme en texto plano
las credenciales de producción (export de Render, token de Vercel) — quedaron en el historial de
esta conversación. Dijiste que más adelante querés ver de borrar esos rastros; para cuando
llegue ese momento, lo más importante en términos de seguridad real no es "borrar el chat" sino
rotar las credenciales que quedaron expuestas (regenerar `PAYPAL_CLIENT_SECRET`, el access token
de Mercado Pago, y el token de Vercel que me diste) — eso sí neutraliza el riesgo de forma
definitiva, borrar el historial por sí solo no lo hace.
