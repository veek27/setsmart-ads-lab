import { supabaseAdmin } from "@/lib/supabase";
import { parseBrief, ACCENT_COLORS, type Ad, type Batch } from "@/lib/types";
import Link from "next/link";

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

  if (!batch) return { batch: null, ads: [] };

  const { data: ads } = await sb
    .from("ads")
    .select("*")
    .eq("batch_id", batch.id)
    .order("position");

  return { batch: batch as Batch, ads: (ads as Ad[]) || [] };
}

export default async function Home() {
  const { batch, ads } = await getLatestBatch();

  if (!batch) {
    return (
      <main className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center font-sans">
        <div className="max-w-md text-center px-6">
          <div className="inline-block rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400 mb-6">
            SetSmart · Ads Lab
          </div>
          <h1 className="text-3xl font-bold mb-3">Aucun batch encore.</h1>
          <p className="text-zinc-400">
            Le premier batch sera généré au prochain cron (9h heure Paris).
          </p>
        </div>
      </main>
    );
  }

  const friendlyDate = new Date(batch.date + "T12:00:00").toLocaleDateString(
    "fr-FR",
    {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }
  );

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100 font-sans">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <header className="mb-12">
          <div className="inline-block rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400 mb-3">
            SetSmart · Ads Lab
          </div>
          <h1 className="text-4xl font-bold tracking-tight">
            Batch du {friendlyDate}
          </h1>
          <div className="flex gap-4 mt-3 text-sm text-zinc-400">
            <span>{ads.length} concepts</span>
            <span>·</span>
            <span>
              Statut :{" "}
              <span className="text-emerald-400 font-medium">
                {batch.status}
              </span>
            </span>
          </div>
        </header>

        <div className="grid gap-4">
          {ads.map((ad) => {
            const brief = parseBrief(ad.brief);
            const accent =
              ACCENT_COLORS[brief?.accent_color || "emerald"] || "#10b981";
            return (
              <Link
                key={ad.id}
                href={`/ad/${ad.id}`}
                className="block rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 hover:border-zinc-700 transition-colors"
              >
                <div className="flex items-start gap-4">
                  <div
                    className="shrink-0 w-1 self-stretch rounded-full"
                    style={{ background: accent }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-mono text-zinc-500">
                        #{ad.position?.toString().padStart(2, "0")}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400">
                        {brief?.format || "—"}
                      </span>
                      <span className="text-xs text-zinc-500">{ad.slug}</span>
                    </div>
                    <h2 className="text-xl font-bold mb-1">
                      {ad.hook_fr || ad.concept}
                    </h2>
                    {ad.hook_en && (
                      <p className="text-sm text-zinc-500 mb-3 italic">
                        EN — {ad.hook_en}
                      </p>
                    )}
                    <p className="text-sm text-zinc-400">{ad.concept}</p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </main>
  );
}
