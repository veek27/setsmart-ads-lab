"use client";

import { useState } from "react";

type Result = {
  ok: boolean;
  links?: { fr: string; en: string };
  filesGenerated?: number;
  adsCount?: number;
  batchDate?: string;
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

  function downloadZip(url: string, lang: "fr" | "en", date?: string) {
    const a = document.createElement("a");
    a.href = url;
    a.download = `setsmart-ads-${date || "batch"}-${lang}.zip`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  if (validatedCount === 0) {
    return (
      <button
        disabled
        className="rounded-2xl border border-zinc-800 bg-zinc-900/40 px-6 py-4 text-sm font-bold text-zinc-600 cursor-not-allowed w-full"
      >
        Aucune ad validée à publier
      </button>
    );
  }

  if (result?.ok && result.links) {
    return (
      <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-5 space-y-4">
        <div className="flex items-center gap-2">
          <span className="text-xl">🎉</span>
          <div>
            <div className="text-sm font-bold text-emerald-300">
              {result.filesGenerated} PNG générés ({result.adsCount} ads)
            </div>
            <div className="text-xs text-zinc-500">
              Tes 2 archives sont prêtes
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => downloadZip(result.links!.fr, "fr", result.batchDate)}
            className="rounded-xl border border-amber-400/40 bg-amber-400/5 hover:bg-amber-400/15 hover:border-amber-300 px-4 py-4 text-center transition-colors group"
          >
            <div className="text-2xl mb-1">🇫🇷</div>
            <div className="text-sm font-bold text-amber-300">
              Pack FR
            </div>
            <div className="text-[10px] text-zinc-500 mt-1 group-hover:text-amber-200">
              Télécharger .zip
            </div>
          </button>
          <button
            onClick={() => downloadZip(result.links!.en, "en", result.batchDate)}
            className="rounded-xl border border-sky-400/40 bg-sky-400/5 hover:bg-sky-400/15 hover:border-sky-300 px-4 py-4 text-center transition-colors group"
          >
            <div className="text-2xl mb-1">🇬🇧</div>
            <div className="text-sm font-bold text-sky-300">
              Pack EN
            </div>
            <div className="text-[10px] text-zinc-500 mt-1 group-hover:text-sky-200">
              Télécharger .zip
            </div>
          </button>
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
            Génération PNG en cours… ({validatedCount}×2 fichiers, ~{validatedCount * 4}s)
          </span>
        ) : (
          <>
            🚀 Publier {validatedCount} ad{validatedCount > 1 ? "s" : ""}{" "}
            validée{validatedCount > 1 ? "s" : ""} → 2 ZIPs (FR + EN)
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
