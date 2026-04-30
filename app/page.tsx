import { supabaseAdmin } from "@/lib/supabase";
import { parseBrief, ACCENT_COLORS, type Ad, type Batch } from "@/lib/types";
import Link from "next/link";
import Image from "next/image";
import AdPreview from "@/components/AdPreview";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function todayParis(): string {
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Paris",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return fmt.format(new Date());
}

async function getLatestBatch(): Promise<{
  batch: Batch | null;
  ads: Ad[];
  feedbackCounts: Record<string, number>;
  totalBatches: number;
}> {
  const sb = supabaseAdmin();
  const today = todayParis();

  const { data: batch } = await sb
    .from("batches")
    .select("*")
    .lte("date", today)
    .order("date", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { count: totalBatches } = await sb
    .from("batches")
    .select("*", { count: "exact", head: true });

  if (!batch) {
    return {
      batch: null,
      ads: [],
      feedbackCounts: {},
      totalBatches: totalBatches || 0,
    };
  }

  const { data: ads } = await sb
    .from("ads")
    .select("*")
    .eq("batch_id", batch.id)
    .order("position");

  const adIds = (ads || []).map((a) => a.id);
  const feedbackCounts: Record<string, number> = {};
  if (adIds.length > 0) {
    const { data: fb } = await sb
      .from("feedback")
      .select("ad_id")
      .in("ad_id", adIds);
    for (const f of fb || []) {
      feedbackCounts[f.ad_id] = (feedbackCounts[f.ad_id] || 0) + 1;
    }
  }

  return {
    batch: batch as Batch,
    ads: (ads as Ad[]) || [],
    feedbackCounts,
    totalBatches: totalBatches || 0,
  };
}

const STATUS_LABEL: Record<string, { label: string; cls: string }> = {
  pending: { label: "En attente", cls: "text-zinc-400 bg-zinc-800" },
  running: { label: "Génération…", cls: "text-amber-300 bg-amber-500/10" },
  done: { label: "Prêt", cls: "text-emerald-400 bg-emerald-500/10" },
  failed: { label: "Échec", cls: "text-rose-400 bg-rose-500/10" },
};

export default async function Home() {
  const { batch, ads, feedbackCounts, totalBatches } = await getLatestBatch();

  if (!batch) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="max-w-md text-center px-6">
          <Image
            src="/logo-setsmart.png"
            alt="SetSmart"
            width={56}
            height={56}
            className="mx-auto mb-6 rounded-xl brand-glow"
          />
          <div className="inline-block rounded-full bg-amber-400/10 border border-amber-400/20 px-3 py-1 text-xs font-semibold text-amber-300 mb-6">
            ADS LAB
          </div>
          <h1 className="text-3xl font-bold mb-3">Aucun batch encore.</h1>
          <p className="text-zinc-500">
            Le premier batch sera généré au prochain cron — 9h, heure de Paris.
          </p>
        </div>
      </main>
    );
  }

  const friendlyDate = new Date(batch.date + "T12:00:00").toLocaleDateString(
    "fr-FR",
    { weekday: "long", day: "numeric", month: "long" }
  );
  const status = STATUS_LABEL[batch.status] || STATUS_LABEL.pending;

  return (
    <main className="min-h-screen">
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Brand header */}
        <header className="mb-12">
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-3">
              <Image
                src="/logo-setsmart.png"
                alt="SetSmart"
                width={40}
                height={40}
                className="rounded-lg brand-glow"
              />
              <div>
                <div className="text-sm font-bold tracking-tight">SetSmart</div>
                <div className="text-[10px] uppercase tracking-[0.2em] text-amber-400 font-semibold">
                  Ads Lab
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <Link
                href="/learnings"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-zinc-800 hover:border-amber-400/40 hover:bg-amber-400/5 text-zinc-400 hover:text-amber-300 font-semibold transition-colors"
              >
                <span>🧠</span>
                <span>Mémoire</span>
              </Link>
              <div className="hidden sm:flex items-center gap-1.5 text-zinc-500">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 pulse-soft" />
                <span>Auto 9h Paris</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="text-xs uppercase tracking-[0.2em] text-zinc-500 font-semibold mb-2">
                Batch du jour
              </div>
              <h1 className="text-5xl sm:text-6xl font-black tracking-tight leading-[0.95] mb-1">
                <span className="text-amber-400">{friendlyDate.split(" ")[0]}</span>{" "}
                <span className="text-white">
                  {friendlyDate.split(" ").slice(1).join(" ")}
                </span>
              </h1>
            </div>
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${status.cls} self-start`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-current" />
              {status.label}
            </span>
          </div>

          {/* Stats bar */}
          <div className="grid grid-cols-4 gap-3 mt-8">
            <div className="rounded-xl border border-zinc-800 bg-zinc-950/50 p-4">
              <div className="text-2xl font-black tracking-tight text-zinc-400">
                {ads.filter((a) => a.status === "pending").length}
              </div>
              <div className="text-xs text-zinc-500 mt-1">À traiter</div>
            </div>
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
              <div className="text-2xl font-black tracking-tight text-emerald-300">
                {ads.filter((a) => a.status === "validated").length}
              </div>
              <div className="text-xs text-emerald-400/70 mt-1">Validées</div>
            </div>
            <div className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-4">
              <div className="text-2xl font-black tracking-tight text-rose-300">
                {ads.filter((a) => a.status === "declined").length}
              </div>
              <div className="text-xs text-rose-400/70 mt-1">Déclinées</div>
            </div>
            <div className="rounded-xl border border-zinc-800 bg-zinc-950/50 p-4">
              <div className="text-2xl font-black tracking-tight">
                {totalBatches}
              </div>
              <div className="text-xs text-zinc-500 mt-1">Batches</div>
            </div>
          </div>
        </header>

        {/* Concepts grid */}
        <section>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-sm font-bold uppercase tracking-[0.15em] text-zinc-400">
              Les 10 concepts
            </h2>
            <span className="text-xs text-zinc-600">
              Clique pour voir + donner ton feedback
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {ads.map((ad) => {
              const brief = parseBrief(ad.brief);
              const accent =
                ACCENT_COLORS[brief?.accent_color || "amber"] || "#fbbf24";
              return (
                <Link
                  key={ad.id}
                  href={`/ad/${ad.id}`}
                  className="group relative block rounded-2xl overflow-hidden bg-zinc-950 border border-zinc-900 hover:border-zinc-600 transition-all hover:-translate-y-1 hover:shadow-2xl"
                  style={{ aspectRatio: "9/16" }}
                >
                  {/* Position badge */}
                  <div className="absolute top-2 left-2 z-20 flex items-center gap-1.5">
                    <span className="text-[10px] font-mono font-bold bg-black/70 backdrop-blur text-white px-2 py-1 rounded-md">
                      #{ad.position?.toString().padStart(2, "0")}
                    </span>
                  </div>

                  <div className="absolute top-2 right-2 z-20 flex items-center gap-1">
                    {ad.version > 1 && (
                      <span className="text-[10px] font-bold bg-amber-400/95 backdrop-blur text-black px-2 py-1 rounded-md">
                        v{ad.version}
                      </span>
                    )}
                    {ad.status === "validated" && (
                      <span className="text-[10px] font-bold bg-emerald-500/95 backdrop-blur text-black px-2 py-1 rounded-md">
                        ✓
                      </span>
                    )}
                    {ad.status === "declined" && (
                      <span className="text-[10px] font-bold bg-rose-500/95 backdrop-blur text-white px-2 py-1 rounded-md">
                        ✗
                      </span>
                    )}
                  </div>

                  {/* Visual preview */}
                  <div className="absolute inset-0 flex items-start justify-center pointer-events-none">
                    {brief && (
                      <AdPreview
                        format={brief.format}
                        accent={accent}
                        accentName={brief.accent_color}
                        hook={ad.hook_fr || ""}
                        body={brief.body_fr}
                        cta={brief.cta_fr}
                        lang="fr"
                        scale={0.4}
                      />
                    )}
                  </div>

                  {/* Hover overlay */}
                  <div className="absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-black via-black/80 to-transparent pt-12 pb-3 px-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <span
                        className="text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider"
                        style={{
                          background: `${accent}20`,
                          color: accent,
                        }}
                      >
                        {brief?.format || "—"}
                      </span>
                    </div>
                    <h3 className="text-xs font-bold leading-tight line-clamp-2 text-white">
                      {ad.hook_fr}
                    </h3>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        <footer className="mt-16 pt-8 border-t border-zinc-900 text-center">
          <div className="text-[10px] uppercase tracking-[0.2em] text-zinc-700">
            SetSmart · Ads Lab · v0.1
          </div>
        </footer>
      </div>
    </main>
  );
}
