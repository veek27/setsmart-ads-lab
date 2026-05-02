"use client";

import { useState } from "react";

type Result = {
  ok: boolean;
  links?: { share: string; fr: string; en: string };
  filesGenerated?: number;
  adsCount?: number;
  batchDate?: string;
  error?: string;
};

export default function PublishButton({
  validatedCount,
  batchId,
}: {
  validatedCount: number;
  batchId: string;
}) {
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [copied, setCopied] = useState(false);

  async function publish() {
    if (validatedCount === 0) return;
    setBusy(true);
    setResult(null);
    try {
      const res = await fetch("/api/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ batchId }),
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

  async function copyShareLink(url: string) {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  if (validatedCount === 0) {
    return (
      <div className="rounded-xl border border-zinc-900 bg-zinc-950/60 px-5 py-3 text-xs text-zinc-600 inline-flex items-center gap-2">
        <span className="w-1 h-1 rounded-full bg-zinc-700" />
        Aucune ad validée
      </div>
    );
  }

  if (result?.ok && result.links) {
    return (
      <div className="rounded-2xl border border-zinc-800 bg-gradient-to-b from-zinc-950 to-black overflow-hidden">
        {/* Top thin amber bar */}
        <div className="h-px bg-gradient-to-r from-transparent via-amber-400/60 to-transparent" />

        <div className="p-5 space-y-5">
          {/* Status */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-400/10 border border-emerald-400/30 flex items-center justify-center">
                <span className="text-emerald-400 text-sm font-black">✓</span>
              </div>
              <div>
                <div className="text-sm font-bold text-zinc-100">
                  Pack publié
                </div>
                <div className="text-[11px] text-zinc-500">
                  {result.filesGenerated} créatives ·{" "}
                  {result.adsCount} ads × FR + EN
                </div>
              </div>
            </div>
            <button
              onClick={() => setResult(null)}
              className="text-[11px] text-zinc-500 hover:text-zinc-300 underline-offset-2 hover:underline transition-colors"
            >
              Re-publier
            </button>
          </div>

          {/* Share link — hero */}
          <div>
            <div className="text-[10px] uppercase tracking-[0.18em] text-amber-400/80 font-bold mb-2.5">
              Lien à partager
            </div>
            <div className="flex items-center gap-1.5 rounded-xl bg-black border border-zinc-800 p-1.5 shadow-inner">
              <input
                readOnly
                value={result.links.share}
                onClick={(e) => (e.target as HTMLInputElement).select()}
                className="flex-1 bg-transparent px-2.5 py-1.5 text-xs text-zinc-300 font-mono focus:outline-none truncate"
              />
              <button
                onClick={() => copyShareLink(result.links!.share)}
                className="rounded-lg bg-amber-400 hover:bg-amber-300 px-3 py-1.5 text-[11px] font-bold text-black transition-all whitespace-nowrap"
              >
                {copied ? "✓ Copié" : "Copier"}
              </button>
              <a
                href={result.links.share}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg bg-zinc-900 hover:bg-zinc-800 px-3 py-1.5 text-[11px] font-bold text-zinc-300 hover:text-white transition-colors whitespace-nowrap"
              >
                Ouvrir ↗
              </a>
            </div>
            <div className="text-[10px] text-zinc-600 mt-2 leading-relaxed">
              Le destinataire pourra browser les visuels, sélectionner ce
              qu&apos;il veut et télécharger en lot.
            </div>
          </div>

          {/* Direct download chips */}
          <div className="flex items-center gap-2 pt-1">
            <span className="text-[10px] uppercase tracking-[0.18em] text-zinc-600 font-bold mr-1">
              ou direct
            </span>
            <button
              onClick={() =>
                downloadZip(result.links!.fr, "fr", result.batchDate)
              }
              className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-zinc-400 hover:text-amber-300 hover:bg-amber-400/5 border border-zinc-800 hover:border-amber-400/30 rounded-lg px-2.5 py-1.5 transition-all"
            >
              🇫🇷 FR.zip
            </button>
            <button
              onClick={() =>
                downloadZip(result.links!.en, "en", result.batchDate)
              }
              className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-zinc-400 hover:text-sky-300 hover:bg-sky-400/5 border border-zinc-800 hover:border-sky-400/30 rounded-lg px-2.5 py-1.5 transition-all"
            >
              🇬🇧 EN.zip
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <button
        onClick={publish}
        disabled={busy}
        className="group relative inline-flex items-center gap-3 rounded-xl bg-gradient-to-b from-zinc-100 to-zinc-300 hover:from-white hover:to-zinc-200 disabled:from-zinc-800 disabled:to-zinc-900 disabled:text-zinc-500 px-5 py-3 text-sm font-bold text-black transition-all shadow-[0_4px_20px_-4px_rgba(251,191,36,0.3)] hover:shadow-[0_6px_30px_-4px_rgba(251,191,36,0.5)] disabled:shadow-none"
      >
        {busy ? (
          <>
            <span className="inline-block w-3.5 h-3.5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
            <span>Génération en cours…</span>
            <span className="text-[10px] text-zinc-600 font-mono">
              ~{validatedCount * 4}s
            </span>
          </>
        ) : (
          <>
            <span className="w-2 h-2 rounded-full bg-amber-400 group-hover:bg-amber-300" />
            <span>Publier {validatedCount} validée{validatedCount > 1 ? "s" : ""}</span>
            <span className="text-[10px] text-zinc-500 font-mono ml-1">
              FR + EN
            </span>
          </>
        )}
      </button>
      {result && !result.ok && (
        <div className="rounded-lg border border-rose-500/30 bg-rose-500/5 px-3 py-2 text-xs text-rose-300 max-w-md">
          {result.error}
        </div>
      )}
    </div>
  );
}
