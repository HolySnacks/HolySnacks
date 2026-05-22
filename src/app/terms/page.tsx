import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "HolySnacks Terms of Service — the rules and conditions for using our platform.",
};

const sections = [
  {
    title: "1. Acceptance of Terms",
    content: `By accessing or using HolySnacks (holysnacks.com), you agree to be bound by these Terms of Service. If you do not agree, please do not use our platform.\n\nThese terms apply to all visitors, users, and anyone who accesses or uses the service.`,
  },
  {
    title: "2. Use of the Platform",
    content: `HolySnacks provides an ingredient scanner, product discovery, and XP-based progress tracking. You agree to use the platform only for lawful purposes and in accordance with these terms.\n\nYou may not:\n• Use the platform in any way that violates applicable law\n• Attempt to gain unauthorised access to any part of the service\n• Use automated tools to scrape or overload the platform\n• Submit false or misleading information`,
  },
  {
    title: "3. User Accounts",
    content: `When you create an account, you are responsible for maintaining the security of your credentials. You agree to notify us immediately of any unauthorised use of your account.\n\nWe reserve the right to terminate accounts that violate these terms or engage in harmful behaviour.`,
  },
  {
    title: "4. Ingredient Scanner & Data Accuracy",
    content: `The ingredient scanner is provided for informational purposes only. Ingredient data is sourced from Open Food Facts, manufacturer labels, and our own research.\n\nWe make no warranty that the data is complete, accurate, or up to date. HolySnacks is not liable for health decisions made based on scanner results. Always consult the physical product label and a qualified professional for dietary advice.`,
  },
  {
    title: "5. XP, Levels & Rewards",
    content: `The XP and level system is a gamification feature for engagement purposes. XP balances have no monetary value and cannot be transferred, sold, or redeemed for cash.\n\nWe reserve the right to modify, suspend, or terminate the XP system at any time without notice.`,
  },
  {
    title: "6. Intellectual Property",
    content: `All content on HolySnacks — including text, graphics, logos, and software — is owned by HolySnacks or its licensors and is protected by copyright law.\n\nYou may not reproduce, distribute, or create derivative works without our explicit written permission.`,
  },
  {
    title: "7. Limitation of Liability",
    content: `To the fullest extent permitted by law, HolySnacks shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the platform.\n\nOur total liability to you for any claims arising from these terms shall not exceed €100 or the amount you paid us in the past 12 months, whichever is greater.`,
  },
  {
    title: "8. Changes to Terms",
    content: `We may update these Terms at any time. Continued use of the platform after changes constitutes acceptance of the new terms. We will notify registered users of significant changes via email.`,
  },
  {
    title: "9. Governing Law",
    content: `These Terms are governed by the laws of the Republic of Lithuania. Any disputes shall be resolved in the courts of Vilnius, Lithuania.`,
  },
];

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#0b1220] text-[#f0eee8]">
      <nav className="fixed top-0 left-0 right-0 z-40 bg-[#0b1220]/80 backdrop-blur-md border-b border-[#f0c855]/10">
        <div className="flex items-center justify-between px-6 py-4 max-w-4xl mx-auto">
          <Link href="/" className="flex items-center gap-2 text-[#f0c855] font-black text-lg tracking-tight">
            <span>✦</span> HolySnacks
          </Link>
          <Link href="/" className="text-sm text-white/40 hover:text-white/80 transition-colors">← Back to home</Link>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-6 pt-32 pb-24">
        <div className="mb-12">
          <div className="text-[10px] font-bold tracking-widest uppercase text-[#f0c855]/60 mb-4">Legal</div>
          <h1 className="font-[var(--font-playfair)] text-4xl font-black text-white mb-3">Terms of Service</h1>
          <p className="text-white/35 text-sm">Last updated: May 2025</p>
        </div>

        <div className="space-y-6">
          {sections.map((s) => (
            <div key={s.title} className="rounded-2xl p-6"
              style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
              <h2 className="font-bold text-white text-lg mb-3">{s.title}</h2>
              <div className="text-white/50 text-sm leading-relaxed whitespace-pre-line">{s.content}</div>
            </div>
          ))}
        </div>

        <div className="mt-10 rounded-2xl p-6 text-center"
          style={{ background: "rgba(99,102,241,0.06)", border: "1px solid rgba(99,102,241,0.15)" }}>
          <p className="text-white/50 text-sm mb-3">Questions about these terms?</p>
          <Link href="/contact" className="text-[#818cf8] hover:text-white font-bold text-sm transition-colors">Contact us →</Link>
        </div>
      </div>

      <footer className="border-t border-white/5 py-8 text-center text-xs text-white/20">
        <p>© 2025 HolySnacks. All rights reserved.</p>
        <div className="flex justify-center gap-6 mt-3">
          <Link href="/privacy" className="hover:text-white/50 transition-colors">Privacy Policy</Link>
          <Link href="/about" className="hover:text-white/50 transition-colors">About</Link>
          <Link href="/contact" className="hover:text-white/50 transition-colors">Contact</Link>
        </div>
      </footer>
    </div>
  );
}
