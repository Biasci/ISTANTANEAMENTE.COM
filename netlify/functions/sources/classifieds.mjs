// Annunci dei siti di annunci (Subito, Vinted, AutoScout24…) presi dall'indice di Google
// tramite SearchApi, con una sola ricerca "site:" per categoria. Non legge i siti direttamente:
// mostra titolo, prezzo e data che Google ha indicizzato e porta all'annuncio originale.
import * as api from "./searchapi.mjs";

const NAMES = {
  "subito.it": "Subito", "vinted.it": "Vinted", "facebook.com": "Marketplace", "clasf.it": "Clasf", "bakeca.it": "Bakeca",
  "secondamano.it": "Secondamano", "portaportese.it": "Porta Portese", "mercatinousato.com": "Mercatino dell'Usato",
  "autoscout24.it": "AutoScout24", "automobile.it": "Automobile.it", "autosupermarket.it": "Autosupermarket", "moto.it": "Moto.it",
  "insella.it": "InSella", "camperonline.it": "CamperOnLine", "boat24.com": "Boat24", "inautia.it": "iNautia",
  "agriaffaires.it": "Agriaffaires", "mascus.it": "Mascus", "truckscout24.it": "TruckScout24", "mercatinomusicale.com": "Mercatino Musicale",
  "reverb.com": "Reverb", "hwupgrade.it": "Hardware Upgrade", "juzaphoto.com": "JuzaPhoto", "depop.com": "Depop",
  "vestiairecollective.com": "Vestiaire Collective", "chrono24.it": "Chrono24", "discogs.com": "Discogs", "comprovendolibri.it": "Comprovendolibri",
  "buycycle.com": "buycycle", "catawiki.com": "Catawiki", "delcampe.net": "Delcampe", "cardmarket.com": "Cardmarket", "deesup.com": "Deesup",
};

const BASE = ["subito.it", "vinted.it", "facebook.com", "clasf.it", "bakeca.it", "portaportese.it"];
export const DOMAINS = {
  tutto: [...BASE, "secondamano.it", "mercatinousato.com"],
  auto: ["subito.it", "autoscout24.it", "automobile.it", "autosupermarket.it", "facebook.com", "portaportese.it"],
  moto: ["subito.it", "moto.it", "insella.it", "autoscout24.it", "facebook.com"],
  camper: ["subito.it", "camperonline.it", "autoscout24.it", "facebook.com"],
  barche: ["subito.it", "boat24.com", "inautia.it", "facebook.com"],
  lavoro: ["subito.it", "agriaffaires.it", "mascus.it", "truckscout24.it"],
  ricambi: ["subito.it", "facebook.com", "clasf.it"],
  elettronica: BASE,
  pc: [...BASE.slice(0, 4), "hwupgrade.it"],
  gaming: BASE,
  tv: BASE,
  foto: [...BASE.slice(0, 4), "juzaphoto.com"],
  musica: ["mercatinomusicale.com", "subito.it", "reverb.com", "facebook.com", "vinted.it"],
  dischi: ["discogs.com", "subito.it", "vinted.it", "facebook.com"],
  libri: ["subito.it", "vinted.it", "comprovendolibri.it", "facebook.com"],
  moda: ["vinted.it", "depop.com", "vestiairecollective.com", "subito.it"],
  lusso: ["chrono24.it", "vestiairecollective.com", "catawiki.com", "subito.it", "vinted.it"],
  bambini: ["vinted.it", "subito.it", "facebook.com", "mercatinousato.com"],
  casa: ["subito.it", "facebook.com", "mercatinousato.com", "deesup.com", "portaportese.it"],
  elettrodomestici: BASE,
  faidate: ["subito.it", "facebook.com", "clasf.it", "agriaffaires.it"],
  bici: ["subito.it", "buycycle.com", "facebook.com", "vinted.it"],
  sport: BASE,
  collezionismo: ["catawiki.com", "delcampe.net", "cardmarket.com", "subito.it", "vinted.it"],
  arte: ["catawiki.com", "subito.it", "facebook.com"],
};

// Pagine che sono elenchi o ricerche, non un singolo annuncio.
const NOT_A_LISTING = /\/(search|ricerca|cerca|catalog|annunci-italia|annunci-[a-z-]+\/vendita|lst|marketplace\/[a-z]+\/?$|tag|categoria|category)(\/|\?|$)|[?&](q|query|search_text|keywords)=/i;
const LISTING_HINT = { "subito.it": /\d{6,}\.htm/, "vinted.it": /\/items\/\d+/, "facebook.com": /\/marketplace\/item\/\d+/, "autoscout24.it": /\/annunci\// };

export function domainOf(url) {
  try { return new URL(url).hostname.replace(/^www\.|^it\.|^m\./, ""); } catch { return null; }
}

export function isListing(url) {
  const d = domainOf(url);
  if (!d) return false;
  const hint = Object.entries(LISTING_HINT).find(([k]) => d.endsWith(k));
  if (hint) return hint[1].test(url);
  return !NOT_A_LISTING.test(url);
}

export function mapResult(r, now = Date.now()) {
  const d = domainOf(r.link);
  const key = Object.keys(NAMES).find((k) => d && d.endsWith(k));
  const text = [r.title, r.snippet].join(" ");
  return {
    id: "web:" + r.link,
    source: key ? NAMES[key] : d,
    title: String(r.title || "").replace(/\s*[-|–]\s*(Subito|Vinted|AutoScout24|Facebook)[^|–-]*$/i, ""),
    price: api.parsePrice(r.price || r.title) ?? api.parsePrice(r.snippet),
    currency: "EUR",
    image: r.thumbnail || null,
    url: r.link,
    date: api.parseDate(r.date, now),
    location: null,
    condition: api.conditionFrom(text) || "Usato",
  };
}

export const isConfigured = api.isConfigured;

export async function search(q, { cat = "tutto", offset = 0, env, fetchImpl } = {}) {
  const domains = DOMAINS[cat] || DOMAINS.tutto;
  const query = `${q} (${domains.map((d) => "site:" + d).join(" OR ")})`;
  const data = await api.call({ engine: "google", q: query, num: "30", page: String(Math.floor(offset / 50) + 1) }, { env, fetchImpl });
  const items = (data.organic_results || []).filter((r) => r.link && isListing(r.link)).map((r) => mapResult(r));
  return { items, total: items.length };
}
