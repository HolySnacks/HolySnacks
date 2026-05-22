import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
  try {
    const { query, brand, ingredients, userId } = await req.json();
    if (!query?.trim() || !ingredients?.trim()) {
      return NextResponse.json({ ok: false, error: "Missing required fields" }, { status: 400 });
    }

    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
    );

    await supabase.from("user_submissions").insert({
      query: query.trim(),
      brand: brand?.trim() || null,
      ingredients_text: ingredients.trim(),
      submitted_by: userId ?? null,
    });

    // Mark the missed search as having a pending submission
    await supabase.from("missed_searches")
      .update({ status: "submitted" })
      .eq("query", query.trim().toLowerCase());

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[submit] error:", err);
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}
