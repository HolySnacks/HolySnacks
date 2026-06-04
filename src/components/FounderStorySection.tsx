"use client";

import { useInView } from "@/lib/hooks";

export function FounderStorySection({ lang }: { lang: "en" | "lt" }) {
  const anim = useInView(0.1);
  const pillars = lang === "en" ? [
    { icon: "🔬", stat: "3 yrs", label: "of ingredient research" },
    { icon: "📋", stat: "52+",   label: "harmful ingredients catalogued" },
    { icon: "🌿", stat: "100%",  label: "natural formulations only" },
    { icon: "🌍", stat: "12+",   label: "countries we source from" },
  ] : [
    { icon: "🔬", stat: "3 m.",  label: "ingredientų tyrimų" },
    { icon: "📋", stat: "52+",   label: "žalingų ingredientų kataloge" },
    { icon: "🌿", stat: "100%",  label: "natūralios formuluotės" },
    { icon: "🌍", stat: "12+",   label: "šalių, iš kurių tiekiame" },
  ];

  return (
    <section className="relative py-32 px-6 overflow-hidden" style={{ background: "radial-gradient(ellipse at 60% 50%, #0d1a0d 0%, #0b1220 60%)" }}>
      {/* Subtle green ambient glow */}
      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-96 h-96 rounded-full blur-[120px] pointer-events-none opacity-20"
        style={{ background: "radial-gradient(circle, #22c55e 0%, transparent 70%)" }} />

      <div ref={anim.ref} className="max-w-6xl mx-auto">
        {/* Label */}
        <p className={`text-[10px] font-bold tracking-[0.3em] uppercase mb-4 transition-all duration-700 ${anim.inView ? "opacity-60 translate-y-0" : "opacity-0 translate-y-4"}`}
          style={{ color: "#22c55e" }}>
          ✦ {lang === "en" ? "Our Origin" : "Mūsų istorija"}
        </p>

        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left — story text */}
          <div className={`transition-all duration-700 delay-100 ${anim.inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            <h2 className="font-[var(--font-playfair)] text-4xl md:text-5xl font-black text-white mb-6 leading-tight">
              {lang === "en"
                ? <>We read the labels<br /><span style={{ color: "#22c55e" }}>so you never have to.</span></>
                : <>Mes skaitome etiketes,<br /><span style={{ color: "#22c55e" }}>kad jums nereikėtų.</span></>}
            </h2>
            <div className="space-y-4 text-white/55 leading-relaxed text-base">
              <p>
                {lang === "en"
                  ? "HolySnacks was born from a simple frustration: why is it so hard to find a snack you can actually trust? Every aisle, every label — a maze of numbers, chemicals, and names nobody can pronounce."
                  : "HolySnacks gimė iš paprastos frustrancijos: kodėl taip sunku rasti užkandį, kuriuo galima tikrai pasitikėti? Kiekviena parduotuvės eilė — cheminių pavadinimų labirintas."}
              </p>
              <p>
                {lang === "en"
                  ? "We spent years cataloguing what the food industry hides in plain sight — artificial dyes, hidden sugars, synthetic preservatives, packaging chemicals that leach into your food. 52 ingredients. The Bad Planet."
                  : "Metus katalogavome, ką maisto pramonė slepia aiškiai matomoje vietoje — dirbtiniai dažai, paslėpti cukrūs, sintetiniai konservantai. 52 ingredientai. Blogoji planeta."}
              </p>
              <p>
                {lang === "en"
                  ? "Then we built the alternative. Every HolySnacks product starts with one rule: if we wouldn't feed it to someone we love, it doesn't go in. No exceptions."
                  : "Tada sukūrėme alternatyvą. Kiekvienas HolySnacks produktas prasideda nuo vienos taisyklės: jei neleistume to valgyti artimiesiems — to nebus sudėtyje. Jokių išimčių."}
              </p>
            </div>

            {/* Pull quote */}
            <div className="mt-10 pl-5 border-l-2 border-[#22c55e]/40">
              <p className="font-[var(--font-playfair)] text-xl text-white/80 italic leading-snug">
                {lang === "en"
                  ? "\"Premium doesn't mean expensive. It means honest.\""
                  : "\"Premium nereiškia brangaus. Tai reiškia sąžiningą.\""}
              </p>
              <p className="text-xs text-white/30 mt-2 tracking-widest uppercase">— HolySnacks</p>
            </div>
          </div>

          {/* Right — stats grid */}
          <div className={`grid grid-cols-2 gap-4 transition-all duration-700 delay-200 ${anim.inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            {pillars.map((p, i) => (
              <div key={i} className="rounded-2xl p-6 flex flex-col gap-3 transition-all duration-300 hover:scale-[1.03]"
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(34,197,94,0.12)",
                  boxShadow: "0 0 24px rgba(34,197,94,0.05)",
                  animationDelay: `${i * 100}ms`,
                }}>
                <span className="text-3xl">{p.icon}</span>
                <div>
                  <div className="font-[var(--font-playfair)] text-3xl font-black" style={{ color: "#22c55e" }}>{p.stat}</div>
                  <div className="text-xs text-white/40 mt-1 leading-snug">{p.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
