"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DeleteButton({ id }: { id: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function del() {
    setBusy(true);
    try {
      await fetch(`/api/learnings/${id}`, { method: "DELETE" });
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      onClick={del}
      disabled={busy}
      className="text-zinc-600 hover:text-rose-400 transition-colors text-xs disabled:opacity-30"
      title="Supprimer cette règle"
    >
      {busy ? "..." : "✕"}
    </button>
  );
}
