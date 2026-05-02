"use client";

import { useMemo, useState } from "react";

export type ShareFile = {
  filename: string;
  url: string;
  lang: "fr" | "en";
  slug: string;
  position: number;
};

type Tab = "all" | "fr" | "en";

export default function ShareGallery({
  token,
  files,
  batchDate,
}: {
  token: string;
  files: ShareFile[];
  batchDate: string;
}) {
  const [tab, setTab] = useState<Tab>("all");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState(false);

  const filtered = useMemo(
    () => (tab === "all" ? files : files.filter((f) => f.lang === tab)),
    [files, tab]
  );

  function toggle(filename: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(filename)) next.delete(filename);
      else next.add(filename);
      return next;
    });
  }

  function selectAllVisible() {
    setSelected(new Set(filtered.map((f) => f.filename)));
  }

  function clearSelection() {
    setSelected(new Set());
  }

  function downloadOne(file: ShareFile) {
    const a = document.createElement("a");
    a.href = file.url;
    a.download = file.filename;
    a.target = "_blank";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  async function downloadSelected() {
    if (selected.size === 0) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/share/${token}/zip`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filenames: Array.from(selected) }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "ZIP failed");
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `setsmart-ads-${batchDate}-selection.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      alert("Erreur : " + (e instanceof Error ? e.message : String(e)));
    } finally {
      setBusy(false);
    }
  }

  async function downloadAll() {
    setSelected(new Set(files.map((f) => f.filename)));
    setBusy(true);
    try {
      const res = await fetch(`/api/share/${token}/zip`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filenames: files.map((f) => f.filename) }),
      });
      if (!res.ok) throw new Error("ZIP failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `setsmart-ads-${batchDate}-all.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      alert("Erreur : " + (e instanceof Error ? e.message : String(e)));
    } finally {
      setBusy(false);
      setSelected(new Set());
    }
  }

  return (
    <>
      {/* Toolbar */}
      <div className="sticky top-4 z-30 mb-6 rounded-2xl border border-zinc-800 bg-zinc-950/90 backdrop-blur p-4 flex items-center justify-between gap-3 flex-wrap shadow-2xl">
        <div className="flex items-center gap-2">
          {(["all", "fr", "en"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                tab === t
                  ? "bg-amber-400 text-black"
                  : "bg-zinc-900 text-zinc-400 hover:text-zinc-100"
              }`}
            >
              {t === "all"
                ? `Tout (${files.length})`
                : t === "fr"
                  ? `🇫🇷 FR (${files.filter((f) => f.lang === "fr").length})`
                  : `🇬🇧 EN (${files.filter((f) => f.lang === "en").length})`}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {selected.size > 0 ? (
            <>
              <span className="text-xs text-zinc-400 font-semibold">
                {selected.size} sélectionné{selected.size > 1 ? "s" : ""}
              </span>
              <button
                onClick={clearSelection}
                className="text-xs text-zinc-500 hover:text-zinc-200 underline"
              >
                Tout déselectionner
              </button>
              <button
                onClick={downloadSelected}
                disabled={busy}
                className="rounded-lg bg-emerald-400 hover:bg-emerald-300 disabled:bg-zinc-700 px-4 py-2 text-xs font-bold text-black transition-colors"
              >
                {busy
                  ? "ZIP en cours…"
                  : `⬇ Télécharger (${selected.size})`}
              </button>
            </>
          ) : (
            <>
              <button
                onClick={selectAllVisible}
                className="rounded-lg border border-zinc-700 hover:border-zinc-500 px-3 py-2 text-xs font-bold text-zinc-300 transition-colors"
              >
                Tout sélectionner
              </button>
              <button
                onClick={downloadAll}
                disabled={busy}
                className="rounded-lg bg-amber-400 hover:bg-amber-300 disabled:bg-zinc-700 px-4 py-2 text-xs font-bold text-black transition-colors"
              >
                {busy ? "ZIP en cours…" : "📦 Télécharger tout en ZIP"}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {filtered.map((file) => {
          const isSelected = selected.has(file.filename);
          return (
            <div
              key={file.filename}
              className={`group relative rounded-2xl overflow-hidden border-2 bg-zinc-950 transition-all cursor-pointer ${
                isSelected
                  ? "border-emerald-400 shadow-lg shadow-emerald-500/20"
                  : "border-zinc-800 hover:border-zinc-600"
              }`}
              onClick={() => toggle(file.filename)}
            >
              <div style={{ aspectRatio: "9/16" }} className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={file.url}
                  alt={file.slug}
                  className="absolute inset-0 w-full h-full object-cover"
                  loading="lazy"
                />

                {/* Lang badge */}
                <div className="absolute top-2 left-2 z-10">
                  <span
                    className={`text-[10px] font-bold backdrop-blur px-2 py-1 rounded-md ${
                      file.lang === "fr"
                        ? "bg-amber-400/95 text-black"
                        : "bg-sky-400/95 text-black"
                    }`}
                  >
                    {file.lang.toUpperCase()}
                  </span>
                </div>

                {/* Checkbox */}
                <div className="absolute top-2 right-2 z-10">
                  <div
                    className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all ${
                      isSelected
                        ? "bg-emerald-400 border-emerald-400 text-black"
                        : "bg-black/40 border-white/40 backdrop-blur"
                    }`}
                  >
                    {isSelected && (
                      <span className="text-xs font-black">✓</span>
                    )}
                  </div>
                </div>

                {/* Hover info + single download */}
                <div className="absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-black via-black/70 to-transparent pt-12 pb-3 px-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="text-[10px] text-white/80 font-mono mb-2 truncate">
                    {file.filename}
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      downloadOne(file);
                    }}
                    className="w-full bg-white text-black text-[11px] font-bold rounded-md py-1.5 hover:bg-zinc-200 transition-colors"
                  >
                    ⬇ Télécharger ce visuel
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <footer className="mt-12 pt-8 border-t border-zinc-900 text-center">
        <div className="text-[10px] uppercase tracking-[0.2em] text-zinc-700">
          SetSmart · Ads Lab
        </div>
      </footer>
    </>
  );
}
