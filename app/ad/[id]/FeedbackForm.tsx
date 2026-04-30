"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function FeedbackForm({ adId }: { adId: string }) {
  const router = useRouter();
  const [rating, setRating] = useState<number | null>(null);
  const [verdict, setVerdict] = useState<string | null>(null);
  const [designNotes, setDesignNotes] = useState("");
  const [copyNotes, setCopyNotes] = useState("");
  const [generalNotes, setGeneralNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ad_id: adId,
          rating,
          verdict,
          design_notes: designNotes,
          copy_notes: copyNotes,
          general_notes: generalNotes,
        }),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || "Unknown error");
      setSuccess(true);
      setTimeout(() => router.refresh(), 800);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-zinc-300 mb-2">
          Note (1 = nul, 5 = parfait)
        </label>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setRating(n)}
              className={`w-10 h-10 rounded-lg border transition-colors ${
                rating === n
                  ? "border-emerald-500 bg-emerald-500/10 text-emerald-400"
                  : "border-zinc-700 text-zinc-500 hover:border-zinc-600"
              }`}
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-zinc-300 mb-2">
          Verdict
        </label>
        <div className="flex gap-2">
          {(["keep", "pivot", "kill"] as const).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setVerdict(v)}
              className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                verdict === v
                  ? v === "keep"
                    ? "border-emerald-500 bg-emerald-500/10 text-emerald-400"
                    : v === "pivot"
                      ? "border-amber-500 bg-amber-500/10 text-amber-400"
                      : "border-rose-500 bg-rose-500/10 text-rose-400"
                  : "border-zinc-700 text-zinc-500 hover:border-zinc-600"
              }`}
            >
              {v === "keep" ? "✅ Garder" : v === "pivot" ? "🔄 Pivoter" : "❌ Killer"}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-zinc-300 mb-2">
          Design / visuel
          <span className="ml-2 text-xs text-zinc-500 font-normal">
            ce qui marche pas visuellement
          </span>
        </label>
        <textarea
          value={designNotes}
          onChange={(e) => setDesignNotes(e.target.value)}
          rows={3}
          className="w-full rounded-lg bg-zinc-900 border border-zinc-800 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:border-zinc-600 focus:outline-none resize-none"
          placeholder="Ex: la couleur jaune est trop pétante, le hook est mal centré, le CTA se perd..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-zinc-300 mb-2">
          Copywriting
          <span className="ml-2 text-xs text-zinc-500 font-normal">
            ce qui marche pas dans le texte
          </span>
        </label>
        <textarea
          value={copyNotes}
          onChange={(e) => setCopyNotes(e.target.value)}
          rows={3}
          className="w-full rounded-lg bg-zinc-900 border border-zinc-800 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:border-zinc-600 focus:outline-none resize-none"
          placeholder="Ex: le hook est trop long, le ton est trop corporate, la version EN est trop littérale..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-zinc-300 mb-2">
          Notes générales
          <span className="ml-2 text-xs text-zinc-500 font-normal">
            tout le reste
          </span>
        </label>
        <textarea
          value={generalNotes}
          onChange={(e) => setGeneralNotes(e.target.value)}
          rows={2}
          className="w-full rounded-lg bg-zinc-900 border border-zinc-800 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:border-zinc-600 focus:outline-none resize-none"
          placeholder="Optionnel"
        />
      </div>

      {error && (
        <div className="rounded-lg bg-rose-500/10 border border-rose-500/30 px-3 py-2 text-sm text-rose-400">
          ❌ {error}
        </div>
      )}

      {success && (
        <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/30 px-3 py-2 text-sm text-emerald-400">
          ✅ Feedback enregistré
        </div>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-lg bg-emerald-500 hover:bg-emerald-400 disabled:bg-zinc-700 disabled:text-zinc-500 px-4 py-3 text-sm font-semibold text-zinc-950 transition-colors"
      >
        {submitting ? "Envoi..." : "Enregistrer le feedback"}
      </button>
    </form>
  );
}
