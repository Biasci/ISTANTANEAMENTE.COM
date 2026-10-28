# Istantaneamente

Tutti gli annunci dell'usato in un'unica lista, dal più recente, più i link di ricerca a 70 siti specializzati.

## Come è fatto

- `public/index.html` è la pagina, senza build.
- `netlify/functions/search.mjs` risponde su `/api/search?q=...`: interroga le fonti, unisce gli annunci e li ordina per data.
- `netlify/functions/sources/` contiene una fonte per file. Per ora c'è eBay (Browse API ufficiale, solo usato, marketplace Italia).

## Messa online (Netlify)

1. Su Netlify scegli "Add new site", poi "Import from GitHub", e seleziona questo repository. Non serve nessun comando di build.
2. In Site configuration > Environment variables aggiungi:
   - `EBAY_CLIENT_ID` e `EBAY_CLIENT_SECRET`: le chiavi "Production" della tua app su developer.ebay.com
   - `EBAY_CAMPAIGN_ID` (facoltativo): l'id campagna di eBay Partner Network, per guadagnare una commissione sugli acquisti
3. Rifai il deploy. Il dominio (es. istantaneamente.it) si collega da Domain management.

## Aggiungere una fonte

Crea `netlify/functions/sources/<nome>.mjs` che esporta `isConfigured()` e `search(q, { offset })`, e che restituisce `{ items, total }`. Ogni item ha `id, source, title, price, currency, image, url, date, location, condition`. Poi aggiungila a `SOURCES` in `search.mjs`.

## Test

```
npm test
```
