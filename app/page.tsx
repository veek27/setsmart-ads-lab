import { supabaseAdmin } from "@/lib/supabase";
import { parseBrief, ACCENT_COLORS, type Ad, type Batch } from "@/lib/types";
import Link from "next/link";
import Image from "next/image";
import AdPreview from "@/components/AdPreview";
import PublishButton from "./PublishButton";
import DateNav from "./DateNav";
import GenerateNowButton from "./GenerateNowButton";
import ConnectGoogle from "./ConnectGoogle";
import { isGoogleConnected } from "@/lib/drive";
import { Suspense } from "react";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function todayParis(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Paris",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function isValidDate(s: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(s);
}

async function getBatchForDate(date: string): Promise<{
  batch: Batch | null;
  ads: Ad[];
  totalBatches: number;
  availableDates: string[];
}> {
  const sb = supabaseAdmin();

  const [batchRes, allBatchesRes] = await Promise.all([
    sb.from("batches").select("*").eq("date", date).maybeSingle(),
    sb
      .from("batches")
      .select("date")
      .order("date", { ascending: false })
      .limit(30),
  ]);

  const availableDates = (allBatchesRes.data || []).map((b) => b.date as string);
  const totalBatches = availableDates.length;

  if (!batchRes.data) {
    return { batch: null, ads: [], totalBatches, availableDates };
  }

  const { data: ads } = await sb
    .from("ads")
    .select("*")
    .eq("batch_id", batchRes.data.id)
    .order("position");

  return {
    batch: batchRes.data as Batch,
    ads: (ads as Ad[]) || [],
    totalBatches,
    availableDates,
  };
}

const STATUS_LABEL: Record<string, { label: string; cls: string }> = {
  pending: { label: "En attente", cls: "text-zinc-400 bg-zinc-800" },
  running: { label: "Génération…", cls: "text-amber-300 bg-amber-500/10" },
  done: { label: "Prêt", cls: "text-emerald-400 bg-emerald-500/10" },
  failed: { label: "Échec", cls: "text-rose-400 bg-rose-500/10" },
};

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const sp = await searchParams;
  const today = todayParis();
  const requested = sp.date && isValidDate(sp.date) ? sp.date : today;

  const [{ batch, ads, totalBatches, availableDates }, googleConnected] =
    await Promise.all([getBatchForDate(requested), isGoogleConnected()]);

  const friendlyDate = new Date(requested + "T12:00:00").toLocaleDateString(
    "fr-FR",
    { weekday: "long", day: "numeric", month: "long" }
  );

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

          {/* Date nav */}
          <div className="mb-6">
            <DateNav
              currentDate={requested}
              availableDates={availableDates}
            />
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="text-xs uppercase tracking-[0.2em] text-zinc-500 font-semibold mb-2">
                {requested === today ? "Batch du jour" : "Batch de ce jour"}
              </div>
              <h1 className="text-5xl sm:text-6xl font-black tracking-tight leading-[0.95] mb-1 capitalize">
                <span className="text-amber-400">
                  {friendlyDate.split(" ")[0]}
                </span>{" "}
                <span className="text-white">
                  {friendlyDate.split(" ").slice(1).join(" ")}
                </span>
              </h1>
            </div>
            {batch && (
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${(STATUS_LABEL[batch.status] || STATUS_LABEL.pending).cls} self-start`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-current" />
                {(STATUS_LABEL[batch.status] || STATUS_LABEL.pending).label}
              </span>
            )}
          </div>

          {batch && (
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
          )}
        </header>

        {!batch ? (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-10 text-center space-y-6">
            <div className="text-5xl">🌫️</div>
            <div>
              <h2 className="text-2xl font-bold mb-2">
                Aucun batch pour ce jour
              </h2>
              <p className="text-sm text-zinc-500 mb-6">
                {requested === today
                  ? "Le cron auto n'a pas encore tourné (Vercel Hobby est imprécis). Tu peux le déclencher manuellement maintenant :"
                  : "Aucun batch n'a été généré ce jour-là."}
              </p>
              {requested === today && (
                <div className="flex justify-center">
                  <GenerateNowButton />
                </div>
              )}
            </div>
          </div>
        ) : (
          <>
            <section className="mb-10 space-y-3">
              <Suspense fallback={null}>
                <ConnectGoogle connected={googleConnected} />
              </Suspense>
              <PublishButton
                validatedCount={
                  ads.filter((a) => a.status === "validated").length
                }
              />
            </section>

            <section>
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-sm font-bold uppercase tracking-[0.15em] text-zinc-400">
                  Les {ads.length} concepts
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
                            meta={brief.meta}
                            scale={0.4}
                          />
                        )}
                      </div>

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
          </>
        )}

        <footer className="mt-16 pt-8 border-t border-zinc-900 text-center">
          <div className="text-[10px] uppercase tracking-[0.2em] text-zinc-700">
            SetSmart · Ads Lab · v0.1
          </div>
        </footer>
      </div>
    </main>
  );
}
