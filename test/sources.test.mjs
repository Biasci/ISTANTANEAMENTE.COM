import { test } from "node:test";
import assert from "node:assert/strict";
import { parsePrice, parseDate, conditionFrom } from "../netlify/functions/sources/searchapi.mjs";
import * as classifieds from "../netlify/functions/sources/classifieds.mjs";
import * as shopping from "../netlify/functions/sources/shopping.mjs";

const env = { SEARCHAPI_KEY: "k" };
const NOW = Date.parse("2026-11-04T12:00:00Z");

test("parsePrice reads Italian formats", () => {
  assert.equal(parsePrice("iPhone 13 128GB - 399 €"), 399);
  assert.equal(parsePrice("€ 1.234,50 trattabili"), 1234.5);
  assert.equal(parsePrice("Prezzo: 89,90€"), 89.9);
  assert.equal(parsePrice("12.500 euro Golf 7"), 12500);
  assert.equal(parsePrice("nessun prezzo"), null);
});

test("parseDate reads relative and absolute Italian dates", () => {
  assert.equal(parseDate("3 giorni fa", NOW), "2026-11-01T12:00:00.000Z");
  assert.equal(parseDate("1 ora fa", NOW), "2026-11-04T11:00:00.000Z");
  assert.equal(parseDate("12 ott 2026", NOW), "2026-10-12T12:00:00.000Z");
  assert.equal(parseDate("", NOW), null);
});

test("conditionFrom", () => {
  assert.equal(conditionFrom("iPhone 13 ricondizionato grado A"), "Ricondizionato");
  assert.equal(conditionFrom("Fender usata ottime condizioni"), "Usato");
  assert.equal(conditionFrom("Fender Stratocaster nuova"), null);
  assert.equal(conditionFrom("Fender usato"), "Usato");
  assert.equal(conditionFrom("Pre-owned"), "Usato");
});

test("isListing keeps single ads and drops search/category pages", () => {
  assert.equal(classifieds.isListing("https://www.subito.it/telefonia/iphone-13-128gb-milano-567891234.htm"), true);
  assert.equal(classifieds.isListing("https://www.subito.it/annunci-italia/vendita/usato/?q=iphone"), false);
  assert.equal(classifieds.isListing("https://www.vinted.it/items/4512345-iphone-13"), true);
  assert.equal(classifieds.isListing("https://www.vinted.it/catalog?search_text=iphone"), false);
  assert.equal(classifieds.isListing("https://www.mercatinomusicale.com/ricerca/?q=fender"), false);
  assert.equal(classifieds.isListing("https://www.mercatinomusicale.com/mm/a_fender-stratocaster-usa_id12345.html"), true);
});

test("classifieds: one site: query per category, mapped and filtered", async () => {
  let called;
  const fetchImpl = async (url) => {
    called = new URL(url);
    return new Response(JSON.stringify({ organic_results: [
      { title: "iPhone 13 128GB blu - Telefonia In vendita a Milano", link: "https://www.subito.it/telefonia/iphone-13-milano-567891234.htm", snippet: "Vendo iPhone 13 perfetto, 420 €", date: "2 giorni fa" },
      { title: "Iphone 13 - Annunci in tutta Italia", link: "https://www.subito.it/annunci-italia/vendita/telefonia/?q=iphone+13", snippet: "" },
      { title: "iPhone 13 mini ricondizionato", link: "https://www.vinted.it/items/99887766-iphone-13-mini", snippet: "€ 310,00" },
    ] }));
  };
  const out = await classifieds.search("iphone 13", { cat: "elettronica", env, fetchImpl });
  assert.equal(called.searchParams.get("engine"), "google");
  assert.equal(called.searchParams.get("gl"), "it");
  assert.match(called.searchParams.get("q"), /^iphone 13 \(site:subito\.it OR site:vinted\.it/);
  assert.equal(out.items.length, 2);
  assert.equal(out.items[0].source, "Subito");
  assert.equal(out.items[0].price, 420);
  assert.ok(out.items[0].date);
  assert.equal(out.items[1].source, "Vinted");
  assert.equal(out.items[1].price, 310);
  assert.equal(out.items[1].condition, "Ricondizionato");
});

test("shopping: merges used and all offers, used first", async () => {
  const calls = [];
  const fetchImpl = async (url) => {
    const u = new URL(url); calls.push(u);
    const used = u.searchParams.get("condition") === "used";
    return new Response(JSON.stringify({ shopping_results: used
      ? [{ title: "Apple iPhone 13 128GB Ricondizionato", extracted_price: 379, seller: "Back Market", product_link: "https://www.backmarket.it/p/1", thumbnail: "https://x/t.jpg" }]
      : [{ title: "Apple iPhone 13 128GB", extracted_price: 599, seller: "MediaWorld", product_link: "https://www.mediaworld.it/p/2" },
         { title: "senza link", extracted_price: 1, seller: "X" }] }));
  };
  const out = await shopping.search("iphone 13", { env, fetchImpl });
  assert.equal(calls.length, 2);
  assert.ok(calls.every((u) => u.searchParams.get("engine") === "google_shopping"));
  assert.deepEqual(out.items.map((i) => [i.source, i.condition, i.price]), [["Back Market", "Ricondizionato", 379], ["MediaWorld", "Nuovo", 599]]);
  assert.equal((await shopping.search("x", { offset: 50, env, fetchImpl })).items.length, 0);
});
