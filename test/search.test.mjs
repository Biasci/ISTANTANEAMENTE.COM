import { test } from "node:test";
import assert from "node:assert/strict";
import * as ebay from "../netlify/functions/sources/ebay.mjs";
import { mergeByDate } from "../netlify/functions/search.mjs";

const env = { EBAY_CLIENT_ID: "id", EBAY_CLIENT_SECRET: "secret" };

function fakeFetch(calls) {
  return async (url, opts = {}) => {
    calls.push({ url: String(url), opts });
    if (String(url).includes("oauth2/token")) return new Response(JSON.stringify({ access_token: "tok", expires_in: 7200 }));
    return new Response(JSON.stringify({
      total: 2,
      itemSummaries: [
        { itemId: "v1|1|0", title: "iPhone 13 128GB", price: { value: "399.00", currency: "EUR" }, image: { imageUrl: "https://i.ebayimg.com/a.jpg" },
          itemWebUrl: "https://www.ebay.it/itm/1", itemCreationDate: "2026-10-28T10:00:00.000Z", itemLocation: { city: "Milano", country: "IT" }, condition: "Usato" },
        { itemId: "v1|2|0", title: "iPhone 13 mini", price: { value: "310.50", currency: "EUR" }, itemWebUrl: "https://www.ebay.it/itm/2", itemCreationDate: "2026-10-27T09:00:00.000Z" },
      ],
    }));
  };
}

test("ebay: token, query parameters and mapping", async () => {
  ebay._resetTokenCache();
  const calls = [];
  const out = await ebay.search("iphone 13", { env: { ...env, EBAY_CAMPAIGN_ID: "555" }, fetchImpl: fakeFetch(calls) });
  assert.equal(calls.length, 2);
  const search = new URL(calls[1].url);
  assert.equal(search.searchParams.get("q"), "iphone 13");
  assert.equal(search.searchParams.get("sort"), "newlyListed");
  assert.equal(search.searchParams.get("filter"), "conditions:{USED}");
  assert.equal(calls[1].opts.headers["X-EBAY-C-MARKETPLACE-ID"], "EBAY_IT");
  assert.equal(calls[1].opts.headers["X-EBAY-C-ENDUSERCTX"], "affiliateCampaignId=555");
  assert.equal(out.total, 2);
  assert.deepEqual(out.items[0], {
    id: "ebay:v1|1|0", source: "eBay", title: "iPhone 13 128GB", price: 399, currency: "EUR", image: "https://i.ebayimg.com/a.jpg",
    url: "https://www.ebay.it/itm/1", date: "2026-10-28T10:00:00.000Z", location: "Milano, IT", condition: "Usato",
  });
  assert.equal(out.items[1].image, null);
});

test("ebay: token is reused between searches", async () => {
  ebay._resetTokenCache();
  const calls = [];
  await ebay.search("a", { env, fetchImpl: fakeFetch(calls) });
  await ebay.search("b", { env, fetchImpl: fakeFetch(calls) });
  assert.equal(calls.filter((c) => c.url.includes("oauth2/token")).length, 1);
});

test("mergeByDate: newest first, duplicates and broken items dropped", () => {
  const a = { id: "x:1", url: "u1", date: "2026-10-01T00:00:00Z" };
  const b = { id: "y:1", url: "u2", date: "2026-10-03T00:00:00Z" };
  const c = { id: "y:2", url: "u3", date: null };
  const out = mergeByDate([[a, c], [b, a, { id: "z", url: "" }]]);
  assert.deepEqual(out.map((i) => i.id), ["y:1", "x:1", "y:2"]);
});
