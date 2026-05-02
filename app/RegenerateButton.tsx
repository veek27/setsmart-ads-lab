"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegenerateButton({ date }: { date: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function regenerate() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/regenerate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date }),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || "Échec");
      setConfirming(false);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  if (confirming) {
    return (
      <div className="inline-flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/5 px-3 py-2">
        <span className="text-xs text-rose-300 font-semibold">
          Sûr ? Le batch actuel + tes feedbacks sont supprimés
        </span>
        <button
          onClick={regenerate}
          disabled={busy}
          className="rounded-lg bg-rose-500 hover:bg-rose-400 disabled:bg-zinc-700 px-3 py-1 text-xs font-bold text-white transition-colors"
        >
          {busy ? "…" : "Oui, regénérer"}
        </button>
        <button
          onClick={() => setConfirming(false)}
          disabled={busy}
          className="text-xs text-zinc-500 hover:text-zinc-300 underline-offset-2 hover:underline"
        >
          Annuler
        </button>
        {error && (
          <span className="text-xs text-rose-400 ml-2">{error}</span>
        )}
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-800 hover:border-amber-400/40 hover:bg-amber-400/5 px-3 py-1.5 text-xs font-semibold text-zinc-400 hover:text-amber-300 transition-colors"
      title="Supprime le batch et regénère 10 nouveaux concepts"
    >
      <span>🔄</span>
      <span>Regénérer le batch</span>
    </button>
  );
}
