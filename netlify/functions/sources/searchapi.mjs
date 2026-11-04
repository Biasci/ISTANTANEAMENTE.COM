// Client minimo per SearchApi (searchapi.io): Google Shopping e ricerca Google, Italia.
// Richiede SEARCHAPI_KEY. 100 ricerche gratuite, poi da 4 $ ogni 1.000.

const ENDPOINT = "https://www.searchapi.io/api/v1/search";

export function isConfigured(env = process.env) {
  return Boolean(env.SEARCHAPI_KEY);
}

export async function call(params, { env = process.env, fetchImpl = fetch } = {}) {
  const qs = new URLSearchParams({ gl: "it", hl: "it", ...params });
  const res = await fetchImpl(`${ENDPOINT}?${qs}`, { headers: { Authorization: `Bearer ${env.SEARCHAPI_KEY}` } });
  if (!res.ok) throw new Error(`SearchApi ${params.engine} ${res.status}`);
  return res.json();
}

// "1.234,56 €", "€ 399", "399,00€" -> 1234.56 / 399
export function parsePrice(text) {
  if (!text) return null;
  const m = String(text).match(/(?:€\s?(\d{1,3}(?:[.\s]\d{3})*(?:,\d{1,2})?|\d+(?:,\d{1,2})?))|(?:(\d{1,3}(?:[.\s]\d{3})*(?:,\d{1,2})?|\d+(?:,\d{1,2})?)\s?(?:€|EUR\b|euro\b))/i);
  if (!m) return null;
  const n = Number((m[1] || m[2]).replace(/[.\s]/g, "").replace(",", "."));
  return Number.isFinite(n) && n > 0 ? n : null;
}

// Date come le mostra Google in italiano: "3 giorni fa", "5 ore fa", "12 ott 2026", ISO.
const MESI = { gen: 0, feb: 1, mar: 2, apr: 3, mag: 4, giu: 5, lug: 6, ago: 7, set: 8, ott: 9, nov: 10, dic: 11 };
export function parseDate(text, now = Date.now()) {
  if (!text) return null;
  const s = String(text).toLowerCase().trim();
  const rel = s.match(/(\d+)\s*(minut[oi]|or[ae]|giorn[oi]|settiman[ae]|mes[ei])\s*fa/);
  if (rel) {
    const units = [["minut", 60e3], ["or", 3600e3], ["giorn", 86400e3], ["settiman", 7 * 86400e3], ["mes", 30 * 86400e3]];
    const unit = units.find(([p]) => rel[2].startsWith(p))[1];
    return new Date(now - Number(rel[1]) * unit).toISOString();
  }
  const abs = s.match(/(\d{1,2})\s+(gen|feb|mar|apr|mag|giu|lug|ago|set|ott|nov|dic)[a-z]*\.?\s+(\d{4})/);
  if (abs) return new Date(Date.UTC(Number(abs[3]), MESI[abs[2]], Number(abs[1]), 12)).toISOString();
  const iso = Date.parse(s);
  return Number.isFinite(iso) ? new Date(iso).toISOString() : null;
}

export function conditionFrom(text) {
  const s = String(text || "").toLowerCase();
  if (/ricondizionat|refurbish|rigenerat/.test(s)) return "Ricondizionato";
  if (/\busat[oaie]\b|seconda mano|pre-owned|used/.test(s)) return "Usato";
  return null;
}
