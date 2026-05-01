"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function ConnectGoogle({
  connected,
}: {
  connected: boolean;
}) {
  const router = useRouter();
  const search = useSearchParams();
  const justConnected = search.get("google_connected") === "1";
  const error = search.get("google_error");
  const [showBanner, setShowBanner] = useState(justConnected || !!error);

  useEffect(() => {
    if (justConnected || error) {
      const t = setTimeout(() => {
        const params = new URLSearchParams(search.toString());
        params.delete("google_connected");
        params.delete("google_error");
        const qs = params.toString();
        router.replace(qs ? `/?${qs}` : "/");
        setShowBanner(false);
      }, 4000);
      return () => clearTimeout(t);
    }
  }, [justConnected, error, router, search]);

  if (showBanner && justConnected) {
    return (
      <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300 font-bold mb-4">
        ✅ Google Drive connecté ! Tu peux publier maintenant.
      </div>
    );
  }
  if (showBanner && error) {
    return (
      <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300 mb-4">
        ❌ Connexion Google échouée : {error}
      </div>
    );
  }

  if (connected) {
    return (
      <div className="inline-flex items-center gap-2 text-xs text-emerald-400 font-semibold">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
        Google Drive connecté
        <a
          href="/api/auth/google/start"
          className="ml-2 text-zinc-500 hover:text-zinc-300 underline"
        >
          Reconnecter
        </a>
      </div>
    );
  }

  return (
    <a
      href="/api/auth/google/start"
      className="inline-flex items-center gap-2 rounded-xl border border-sky-500/30 hover:border-sky-400 bg-sky-500/5 hover:bg-sky-500/10 px-4 py-2 text-sm font-bold text-sky-300 transition-colors"
    >
      <span>📁</span>
      <span>Connecter Google Drive</span>
    </a>
  );
}
