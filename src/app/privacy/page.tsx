import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "HolySnacks Privacy Policy — how we collect, use, and protect your data.",
};

const sections = [
  {
    title: "1. Information We Collect",
    content: `We collect information you provide directly, such as your name, email address, and password when you create an account. If you sign in with Google, we receive your name, email, and profile picture from Google.\n\nWe also automatically collect usage data such as pages visited, products scanned, and interaction patterns to improve our service. We do not sell your personal data.`,
  },
  {
    title: "2. How We Use Your Information",
    content: `We use your information to:\n• Provide and improve the HolySnacks platform and ingredient scanner\n• Track your XP progress, level, and scan history\n• Send transactional emails (account verification, password reset)\n• Respond to your support requests\n• Analyse usage patterns to improve the product\n\nWe do not use your data for advertising profiling or sell it to third parties.`,
  },
  {
    title: "3. Data Storage & Security",
    content: `Your data is stored securely using Supabase (PostgreSQL), hosted in the EU. We implement industry-standard security measures including encryption at rest and in transit, Row Level Security (RLS) ensuring users can only access their own data, and secure authentication via Supabase Auth.\n\nWe retain your data as long as your account is active. You may request deletion at any time.`,
  },
  {
    title: "4. Cookies",
    content: `We use only essential cookies required for authentication and session management. We do not use tracking cookies, advertising cookies, or third-party analytics cookies.\n\nYour authentication session is stored in a secure, httpOnly cookie that expires after 7 days of inactivity.`,
  },
  {
    title: "5. Third-Party Services",
    content: `We use the following third-party services:\n• Supabase — authentication and database (EU-hosted)\n• Google OAuth — optional sign-in method\n• Open Food Facts — ingredient data lookup (no personal data shared)\n\nEach service operates under its own privacy policy.`,
  },
  {
    title: "6. Your Rights (GDPR)",
    content: `As a user in the EU/EEA, you have the right to:\n• Access your personal data\n• Correct inaccurate data\n• Request deletion of your account and data\n• Export your data in a portable format\n• Withdraw consent at any time\n\nTo exercise these rights, contact us at privacy@holysnacks.com or use the account deletion option in your profile.`,
  },
  {
    title: "7. Changes to This Policy",
    content: `We may update this Privacy Policy from time to time. We will notify you of significant changes via email or a prominent notice on the platform. The date at the top of this page reflects the most recent update.`,
  },
];

export default function PrivacyPage() {
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
          <h1 className="font-[var(--font-playfair)] text-4xl font-black text-white mb-3">Privacy Policy</h1>
          <p className="text-white/35 text-sm">Last updated: May 2025</p>
        </div>

        <div className="rounded-2xl p-6 mb-10 text-sm text-white/60 leading-relaxed"
          style={{ background: "rgba(240,200,85,0.05)", border: "1px solid rgba(240,200,85,0.12)" }}>
          HolySnacks (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;) is committed to protecting your privacy. This policy explains
          what data we collect, why we collect it, and how we keep it safe. We are GDPR-compliant
          and take your privacy seriously.
        </div>

        <div className="space-y-8">
          {sections.map((s) => (
            <div key={s.title} className="rounded-2xl p-6"
              style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
              <h2 className="font-bold text-white text-lg mb-4">{s.title}</h2>
              <div className="text-white/50 text-sm leading-relaxed whitespace-pre-line">{s.content}</div>
            </div>
          ))}
        </div>

        <div className="mt-10 rounded-2xl p-6 text-center"
          style={{ background: "rgba(99,102,241,0.06)", border: "1px solid rgba(99,102,241,0.15)" }}>
          <p className="text-white/50 text-sm mb-3">Questions about your privacy?</p>
          <Link href="/contact" className="text-[#818cf8] hover:text-white font-bold text-sm transition-colors">
            Contact us →
          </Link>
        </div>
      </div>

      <footer className="border-t border-white/5 py-8 text-center text-xs text-white/20">
        <p>© 2025 HolySnacks. All rights reserved.</p>
        <div className="flex justify-center gap-6 mt-3">
          <Link href="/terms" className="hover:text-white/50 transition-colors">Terms of Service</Link>
          <Link href="/about" className="hover:text-white/50 transition-colors">About</Link>
          <Link href="/contact" className="hover:text-white/50 transition-colors">Contact</Link>
        </div>
      </footer>
    </div>
  );
}
