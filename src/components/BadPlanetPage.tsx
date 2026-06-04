"use client";

import { useState, useEffect } from "react";
import { BAD_CATEGORIES, BAD_INGREDIENTS } from "@/lib/badIngredients";
import { HolyLogo } from "./HolyLogo";

export function BadPlanetPage({ lang, onBack }: { lang: "en" | "lt"; onBack: () => void }) {
  const [visible, setVisible] = useState(false);
  const [activeCategory, setActiveCategory] = useState("all");
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  useEffect(() => { setTimeout(() => setVisible(true), 50); }, []);

  const dangerMeta = {
    high:   { label: "HIGH RISK",   labelLt: "DIDELĖ RIZIKA",   color: "#ef4444", border: "rgba(220,38,38,0.40)", bg: "rgba(220,38,38,0.09)"  },
    medium: { label: "MEDIUM RISK", labelLt: "VIDUTINĖ RIZIKA", color: "#f97316", border: "rgba(234,88,12,0.35)", bg: "rgba(234,88,12,0.08)"  },
    low:    { label: "CAUTION",     labelLt: "DĖMESIO",         color: "#eab308", border: "rgba(202,138,4,0.30)", bg: "rgba(202,138,4,0.07)"  },
  };

  const filtered = activeCategory === "all"
    ? BAD_INGREDIENTS
    : BAD_INGREDIENTS.filter(ing => ing.category === activeCategory);

  const highCount   = BAD_INGREDIENTS.filter(i => i.danger === "high").length;
  const bannedCount = BAD_INGREDIENTS.filter(i => i.bannedIn).length;
  const total       = BAD_INGREDIENTS.length;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" style={{ background: "#08060e" }}>

      {/* ── Top bar ── */}
      <div className="sticky top-0 z-20 flex items-center justify-between px-6 py-4 backdrop-blur-md border-b border-red-950/40"
        style={{ background: "rgba(8,6,14,0.96)" }}>
        <button onClick={onBack} className="text-sm font-semibold text-red-400/55 hover:text-red-400 transition-colors">
          {lang === "en" ? "← Back to Universe" : "← Grįžti į visatą"}
        </button>
        <div className="flex items-center gap-2">
          <span className="text-xl">☠️</span>
          <span className="font-[var(--font-playfair)] text-lg font-bold" style={{ color: "#fca5a5" }}>
            {lang === "en" ? "The Bad Planet" : "Blogoji planeta"}
          </span>
        </div>
        <HolyLogo size="sm" />
      </div>

      {/* ── Hero ── */}
      <div className={`relative py-16 px-6 text-center overflow-hidden transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
        {/* Background atmosphere */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[420px]"
            style={{ background: "radial-gradient(ellipse, rgba(180,0,0,0.18) 0%, transparent 65%)" }} />
          {[-60,-35,-12,0,12,35,60].map((deg, i) => (
            <div key={i} className="absolute top-0 left-1/2 origin-top h-96 w-px opacity-[0.04]"
              style={{ background: "linear-gradient(to bottom, #ef4444, transparent)", transform: `rotate(${deg}deg)` }} />
          ))}
        </div>

        <div className="relative z-10 max-w-3xl mx-auto">
          {/* Planet */}
          <div className="w-28 h-28 rounded-full mx-auto mb-8 flex items-center justify-center animate-float"
            style={{
              background: "radial-gradient(circle at 35% 35%, #7f1d1d, #450a0a 55%, #120000)",
              boxShadow: "0 0 90px 28px rgba(200,0,0,0.22), 0 0 40px 10px rgba(220,38,38,0.15), inset 0 0 30px rgba(0,0,0,0.8)",
              border: "2px solid rgba(220,38,38,0.28)",
            }}>
            <span className="text-5xl">☠️</span>
          </div>

          <p className="text-red-500/50 text-xs tracking-[0.3em] uppercase font-bold mb-4">
            ☠ {lang === "en" ? "Educational — No products for sale" : "Edukacinis — Produktų nėra"} ☠
          </p>
          <h1 className="font-[var(--font-playfair)] text-4xl md:text-6xl font-black mb-5 leading-tight"
            style={{ color: "#fca5a5", textShadow: "0 0 60px rgba(220,38,38,0.45)" }}>
            {lang === "en" ? "What Hides in Your Snacks" : "Kas slepiasi tavo užkandžiuose"}
          </h1>
          <p className="text-white/45 text-base md:text-lg leading-relaxed mb-10">
            {lang === "en"
              ? "The global food industry uses hundreds of additives, preservatives, and synthetic ingredients — many banned in other countries or linked to serious health issues. We researched every single one so you don't have to."
              : "Pasaulinė maisto pramonė naudoja šimtus priedų, konservantų ir sintetinių ingredientų. Daugelis jų yra uždrausti kitose šalyse arba siejami su rimtomis sveikatos problemomis. Mes juos ištyrėme už jus."}
          </p>

          {/* Stats row */}
          <div className="flex justify-center gap-5 md:gap-12 mb-10 flex-wrap">
            {[
              { num: total,        suffix: "",  label: lang === "en" ? "Ingredients Exposed"  : "Atskleistų ingredientų", red: true  },
              { num: highCount,    suffix: "",  label: lang === "en" ? "High Risk"             : "Didelė rizika",           red: true  },
              { num: bannedCount,  suffix: "+", label: lang === "en" ? "Banned Somewhere"      : "Uždrausti šalyse",        red: true  },
              { num: 0,            suffix: "",  label: lang === "en" ? "In HolySnacks"         : "HolySnacks produktuose",  red: false },
            ].map((s, i) => (
              <div key={i} className="text-center px-4">
                <div className="font-[var(--font-playfair)] text-4xl font-black mb-1"
                  style={{ color: s.red ? "#ef4444" : "#f0c855" }}>
                  {s.num}{s.suffix}
                </div>
                <div className="text-xs text-white/30 tracking-widest uppercase">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Danger legend */}
          <div className="flex justify-center gap-3 flex-wrap">
            {(["high", "medium", "low"] as const).map(d => (
              <div key={d} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold"
                style={{ background: dangerMeta[d].bg, border: `1px solid ${dangerMeta[d].border}`, color: dangerMeta[d].color }}>
                <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: dangerMeta[d].color }} />
                {lang === "en" ? dangerMeta[d].label : dangerMeta[d].labelLt}
              </div>
            ))}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.10)", color: "rgba(255,255,255,0.35)" }}>
              🚫 {lang === "en" ? "Banned in countries" : "Uždrausti šalyse"}
            </div>
          </div>
        </div>
      </div>

      {/* ── Category filter tabs (sticky) ── */}
      <div className="sticky top-[65px] z-10 border-b border-white/5"
        style={{ background: "rgba(8,6,14,0.98)", backdropFilter: "blur(12px)" }}>
        <div className="flex flex-wrap gap-2 px-6 py-3 justify-center">
          {BAD_CATEGORIES.map(bc => {
            const count = bc.id === "all"
              ? BAD_INGREDIENTS.length
              : BAD_INGREDIENTS.filter(i => i.category === bc.id).length;
            const isActive = activeCategory === bc.id;
            return (
              <button key={bc.id} onClick={() => setActiveCategory(bc.id)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-full text-[11px] font-bold whitespace-nowrap transition-all"
                style={isActive ? {
                  background: "linear-gradient(135deg, #991b1b, #dc2626)",
                  color: "#fff",
                  boxShadow: "0 0 18px rgba(220,38,38,0.45)",
                } : {
                  background: "rgba(255,255,255,0.04)",
                  color: "rgba(255,255,255,0.40)",
                  border: "1px solid rgba(255,255,255,0.07)",
                }}>
                <span>{bc.icon}</span>
                <span>{lang === "lt" ? bc.labelLt : bc.label}</span>
                <span className="opacity-40 ml-0.5">({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Ingredients grid ── */}
      <div className="max-w-7xl mx-auto px-6 py-8 pb-16">
        <p className="text-white/20 text-xs tracking-widest uppercase mb-6">
          {lang === "en"
            ? `Showing ${filtered.length} of ${total} ingredients — 0 found in HolySnacks`
            : `Rodoma ${filtered.length} iš ${total} ingredientų — 0 HolySnacks produktuose`}
        </p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((ing, i) => {
            const dm = dangerMeta[ing.danger];
            const cardKey = ing.name;
            const isExpanded = expandedCard === cardKey;
            return (
              <div key={cardKey}
                className={`rounded-2xl overflow-hidden flex flex-col hover:-translate-y-0.5 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
                style={{
                  background: dm.bg,
                  border: `1px solid ${dm.border}`,
                  boxShadow: `0 4px 20px rgba(0,0,0,0.3)`,
                  transition: `opacity 0.5s ${((i % 9) * 55 + 80) / 1000}s, transform 0.5s ${((i % 9) * 55 + 80) / 1000}s`,
                }}>

                {/* Card header */}
                <div className={`h-24 bg-gradient-to-br ${ing.gradient} relative flex items-center justify-center overflow-hidden flex-shrink-0`}>
                  <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_30%_30%,white,transparent_60%)]" />
                  <span className="text-5xl relative z-10 drop-shadow-lg select-none">{ing.emoji}</span>

                  {/* Danger badge */}
                  <span className="absolute top-2 right-2 text-[8px] font-black px-2 py-0.5 rounded-full tracking-widest"
                    style={{ background: "rgba(0,0,0,0.65)", color: dm.color, border: `1px solid ${dm.color}35` }}>
                    {lang === "en" ? dm.label : dm.labelLt}
                  </span>

                  {/* Banned badge */}
                  {ing.bannedIn && (
                    <span className="absolute top-2 left-2 text-[8px] font-black px-2 py-0.5 rounded-full bg-black/70 text-white/60 border border-white/10 tracking-wider">
                      🚫 BANNED
                    </span>
                  )}

                  {/* E-number */}
                  {ing.eNumber && (
                    <span className="absolute bottom-2 right-2 text-[8px] font-mono text-white/35 tracking-wider">
                      {ing.eNumber}
                    </span>
                  )}
                </div>

                {/* Card body */}
                <div className="p-4 flex flex-col flex-1 gap-2.5">
                  <h3 className="font-[var(--font-playfair)] font-bold text-base leading-snug" style={{ color: dm.color }}>
                    {ing.name}
                  </h3>

                  {/* Also known as */}
                  {ing.alsoKnownAs && (
                    <div className="text-[9px] leading-relaxed" style={{ color: `${dm.color}60` }}>
                      <span className="font-black tracking-widest uppercase">🏷 {lang === "en" ? "Also known as" : "Taip pat žinoma kaip"}: </span>
                      <span className="text-white/35">{ing.alsoKnownAs}</span>
                    </div>
                  )}

                  {/* Banned in */}
                  {ing.bannedIn && (
                    <div className="px-2.5 py-1.5 rounded-lg text-[9px] leading-relaxed"
                      style={{ background: "rgba(220,38,38,0.07)", border: "1px solid rgba(220,38,38,0.18)" }}>
                      <span className="font-black text-red-400/60 tracking-widest uppercase">🚫 {lang === "en" ? "Banned" : "Uždrausta"}: </span>
                      <span className="text-white/40">{ing.bannedIn}</span>
                    </div>
                  )}

                  {/* Hides in */}
                  <div>
                    <p className="text-[8px] font-black tracking-[0.18em] uppercase mb-1" style={{ color: `${dm.color}55` }}>
                      🕵️ {lang === "en" ? "Hides in" : "Slepiasi"}
                    </p>
                    <p className="text-[11px] text-white/45 leading-relaxed">{ing.hidesIn}</p>
                  </div>

                  {/* Why harmful — collapsible */}
                  <div className="flex-1">
                    <p className="text-[8px] font-black tracking-[0.18em] uppercase mb-1" style={{ color: `${dm.color}55` }}>
                      ⚠️ {lang === "en" ? "Why harmful" : "Kodėl kenksminga"}
                    </p>
                    <p className={`text-[11px] text-white/65 leading-relaxed transition-all duration-300 ${isExpanded ? "" : "line-clamp-3"}`}>
                      {ing.whyBad}
                    </p>
                    <button
                      className="text-[9px] font-bold mt-1.5 transition-opacity hover:opacity-100 opacity-60"
                      style={{ color: dm.color }}
                      onClick={() => setExpandedCard(isExpanded ? null : cardKey)}
                    >
                      {isExpanded
                        ? (lang === "en" ? "Show less ↑" : "Mažiau ↑")
                        : (lang === "en" ? "Read more ↓" : "Daugiau ↓")}
                    </button>
                  </div>

                  {/* Holy Promise */}
                  <div className="px-3 py-2.5 rounded-xl mt-1"
                    style={{ background: "rgba(240,200,85,0.055)", border: "1px solid rgba(240,200,85,0.14)" }}>
                    <p className="text-[8px] font-black tracking-[0.18em] uppercase text-[#f0c855]/45 mb-1">
                      ✦ {lang === "en" ? "HolySnacks Promise" : "HolySnacks pažadas"}
                    </p>
                    <p className="text-[11px] text-[#f0c855]/75 leading-relaxed">{ing.holyPromise}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Bottom CTA ── */}
      <div className="px-6 pb-24">
        <div className="max-w-xl mx-auto text-center p-10 rounded-3xl"
          style={{ background: "rgba(240,200,85,0.04)", border: "1px solid rgba(240,200,85,0.13)" }}>
          <div className="w-12 h-12 rounded-full mx-auto mb-6 flex items-center justify-center"
            style={{
              background: "radial-gradient(circle at 35% 35%, #fde68a, #f0c855 50%, #b8860b)",
              boxShadow: "0 0 24px 6px rgba(240,200,85,0.35)",
            }}>
            <span className="font-[var(--font-playfair)] font-black text-lg text-[#0b1220]">H</span>
          </div>
          <p className="text-[#f0c855]/25 text-xs tracking-widest uppercase mb-4">✦ ✦ ✦</p>
          <h3 className="font-[var(--font-playfair)] text-2xl md:text-3xl font-black text-white mb-3">
            {lang === "en" ? "Now you know." : "Dabar žinai."}
          </h3>
          <p className="text-white/30 text-sm leading-relaxed mb-8">
            {lang === "en"
              ? `Every one of these ${total} ingredients is absent from every single HolySnacks product. That's not luck — that's the mission.`
              : `Nė vieno iš šių ${total} ingredientų nėra jokiame HolySnacks produkte. Tai ne atsitiktinumas — tai mūsų misija.`}
          </p>
          <button onClick={onBack}
            className="px-8 py-4 rounded-full font-bold text-sm hover:opacity-90 transition-all hover:scale-105 text-[#0b1220]"
            style={{ background: "linear-gradient(to right, #d4a830, #fad55c)", boxShadow: "0 4px 28px rgba(240,200,85,0.28)" }}>
            ✦ {lang === "en" ? "Choose the Holy Path" : "Pasirink šventą kelią"}
          </button>
        </div>
      </div>
    </div>
  );
}
