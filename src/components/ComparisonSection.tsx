"use client";

import { useInView } from "@/lib/hooks";

export function ComparisonSection({ lang }: { lang: "en" | "lt" }) {
  const anim = useInView();

  const rows = [
    {
      label:  lang === "en" ? "Sweetener"   : "Saldintuvas",
      bad:    lang === "en" ? "Refined sugar or high-fructose corn syrup" : "Rafinuotas cukrus arba HFCS",
      good:   lang === "en" ? "Coconut sugar or real fruit" : "Kokosų cukrus arba tikri vaisiai",
    },
    {
      label:  lang === "en" ? "Color"       : "Spalva",
      bad:    lang === "en" ? "Red 40, Yellow 5, Blue 1 (petroleum-derived)" : "Red 40, Yellow 5 (iš naftos)",
      good:   lang === "en" ? "Beet juice, turmeric, spirulina" : "Burokėliai, ciberžolė, spirulina",
    },
    {
      label:  lang === "en" ? "Preservative": "Konservantas",
      bad:    lang === "en" ? "Sodium Benzoate + BHA/BHT" : "Natrio benzoatas, BHA/BHT",
      good:   lang === "en" ? "Rosemary extract + citric acid" : "Rozmarino ekstraktas + citrinų rūgštis",
    },
    {
      label:  lang === "en" ? "Fat source"  : "Riebalai",
      bad:    lang === "en" ? "Palm oil or hydrogenated oils" : "Palmių aliejus arba hidrogenizuoti riebalai",
      good:   lang === "en" ? "Cold-pressed olive or coconut oil" : "Šaltai spaustas alyvuogių aliejus",
    },
    {
      label:  lang === "en" ? "Salt"        : "Druska",
      bad:    lang === "en" ? "Refined table salt + anti-caking agents" : "Rafinuota druska + priedai",
      good:   lang === "en" ? "Himalayan pink salt (80+ minerals)" : "Himalajų druska (80+ mineralų)",
    },
    {
      label:  lang === "en" ? "Transparency": "Skaidrumas",
      bad:    lang === "en" ? `"Natural flavors" — a legal black box` : `"Natūralus aromatas" — juridinė dėžutė`,
      good:   lang === "en" ? "Every ingredient named in plain language" : "Kiekvienas ingredientas pavadintas aiškiai",
    },
  ];

  return (
    <section className="px-6 py-24 border-t border-white/5">
      <div ref={anim.ref}
        className={`max-w-4xl mx-auto transition-all duration-700 ${anim.inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>

        <div className="text-center mb-14">
          <p className="text-[#f0c855]/45 text-xs tracking-widest uppercase mb-4">✦ ✦ ✦</p>
          <h2 className="font-[var(--font-playfair)] text-4xl md:text-5xl font-bold text-white mb-4">
            {lang === "en" ? "HolySnacks vs The Rest" : "HolySnacks prieš kitus"}
          </h2>
          <p className="text-white/35 max-w-md mx-auto text-sm">
            {lang === "en" ? "Side by side. No spin. Just ingredients." : "Greta. Be apgaulės. Tik ingredientai."}
          </p>
        </div>

        {/* Column headers */}
        <div className="grid grid-cols-[minmax(80px,1fr)_1.4fr_1.4fr] gap-3 mb-2">
          <div />
          <div className="text-center text-[10px] font-black tracking-widest uppercase px-3 py-2 rounded-xl"
            style={{ background: "rgba(220,38,38,0.07)", border: "1px solid rgba(220,38,38,0.15)", color: "#ef4444" }}>
            😈 {lang === "en" ? "Conventional" : "Įprasti"}
          </div>
          <div className="text-center text-[10px] font-black tracking-widest uppercase px-3 py-2 rounded-xl"
            style={{ background: "rgba(240,200,85,0.07)", border: "1px solid rgba(240,200,85,0.20)", color: "#f0c855" }}>
            ✦ HolySnacks
          </div>
        </div>

        {/* Rows */}
        <div className="flex flex-col gap-2">
          {rows.map((row, i) => (
            <div key={i} className="grid grid-cols-[minmax(80px,1fr)_1.4fr_1.4fr] gap-3 items-center">
              <div className="text-[11px] font-bold text-white/40 px-2 py-2">{row.label}</div>
              <div className="px-3.5 py-3 rounded-xl text-[11px] text-red-400/65 leading-relaxed"
                style={{ background: "rgba(220,38,38,0.05)", border: "1px solid rgba(220,38,38,0.10)" }}>
                ✗ {row.bad}
              </div>
              <div className="px-3.5 py-3 rounded-xl text-[11px] leading-relaxed"
                style={{ background: "rgba(240,200,85,0.05)", border: "1px solid rgba(240,200,85,0.13)", color: "rgba(240,200,85,0.75)" }}>
                ✓ {row.good}
              </div>
            </div>
          ))}
        </div>

        <p className="text-center text-white/20 text-[10px] mt-8">
          {lang === "en"
            ? "Based on average ingredients found in top-selling conventional snack brands."
            : "Remiantis populiariausių įprastų užkandžių brandų ingredientų sąrašais."}
        </p>
      </div>
    </section>
  );
}
