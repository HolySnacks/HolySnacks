import { createBrowserClient } from "@supabase/ssr";
import type { Category, Product, KeyIngredient } from "./types";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

/** Fetch the full product catalog from Supabase and reconstruct Category[].
 *  Returns an empty array if the DB is empty or unreachable. */
export async function getCategories(): Promise<Category[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from("categories")
    .select("*, products(*), category_key_ingredients(*)")
    .eq("is_active", true)
    .order("sort_order");

  if (!data || data.length === 0) return [];

  return data.map((c: Record<string, unknown>) => ({
    id:          c.id as string,
    radius:      c.radius as number,
    duration:    c.duration as number,
    size:        c.size as number,
    startAngle:  c.start_angle as number,
    icon:        c.icon as string,
    label:       c.label as string,
    labelLt:     c.label_lt as string,
    gradient:    c.gradient as string,
    glow:        c.glow as string,
    ring:        c.ring as string,
    bgFrom:      c.bg_from as string,
    accentColor: c.accent_color as string,
    products: ((c.products as Record<string, unknown>[]) ?? [])
      .sort((a, b) => (a.sort_order as number) - (b.sort_order as number))
      .map((p): Product => ({
        name:     p.name as string,
        flavor:   p.flavor as string,
        price:    p.price as string,
        emoji:    p.emoji as string,
        badge:    (p.badge as string | null) ?? undefined,
        desc:     p.description as string,
        gradient: p.gradient as string,
      })),
    keyIngredients: ((c.category_key_ingredients as Record<string, unknown>[]) ?? [])
      .sort((a, b) => (a.sort_order as number) - (b.sort_order as number))
      .map((ki): KeyIngredient => ({
        emoji:   ki.emoji as string,
        name:    ki.name as string,
        benefit: ki.benefit as string,
      })),
  }));
}

export type Profile = {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  xp: number;
  level: number;
  streak_days: number;
  last_scan_at: string | null;   // date string "YYYY-MM-DD"
  total_scans: number;
  created_at: string;
};

export type ScanRecord = {
  id: string;
  user_id: string;
  product_name: string;
  brand: string | null;
  score: number;
  grade: string | null;
  xp_earned: number;
  created_at: string;
};

// ── XP / Level config ────────────────────────────────────────────────────────

export const LEVELS = [
  { level: 1,  xpRequired: 0,      title: "Snack Curious",     emoji: "🌱" },
  { level: 2,  xpRequired: 300,    title: "Label Reader",      emoji: "🔍" },
  { level: 3,  xpRequired: 800,    title: "Ingredient Aware",  emoji: "📋" },
  { level: 4,  xpRequired: 1800,   title: "Snack Conscious",   emoji: "🌿" },
  { level: 5,  xpRequired: 3500,   title: "Holy Snacker",      emoji: "✦"  },
  { level: 6,  xpRequired: 6000,   title: "Ingredient Monk",   emoji: "🧘" },
  { level: 7,  xpRequired: 10000,  title: "Purity Knight",     emoji: "⚔️" },
  { level: 8,  xpRequired: 16000,  title: "Divine Eater",      emoji: "👑" },
  { level: 9,  xpRequired: 25000,  title: "Holy Saint",        emoji: "🌟" },
  { level: 10, xpRequired: 40000,  title: "Snack Deity",       emoji: "☀️" },
];

export function getLevelInfo(xp: number) {
  let current = LEVELS[0];
  let next = LEVELS[1];
  for (let i = 0; i < LEVELS.length; i++) {
    if (xp >= LEVELS[i].xpRequired) {
      current = LEVELS[i];
      next = LEVELS[i + 1] ?? null!;
    }
  }
  const xpIntoLevel = next ? xp - current.xpRequired : 0;
  const xpNeeded    = next ? next.xpRequired - current.xpRequired : 1;
  const progress    = next ? Math.min(100, (xpIntoLevel / xpNeeded) * 100) : 100;
  return { current, next, progress, xpIntoLevel, xpNeeded };
}

export function computeXP(score: number, isFirstToday: boolean, streakDays: number): number {
  const base        = 15;
  const scoreBonus  = Math.max(0, Math.floor(score / 100));
  const firstBonus  = isFirstToday ? 30 : 0;
  const streakBonus = isFirstToday ? streakDays * 10 : 0;
  return base + scoreBonus + firstBonus + streakBonus;
}
