"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase";

type Review = {
  id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  profiles: { display_name: string | null; avatar_url: string | null }[] | null;
};

export function ProductReviews({ lang, productName }: { lang: "en" | "lt"; productName: string }) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from("product_reviews")
          .select("id, rating, comment, created_at, profiles(display_name, avatar_url)")
          .ilike("product_name", productName)
          .order("created_at", { ascending: false })
          .limit(10);
        if (error) { setLoading(false); return; }
        setReviews((data as Review[]) ?? []);
      } catch { /* silent */ }
      setLoading(false);
    })();
  }, [productName]);

  if (loading || reviews.length === 0) return null;

  const avgRating = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;

  return (
    <div className="mt-6 rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5">
      <div className="flex items-center gap-3 mb-4">
        <h3 className="font-semibold text-white/80 text-sm">
          {lang === "en" ? "Community Reviews" : "Bendruomenės atsiliepimai"}
        </h3>
        <div className="flex items-center gap-1">
          <span className="text-[#f0c855] text-sm">{"★".repeat(Math.round(avgRating))}</span>
          <span className="text-white/30 text-xs ml-1">{avgRating.toFixed(1)} · {reviews.length}</span>
        </div>
      </div>
      <div className="flex flex-col gap-3">
        {reviews.map((r) => (
          <div key={r.id} className="flex gap-3">
            <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold bg-white/[0.06] text-white/50 overflow-hidden">
              {r.profiles?.[0]?.avatar_url
                ? <img src={r.profiles[0].avatar_url!} alt="" className="w-full h-full object-cover" />
                : (r.profiles?.[0]?.display_name?.[0]?.toUpperCase() ?? "?")}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-xs font-semibold text-white/70">
                  {r.profiles?.[0]?.display_name ?? (lang === "en" ? "Anonymous" : "Anonimas")}
                </span>
                <span className="text-[#f0c855] text-xs">{"★".repeat(r.rating)}</span>
                <span className="text-white/20 text-[10px]">
                  {new Date(r.created_at).toLocaleDateString()}
                </span>
              </div>
              {r.comment && (
                <p className="text-xs text-white/45 leading-relaxed">{r.comment}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
