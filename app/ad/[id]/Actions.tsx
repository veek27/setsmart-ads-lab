"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Status = "pending" | "validated" | "declined";

export default function Actions({
  adId,
  initialStatus,
}: {
  adId: string;
  initialStatus: Status;
}) {
  const router = useRouter();
  const [status, setStatus] = useState<Status>(initialStatus);
  const [mode, setMode] = useState<"idle" | "correcting">("idle");
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState<null | "validate" | "decline" | "correct">(
    null
  );
  const [error, setError] = useState<string | null>(null);

  async function action(kind: "validate" | "decline") {
    setBusy(kind);
    setError(null);
    try {
      const res = await fetch(`/api/ad/${adId}/${kind}`, { method: "POST" });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || "Unknown error");
      setStatus(kind === "validate" ? "validated" : "declined");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(null);
    }
  }

  async function submitCorrection(e: React.FormEvent) {
    e.preventDefault();
    if (notes.trim().length < 3) {
      setError("Note de correction trop courte (3 caractères min)");
      return;
    }
    setBusy("correct");
    setError(null);
    try {
      const res = await fetch(`/api/ad/${adId}/correct`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes }),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || "Unknown error");
      setNotes("");
      setMode("idle");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(null);
    }
  }

  async function reset() {
    setBusy("validate");
    try {
      await fetch(`/api/ad/${adId}/reset`, { method: "POST" });
      setStatus("pending");
      router.refresh();
    } finally {
      setBusy(null);
    }
  }

  if (status === "validated") {
    return (
      <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-6 text-center">
        <div className="text-4xl mb-2">✅</div>
        <div className="text-lg font-bold text-emerald-300 mb-1">Validée</div>
        <div className="text-sm text-zinc-400 mb-4">
          Ce concept est gardé pour la production.
        </div>
        <button
          onClick={reset}
          disabled={!!busy}
          className="text-xs text-zinc-500 hover:text-zinc-300 underline disabled:opacity-50"
        >
          {busy ? "..." : "Annuler la validation"}
        </button>
      </div>
    );
  }

  if (status === "declined") {
    return (
      <div className="rounded-2xl border border-rose-500/30 bg-rose-500/5 p-6 text-center">
        <div className="text-4xl mb-2">❌</div>
        <div className="text-lg font-bold text-rose-300 mb-1">Déclinée</div>
        <div className="text-sm text-zinc-400 mb-4">
          Ce concept ne sera pas gardé.
        </div>
        <button
          onClick={reset}
          disabled={!!busy}
          className="text-xs text-zinc-500 hover:text-zinc-300 underline disabled:opacity-50"
        >
          {busy ? "..." : "Revenir en arrière"}
        </button>
      </div>
    );
  }

  if (mode === "correcting") {
    return (
      <form onSubmit={submitCorrection} className="space-y-4">
        <div>
          <label className="block text-sm font-bold text-amber-300 mb-2">
            Qu&apos;est-ce qui doit changer ?
          </label>
          <textarea
            autoFocus
            rows={5}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Ex: le hook est trop long, raccourcis-le. Le yellow est trop pétant, prends un emerald. Vire l'emoji."
            className="w-full rounded-xl bg-black/40 border border-amber-500/30 focus:border-amber-400/60 px-4 py-3 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none resize-none"
          />
          <div className="text-xs text-zinc-500 mt-2">
            Sois précis — Claude va régénérer FR + EN en gardant l&apos;esprit
            mais en appliquant ta demande.
          </div>
        </div>
        {error && (
          <div className="text-sm text-rose-400">❌ {error}</div>
        )}
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={busy === "correct" || notes.trim().length < 3}
            className="flex-1 rounded-xl bg-amber-400 hover:bg-amber-300 disabled:bg-zinc-800 disabled:text-zinc-500 px-4 py-3 text-sm font-bold text-black transition-colors"
          >
            {busy === "correct"
              ? "🔄 Correction en cours…"
              : "🔄 Régénérer avec correction"}
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("idle");
              setNotes("");
              setError(null);
            }}
            disabled={busy === "correct"}
            className="rounded-xl border border-zinc-800 px-4 py-3 text-sm font-medium text-zinc-400 hover:text-zinc-100 hover:border-zinc-600 transition-colors"
          >
            Annuler
          </button>
        </div>
      </form>
    );
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-3">
        <button
          onClick={() => action("validate")}
          disabled={!!busy}
          className="group relative rounded-2xl border border-emerald-500/30 hover:border-emerald-400 bg-emerald-500/5 hover:bg-emerald-500/10 px-4 py-5 text-center transition-all disabled:opacity-50"
        >
          <div className="text-2xl mb-1">✅</div>
          <div className="text-sm font-bold text-emerald-300">Valider</div>
          <div className="text-[10px] text-zinc-500 mt-1">On la garde</div>
        </button>

        <button
          onClick={() => setMode("correcting")}
          disabled={!!busy}
          className="group relative rounded-2xl border border-amber-500/30 hover:border-amber-400 bg-amber-500/5 hover:bg-amber-500/10 px-4 py-5 text-center transition-all disabled:opacity-50"
        >
          <div className="text-2xl mb-1">🔄</div>
          <div className="text-sm font-bold text-amber-300">Correction</div>
          <div className="text-[10px] text-zinc-500 mt-1">Régénère</div>
        </button>

        <button
          onClick={() => action("decline")}
          disabled={!!busy}
          className="group relative rounded-2xl border border-rose-500/30 hover:border-rose-400 bg-rose-500/5 hover:bg-rose-500/10 px-4 py-5 text-center transition-all disabled:opacity-50"
        >
          <div className="text-2xl mb-1">❌</div>
          <div className="text-sm font-bold text-rose-300">Décliner</div>
          <div className="text-[10px] text-zinc-500 mt-1">On la jette</div>
        </button>
      </div>

      {error && <div className="text-sm text-rose-400">❌ {error}</div>}
    </div>
  );
}
