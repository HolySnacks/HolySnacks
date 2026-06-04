"use client";

import { useState } from "react";
import { useInView } from "@/lib/hooks";
import { T } from "@/lib/translations";

export function NewsletterSection({ lang }: { lang: "en" | "lt" }) {
  const anim = useInView(0.05);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");

  const t = {
    en: { title: "Join the Chosen.", sub: "New flavours. Exclusive drops. Early access. No spam.", placeholder: "your@email.com", cta: "✦ Join the Movement", done: "You're in! ✦ Watch your inbox.", err: "Something went wrong — try again." },
    lt: { title: "Prisijunk prie išrinktųjų.", sub: "Nauji skoniai. Išskirtiniai leidimai. Ankstyva prieiga.", placeholder: "tavo@el.pastas.lt", cta: "✦ Prisijungti", done: "Prisijungta! ✦ Laukite žinučių.", err: "Klaida — bandykite dar kartą." },
  }[lang];

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || status === "sending") return;
    setStatus("sending");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setStatus(res.ok ? "done" : "error");
    } catch { setStatus("error"); }
  }

  return (
    <section className="px-6 py-16 max-w-2xl mx-auto text-center">
      <div ref={anim.ref} className={`transition-all duration-700 ${anim.inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
        <span className="text-[#f0c855]/60 text-xs tracking-widest uppercase mb-4 block">✦ ✦ ✦</span>
        <h2 className="font-[var(--font-playfair)] text-4xl md:text-5xl font-bold mb-4">{t.title}</h2>
        <p className="text-white/55 text-lg mb-10">{t.sub}</p>
        {status === "done" ? (
          <p className="text-[#f0c855] font-semibold text-lg">{t.done}</p>
        ) : (
          <>
            <form className="flex flex-col sm:flex-row gap-3" onSubmit={submit}>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                placeholder={t.placeholder}
                className="flex-1 px-5 py-3.5 rounded-full bg-white/[0.04] border border-[#f0c855]/15 text-white placeholder-white/25 focus:outline-none focus:border-[#f0c855]/40 transition-colors text-sm" />
              <button type="submit" disabled={status === "sending"}
                className="px-6 py-3.5 rounded-full font-bold text-sm hover:opacity-90 transition-opacity whitespace-nowrap text-[#0b1220] disabled:opacity-50"
                style={{ background: "linear-gradient(to right, #d4a830, #fad55c)" }}>
                {status === "sending" ? "…" : t.cta}
              </button>
            </form>
            {status === "error" && <p className="text-red-400 text-sm mt-3">{t.err}</p>}
          </>
        )}
      </div>
    </section>
  );
}
