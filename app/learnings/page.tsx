import { supabaseAdmin } from "@/lib/supabase";
import Link from "next/link";
import Image from "next/image";
import RefreshButton from "./RefreshButton";
import DeleteButton from "./DeleteButton";
import type { Learning } from "@/lib/learnings";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const CATEGORY_META: Record<
  string,
  { label: string; emoji: string; cls: string }
> = {
  design: {
    label: "Design",
    emoji: "🎨",
    cls: "border-amber-500/30 bg-amber-500/5",
  },
  copy: {
    label: "Copywriting",
    emoji: "✍️",
    cls: "border-emerald-500/30 bg-emerald-500/5",
  },
  format: {
    label: "Format",
    emoji: "📐",
    cls: "border-sky-500/30 bg-sky-500/5",
  },
  tone: {
    label: "Ton",
    emoji: "🎙️",
    cls: "border-violet-500/30 bg-violet-500/5",
  },
  general: {
    label: "Général",
    emoji: "🧠",
    cls: "border-zinc-700 bg-zinc-900/50",
  },
};

async function getLearnings(): Promise<{
  learnings: Learning[];
  feedbackCount: number;
}> {
  const sb = supabaseAdmin();
  const [learningsRes, feedbackRes] = await Promise.all([
    sb
      .from("learnings")
      .select("*")
      .order("frequency", { ascending: false }),
    sb.from("feedback").select("*", { count: "exact", head: true }),
  ]);
  return {
    learnings: (learningsRes.data as Learning[]) || [],
    feedbackCount: feedbackRes.count || 0,
  };
}

export default async function LearningsPage() {
  const { learnings, feedbackCount } = await getLearnings();

  const grouped: Record<string, Learning[]> = {};
  for (const l of learnings) {
    const cat = l.category || "general";
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(l);
  }

  const orderedCategories = ["design", "copy", "format", "tone", "general"];

  return (
    <main className="min-h-screen">
      <div className="max-w-4xl mx-auto px-6 py-10">
        <nav className="flex items-center justify-between mb-10">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs text-zinc-500 hover:text-zinc-200 transition-colors group"
          >
            <span className="group-hover:-translate-x-0.5 transition-transform">
              ←
            </span>
            Retour au batch
          </Link>
          <div className="flex items-center gap-2">
            <Image
              src="/logo-setsmart.png"
              alt="SetSmart"
              width={28}
              height={28}
              className="rounded-md"
            />
            <span className="text-[10px] uppercase tracking-[0.2em] text-amber-400 font-bold">
              Ads Lab
            </span>
          </div>
        </nav>

        <header className="mb-10 flex items-end justify-between gap-4 flex-wrap">
          <div>
            <div className="text-xs uppercase tracking-[0.2em] text-zinc-500 font-semibold mb-2">
              Mémoire long-terme
            </div>
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight leading-[0.95] mb-2">
              Ce que j&apos;ai{" "}
              <span className="text-amber-400">appris</span>
            </h1>
            <p className="text-sm text-zinc-500">
              Règles distillées depuis tes {feedbackCount} feedback
              {feedbackCount > 1 ? "s" : ""}. Injectées dans le prompt à chaque
              nouveau batch.
            </p>
          </div>
          <RefreshButton />
        </header>

        {learnings.length === 0 ? (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-10 text-center">
            <div className="text-4xl mb-3">🧠</div>
            <div className="text-lg font-bold text-zinc-300 mb-2">
              Mémoire vide pour l&apos;instant
            </div>
            <div className="text-sm text-zinc-500 mb-6 max-w-md mx-auto">
              Donne du feedback sur les ads (valider / décliner / corriger),
              puis clique sur <strong>Distiller la mémoire</strong> ci-dessus
              pour générer les premières règles.
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {orderedCategories.map((cat) => {
              const items = grouped[cat] || [];
              if (items.length === 0) return null;
              const meta = CATEGORY_META[cat] || CATEGORY_META.general;
              return (
                <section key={cat}>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xl">{meta.emoji}</span>
                    <h2 className="text-sm font-bold uppercase tracking-[0.15em] text-zinc-300">
                      {meta.label}
                    </h2>
                    <span className="text-xs text-zinc-600">
                      ({items.length})
                    </span>
                  </div>
                  <div className="space-y-2">
                    {items.map((l) => (
                      <div
                        key={l.id}
                        className={`rounded-xl border ${meta.cls} px-4 py-3 flex items-start gap-3`}
                      >
                        <div className="flex-1 text-sm text-zinc-100 leading-relaxed">
                          {l.pattern}
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <span className="text-[10px] font-mono font-bold text-zinc-500">
                            ×{l.frequency}
                          </span>
                          <DeleteButton id={l.id} />
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        )}

        <div className="mt-12 pt-8 border-t border-zinc-900 text-center">
          <div className="text-[10px] uppercase tracking-[0.2em] text-zinc-700">
            Distillation manuelle ou automatique au prochain batch
          </div>
        </div>
      </div>
    </main>
  );
}
