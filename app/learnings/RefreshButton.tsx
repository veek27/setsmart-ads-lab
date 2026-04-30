"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RefreshButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<number | null>(null);

  async function refresh() {
    setBusy(true);
    setError(null);
    setDone(null);
    try {
      const res = await fetch("/api/learnings/extract", { method: "POST" });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || "Unknown error");
      setDone(data.count);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <button
        onClick={refresh}
        disabled={busy}
        className="rounded-xl bg-amber-400 hover:bg-amber-300 disabled:bg-zinc-800 disabled:text-zinc-500 px-4 py-2 text-sm font-bold text-black transition-colors"
      >
        {busy ? "🧠 Distillation…" : "🧠 Distiller la mémoire"}
      </button>
      {done !== null && (
        <div className="text-xs text-emerald-400">
          ✅ {done} règle{done > 1 ? "s" : ""} extraite{done > 1 ? "s" : ""}
        </div>
      )}
      {error && <div className="text-xs text-rose-400">❌ {error}</div>}
    </div>
  );
}
