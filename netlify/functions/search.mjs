// GET /api/search?q=iphone&offset=0
// Interroga tutte le fonti configurate, unisce gli annunci e li ordina dal più recente.
import * as ebay from "./sources/ebay.mjs";

// Per aggiungere una fonte: un modulo con isConfigured() e search(q, opts) -> { items, total }.
const SOURCES = [{ name: "eBay", mod: ebay }];

export function mergeByDate(lists) {
  const seen = new Set();
  return lists
    .flat()
    .filter((it) => it && it.url && !seen.has(it.id) && seen.add(it.id))
    .sort((a, b) => (Date.parse(b.date) || 0) - (Date.parse(a.date) || 0));
}

const json = (status, body) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "public, max-age=120" },
  });

export default async (req) => {
  const url = new URL(req.url);
  const q = (url.searchParams.get("q") || "").trim().slice(0, 120);
  const offset = Math.max(0, parseInt(url.searchParams.get("offset") || "0", 10) || 0);
  if (!q) return json(400, { error: "Scrivi cosa cerchi." });

  const active = SOURCES.filter((s) => s.mod.isConfigured());
  if (!active.length) return json(503, { error: "Nessuna fonte configurata: mancano le chiavi eBay nelle impostazioni del sito." });

  const results = await Promise.allSettled(active.map((s) => s.mod.search(q, { offset })));
  const sources = results.map((r, i) => ({
    name: active[i].name,
    ok: r.status === "fulfilled",
    total: r.status === "fulfilled" ? r.value.total : 0,
  }));
  results.forEach((r, i) => r.status === "rejected" && console.error(active[i].name, r.reason));
  const items = mergeByDate(results.filter((r) => r.status === "fulfilled").map((r) => r.value.items));
  return json(200, { q, offset, items, sources });
};
