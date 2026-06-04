/**
 * Seed the Supabase products catalog from the static CATEGORIES data.
 * Run once (idempotent — uses upsert):
 *   NEXT_PUBLIC_SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... npx tsx scripts/seed-products.ts
 */

import { createClient } from "@supabase/supabase-js";
import { CATEGORIES } from "../src/lib/products";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey  = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey);

function toSlug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

async function seed() {
  console.log(`Seeding ${CATEGORIES.length} categories…`);

  for (const [index, cat] of CATEGORIES.entries()) {
    // 1. Upsert category
    const { error: catErr } = await supabase.from("categories").upsert({
      id:           cat.id,
      label:        cat.label,
      label_lt:     cat.labelLt,
      icon:         cat.icon,
      radius:       cat.radius,
      duration:     cat.duration,
      size:         cat.size,
      start_angle:  cat.startAngle,
      gradient:     cat.gradient,
      glow:         cat.glow,
      ring:         cat.ring,
      bg_from:      cat.bgFrom,
      accent_color: cat.accentColor,
      sort_order:   index,
      is_active:    true,
    }, { onConflict: "id" });
    if (catErr) { console.error(`Category ${cat.id}:`, catErr.message); continue; }

    // 2. Replace key ingredients (delete + insert for clean state)
    await supabase.from("category_key_ingredients").delete().eq("category_id", cat.id);
    if (cat.keyIngredients && cat.keyIngredients.length > 0) {
      const { error: kiErr } = await supabase.from("category_key_ingredients").insert(
        cat.keyIngredients.map((ki, i) => ({
          category_id: cat.id,
          emoji:       ki.emoji,
          name:        ki.name,
          benefit:     ki.benefit,
          sort_order:  i,
        }))
      );
      if (kiErr) console.error(`Key ingredients for ${cat.id}:`, kiErr.message);
    }

    // 3. Upsert products
    for (const [pIndex, product] of cat.products.entries()) {
      const { error: pErr } = await supabase.from("products").upsert({
        slug:        toSlug(product.name),
        category_id: cat.id,
        name:        product.name,
        flavor:      product.flavor,
        price:       product.price,
        emoji:       product.emoji,
        badge:       product.badge ?? null,
        description: product.desc,
        gradient:    product.gradient,
        is_active:   true,
        sort_order:  pIndex,
      }, { onConflict: "slug" });
      if (pErr) console.error(`Product ${product.name}:`, pErr.message);
    }

    console.log(`  ✓ ${cat.label} (${cat.products.length} products)`);
  }

  console.log("Seed complete.");
}

seed().catch((err) => { console.error(err); process.exit(1); });
