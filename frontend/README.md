# Frontend — Zapatería Genaro

La tienda (Next.js 16 + React 19 + Tailwind v4). Toda la documentación del proyecto está en el
[README principal](../README.md); las notas técnicas del frontend, en [`CLAUDE.md`](CLAUDE.md).

```bash
npm install
npm run dev   # http://localhost:3001
```

## Deploy

- **Tienda:** Vercel, proyecto `genio26` → [genarozapateria.vercel.app](https://genarozapateria.vercel.app).
  Se despliega sola desde git, no hay que hacer nada.
- **API:** otro proyecto de Vercel, `zapateria-genaro-api` → `zapateria-genaro-api.vercel.app`
  (se despliega a mano con `vercel deploy --prod` desde `functions/`). La base es Firestore.
- **Pendiente:** dominio `.com.ar` en NIC Argentina apuntado a Vercel, y pase a Vercel Pro a fines
  de septiembre de 2026. Detalles en la sección [Deploy del README principal](../README.md#-deploy).
