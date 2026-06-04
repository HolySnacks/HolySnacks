"use client";

import { useInView } from "@/lib/hooks";

export function LoyaltySection({ lang }: { lang: "en" | "lt" }) {
  const anim = useInView(0.1);
  const tiers = [
    {
      name: "Novice",       nameLt: "Naujokas",
      icon: "🌱", points: "0 – 499",
      color: "#86efac", glow: "rgba(134,239,172,0.3)",
      perks: lang === "en"
        ? ["Early access to new flavours", "5% off every order", "Monthly snack digest"]
        : ["Ankstyva prieiga prie naujų skonių", "5% nuolaida kiekvienam užsakymui", "Mėnesinis biuletenis"],
    },
    {
      name: "Apostle",      nameLt: "Apaštalas",
      icon: "⚡", points: "500 – 1 999",
      color: "#60a5fa", glow: "rgba(96,165,250,0.3)",
      perks: lang === "en"
        ? ["All Novice perks", "10% off + free shipping", "Exclusive limited drops", "Birthday gift box"]
        : ["Visos Naujoko naudos", "10% nuolaida + nemokamas pristatymas", "Išskirtiniai leidimai", "Gimtadienio dovanų dėžutė"],
    },
    {
      name: "Saint",        nameLt: "Šventasis",
      icon: "✦", points: "2 000 – 4 999",
      color: "#f0c855", glow: "rgba(240,200,85,0.35)",
      perks: lang === "en"
        ? ["All Apostle perks", "15% off everything", "Taste-tester invitations", "Personalised snack box"]
        : ["Visos Apaštalo naudos", "15% nuolaida viskam", "Skonio testerio kvietimai", "Personalizuota dėžutė"],
    },
    {
      name: "Divine",       nameLt: "Dieviškasis",
      icon: "👑", points: "5 000+",
      color: "#e879f9", glow: "rgba(232,121,249,0.35)",
      perks: lang === "en"
        ? ["All Saint perks", "20% off for life", "Co-create new products", "Annual divine retreat"]
        : ["Visos Šventojo naudos", "20% nuolaida visam laikui", "Kurkite produktus kartu", "Metinis susitikimas"],
    },
  ];

  return (
    <section className="relative py-28 px-6 overflow-hidden" style={{ background: "radial-gradient(ellipse at 50% 0%, #0f0a18 0%, #0b1220 65%)" }}>
      <div className="absolute inset-x-0 top-0 h-px" style={{ background: "linear-gradient(to right, transparent, rgba(240,200,85,0.2), transparent)" }} />

      <div ref={anim.ref} className="max-w-5xl mx-auto">
        <div className={`text-center mb-16 transition-all duration-700 ${anim.inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
          <p className="text-[10px] font-bold tracking-[0.3em] uppercase mb-3" style={{ color: "#f0c855" }}>
            ✦ {lang === "en" ? "The Holy Circle" : "Šventasis ratas"}
          </p>
          <h2 className="font-[var(--font-playfair)] text-4xl md:text-5xl font-black text-white mb-4">
            {lang === "en" ? <>Snack more.<br /><span style={{ color: "#f0c855" }}>Earn divinity.</span></> : <>Užkandžiauk daugiau.<br /><span style={{ color: "#f0c855" }}>Pelnauk dievystę.</span></>}
          </h2>
          <p className="text-white/40 max-w-md mx-auto text-sm">
            {lang === "en"
              ? "Every purchase earns Holy Points. Rise through the tiers, unlock exclusive perks, and become part of something greater."
              : "Kiekvienas pirkinys uždirba Holy taškų. Kopkite per lygius, atrakinkite išskirtines privilegijas."}
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {tiers.map((tier, i) => (
            <div key={i}
              className="rounded-3xl p-6 flex flex-col gap-5 hover:scale-[1.03]"
              style={{
                background: "rgba(255,255,255,0.03)",
                border: `1px solid ${tier.color}22`,
                boxShadow: `0 0 30px ${tier.glow}`,
                opacity: anim.inView ? 1 : 0,
                transform: anim.inView ? "translateY(0) scale(1)" : "translateY(32px) scale(1)",
                transition: `opacity 0.6s ${i * 0.1}s, transform 0.6s ${i * 0.1}s, box-shadow 0.3s`,
              }}>
              {/* Icon + name */}
              <div>
                <div className="text-4xl mb-3">{tier.icon}</div>
                <div className="font-[var(--font-playfair)] text-xl font-black text-white">
                  {lang === "lt" ? tier.nameLt : tier.name}
                </div>
                <div className="text-[10px] font-bold tracking-widest uppercase mt-1" style={{ color: tier.color }}>
                  {tier.points} {lang === "en" ? "pts" : "tašk."}
                </div>
              </div>
              {/* Divider */}
              <div className="h-px w-full rounded-full opacity-20" style={{ background: tier.color }} />
              {/* Perks */}
              <ul className="space-y-2 flex-1">
                {tier.perks.map((perk, j) => (
                  <li key={j} className="flex items-start gap-2 text-xs text-white/55 leading-snug">
                    <span className="mt-0.5 flex-shrink-0 w-3 h-3 rounded-full flex items-center justify-center text-[8px] font-black"
                      style={{ background: `${tier.color}30`, color: tier.color }}>✓</span>
                    {perk}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <p className={`text-center text-xs text-white/25 mt-10 transition-all duration-700 delay-500 ${anim.inView ? "opacity-100" : "opacity-0"}`}>
          {lang === "en" ? "✦ Launching with our first product drop — join the waitlist to start earning early." : "✦ Paleisime kartu su pirmuoju produktų paleidimu — prisijunkite prie laukimo sąrašo."}
        </p>
      </div>
    </section>
  );
}
