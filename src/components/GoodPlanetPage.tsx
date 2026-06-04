"use client";

import { useState, useEffect } from "react";
import { GOOD_CATEGORIES, GOOD_INGREDIENTS } from "@/lib/badIngredients";
import { HolyLogo } from "./HolyLogo";

export function GoodPlanetPage({ lang, onBack }: { lang: "en" | "lt"; onBack: () => void }) {
  const [visible, setVisible] = useState(false);
  const [activeCategory, setActiveCategory] = useState("all");
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  useEffect(() => { setTimeout(() => setVisible(true), 50); }, []);

  const filtered = activeCategory === "all"
    ? GOOD_INGREDIENTS
    : GOOD_INGREDIENTS.filter(ing => ing.category === activeCategory);

  const highCount = GOOD_INGREDIENTS.filter(i => i.benefit === "high").length;
  const total = GOOD_INGREDIENTS.length;

  const benefitMeta = {
    high:   { label: "HIGH BENEFIT",   labelLt: "DIDELĖ NAUDA",    color: "#22c55e", border: "rgba(34,197,94,0.40)",  bg: "rgba(34,197,94,0.09)"  },
    medium: { label: "PROVEN BENEFIT", labelLt: "ĮRODYTA NAUDA",   color: "#84cc16", border: "rgba(132,204,22,0.35)", bg: "rgba(132,204,22,0.08)" },
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" style={{ background: "#040e08" }}>

      {/* ── Top bar ── */}
      <div className="sticky top-0 z-20 flex items-center justify-between px-6 py-4 backdrop-blur-md border-b border-emerald-950/40"
        style={{ background: "rgba(4,14,8,0.96)" }}>
        <button onClick={onBack} className="text-sm font-semibold text-emerald-400/55 hover:text-emerald-400 transition-colors">
          {lang === "en" ? "← Back to Universe" : "← Grįžti į visatą"}
        </button>
        <div className="flex items-center gap-2">
          <span className="text-xl">🌿</span>
          <span className="font-[var(--font-playfair)] text-lg font-bold" style={{ color: "#86efac" }}>
            {lang === "en" ? "The Good Planet" : "Geroji planeta"}
          </span>
        </div>
        <HolyLogo size="sm" />
      </div>

      {/* ── Hero ── */}
      <div className={`relative py-16 px-6 text-center overflow-hidden transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[420px]"
            style={{ background: "radial-gradient(ellipse, rgba(0,150,60,0.18) 0%, transparent 65%)" }} />
        </div>

        <div className="relative z-10 max-w-3xl mx-auto">
          <div className="w-28 h-28 rounded-full mx-auto mb-8 flex items-center justify-center animate-float"
            style={{
              background: "radial-gradient(circle at 35% 35%, #052e16, #14532d 55%, #052e16)",
              boxShadow: "0 0 90px 28px rgba(0,180,80,0.22), 0 0 40px 10px rgba(34,197,94,0.15), inset 0 0 30px rgba(0,0,0,0.6)",
              border: "2px solid rgba(34,197,94,0.28)",
            }}>
            <span className="text-5xl">🌿</span>
          </div>

          <p className="text-emerald-500/50 text-xs tracking-[0.3em] uppercase font-bold mb-4">
            ✦ {lang === "en" ? "Every bad ingredient has a clean alternative" : "Kiekvienam blogam ingredientui yra švari alternatyva"} ✦
          </p>
          <h1 className="font-[var(--font-playfair)] text-4xl md:text-6xl font-black mb-5 leading-tight"
            style={{ color: "#86efac", textShadow: "0 0 60px rgba(34,197,94,0.45)" }}>
            {lang === "en" ? "What Should Be in Your Snacks" : "Kas turėtų būti tavo užkandžiuose"}
          </h1>
          <p className="text-white/45 text-base md:text-lg leading-relaxed mb-10">
            {lang === "en"
              ? "For every toxic shortcut the food industry takes, nature already has a better answer. These are the ingredients that replace the bad ones — with proven science, not marketing."
              : "Kiekvienam toksiškam pramonės sprendimui gamta jau turi geresnį atsakymą. Tai ingredientai, kurie pakeičia blogus — su mokslo įrodymais, ne rinkodara."}
          </p>

          <div className="flex justify-center gap-5 md:gap-12 mb-10 flex-wrap">
            {[
              { num: total,     suffix: "", label: lang === "en" ? "Good Alternatives"  : "Gerų alternatyvų",  green: true  },
              { num: highCount, suffix: "", label: lang === "en" ? "High Benefit"        : "Didelė nauda",      green: true  },
              { num: 0,         suffix: "", label: lang === "en" ? "Artificial Additives" : "Sintetinių priedų", green: false },
            ].map((s, i) => (
              <div key={i} className="text-center px-4">
                <div className="font-[var(--font-playfair)] text-4xl font-black mb-1"
                  style={{ color: s.green ? "#22c55e" : "#f0c855" }}>
                  {s.num}{s.suffix}
                </div>
                <div className="text-xs text-white/30 tracking-widest uppercase">{s.label}</div>
              </div>
            ))}
          </div>

          <div className="flex justify-center gap-3 flex-wrap">
            {(["high", "medium"] as const).map(b => (
              <div key={b} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold"
                style={{ background: benefitMeta[b].bg, border: `1px solid ${benefitMeta[b].border}`, color: benefitMeta[b].color }}>
                <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: benefitMeta[b].color }} />
                {lang === "en" ? benefitMeta[b].label : benefitMeta[b].labelLt}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Category filter tabs ── */}
      <div className="sticky top-[65px] z-10 border-b border-white/5"
        style={{ background: "rgba(4,14,8,0.98)", backdropFilter: "blur(12px)" }}>
        <div className="flex flex-wrap gap-2 px-6 py-3 justify-center">
          {GOOD_CATEGORIES.map(gc => {
            const count = gc.id === "all" ? GOOD_INGREDIENTS.length : GOOD_INGREDIENTS.filter(i => i.category === gc.id).length;
            const isActive = activeCategory === gc.id;
            return (
              <button key={gc.id} onClick={() => setActiveCategory(gc.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold transition-all"
                style={{
                  background: isActive ? "rgba(34,197,94,0.20)" : "rgba(255,255,255,0.04)",
                  border: `1px solid ${isActive ? "rgba(34,197,94,0.50)" : "rgba(255,255,255,0.08)"}`,
                  color: isActive ? "#22c55e" : "rgba(255,255,255,0.40)",
                }}>
                <span>{gc.icon}</span>
                <span>{lang === "en" ? gc.label : gc.labelLt}</span>
                <span className="ml-0.5 opacity-50">({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Ingredient cards ── */}
      <div className="max-w-4xl mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((ing) => {
          const isExpanded = expandedCard === ing.name;
          const bm = benefitMeta[ing.benefit];
          return (
            <div key={ing.name}
              className="rounded-2xl overflow-hidden cursor-pointer transition-all duration-300"
              style={{
                background: `linear-gradient(135deg, rgba(4,14,8,0.95) 0%, rgba(5,46,22,0.4) 100%)`,
                border: `1px solid ${isExpanded ? "rgba(34,197,94,0.35)" : "rgba(34,197,94,0.12)"}`,
                boxShadow: isExpanded ? "0 0 30px rgba(34,197,94,0.12)" : "none",
              }}
              onClick={() => setExpandedCard(isExpanded ? null : ing.name)}
            >
              {/* Card header */}
              <div className="p-4 flex items-start gap-4">
                {/* Gradient sphere */}
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${ing.gradient} flex items-center justify-center flex-shrink-0`}
                  style={{ boxShadow: "0 4px 16px rgba(0,0,0,0.4)" }}>
                  <span className="text-2xl">{ing.emoji}</span>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-[var(--font-playfair)] font-bold text-white text-base leading-tight">{ing.name}</h3>
                    <span className="text-white/30 text-lg flex-shrink-0 mt-0.5">{isExpanded ? "−" : "+"}</span>
                  </div>

                  {/* Benefit badge */}
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    <span className="text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider"
                      style={{ background: bm.bg, color: bm.color, border: `1px solid ${bm.border}` }}>
                      ✦ {lang === "en" ? bm.label : bm.labelLt}
                    </span>
                  </div>

                  {/* Replaces tag — always visible */}
                  <p className="text-[10px] text-white/35 mt-1.5 leading-relaxed">
                    <span className="text-red-400/60">Replaces: </span>
                    <span>{ing.replaces.split(",")[0]}{ing.replaces.includes(",") ? "…" : ""}</span>
                  </p>
                </div>
              </div>

              {/* Expanded content */}
              {isExpanded && (
                <div className="px-4 pb-5 flex flex-col gap-3 border-t border-white/[0.06] pt-4">
                  {/* Replaces full */}
                  <div className="flex gap-2">
                    <span className="text-red-400 text-xs flex-shrink-0 mt-0.5">🚫</span>
                    <div>
                      <p className="text-[10px] text-red-400/60 font-bold uppercase tracking-wide mb-0.5">
                        {lang === "en" ? "Replaces" : "Pakeičia"}
                      </p>
                      <p className="text-xs text-white/50">{ing.replaces}</p>
                    </div>
                  </div>

                  {ing.alsoKnownAs && (
                    <div className="flex gap-2">
                      <span className="text-white/20 text-xs flex-shrink-0 mt-0.5">🏷</span>
                      <div>
                        <p className="text-[10px] text-white/30 font-bold uppercase tracking-wide mb-0.5">
                          {lang === "en" ? "Also known as" : "Taip pat žinomas kaip"}
                        </p>
                        <p className="text-xs text-white/40 italic">{ing.alsoKnownAs}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <span className="text-emerald-400 text-xs flex-shrink-0 mt-0.5">✦</span>
                    <div>
                      <p className="text-[10px] text-emerald-400/60 font-bold uppercase tracking-wide mb-0.5">
                        {lang === "en" ? "Why it's better" : "Kodėl geriau"}
                      </p>
                      <p className="text-xs text-white/55 leading-relaxed">{ing.whyGood}</p>
                    </div>
                  </div>

                  {ing.scienceFact && (
                    <div className="flex gap-2 rounded-lg px-3 py-2.5"
                      style={{ background: "rgba(34,197,94,0.07)", border: "1px solid rgba(34,197,94,0.15)" }}>
                      <span className="text-emerald-400 text-xs flex-shrink-0">🔬</span>
                      <p className="text-[11px] text-emerald-300/60 leading-relaxed italic">{ing.scienceFact}</p>
                    </div>
                  )}

                  <div className="flex gap-2 rounded-lg px-3 py-2.5 mt-1"
                    style={{ background: "rgba(240,200,85,0.06)", border: "1px solid rgba(240,200,85,0.15)" }}>
                    <span className="text-[#f0c855] text-xs flex-shrink-0">✦</span>
                    <div>
                      <p className="text-[9px] text-[#f0c855]/50 font-bold uppercase tracking-wide mb-0.5">Holy Promise</p>
                      <p className="text-[11px] text-white/45 leading-relaxed">{ing.holyUse}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
