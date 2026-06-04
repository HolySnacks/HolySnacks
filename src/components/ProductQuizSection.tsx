"use client";

import { useState } from "react";
import { Category } from "@/lib/types";
import { CATEGORIES } from "@/lib/products";
import { useInView } from "@/lib/hooks";

const QUIZ_STEPS = [
  {
    q: { en: "What's your main snack goal?", lt: "Koks jūsų pagrindinis užkandžių tikslas?" },
    options: [
      { en: "Pure treat / enjoyment", lt: "Malonumas",        emoji: "😋", cats: ["gummies", "chocolate"] },
      { en: "Energy & hydration",     lt: "Energija",         emoji: "⚡", cats: ["drinks", "snacks"] },
      { en: "Dental & oral health",   lt: "Dantų sveikata",   emoji: "🦷", cats: ["gums"] },
      { en: "Clean everyday snack",   lt: "Švarūs užkandžiai",emoji: "🌿", cats: ["snacks", "gummies"] },
    ],
  },
  {
    q: { en: "Favourite flavour direction?", lt: "Mėgiama skonio kryptis?" },
    options: [
      { en: "Sweet & fruity",  lt: "Saldus ir vaisinis",  emoji: "🍓", cats: ["gummies", "drinks"] },
      { en: "Rich & intense",  lt: "Sodrus ir intensyvus", emoji: "🍫", cats: ["chocolate"] },
      { en: "Salty & crunchy", lt: "Sūrus ir traškus",    emoji: "🧂", cats: ["snacks"] },
      { en: "Cool & fresh",    lt: "Gaivus ir šviežias",  emoji: "❄️", cats: ["gums", "drinks"] },
    ],
  },
  {
    q: { en: "Any dietary preference?", lt: "Kokia mityba?" },
    options: [
      { en: "Vegan / plant-based", lt: "Veganiška",   emoji: "🌱", cats: ["gummies", "snacks", "drinks", "gums"] },
      { en: "No added sugar",      lt: "Be cukraus",  emoji: "🚫", cats: ["gums", "drinks"] },
      { en: "High protein",        lt: "Daug baltymų",emoji: "💪", cats: ["snacks"] },
      { en: "No preference",       lt: "Nėra",        emoji: "✨", cats: ["gummies", "chocolate", "drinks", "snacks", "gums"] },
    ],
  },
];

export function ProductQuizSection({ lang, onSelectCategory }: { lang: "en" | "lt"; onSelectCategory: (cat: Category) => void }) {
  const anim = useInView(0.1);
  const [step, setStep] = useState(0);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [done, setDone] = useState(false);

  function pick(cats: string[]) {
    const next = { ...scores };
    cats.forEach(c => { next[c] = (next[c] || 0) + 1; });
    setScores(next);
    if (step + 1 >= QUIZ_STEPS.length) setDone(true);
    else setStep(s => s + 1);
  }

  function reset() { setStep(0); setScores({}); setDone(false); }

  const topCatId = Object.entries(scores).sort((a, b) => b[1] - a[1])[0]?.[0];
  const topCat   = CATEGORIES.find(c => c.id === topCatId);

  return (
    <section className="relative py-28 px-6 overflow-hidden" style={{ background: "radial-gradient(ellipse at 70% 40%, #120a18 0%, #0b1220 65%)" }}>
      <div className="absolute right-0 bottom-0 w-80 h-80 rounded-full blur-[120px] pointer-events-none opacity-20"
        style={{ background: "radial-gradient(circle, #a855f7 0%, transparent 70%)" }} />

      <div ref={anim.ref} className="max-w-2xl mx-auto">
        <div className={`text-center mb-12 transition-all duration-700 ${anim.inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
          <p className="text-[10px] font-bold tracking-[0.3em] uppercase mb-3" style={{ color: "#c084fc" }}>
            ✦ {lang === "en" ? "Find Your Planet" : "Rask savo planetą"}
          </p>
          <h2 className="font-[var(--font-playfair)] text-4xl md:text-5xl font-black text-white mb-4">
            {lang === "en" ? <>What's your<br /><span style={{ color: "#c084fc" }}>Holy Snack?</span></> : <>Koks tavo<br /><span style={{ color: "#c084fc" }}>šventasis užkandis?</span></>}
          </h2>
        </div>

        {!done ? (
          <div className={`transition-all duration-500 ${anim.inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            {/* Progress bar */}
            <div className="flex gap-1.5 mb-8">
              {QUIZ_STEPS.map((_, i) => (
                <div key={i} className="h-1 flex-1 rounded-full transition-all duration-500"
                  style={{ background: i <= step ? "#c084fc" : "rgba(255,255,255,0.1)" }} />
              ))}
            </div>
            {/* Question */}
            <div className="rounded-3xl p-8" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(192,132,252,0.15)" }}>
              <p className="font-[var(--font-playfair)] text-2xl font-bold text-white mb-8 text-center">
                {QUIZ_STEPS[step].q[lang]}
              </p>
              <div className="grid grid-cols-2 gap-3">
                {QUIZ_STEPS[step].options.map((opt, i) => (
                  <button key={i} onClick={() => pick(opt.cats)}
                    className="rounded-2xl p-4 text-left transition-all hover:scale-[1.03] active:scale-95 flex items-center gap-3"
                    style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(192,132,252,0.12)" }}>
                    <span className="text-2xl flex-shrink-0">{opt.emoji}</span>
                    <span className="text-sm text-white/80 font-medium leading-snug">{opt[lang]}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="animate-fade-in-up text-center">
            {topCat ? (
              <>
                <p className="text-sm text-white/50 mb-6">{lang === "en" ? "Your perfect match is…" : "Jūsų idealus pasirinkimas…"}</p>
                <div className={`w-36 h-36 rounded-full bg-gradient-to-br ${topCat.gradient} flex items-center justify-center mx-auto mb-6`}
                  style={{ boxShadow: `0 0 60px 20px ${topCat.glow}, inset 0 0 30px rgba(255,255,255,0.2)`, border: "2px solid rgba(255,255,255,0.3)" }}>
                  <span style={{ fontSize: 52 }}>{topCat.icon}</span>
                </div>
                <h3 className="font-[var(--font-playfair)] text-4xl font-black text-white mb-2">{lang === "lt" ? topCat.labelLt : topCat.label}</h3>
                <p className="text-white/45 mb-8 text-sm max-w-xs mx-auto">
                  {lang === "en" ? "Based on your answers, this planet was made for you." : "Pagal jūsų atsakymus, ši planeta skirta jums."}
                </p>
                <div className="flex gap-3 justify-center">
                  <button onClick={() => onSelectCategory(topCat)}
                    className="px-8 py-3 rounded-full font-bold text-sm transition-all hover:scale-105"
                    style={{ background: `linear-gradient(135deg, ${topCat.accentColor}, ${topCat.accentColor}cc)`, color: "#0b1220" }}>
                    {lang === "en" ? "Explore Planet →" : "Tyrinėti →"}
                  </button>
                  <button onClick={reset}
                    className="px-6 py-3 rounded-full font-semibold text-sm text-white/40 hover:text-white/70 transition-colors border border-white/10">
                    {lang === "en" ? "Retake" : "Bandyti dar"}
                  </button>
                </div>
              </>
            ) : (
              <button onClick={reset} className="text-white/50 underline">{lang === "en" ? "Try again" : "Bandyti dar kartą"}</button>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
