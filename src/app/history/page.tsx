"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient, type ScanRecord } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";
import Link from "next/link";

const PAGE_SIZE = 20;

function gradeColor(grade: string | null) {
  if (!grade) return "#888";
  const g = grade.toLowerCase();
  if (g.startsWith("a")) return "#22c55e";
  if (g.startsWith("b")) return "#84cc16";
  if (g.startsWith("c")) return "#eab308";
  if (g.startsWith("d")) return "#f97316";
  return "#ef4444";
}

function scoreBar(score: number) {
  const pct = Math.min(100, Math.max(0, score / 10));
  const color = score >= 700 ? "#22c55e" : score >= 450 ? "#eab308" : "#ef4444";
  return (
    <div className="w-full bg-white/10 rounded-full h-1.5 mt-1">
      <div className="h-1.5 rounded-full" style={{ width: `${pct}%`, backgroundColor: color }} />
    </div>
  );
}

function downloadCSV(records: ScanRecord[]) {
  const header = ["Date", "Product", "Brand", "Score", "Grade", "XP Earned"];
  const rows = records.map((r) => [
    new Date(r.created_at).toLocaleDateString(),
    r.product_name,
    r.brand ?? "",
    r.score,
    r.grade ?? "",
    r.xp_earned,
  ]);
  const csv = [header, ...rows].map((row) => row.map(String).map((v) => `"${v.replace(/"/g, '""')}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "holysnacks-scan-history.csv";
  a.click();
  URL.revokeObjectURL(url);
}

export default function HistoryPage() {
  const [user, setUser] = useState<User | null>(null);
  const [records, setRecords] = useState<ScanRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);
  const [filter, setFilter] = useState<"all" | "good" | "bad">("all");

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      setAuthChecked(true);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const fetchRecords = useCallback(async (userId: string, pageNum: number, scoreFilter: typeof filter) => {
    setLoading(true);
    const supabase = createClient();

    let query = supabase
      .from("scan_records")
      .select("*", { count: "exact" })
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .range(pageNum * PAGE_SIZE, (pageNum + 1) * PAGE_SIZE - 1);

    if (scoreFilter === "good") query = query.gte("score", 700);
    if (scoreFilter === "bad") query = query.lt("score", 400);

    const { data, count } = await query;
    setRecords(data ?? []);
    setTotal(count ?? 0);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (user) fetchRecords(user.id, page, filter);
  }, [user, page, filter, fetchRecords]);

  const fetchAll = async (): Promise<ScanRecord[]> => {
    if (!user) return [];
    const supabase = createClient();
    const { data } = await supabase
      .from("scan_records")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    return data ?? [];
  };

  const handleExport = async () => {
    const all = await fetchAll();
    downloadCSV(all);
  };

  if (!authChecked) {
    return (
      <div className="min-h-screen bg-[#0b1220] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#f0c855] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#0b1220] flex flex-col items-center justify-center gap-6 px-4 text-center">
        <div className="text-5xl">🔒</div>
        <h1 className="text-2xl font-bold text-[#f5f0eb]">Sign in to see your scan history</h1>
        <p className="text-[#f5f0eb]/60 max-w-sm">Your scan history is saved to your account. Sign in to view all your past scans, filter by score, and export a CSV.</p>
        <Link href="/" className="px-6 py-3 bg-[#f0c855] text-[#0b1220] font-bold rounded-full hover:bg-[#f0c855]/90 transition-colors">
          Go to HolySnacks
        </Link>
      </div>
    );
  }

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="min-h-screen bg-[#0b1220] text-[#f5f0eb] px-4 py-10 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <Link href="/" className="text-[#f0c855]/70 hover:text-[#f0c855] text-sm mb-2 block">← Back to HolySnacks</Link>
          <h1 className="text-3xl font-bold">Scan History</h1>
          <p className="text-[#f5f0eb]/60 mt-1">{total} scans total</p>
        </div>
        <button
          onClick={handleExport}
          className="flex items-center gap-2 px-4 py-2 border border-[#f0c855]/40 text-[#f0c855] rounded-lg hover:bg-[#f0c855]/10 transition-colors text-sm font-medium"
        >
          <span>⬇</span> Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6">
        {(["all", "good", "bad"] as const).map((f) => (
          <button
            key={f}
            onClick={() => { setFilter(f); setPage(0); }}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              filter === f
                ? "bg-[#f0c855] text-[#0b1220]"
                : "border border-white/20 text-[#f5f0eb]/70 hover:border-white/40"
            }`}
          >
            {f === "all" ? "All" : f === "good" ? "✓ Clean (700+)" : "✗ Avoid (<400)"}
          </button>
        ))}
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-2 border-[#f0c855] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : records.length === 0 ? (
        <div className="text-center py-20 text-[#f5f0eb]/40">
          <div className="text-4xl mb-3">🔍</div>
          <p>No scans found{filter !== "all" ? " for this filter" : ""}.</p>
          {filter !== "all" && (
            <button onClick={() => setFilter("all")} className="mt-3 text-[#f0c855] underline text-sm">Clear filter</button>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {records.map((r) => (
            <div
              key={r.id}
              className="flex items-center gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/8 transition-colors"
            >
              {/* Grade badge */}
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 border-2"
                style={{ borderColor: gradeColor(r.grade), color: gradeColor(r.grade) }}
              >
                {r.grade ?? "?"}
              </div>

              {/* Product info */}
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{r.product_name}</p>
                {r.brand && <p className="text-[#f5f0eb]/50 text-sm truncate">{r.brand}</p>}
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-[#f5f0eb]/40">{new Date(r.created_at).toLocaleDateString()}</span>
                </div>
                {scoreBar(r.score)}
              </div>

              {/* Score + XP */}
              <div className="text-right flex-shrink-0">
                <p className="font-bold" style={{ color: gradeColor(r.grade) }}>{r.score}</p>
                <p className="text-xs text-[#f5f0eb]/40">/ 1000</p>
                <p className="text-xs text-[#f0c855] mt-1">+{r.xp_earned} XP</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 mt-8">
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            className="px-4 py-2 rounded-lg border border-white/20 text-sm disabled:opacity-30 hover:border-white/40 transition-colors"
          >
            ← Prev
          </button>
          <span className="text-sm text-[#f5f0eb]/60">
            Page {page + 1} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1}
            className="px-4 py-2 rounded-lg border border-white/20 text-sm disabled:opacity-30 hover:border-white/40 transition-colors"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
