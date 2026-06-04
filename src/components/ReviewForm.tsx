"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase";

export function ReviewForm({ id, lang, productName, brand, score, userId }: {
  id?: string;
  lang: "en" | "lt";
  productName: string;
  brand: string;
  score: number;
  userId: string;
}) {
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!rating) return;
    setStatus("sending");
    try {
      const supabase = createClient();
      const { error } = await supabase.from("product_reviews").insert({
        user_id: userId,
        product_name: productName.trim(),
        brand: brand.trim() || null,
        purity_score: score,
        rating,
        comment: comment.trim() || null,
      });
      if (error) throw error;
      setStatus("done");
    } catch {
      setStatus("error");
    }
  }

  const labels = {
    en: { title: "Leave a review", sub: "Help the community with your experience", star: "stars", placeholder: "Share your experience with this product (optional)…", send: "Submit Review", done: "Thank you for your review! ✦", err: "Couldn't save — try again." },
    lt: { title: "Palikite atsiliepimą", sub: "Padėkite bendruomenei", star: "žvaigždutės", placeholder: "Pasidalinkite patirtimi apie šį produktą (nebūtina)…", send: "Pateikti atsiliepimą", done: "Ačiū už atsiliepimą! ✦", err: "Nepavyko išsaugoti — bandykite dar kartą." },
  }[lang];

  return (
    <div id={id} className="mt-8 rounded-2xl border border-[#f0c855]/15 bg-white/[0.03] p-6">
      <h3 className="font-[var(--font-playfair)] text-xl font-bold text-white/90 mb-1">{labels.title}</h3>
      <p className="text-sm text-white/35 mb-5">{labels.sub}</p>

      {status === "done" ? (
        <p className="text-[#22c55e] font-semibold text-center py-4">{labels.done}</p>
      ) : (
        <form onSubmit={submit} className="flex flex-col gap-4">
          {/* Star picker */}
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((s) => (
              <button
                key={s}
                type="button"
                onMouseEnter={() => setHovered(s)}
                onMouseLeave={() => setHovered(0)}
                onClick={() => setRating(s)}
                className="text-3xl transition-transform hover:scale-110 focus:outline-none"
                aria-label={`${s} ${labels.star}`}
              >
                <span style={{ filter: s <= (hovered || rating) ? "none" : "grayscale(1) opacity(0.25)" }}>⭐</span>
              </button>
            ))}
          </div>

          {/* Comment */}
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder={labels.placeholder}
            rows={3}
            maxLength={500}
            className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-[#f0c855]/15 text-white placeholder-white/25 text-sm focus:outline-none focus:border-[#f0c855]/40 resize-none transition-colors"
          />

          {status === "error" && (
            <p className="text-red-400 text-sm">{labels.err}</p>
          )}

          <button
            type="submit"
            disabled={!rating || status === "sending"}
            className="self-start px-6 py-2.5 rounded-full text-sm font-bold text-[#0b1220] disabled:opacity-40 transition-opacity"
            style={{ background: "linear-gradient(to right, #d4a830, #fad55c)" }}
          >
            {status === "sending" ? "…" : labels.send}
          </button>
        </form>
      )}
    </div>
  );
}
