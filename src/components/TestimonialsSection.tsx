"use client";

import { useInView } from "@/lib/hooks";
import { TESTIMONIALS } from "@/lib/products";

export function TestimonialsSection({ lang }: { lang: "en" | "lt" }) {
  const anim = useInView();
  return (
    <section className="px-6 py-24 border-t border-[#f0c855]/10"
      style={{ background: "radial-gradient(ellipse at 50% 40%, rgba(240,200,85,0.04) 0%, transparent 65%), #0b1220" }}>
      <div ref={anim.ref}
        className={`max-w-6xl mx-auto transition-all duration-700 ${anim.inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>

        <div className="text-center mb-14">
          <p className="text-[#f0c855]/45 text-xs tracking-widest uppercase mb-4">✦ ✦ ✦</p>
          <h2 className="font-[var(--font-playfair)] text-4xl md:text-5xl font-bold text-white mb-4">
            {lang === "en" ? "The Chosen Speak" : "Sako išrinktieji"}
          </h2>
          <p className="text-white/35 max-w-sm mx-auto text-sm">
            {lang === "en" ? "Real people. Real results. No sponsored posts." : "Tikri žmonės. Tikri atsiliepimai. Jokių reklaminių postų."}
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {TESTIMONIALS.map((t, i) => (
            <div key={i}
              className="p-6 rounded-2xl flex flex-col gap-4 transition-all duration-300 hover:-translate-y-1"
              style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(240,200,85,0.09)" }}>

              {/* Stars */}
              <div className="flex gap-0.5">
                {Array.from({ length: t.rating }).map((_, s) => (
                  <span key={s} className="text-sm" style={{ color: "#f0c855" }}>★</span>
                ))}
              </div>

              {/* Text */}
              <p className="text-white/60 text-sm leading-relaxed flex-1">"{t.text}"</p>

              {/* Product */}
              <div className="flex items-center gap-2 pt-1">
                <span className="text-base">{t.catIcon}</span>
                <span className="text-xs font-semibold" style={{ color: "#f0c855" }}>{t.productName}</span>
              </div>

              {/* Author */}
              <div className="pt-3 border-t border-white/5 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-black flex-shrink-0"
                  style={{ background: "rgba(240,200,85,0.14)", color: "#f0c855" }}>
                  {t.name.charAt(0)}
                </div>
                <div>
                  <div className="text-xs font-bold text-white/80">{t.name}</div>
                  <div className="text-[10px] text-white/25">{t.location}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
