import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
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
