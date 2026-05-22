import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const FIELDS = "product_name,brands,ingredients_text,nutriscore_grade,image_thumb_url";

interface OFFProduct {
  product_name?: string;
  brands?: string;
  ingredients_text?: string;
  nutriscore_grade?: string;
  image_thumb_url?: string;
}

/** Try Open Food Facts with three strategies, return best match with ingredients */
async function researchProduct(q: string): Promise<OFFProduct | null> {
  const strategies = [
    `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(q)}&search_simple=1&action=process&json=1&page_size=10&fields=${FIELDS}`,
    `https://world.openfoodfacts.org/api/v2/search?q=${encodeURIComponent(q)}&fields=${FIELDS}&page_size=10`,
    `https://world.openfoodfacts.org/cgi/search.pl?tagtype_0=brands&tag_contains_0=contains&tag_0=${encodeURIComponent(q)}&action=process&json=1&page_size=5&fields=${FIELDS}`,
  ];

  for (const url of strategies) {
    try {
      const res = await fetch(url, {
        headers: { "User-Agent": "HolySnacks-Scanner/1.0 (holysnacks.com)" },
        signal: AbortSignal.timeout(4000),
      });
      if (!res.ok) continue;
      const data = await res.json();
      const products: OFFProduct[] = data.products ?? [];
      const found =
        products.find((p) => (p.ingredients_text?.length ?? 0) > 10) ??
        products[0];
      if (found?.ingredients_text) return found;
    } catch {
      continue;
    }
  }
  return null;
}

export async function POST(req: NextRequest) {
  try {
    const { query, userId } = await req.json();
    if (!query?.trim()) return NextResponse.json({ ok: false });

    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
    );

    const q = query.trim().toLowerCase();

    // ── Record or increment the missed search ──────────────────────────────
    const { data: existing } = await supabase
      .from("missed_searches")
      .select("id, search_count, user_ids")
      .eq("query", q)
      .single();

    let newCount = 1;

    if (existing) {
      const newUserIds =
        userId && !existing.user_ids?.includes(userId)
          ? [...(existing.user_ids ?? []), userId]
          : existing.user_ids ?? [];
      newCount = existing.search_count + 1;
      await supabase
        .from("missed_searches")
        .update({ search_count: newCount, last_searched_at: new Date().toISOString(), user_ids: newUserIds })
        .eq("id", existing.id);
    } else {
      await supabase.from("missed_searches").insert({
        query: q,
        user_ids: userId ? [userId] : [],
        research_status: "researching",
      });
    }

    // ── Immediate auto-research via Open Food Facts ────────────────────────
    let autoFound = false;
    try {
      const found = await Promise.race([
        researchProduct(q),
        new Promise<null>((resolve) => setTimeout(() => resolve(null), 5000)),
      ]);

      if (found?.ingredients_text) {
        // Save to products_cache so next scan finds it instantly
        await supabase.from("products_cache").upsert(
          {
            search_key: q,
            product_name: found.product_name ?? q,
            brand: found.brands ?? "",
            ingredients: found.ingredients_text,
            nutriscore: found.nutriscore_grade ?? null,
            image_url: found.image_thumb_url ?? null,
            source: "openfoodfacts_auto",
          },
          { onConflict: "search_key" }
        );

        // Update missed_searches status
        await supabase
          .from("missed_searches")
          .update({ research_status: "found" })
          .eq("query", q);

        autoFound = true;
      } else {
        // Mark as researched but not found
        await supabase
          .from("missed_searches")
          .update({ research_status: "not_found" })
          .eq("query", q);
      }
    } catch {
      // Research failed — that's OK, search is still recorded
    }

    return NextResponse.json({ ok: true, count: newCount, autoFound });
  } catch (err) {
    console.error("[missed] error:", err);
    return NextResponse.json({ ok: false });
  }
}

// Check if a previously missed search has now been found
export async function GET(req: NextRequest) {
  const query = new URL(req.url).searchParams.get("q")?.toLowerCase().trim();
  if (!query) return NextResponse.json({ count: 0 });

  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  );

  const { data } = await supabase
    .from("missed_searches")
    .select("search_count, research_status")
    .eq("query", query)
    .single();

  return NextResponse.json({
    count: data?.search_count ?? 0,
    researchStatus: data?.research_status ?? "pending",
  });
}
