"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function GenerateNowButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function trigger() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/generate", { method: "POST" });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || "Génération échouée");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-3">
      <button
        onClick={trigger}
        disabled={busy}
        className="rounded-2xl bg-gradient-to-br from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 disabled:from-zinc-800 disabled:to-zinc-900 disabled:text-zinc-500 px-6 py-4 text-sm font-bold text-black transition-all shadow-lg shadow-amber-500/20"
      >
        {busy ? (
          <span className="inline-flex items-center gap-2">
            <span className="inline-block w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
            Génération en cours… (~50s)
          </span>
        ) : (
          <>⚡ Générer le batch maintenant</>
        )}
      </button>
      {error && (
        <div className="rounded-xl border border-rose-500/30 bg-rose-500/5 px-4 py-3 text-sm text-rose-300">
          ❌ {error}
        </div>
      )}
    </div>
  );
}
