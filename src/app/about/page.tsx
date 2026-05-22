import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About Us",
  description: "The story behind HolySnacks — why we built the cleanest snack brand on the planet, and what drives us to fight back against junk food.",
};

const values = [
  {
    emoji: "🔍",
    title: "Radical Transparency",
    desc: "Every ingredient we use is on the label. No hidden additives, no proprietary blends, no 'natural flavors' masking chemicals. If we wouldn't eat it ourselves, it doesn't go in.",
  },
  {
    emoji: "🌿",
    title: "Clean by Design",
    desc: "We start with the ingredient list, not the flavor profile. Every product is formulated around what we remove — artificial colors, synthetic preservatives, HFCS, trans fats — not just what we add.",
  },
  {
    emoji: "⚡",
    title: "Science-Backed",
    desc: "Our ingredient scanner scores over 80 harmful additives based on peer-reviewed research, EFSA assessments, and IARC classifications. We follow the evidence, not the marketing.",
  },
  {
    emoji: "🇱🇹",
    title: "Built in Lithuania",
    desc: "We're a Lithuanian brand with a European mindset — strict ingredient standards, local sourcing where possible, and a belief that the food industry can do better.",
  },
];

const team = [
  { name: "Founder", role: "Vision & Product", emoji: "👑" },
  { name: "Formulation", role: "Ingredient Science", emoji: "🧪" },
  { name: "Design", role: "Brand & Experience", emoji: "✦" },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#0b1220] text-[#f0eee8]">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-40 bg-[#0b1220]/80 backdrop-blur-md border-b border-[#f0c855]/10">
        <div className="flex items-center justify-between px-6 py-4 max-w-5xl mx-auto">
          <Link href="/" className="flex items-center gap-2 text-[#f0c855] font-black text-lg tracking-tight">
            <span>✦</span> HolySnacks
          </Link>
          <Link href="/" className="text-sm text-white/40 hover:text-white/80 transition-colors flex items-center gap-2">
            ← {`Back to home`}
          </Link>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 pt-32 pb-24">

        {/* Hero */}
        <div className="mb-20 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold tracking-widest uppercase mb-8"
            style={{ background: "rgba(240,200,85,0.08)", border: "1px solid rgba(240,200,85,0.2)", color: "#f0c855" }}>
            Our Story
          </div>
          <h1 className="font-[var(--font-playfair)] text-5xl md:text-6xl font-black text-white mb-6 leading-tight">
            We got tired of reading<br />
            <span style={{ color: "#f0c855" }}>labels full of lies.</span>
          </h1>
          <p className="text-lg text-white/50 max-w-2xl mx-auto leading-relaxed">
            HolySnacks was born out of frustration. Every "healthy" snack on supermarket shelves
            hid something — artificial colors, synthetic preservatives, high-fructose corn syrup
            dressed up with clean-sounding names. We decided to build the alternative.
          </p>
        </div>

        {/* Mission block */}
        <div className="rounded-3xl p-8 md:p-12 mb-16"
          style={{ background: "rgba(240,200,85,0.05)", border: "1px solid rgba(240,200,85,0.15)" }}>
          <div className="text-[10px] font-bold tracking-widest uppercase text-[#f0c855]/60 mb-4">Our Mission</div>
          <p className="text-2xl md:text-3xl font-[var(--font-playfair)] font-bold text-white leading-relaxed">
            "Make it effortless to choose food that's genuinely good for you — and make junk food
            impossible to hide behind clever marketing."
          </p>
        </div>

        {/* Values */}
        <div className="mb-16">
          <h2 className="font-[var(--font-playfair)] text-3xl font-black text-white mb-8">What we stand for</h2>
          <div className="grid md:grid-cols-2 gap-5">
            {values.map((v) => (
              <div key={v.title} className="rounded-2xl p-6"
                style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
                <div className="text-3xl mb-3">{v.emoji}</div>
                <div className="font-bold text-white text-lg mb-2">{v.title}</div>
                <p className="text-white/50 text-sm leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Ingredient scanner callout */}
        <div className="rounded-3xl p-8 mb-16 text-center"
          style={{ background: "linear-gradient(135deg, rgba(99,102,241,0.08), rgba(129,140,248,0.04))", border: "1px solid rgba(99,102,241,0.2)" }}>
          <div className="text-4xl mb-4">🔍</div>
          <h2 className="font-[var(--font-playfair)] text-2xl font-black text-white mb-3">
            The Ingredient Scanner
          </h2>
          <p className="text-white/50 text-sm leading-relaxed max-w-xl mx-auto mb-6">
            We built a free tool that scans any product's ingredients and scores them on a 1000-point
            purity scale — covering 80+ harmful additives across sugars, synthetic colors, preservatives,
            trans fats, and more. 4 million+ products searchable. No account needed.
          </p>
          <Link href="/#scanner"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-bold text-sm text-[#0b1220] hover:opacity-90 transition-opacity"
            style={{ background: "linear-gradient(to right, #d4a830, #fad55c)" }}>
            Try the scanner →
          </Link>
        </div>

        {/* Team */}
        <div className="mb-16">
          <h2 className="font-[var(--font-playfair)] text-3xl font-black text-white mb-8">The team</h2>
          <div className="grid grid-cols-3 gap-4">
            {team.map((m) => (
              <div key={m.name} className="rounded-2xl p-6 text-center"
                style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
                <div className="text-4xl mb-3">{m.emoji}</div>
                <div className="font-bold text-white">{m.name}</div>
                <div className="text-xs text-white/35 mt-1">{m.role}</div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <Link href="/contact"
            className="inline-flex items-center gap-2 text-sm text-white/40 hover:text-white/70 transition-colors border border-white/10 hover:border-white/20 px-6 py-3 rounded-full">
            Get in touch →
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 text-center text-xs text-white/20">
        <p>© 2025 HolySnacks. All rights reserved.</p>
        <div className="flex justify-center gap-6 mt-3">
          <Link href="/privacy" className="hover:text-white/50 transition-colors">Privacy Policy</Link>
          <Link href="/terms" className="hover:text-white/50 transition-colors">Terms of Service</Link>
          <Link href="/contact" className="hover:text-white/50 transition-colors">Contact</Link>
        </div>
      </footer>
    </div>
  );
}
