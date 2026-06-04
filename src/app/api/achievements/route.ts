import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export type Achievement = {
  key: string;
  title: string;
  emoji: string;
  description: string;
};

const ACHIEVEMENTS: Achievement[] = [
  { key: "first_scan",         title: "First Scan",          emoji: "🔍", description: "Scanned your very first product." },
  { key: "scan_10",            title: "Getting Curious",     emoji: "📋", description: "Completed 10 scans." },
  { key: "scan_50",            title: "Ingredient Aware",    emoji: "🌿", description: "Completed 50 scans." },
  { key: "scan_100",           title: "Century Scanner",     emoji: "💯", description: "Completed 100 scans." },
  { key: "streak_3",           title: "On a Roll",           emoji: "🔥", description: "3-day scan streak." },
  { key: "streak_7",           title: "Week Warrior",        emoji: "⚔️", description: "7-day scan streak." },
  { key: "streak_30",          title: "Monthly Master",      emoji: "🌟", description: "30-day scan streak." },
  { key: "perfect_score",      title: "Purity Pro",          emoji: "👑", description: "Scored 900+ on a single product." },
  { key: "legendary_score",    title: "Legendary Find",      emoji: "⭐", description: "Scored 1200+ on a single product." },
  { key: "detected_10_bad",    title: "Ingredient Detective", emoji: "🕵️", description: "Detected harmful ingredients in 10 products." },
  { key: "all_categories",     title: "Category Explorer",   emoji: "🌍", description: "Scanned products from every HolySnacks category." },
];

function checkEarned(
  key: string,
  data: { totalScans: number; streakDays: number; latestScore: number; badDetectedCount: number }
): boolean {
  switch (key) {
    case "first_scan":      return data.totalScans >= 1;
    case "scan_10":         return data.totalScans >= 10;
    case "scan_50":         return data.totalScans >= 50;
    case "scan_100":        return data.totalScans >= 100;
    case "streak_3":        return data.streakDays >= 3;
    case "streak_7":        return data.streakDays >= 7;
    case "streak_30":       return data.streakDays >= 30;
    case "perfect_score":   return data.latestScore >= 900;
    case "legendary_score": return data.latestScore >= 1200;
    case "detected_10_bad": return data.badDetectedCount >= 10;
    default:                return false;
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId, totalScans, streakDays, latestScore, badDetectedCount } = await req.json();
    if (!userId) return NextResponse.json({ ok: false, newAchievements: [] });

    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
    );

    // Get already-unlocked achievements
    const { data: existing } = await supabase
      .from("user_achievements")
      .select("achievement_key")
      .eq("user_id", userId);

    const alreadyUnlocked = new Set(existing?.map((r) => r.achievement_key) ?? []);
    const data = { totalScans: totalScans ?? 0, streakDays: streakDays ?? 0, latestScore: latestScore ?? 0, badDetectedCount: badDetectedCount ?? 0 };

    const newAchievements: Achievement[] = [];
    const toInsert: { user_id: string; achievement_key: string }[] = [];

    for (const ach of ACHIEVEMENTS) {
      if (alreadyUnlocked.has(ach.key)) continue;
      if (checkEarned(ach.key, data)) {
        newAchievements.push(ach);
        toInsert.push({ user_id: userId, achievement_key: ach.key });
      }
    }

    if (toInsert.length > 0) {
      await supabase.from("user_achievements").insert(toInsert);
    }

    return NextResponse.json({ ok: true, newAchievements });
  } catch (err) {
    console.error("[achievements]", err);
    return NextResponse.json({ ok: false, newAchievements: [] });
  }
}

export async function GET(req: NextRequest) {
  const userId = new URL(req.url).searchParams.get("userId");
  if (!userId) return NextResponse.json({ achievements: [] });

  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  );

  const { data } = await supabase
    .from("user_achievements")
    .select("achievement_key, unlocked_at")
    .eq("user_id", userId)
    .order("unlocked_at", { ascending: false });

  const unlockedKeys = new Set(data?.map((r) => r.achievement_key) ?? []);
  const achievements = ACHIEVEMENTS.map((ach) => ({
    ...ach,
    unlocked: unlockedKeys.has(ach.key),
    unlockedAt: data?.find((r) => r.achievement_key === ach.key)?.unlocked_at ?? null,
  }));

  return NextResponse.json({ achievements });
}
