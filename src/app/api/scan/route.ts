import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

const FIELDS = "product_name,brands,ingredients_text,nutriscore_grade,image_thumb_url";
const SB_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SB_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

interface OFFProduct {
  product_name?: string;
  brands?: string;
  ingredients_text?: string;
  nutriscore_grade?: string;
  image_thumb_url?: string;
}

async function offFetch(url: string): Promise<Response> {
  return fetch(url, {
    headers: { "User-Agent": "HolySnacks-Scanner/1.0 (holysnacks.com)" },
    signal: AbortSignal.timeout(5000),
  });
}

/** Pick product with best ingredient data */
function pickBest(products: OFFProduct[]): OFFProduct | null {
  return (
    products.find((p) => (p.ingredients_text?.length ?? 0) > 10) ??
    products[0] ??
    null
  );
}

/** Try Open Food Facts via three strategies, returning best result with ingredients */
async function searchOFF(q: string): Promise<OFFProduct | null> {
  const strategies = [
    // 1. Standard text search
    `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(q)}&search_simple=1&action=process&json=1&page_size=10&fields=${FIELDS}`,
    // 2. v2 search API (broader fuzzy matching)
    `https://world.openfoodfacts.org/api/v2/search?q=${encodeURIComponent(q)}&fields=${FIELDS}&page_size=10`,
    // 3. Brand-specific search (catches "Carlsberg" as a brand even with no product match)
    `https://world.openfoodfacts.org/cgi/search.pl?tagtype_0=brands&tag_contains_0=contains&tag_0=${encodeURIComponent(q)}&action=process&json=1&page_size=5&fields=${FIELDS}`,
  ];

  for (const url of strategies) {
    try {
      const res = await offFetch(url);
      if (!res.ok) continue;
      const data = await res.json();
      const product = pickBest(data.products ?? []);
      if (product?.ingredients_text) return product;
    } catch {
      continue;
    }
  }
  return null;
}

/** Read from Supabase products_cache */
async function checkCache(key: string) {
  try {
    const res = await fetch(
      `${SB_URL}/rest/v1/products_cache?search_key=eq.${encodeURIComponent(key)}&limit=1`,
      { headers: { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}` } }
    );
    if (!res.ok) return null;
    const rows = await res.json();
    return (rows[0] as Record<string, string> | undefined) ?? null;
  } catch {
    return null;
  }
}

/** Write to Supabase products_cache (fire-and-forget) */
function saveCache(key: string, data: {
  product_name: string; brand: string; ingredients: string;
  nutriscore: string | null; image_url: string | null;
}) {
  fetch(`${SB_URL}/rest/v1/products_cache`, {
    method: "POST",
    headers: {
      apikey: SB_KEY,
      Authorization: `Bearer ${SB_KEY}`,
      "Content-Type": "application/json",
      Prefer: "resolution=merge-duplicates",
    },
    body: JSON.stringify({ search_key: key, ...data }),
  }).catch(() => {});
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim();
  if (!q) return NextResponse.json({ found: false, error: "No query" }, { status: 400 });

  const key = q.toLowerCase();

  try {
    // ── Barcode lookup ──────────────────────────────────────────────────────
    if (/^\d{8,14}$/.test(q)) {
      const res = await offFetch(
        `https://world.openfoodfacts.org/api/v0/product/${q}.json?fields=${FIELDS}`
      );
      if (res.ok) {
        const data = await res.json();
        if (data.status === 1 && data.product) {
          const p = data.product as OFFProduct;
          const result = {
            productName: p.product_name ?? q,
            brand: p.brands ?? "",
            ingredients: p.ingredients_text ?? "",
            nutriscore: p.nutriscore_grade ?? null,
            image: p.image_thumb_url ?? null,
          };
          if (result.ingredients) {
            saveCache(key, {
              product_name: result.productName, brand: result.brand,
              ingredients: result.ingredients, nutriscore: result.nutriscore,
              image_url: result.image,
            });
          }
          return NextResponse.json({ found: true, ...result });
        }
      }
      return NextResponse.json({ found: false });
    }

    // ── Cache check ─────────────────────────────────────────────────────────
    const cached = await checkCache(key);
    if (cached?.ingredients) {
      return NextResponse.json({
        found: true,
        productName: cached.product_name,
        brand: cached.brand,
        ingredients: cached.ingredients,
        nutriscore: cached.nutriscore ?? null,
        image: cached.image_url ?? null,
        fromCache: true,
      });
    }

    // ── Multi-strategy Open Food Facts search ───────────────────────────────
    const product = await searchOFF(q);
    if (!product) return NextResponse.json({ found: false });

    const result = {
      productName: product.product_name ?? q,
      brand: product.brands ?? "",
      ingredients: product.ingredients_text ?? "",
      nutriscore: product.nutriscore_grade ?? null,
      image: product.image_thumb_url ?? null,
    };

    // Cache it for next time
    if (result.ingredients) {
      saveCache(key, {
        product_name: result.productName, brand: result.brand,
        ingredients: result.ingredients, nutriscore: result.nutriscore,
        image_url: result.image,
      });
    }

    return NextResponse.json({ found: true, ...result });
  } catch (err) {
    console.error("[scan]", err);
    return NextResponse.json({ found: false, error: "Network error" }, { status: 500 });
  }
}
