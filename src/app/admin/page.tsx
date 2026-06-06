"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";
import Link from "next/link";

const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL ?? "dsvykas@gmail.com";

type MissedSearch = {
  id: string;
  query: string;
  search_count: number;
  research_status: string;
  status: string | null;
  last_searched_at: string;
};

type UserSubmission = {
  id: string;
  query: string;
  brand: string | null;
  ingredients_text: string;
  submitted_by: string | null;
  created_at: string;
};

type Tab = "missed" | "submissions" | "newsletter";

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    pending: "bg-yellow-500/20 text-yellow-400",
    researching: "bg-blue-500/20 text-blue-400",
    found: "bg-green-500/20 text-green-400",
    not_found: "bg-red-500/20 text-red-400",
    submitted: "bg-purple-500/20 text-purple-400",
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${colors[status] ?? "bg-white/10 text-white/60"}`}>
      {status}
    </span>
  );
}

export default function AdminPage() {
  const [user, setUser] = useState<User | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [tab, setTab] = useState<Tab>("missed");

  const [missed, setMissed] = useState<MissedSearch[]>([]);
  const [submissions, setSubmissions] = useState<UserSubmission[]>([]);
  const [subscriberCount, setSubscriberCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [approving, setApproving]   = useState<string | null>(null);
  const [resolving, setResolving]   = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      setAuthChecked(true);
    });
  }, []);

  useEffect(() => {
    if (!user || user.email !== ADMIN_EMAIL) return;
    loadData();
  }, [user]);

  async function loadData() {
    setLoading(true);
    const supabase = createClient();

    const [missedRes, submissionsRes, countRes] = await Promise.all([
      supabase
        .from("missed_searches")
        .select("*")
        .order("search_count", { ascending: false })
        .limit(100),
      supabase
        .from("user_submissions")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50),
      supabase
        .from("newsletter_subscribers")
        .select("id", { count: "exact", head: true }),
    ]);

    setMissed(missedRes.data ?? []);
    setSubmissions(submissionsRes.data ?? []);
    setSubscriberCount(countRes.count ?? 0);
    setLoading(false);
  }

  async function resolveMissedSearch(m: MissedSearch) {
    setResolving(m.id);
    const supabase = createClient();
    await supabase.from("missed_searches").update({ status: "resolved" }).eq("id", m.id);
    setMissed(prev => prev.filter(r => r.id !== m.id));
    setResolving(null);
  }

  async function approveSubmission(sub: UserSubmission) {
    setApproving(sub.id);
    const supabase = createClient();

    await supabase.from("products_cache").upsert(
      {
        search_key: sub.query.toLowerCase().trim(),
        product_name: sub.query,
        brand: sub.brand ?? "",
        ingredients: sub.ingredients_text,
        source: "user_submission",
      },
      { onConflict: "search_key" }
    );

    await supabase
      .from("missed_searches")
      .update({ research_status: "found", status: "submitted" })
      .eq("query", sub.query.toLowerCase().trim());

    setSubmissions((prev) => prev.filter((s) => s.id !== sub.id));
    setApproving(null);
  }

  async function exportNewsletterCSV() {
    const supabase = createClient();
    const { data } = await supabase
      .from("newsletter_subscribers")
      .select("email, subscribed_at")
      .order("subscribed_at", { ascending: false });

    if (!data) return;
    const csv = ["email,subscribed_at", ...data.map((r) => `${r.email},${r.subscribed_at}`)].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "newsletter-subscribers.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  if (!authChecked) {
    return (
      <div className="min-h-screen bg-[#0b1220] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#f0c855] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user || user.email !== ADMIN_EMAIL) {
    return (
      <div className="min-h-screen bg-[#0b1220] flex flex-col items-center justify-center gap-4 text-center px-4">
        <div className="text-5xl">🚫</div>
        <h1 className="text-2xl font-bold text-[#f5f0eb]">Access Denied</h1>
        <p className="text-[#f5f0eb]/50">This page is restricted to HolySnacks admins.</p>
        <Link href="/" className="text-[#f0c855] underline text-sm">← Back to HolySnacks</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b1220] text-[#f5f0eb] px-4 py-10 max-w-5xl mx-auto">
      <div className="mb-8">
        <Link href="/" className="text-[#f0c855]/70 hover:text-[#f0c855] text-sm mb-2 block">← Back to HolySnacks</Link>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white/5 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-[#f0c855]">{missed.length}</p>
          <p className="text-sm text-[#f5f0eb]/50 mt-1">Missed Searches</p>
        </div>
        <div className="bg-white/5 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-[#f0c855]">{submissions.length}</p>
          <p className="text-sm text-[#f5f0eb]/50 mt-1">Pending Submissions</p>
        </div>
        <div className="bg-white/5 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-[#f0c855]">{subscriberCount ?? "—"}</p>
          <p className="text-sm text-[#f5f0eb]/50 mt-1">Newsletter Subscribers</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {(["missed", "submissions", "newsletter"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              tab === t ? "bg-[#f0c855] text-[#0b1220]" : "border border-white/20 text-[#f5f0eb]/70 hover:border-white/40"
            }`}
          >
            {t === "missed" ? "Missed Searches" : t === "submissions" ? "User Submissions" : "Newsletter"}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-2 border-[#f0c855] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {/* Missed Searches */}
          {tab === "missed" && (
            <div className="space-y-2">
              {missed.length === 0 && <p className="text-center text-[#f5f0eb]/40 py-10">No missed searches.</p>}
              {missed.map((m) => (
                <div key={m.id} className="flex items-center gap-3 p-3 bg-white/5 rounded-xl">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{m.query}</p>
                    <p className="text-xs text-[#f5f0eb]/40">{new Date(m.last_searched_at).toLocaleDateString()}</p>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className="text-sm text-[#f5f0eb]/60">{m.search_count}×</span>
                    <StatusBadge status={m.status ?? m.research_status} />
                    <button
                      onClick={() => resolveMissedSearch(m)}
                      disabled={resolving === m.id}
                      className="px-2.5 py-1 bg-white/8 text-[#f5f0eb]/50 rounded-lg text-xs font-medium hover:bg-white/15 hover:text-[#f5f0eb] transition-colors disabled:opacity-30"
                    >
                      {resolving === m.id ? "…" : "✓ Resolve"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* User Submissions */}
          {tab === "submissions" && (
            <div className="space-y-3">
              {submissions.length === 0 && <p className="text-center text-[#f5f0eb]/40 py-10">No pending submissions.</p>}
              {submissions.map((s) => (
                <div key={s.id} className="p-4 bg-white/5 rounded-xl">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium">{s.query}{s.brand ? ` — ${s.brand}` : ""}</p>
                      <p className="text-xs text-[#f5f0eb]/40 mt-0.5">{new Date(s.created_at).toLocaleDateString()}</p>
                      <p className="text-sm text-[#f5f0eb]/60 mt-2 line-clamp-2">{s.ingredients_text}</p>
                    </div>
                    <button
                      onClick={() => approveSubmission(s)}
                      disabled={approving === s.id}
                      className="px-3 py-1.5 bg-green-500/20 text-green-400 rounded-lg text-sm font-medium hover:bg-green-500/30 transition-colors disabled:opacity-50 flex-shrink-0"
                    >
                      {approving === s.id ? "…" : "Approve"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Newsletter */}
          {tab === "newsletter" && (
            <div className="text-center py-12">
              <p className="text-5xl mb-4">📬</p>
              <p className="text-xl font-bold mb-2">{subscriberCount} subscriber{subscriberCount !== 1 ? "s" : ""}</p>
              <p className="text-[#f5f0eb]/50 mb-6 text-sm">Export to send campaigns with your email provider.</p>
              <button
                onClick={exportNewsletterCSV}
                className="px-6 py-3 bg-[#f0c855] text-[#0b1220] font-bold rounded-full hover:bg-[#f0c855]/90 transition-colors"
              >
                ⬇ Export Subscriber CSV
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
