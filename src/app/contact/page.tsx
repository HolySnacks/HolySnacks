"use client";

import { useState } from "react";
import Link from "next/link";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", subject: "general", message: "" });
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    // Simulate send (replace with real email API — Resend, Formspree, etc.)
    await new Promise(r => setTimeout(r, 1200));
    setSent(true);
    setSending(false);
  }

  const subjects = [
    { value: "general",     label: "General question" },
    { value: "scanner",     label: "Ingredient Scanner" },
    { value: "products",    label: "Products & orders" },
    { value: "partnership", label: "Partnership / Press" },
    { value: "bug",         label: "Bug report" },
  ];

  const contacts = [
    { emoji: "📧", label: "Email", value: "hello@holysnacks.com", href: "mailto:hello@holysnacks.com" },
    { emoji: "📍", label: "Location", value: "Vilnius, Lithuania", href: null },
    { emoji: "⏱️", label: "Response time", value: "Within 24 hours", href: null },
  ];

  return (
    <div className="min-h-screen bg-[#0b1220] text-[#f0eee8]">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-40 bg-[#0b1220]/80 backdrop-blur-md border-b border-[#f0c855]/10">
        <div className="flex items-center justify-between px-6 py-4 max-w-5xl mx-auto">
          <Link href="/" className="flex items-center gap-2 text-[#f0c855] font-black text-lg tracking-tight">
            <span>✦</span> HolySnacks
          </Link>
          <Link href="/" className="text-sm text-white/40 hover:text-white/80 transition-colors">
            ← Back to home
          </Link>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 pt-32 pb-24">
        <div className="mb-12 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold tracking-widest uppercase mb-6"
            style={{ background: "rgba(240,200,85,0.08)", border: "1px solid rgba(240,200,85,0.2)", color: "#f0c855" }}>
            Get in Touch
          </div>
          <h1 className="font-[var(--font-playfair)] text-5xl font-black text-white mb-4">
            We&apos;d love to hear from you
          </h1>
          <p className="text-white/45 text-lg max-w-xl mx-auto">
            Questions, feedback, press enquiries, or just saying hi — we read every message.
          </p>
        </div>

        <div className="grid md:grid-cols-5 gap-8">
          {/* Contact info */}
          <div className="md:col-span-2 space-y-4">
            {contacts.map((c) => (
              <div key={c.label} className="rounded-2xl p-5"
                style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
                <div className="text-2xl mb-2">{c.emoji}</div>
                <div className="text-xs text-white/35 uppercase tracking-widest font-bold mb-1">{c.label}</div>
                {c.href
                  ? <a href={c.href} className="text-[#f0c855]/80 hover:text-[#f0c855] transition-colors text-sm font-medium">{c.value}</a>
                  : <div className="text-white/70 text-sm">{c.value}</div>}
              </div>
            ))}

            <div className="rounded-2xl p-5"
              style={{ background: "rgba(99,102,241,0.06)", border: "1px solid rgba(99,102,241,0.2)" }}>
              <div className="text-2xl mb-2">🔍</div>
              <div className="text-xs text-white/35 uppercase tracking-widest font-bold mb-2">Ingredient Scanner</div>
              <p className="text-white/50 text-xs leading-relaxed mb-3">
                Found a product missing from our database? Let us know and we'll add it.
              </p>
              <Link href="/#scanner" className="text-[#818cf8] text-xs font-bold hover:text-white transition-colors">
                Open Scanner →
              </Link>
            </div>
          </div>

          {/* Form */}
          <div className="md:col-span-3">
            {sent ? (
              <div className="rounded-3xl p-12 text-center h-full flex flex-col items-center justify-center"
                style={{ background: "rgba(34,197,94,0.06)", border: "1px solid rgba(34,197,94,0.2)" }}>
                <div className="text-5xl mb-4">✦</div>
                <h2 className="font-[var(--font-playfair)] text-2xl font-black text-white mb-3">Message sent!</h2>
                <p className="text-white/50 text-sm mb-6">We'll get back to you within 24 hours.</p>
                <button onClick={() => { setSent(false); setForm({ name: "", email: "", subject: "general", message: "" }); }}
                  className="text-sm text-white/40 hover:text-white/70 transition-colors border border-white/10 px-5 py-2 rounded-full">
                  Send another
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="rounded-3xl p-8 space-y-4"
                style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)" }}>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold tracking-widest uppercase text-white/30 block mb-2">Name</label>
                    <input type="text" required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                      placeholder="Your name"
                      className="w-full px-4 py-3 rounded-xl text-sm bg-white/5 border border-white/10 text-white placeholder-white/20 outline-none focus:border-[#f0c855]/40 transition-colors" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold tracking-widest uppercase text-white/30 block mb-2">Email</label>
                    <input type="email" required value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                      placeholder="your@email.com"
                      className="w-full px-4 py-3 rounded-xl text-sm bg-white/5 border border-white/10 text-white placeholder-white/20 outline-none focus:border-[#f0c855]/40 transition-colors" />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold tracking-widest uppercase text-white/30 block mb-2">Subject</label>
                  <select value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl text-sm bg-[#0d1525] border border-white/10 text-white/80 outline-none focus:border-[#f0c855]/40 transition-colors">
                    {subjects.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold tracking-widest uppercase text-white/30 block mb-2">Message</label>
                  <textarea required value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                    placeholder="Tell us what's on your mind..."
                    rows={6}
                    className="w-full px-4 py-3 rounded-xl text-sm bg-white/5 border border-white/10 text-white placeholder-white/20 outline-none focus:border-[#f0c855]/40 transition-colors resize-none" />
                </div>

                <button type="submit" disabled={sending}
                  className="w-full py-3.5 rounded-2xl font-bold text-sm transition-all hover:opacity-90 disabled:opacity-50 text-[#0b1220]"
                  style={{ background: "linear-gradient(to right, #d4a830, #fad55c)" }}>
                  {sending ? "Sending…" : "✦ Send Message"}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      <footer className="border-t border-white/5 py-8 text-center text-xs text-white/20">
        <p>© 2025 HolySnacks. All rights reserved.</p>
        <div className="flex justify-center gap-6 mt-3">
          <Link href="/privacy" className="hover:text-white/50 transition-colors">Privacy Policy</Link>
          <Link href="/terms" className="hover:text-white/50 transition-colors">Terms of Service</Link>
          <Link href="/about" className="hover:text-white/50 transition-colors">About</Link>
        </div>
      </footer>
    </div>
  );
}
