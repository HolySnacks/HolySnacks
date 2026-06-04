"use client";

import type { Category } from "@/lib/types";
import { GOOD_INGREDIENTS } from "@/lib/ingredients";
import { CATEGORIES } from "@/lib/products";

export function MobilePlanetScroller({ onSelectCategory, onBadPlanet, onGoodPlanet, lang }: {
  onSelectCategory: (cat: Category) => void;
  onBadPlanet: () => void;
  onGoodPlanet: () => void;
  lang: "en" | "lt";
}) {
  return (
    <div className="w-full flex flex-col items-center gap-2">

      {/* ── Comet Banners (fixed above planet scroller) ── */}
      <div className="flex gap-2 w-full px-4 mb-1">

        {/* Good Comet — top-left approaching (tail extends left) */}
        <button onClick={onGoodPlanet} className="flex-1 flex items-center gap-3 rounded-2xl px-4 py-4 active:scale-95 transition-all relative overflow-hidden"
          style={{
            background: "linear-gradient(105deg, rgba(4,30,16,0.97) 0%, rgba(5,46,22,0.85) 100%)",
            border: "1px solid rgba(34,197,94,0.4)",
            animation: "comet-banner-pulse-good 3s ease-in-out infinite",
          }}>
          {/* Tail visual extending LEFT */}
          <div style={{
            position: "absolute", right: "100%", top: "50%", marginTop: -8,
            width: 60, height: 16,
            background: "linear-gradient(to left, rgba(34,197,94,0.6), transparent)",
            borderRadius: "100px 0 0 100px",
            pointerEvents: "none",
          }} />
          {/* Glow behind nucleus */}
          <div style={{
            position: "absolute", left: 8, top: "50%", marginTop: -20,
            width: 40, height: 40, borderRadius: "50%",
            background: "rgba(34,197,94,0.25)", filter: "blur(10px)",
            pointerEvents: "none",
          }} />
          {/* Nucleus */}
          <div style={{
            width: 46, height: 46, borderRadius: "50%", flexShrink: 0,
            background: "radial-gradient(circle at 30% 28%, #052e16, #14532d 55%, #021a0a)",
            boxShadow: "0 0 20px 7px rgba(34,197,94,0.6), inset 0 0 14px rgba(0,0,0,0.6)",
            border: "2px solid rgba(34,197,94,0.6)",
            display: "flex", alignItems: "center", justifyContent: "center",
            position: "relative", zIndex: 1,
          }}>
            <span style={{ fontSize: 20 }}>🌿</span>
          </div>
          {/* Text */}
          <div className="text-left min-w-0 flex-1 z-10">
            <div className="text-sm font-black tracking-wider leading-tight" style={{ color: "#22c55e" }}>
              {lang === "en" ? "GOOD PLANET" : "GEROJI PLANETA"}
            </div>
            <div className="text-[10px] text-white/45 leading-tight mt-1">
              {GOOD_INGREDIENTS.length} {lang === "en" ? "clean ingredients" : "švarių ingredientų"}
            </div>
          </div>
          <span className="text-emerald-400/60 text-sm z-10">→</span>
        </button>

        {/* Bad Comet — top-right approaching (tail extends right) */}
        <button onClick={onBadPlanet} className="flex-1 flex items-center gap-3 rounded-2xl px-4 py-4 active:scale-95 transition-all relative overflow-hidden"
          style={{
            background: "linear-gradient(75deg, rgba(30,4,4,0.97) 0%, rgba(60,5,5,0.85) 100%)",
            border: "1px solid rgba(220,38,38,0.4)",
            animation: "comet-banner-pulse 3s ease-in-out infinite",
          }}>
          {/* Tail visual extending RIGHT */}
          <div style={{
            position: "absolute", left: "100%", top: "50%", marginTop: -8,
            width: 60, height: 16,
            background: "linear-gradient(to right, rgba(220,38,38,0.6), transparent)",
            borderRadius: "0 100px 100px 0",
            pointerEvents: "none",
          }} />
          {/* Glow behind nucleus */}
          <div style={{
            position: "absolute", right: 8, top: "50%", marginTop: -20,
            width: 40, height: 40, borderRadius: "50%",
            background: "rgba(220,38,38,0.25)", filter: "blur(10px)",
            pointerEvents: "none",
          }} />
          {/* Nucleus */}
          <div style={{
            width: 46, height: 46, borderRadius: "50%", flexShrink: 0,
            background: "radial-gradient(circle at 30% 28%, #7f1d1d, #450a0a 55%, #1c0202)",
            boxShadow: "0 0 20px 7px rgba(220,38,38,0.6), inset 0 0 14px rgba(0,0,0,0.6)",
            border: "2px solid rgba(220,38,38,0.6)",
            display: "flex", alignItems: "center", justifyContent: "center",
            position: "relative", zIndex: 1,
          }}>
            <span style={{ fontSize: 20 }}>☠️</span>
          </div>
          {/* Text */}
          <div className="text-left min-w-0 flex-1 z-10">
            <div className="text-sm font-black tracking-wider leading-tight" style={{ color: "#ef4444" }}>
              {lang === "en" ? "BAD PLANET" : "BLOGOJI PLANETA"}
            </div>
            <div className="text-[10px] text-white/45 leading-tight mt-1">
              {lang === "en" ? "Toxins exposed" : "Atskleisti toksinai"}
            </div>
          </div>
          <span className="text-red-500/40 text-xs z-10">→</span>
        </button>
      </div>

      {/* ── Planet cards scroller ── */}
      <div
        className="w-full flex overflow-x-auto snap-x snap-mandatory gap-4 px-6 py-4"
        style={{ scrollbarWidth: "none", WebkitOverflowScrolling: "touch" } as React.CSSProperties}
      >
        {CATEGORIES.map((cat) => (
          <button key={cat.id} onClick={() => onSelectCategory(cat)}
            className="snap-center flex-shrink-0 flex flex-col items-center gap-4 rounded-3xl p-6 transition-all active:scale-95 cursor-pointer text-left"
            style={{
              width: 230,
              background: `radial-gradient(ellipse at 50% 0%, ${cat.bgFrom}dd 0%, rgba(11,18,32,0.97) 100%)`,
              border: `1px solid ${cat.accentColor}28`,
              boxShadow: `0 0 40px ${cat.glow}18`,
            }}
          >
            <div className={`w-20 h-20 rounded-full bg-gradient-to-br ${cat.gradient} flex items-center justify-center flex-shrink-0`}
              style={{
                boxShadow: `0 0 30px 6px ${cat.glow}, inset 0 0 18px rgba(255,255,255,0.15)`,
                border: "2px solid rgba(255,255,255,0.22)",
              }}>
              <span style={{ fontSize: 30 }}>{cat.icon}</span>
            </div>
            <div className="text-center">
              <div className="font-[var(--font-playfair)] font-black text-lg text-white mb-0.5">
                {lang === "lt" ? cat.labelLt : cat.label}
              </div>
              <div className="text-[10px] font-bold tracking-widest uppercase" style={{ color: cat.accentColor }}>
                {cat.products.length} {lang === "en" ? "products" : "produktai"}
              </div>
            </div>
            {cat.keyIngredients && (
              <div className="text-[9px] text-white/30 text-center leading-relaxed px-1">
                {cat.keyIngredients.map(ki => ki.name).join(" · ")}
              </div>
            )}
            <div className="px-4 py-1.5 rounded-full text-[10px] font-bold mt-auto"
              style={{ background: `${cat.accentColor}18`, color: cat.accentColor, border: `1px solid ${cat.accentColor}38` }}>
              {lang === "en" ? "Explore →" : "Tyrinėti →"}
            </div>
          </button>
        ))}
      </div>

      <p className="text-[10px] text-white/25 tracking-[0.2em] uppercase animate-pulse">
        ← {lang === "en" ? "swipe to explore" : "braukite tyrinėti"} →
      </p>
    </div>
  );
}
