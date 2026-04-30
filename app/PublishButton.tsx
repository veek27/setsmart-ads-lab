"use client";

import { useState } from "react";

type Result = {
  ok: boolean;
  links?: { batch: string; fr: string; en: string };
  filesUploaded?: number;
  error?: string;
};

export default function PublishButton({
  validatedCount,
}: {
  validatedCount: number;
}) {
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<Result | null>(null);

  async function publish() {
    if (validatedCount === 0) return;
    setBusy(true);
    setResult(null);
    try {
      const res = await fetch("/api/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "{}",
      });
      const data = await res.json();
      setResult(data);
    } catch (e) {
      setResult({
        ok: false,
        error: e instanceof Error ? e.message : String(e),
      });
    } finally {
      setBusy(false);
    }
  }

  if (validatedCount === 0) {
    return (
      <button
        disabled
        className="rounded-2xl border border-zinc-800 bg-zinc-900/40 px-6 py-4 text-sm font-bold text-zinc-600 cursor-not-allowed"
      >
        Aucune ad validée à publier
      </button>
    );
  }

  if (result?.ok && result.links) {
    return (
      <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-5 space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">🎉</span>
          <span className="text-sm font-bold text-emerald-300">
            {result.filesUploaded} fichiers uploadés sur Drive
          </span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <a
            href={result.links.batch}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-xl border border-zinc-700 bg-black/40 hover:bg-black/60 hover:border-zinc-500 px-3 py-3 text-center transition-colors"
          >
            <div className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold mb-1">
              Dossier batch
            </div>
            <div className="text-xs text-zinc-200 font-semibold">→ Ouvrir</div>
          </a>
          <a
            href={result.links.fr}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-xl border border-amber-500/40 bg-amber-500/5 hover:bg-amber-500/10 px-3 py-3 text-center transition-colors"
          >
            <div className="text-[10px] uppercase tracking-wider text-amber-400 font-bold mb-1">
              🇫🇷 Pack FR
            </div>
            <div className="text-xs text-zinc-200 font-semibold">→ Ouvrir</div>
          </a>
          <a
            href={result.links.en}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-xl border border-sky-500/40 bg-sky-500/5 hover:bg-sky-500/10 px-3 py-3 text-center transition-colors"
          >
            <div className="text-[10px] uppercase tracking-wider text-sky-400 font-bold mb-1">
              🇬🇧 Pack EN
            </div>
            <div className="text-xs text-zinc-200 font-semibold">→ Ouvrir</div>
          </a>
        </div>
        <button
          onClick={() => setResult(null)}
          className="text-xs text-zinc-500 hover:text-zinc-300 underline"
        >
          Re-publier
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <button
        onClick={publish}
        disabled={busy}
        className="w-full rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-500 hover:from-emerald-300 hover:to-emerald-400 disabled:from-zinc-800 disabled:to-zinc-900 disabled:text-zinc-500 px-6 py-5 text-base font-black text-black transition-all shadow-lg shadow-emerald-500/20"
      >
        {busy ? (
          <span className="inline-flex items-center gap-2">
            <span className="inline-block w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
            Publication en cours… ({validatedCount}×2 fichiers)
          </span>
        ) : (
          <>
            🚀 Publier {validatedCount} ad{validatedCount > 1 ? "s" : ""}{" "}
            validée{validatedCount > 1 ? "s" : ""} sur Drive
          </>
        )}
      </button>
      {result && !result.ok && (
        <div className="rounded-xl border border-rose-500/30 bg-rose-500/5 px-4 py-3 text-sm text-rose-300">
          ❌ {result.error}
        </div>
      )}
    </div>
  );
}
