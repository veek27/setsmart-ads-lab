"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Status = "pending" | "validated" | "declined";
type ActionKind = "validate" | "correct" | "decline";

const COPY: Record<
  ActionKind,
  {
    label: string;
    icon: string;
    color: string;
    bg: string;
    border: string;
    placeholder: string;
    helper: string;
    submitLabel: string;
    busyLabel: string;
    requiresNotes: boolean;
  }
> = {
  validate: {
    label: "Valider",
    icon: "✅",
    color: "text-emerald-300",
    bg: "bg-emerald-500/5 hover:bg-emerald-500/10",
    border: "border-emerald-500/30 hover:border-emerald-400",
    placeholder:
      "Ex: le hook est puissant, le visuel split-screen marche bien, le yellow est parfait sur ce format. Garde cette approche pour les comparaisons.",
    helper:
      "Dis ce qui marche. Ces notes m'aident à reproduire ce qui te plaît dans les futurs batches.",
    submitLabel: "Valider avec notes",
    busyLabel: "Sauvegarde…",
    requiresNotes: false,
  },
  correct: {
    label: "Correction",
    icon: "🔄",
    color: "text-amber-300",
    bg: "bg-amber-500/5 hover:bg-amber-500/10",
    border: "border-amber-500/30 hover:border-amber-400",
    placeholder:
      "Ex: raccourcis le hook à 4 mots, remplace le jaune par emerald, vire l'emoji.",
    helper:
      "Sois précis — Claude régénère FR + EN en gardant l'esprit mais en appliquant ta demande.",
    submitLabel: "🔄 Régénérer avec correction",
    busyLabel: "🔄 Correction en cours…",
    requiresNotes: true,
  },
  decline: {
    label: "Décliner",
    icon: "❌",
    color: "text-rose-300",
    bg: "bg-rose-500/5 hover:bg-rose-500/10",
    border: "border-rose-500/30 hover:border-rose-400",
    placeholder:
      "Ex: le concept est trop générique, on l'a déjà fait, le ton est corporate, le hook ne stoppe pas le scroll.",
    helper:
      "Dis pourquoi tu la jettes. Ça m'évite de reproduire le même type d'erreur demain.",
    submitLabel: "Décliner avec notes",
    busyLabel: "Sauvegarde…",
    requiresNotes: false,
  },
};

export default function Actions({
  adId,
  initialStatus,
}: {
  adId: string;
  initialStatus: Status;
}) {
  const router = useRouter();
  const [status, setStatus] = useState<Status>(initialStatus);
  const [activeKind, setActiveKind] = useState<ActionKind | null>(null);
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function open(kind: ActionKind) {
    setActiveKind(kind);
    setNotes("");
    setError(null);
  }

  function close() {
    setActiveKind(null);
    setNotes("");
    setError(null);
  }

  async function reset() {
    setBusy(true);
    try {
      await fetch(`/api/ad/${adId}/reset`, { method: "POST" });
      setStatus("pending");
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!activeKind) return;
    const cfg = COPY[activeKind];

    if (cfg.requiresNotes && notes.trim().length < 3) {
      setError("Note de correction trop courte (3 caractères min)");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/ad/${adId}/${activeKind}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes: notes.trim() }),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || "Unknown error");

      if (activeKind === "validate") setStatus("validated");
      if (activeKind === "decline") setStatus("declined");

      close();
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  if (status === "validated") {
    return (
      <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-6 text-center">
        <div className="text-4xl mb-2">✅</div>
        <div className="text-lg font-bold text-emerald-300 mb-1">Validée</div>
        <div className="text-sm text-zinc-400 mb-4">
          Tes notes sont enregistrées. Ce concept est gardé.
        </div>
        <button
          onClick={reset}
          disabled={busy}
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
          Tes notes sont enregistrées. Ce concept ne sera pas gardé.
        </div>
        <button
          onClick={reset}
          disabled={busy}
          className="text-xs text-zinc-500 hover:text-zinc-300 underline disabled:opacity-50"
        >
          {busy ? "..." : "Revenir en arrière"}
        </button>
      </div>
    );
  }

  if (activeKind) {
    const cfg = COPY[activeKind];
    return (
      <form onSubmit={submit} className="space-y-4">
        <div className="flex items-center gap-2">
          <span className="text-xl">{cfg.icon}</span>
          <h3 className={`text-base font-bold ${cfg.color}`}>
            {cfg.label}
          </h3>
        </div>
        <div>
          <label className="block text-xs font-bold text-zinc-300 mb-2">
            {cfg.requiresNotes ? "Qu'est-ce qui doit changer ?" : "Pourquoi ?"}
            {!cfg.requiresNotes && (
              <span className="ml-2 text-[10px] font-normal text-zinc-500">
                (recommandé pour nourrir la mémoire)
              </span>
            )}
          </label>
          <textarea
            autoFocus
            rows={5}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={cfg.placeholder}
            className={`w-full rounded-xl bg-black/40 border ${cfg.border.replace("hover:", "")} px-4 py-3 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none resize-none focus:bg-black/60`}
          />
          <div className="text-xs text-zinc-500 mt-2">{cfg.helper}</div>
        </div>
        {error && <div className="text-sm text-rose-400">❌ {error}</div>}
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={busy || (cfg.requiresNotes && notes.trim().length < 3)}
            className={`flex-1 rounded-xl px-4 py-3 text-sm font-bold transition-colors disabled:bg-zinc-800 disabled:text-zinc-500 ${
              activeKind === "validate"
                ? "bg-emerald-400 hover:bg-emerald-300 text-black"
                : activeKind === "correct"
                  ? "bg-amber-400 hover:bg-amber-300 text-black"
                  : "bg-rose-500 hover:bg-rose-400 text-white"
            }`}
          >
            {busy ? cfg.busyLabel : cfg.submitLabel}
          </button>
          <button
            type="button"
            onClick={close}
            disabled={busy}
            className="rounded-xl border border-zinc-800 px-4 py-3 text-sm font-medium text-zinc-400 hover:text-zinc-100 hover:border-zinc-600 transition-colors disabled:opacity-50"
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
        {(Object.keys(COPY) as ActionKind[]).map((kind) => {
          const cfg = COPY[kind];
          return (
            <button
              key={kind}
              onClick={() => open(kind)}
              className={`group relative rounded-2xl border ${cfg.border} ${cfg.bg} px-4 py-5 text-center transition-all`}
            >
              <div className="text-2xl mb-1">{cfg.icon}</div>
              <div className={`text-sm font-bold ${cfg.color}`}>
                {cfg.label}
              </div>
              <div className="text-[10px] text-zinc-500 mt-1">
                {kind === "validate"
                  ? "On la garde"
                  : kind === "correct"
                    ? "Régénère"
                    : "On la jette"}
              </div>
            </button>
          );
        })}
      </div>
      <div className="text-center text-[11px] text-zinc-600 pt-2">
        Quelle que soit ton choix, tu pourras laisser une note pour nourrir la
        mémoire.
      </div>
    </div>
  );
}
