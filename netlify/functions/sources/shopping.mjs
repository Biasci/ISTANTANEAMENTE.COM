// Offerte dei negozi da Google Shopping (Amazon, MediaWorld, Unieuro, Euronics, Back Market,
// refurbed, Swappie…) tramite SearchApi: una ricerca normale e una filtrata sull'usato.
import * as api from "./searchapi.mjs";

export const isConfigured = api.isConfigured;

export function mapOffer(o, used) {
  const url = o.product_link || o.link || o.offers_link;
  const text = [o.title, o.condition, o.durability, o.second_hand_condition].join(" ");
  return {
    id: "shop:" + (o.product_id || url),
    source: o.seller || o.source || o.merchant || "Negozio",
    title: o.title,
    price: typeof o.extracted_price === "number" ? o.extracted_price : api.parsePrice(o.price),
    currency: "EUR",
    image: o.thumbnail || null,
    url,
    date: null,
    location: null,
    condition: api.conditionFrom(text) || (used ? "Usato" : "Nuovo"),
  };
}

export async function search(q, { offset = 0, env, fetchImpl } = {}) {
  if (offset > 0) return { items: [], total: 0 };
  const opts = { env, fetchImpl };
  const [all, used] = await Promise.all([
    api.call({ engine: "google_shopping", q, link: "resolved" }, opts),
    api.call({ engine: "google_shopping", q, condition: "used", link: "resolved" }, opts).catch(() => ({})),
  ]);
  const items = [
    ...(used.shopping_results || []).map((o) => mapOffer(o, true)),
    ...(all.shopping_results || []).map((o) => mapOffer(o, false)),
  ].filter((it) => it.url && it.title);
  return { items, total: items.length };
}
