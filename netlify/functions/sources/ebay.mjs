// Annunci usati da eBay Italia tramite la Browse API ufficiale.
// Richiede EBAY_CLIENT_ID e EBAY_CLIENT_SECRET (developer.ebay.com, chiavi "Production").
// EBAY_CAMPAIGN_ID (facoltativo) aggiunge il tracciamento eBay Partner Network ai link.

const TOKEN_URL = "https://api.ebay.com/identity/v1/oauth2/token";
const SEARCH_URL = "https://api.ebay.com/buy/browse/v1/item_summary/search";
const SCOPE = "https://api.ebay.com/oauth/api_scope";

let cached = { token: null, expiresAt: 0 };

export function isConfigured(env = process.env) {
  return Boolean(env.EBAY_CLIENT_ID && env.EBAY_CLIENT_SECRET);
}

async function getToken(env, fetchImpl) {
  if (cached.token && Date.now() < cached.expiresAt - 60_000) return cached.token;
  const basic = Buffer.from(`${env.EBAY_CLIENT_ID}:${env.EBAY_CLIENT_SECRET}`).toString("base64");
  const res = await fetchImpl(TOKEN_URL, {
    method: "POST",
    headers: { Authorization: `Basic ${basic}`, "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "client_credentials", scope: SCOPE }),
  });
  if (!res.ok) throw new Error(`eBay token ${res.status}`);
  const data = await res.json();
  cached = { token: data.access_token, expiresAt: Date.now() + data.expires_in * 1000 };
  return cached.token;
}

export function mapItem(it) {
  const price = it.price ? Number(it.price.value) : null;
  const loc = it.itemLocation || {};
  return {
    id: "ebay:" + it.itemId,
    source: "eBay",
    title: it.title,
    price,
    currency: it.price?.currency || "EUR",
    image: it.image?.imageUrl || it.thumbnailImages?.[0]?.imageUrl || null,
    url: it.itemAffiliateWebUrl || it.itemWebUrl,
    date: it.itemCreationDate || it.itemOriginDate || null,
    location: [loc.city, loc.country].filter(Boolean).join(", ") || null,
    condition: it.condition || null,
  };
}

export async function search(q, { limit = 50, offset = 0, env = process.env, fetchImpl = fetch } = {}) {
  const token = await getToken(env, fetchImpl);
  const params = new URLSearchParams({
    q,
    limit: String(limit),
    offset: String(offset),
    sort: "newlyListed",
    filter: "conditions:{USED}",
  });
  const headers = { Authorization: `Bearer ${token}`, "X-EBAY-C-MARKETPLACE-ID": "EBAY_IT", "Accept-Language": "it-IT" };
  if (env.EBAY_CAMPAIGN_ID) headers["X-EBAY-C-ENDUSERCTX"] = `affiliateCampaignId=${env.EBAY_CAMPAIGN_ID}`;
  const res = await fetchImpl(`${SEARCH_URL}?${params}`, { headers });
  if (!res.ok) throw new Error(`eBay search ${res.status}`);
  const data = await res.json();
  return { items: (data.itemSummaries || []).map(mapItem), total: data.total || 0 };
}

export function _resetTokenCache() {
  cached = { token: null, expiresAt: 0 };
}
