import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email?.trim() || !email.includes("@")) {
      return NextResponse.json({ ok: false, error: "Invalid email" }, { status: 400 });
    }

    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
    );

    const { error } = await supabase
      .from("newsletter_subscribers")
      .insert({ email: email.trim().toLowerCase() });

    // Ignore duplicate key errors (already subscribed)
    if (error && !error.message.includes("duplicate")) {
      throw error;
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[newsletter]", err);
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}
