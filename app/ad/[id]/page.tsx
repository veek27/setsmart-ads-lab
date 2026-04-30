import { supabaseAdmin } from "@/lib/supabase";
import {
  parseBrief,
  ACCENT_COLORS,
  type Ad,
  type FeedbackRow,
} from "@/lib/types";
import Link from "next/link";
import { notFound } from "next/navigation";
import FeedbackForm from "./FeedbackForm";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type Params = { id: string };

async function getAd(id: string): Promise<{
  ad: Ad | null;
  feedback: FeedbackRow[];
}> {
  const sb = supabaseAdmin();
  const { data: ad } = await sb
    .from("ads")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!ad) return { ad: null, feedback: [] };

  const { data: feedback } = await sb
    .from("feedback")
    .select("*")
    .eq("ad_id", id)
    .order("created_at", { ascending: false });

  return {
    ad: ad as Ad,
    feedback: (feedback as FeedbackRow[]) || [],
  };
}

function parseFeedbackNotes(notes: string | null) {
  if (!notes) return { design: "", copy: "", general: "", screenshots: [] };
  try {
    const p = JSON.parse(notes);
    return {
      design: p.design || "",
      copy: p.copy || "",
      general: p.general || "",
      screenshots: Array.isArray(p.screenshots) ? p.screenshots : [],
    };
  } catch {
    return { design: "", copy: "", general: notes, screenshots: [] };
  }
}

export default async function AdPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { id } = await params;
  const { ad, feedback } = await getAd(id);

  if (!ad) notFound();

  const brief = parseBrief(ad.brief);
  const accent = ACCENT_COLORS[brief?.accent_color || "emerald"] || "#10b981";

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100 font-sans">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-300 mb-8"
        >
          ← Retour au batch
        </Link>

        <div className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs font-mono text-zinc-500">
              #{ad.position?.toString().padStart(2, "0")}
            </span>
            <span
              className="text-xs px-2 py-0.5 rounded-full font-medium"
              style={{
                background: `${accent}1a`,
                color: accent,
              }}
            >
              {brief?.format || "—"}
            </span>
            <span className="text-xs text-zinc-500">{ad.slug}</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">
            {ad.hook_fr}
          </h1>
          {ad.hook_en && (
            <p className="text-lg text-zinc-400 italic">EN — {ad.hook_en}</p>
          )}
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 mb-10">
          <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-4">
            Concept visuel
          </h3>
          <p className="text-zinc-200 mb-6">{ad.concept}</p>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <div className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">
                🇫🇷 Version FR
              </div>
              <div className="rounded-xl bg-zinc-950 border border-zinc-800 p-4 space-y-3">
                <div>
                  <div className="text-[10px] text-zinc-600 uppercase mb-1">
                    Hook
                  </div>
                  <div className="text-base font-bold">{ad.hook_fr}</div>
                </div>
                {brief?.body_fr && (
                  <div>
                    <div className="text-[10px] text-zinc-600 uppercase mb-1">
                      Body
                    </div>
                    <div className="text-sm text-zinc-300">
                      {brief.body_fr}
                    </div>
                  </div>
                )}
                {brief?.cta_fr && (
                  <div>
                    <div className="text-[10px] text-zinc-600 uppercase mb-1">
                      CTA
                    </div>
                    <div
                      className="inline-block px-3 py-1 rounded-md text-sm font-semibold"
                      style={{ background: accent, color: "#0a0a0a" }}
                    >
                      {brief.cta_fr}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div>
              <div className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">
                🇬🇧 Version EN
              </div>
              <div className="rounded-xl bg-zinc-950 border border-zinc-800 p-4 space-y-3">
                <div>
                  <div className="text-[10px] text-zinc-600 uppercase mb-1">
                    Hook
                  </div>
                  <div className="text-base font-bold">{ad.hook_en}</div>
                </div>
                {brief?.body_en && (
                  <div>
                    <div className="text-[10px] text-zinc-600 uppercase mb-1">
                      Body
                    </div>
                    <div className="text-sm text-zinc-300">
                      {brief.body_en}
                    </div>
                  </div>
                )}
                {brief?.cta_en && (
                  <div>
                    <div className="text-[10px] text-zinc-600 uppercase mb-1">
                      CTA
                    </div>
                    <div
                      className="inline-block px-3 py-1 rounded-md text-sm font-semibold"
                      style={{ background: accent, color: "#0a0a0a" }}
                    >
                      {brief.cta_en}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 mb-10">
          <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-4">
            Ton feedback
          </h3>
          <FeedbackForm adId={ad.id} />
        </div>

        {feedback.length > 0 && (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
            <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-4">
              Historique feedbacks ({feedback.length})
            </h3>
            <div className="space-y-4">
              {feedback.map((f) => {
                const notes = parseFeedbackNotes(f.notes);
                const date = new Date(f.created_at).toLocaleString("fr-FR", {
                  dateStyle: "short",
                  timeStyle: "short",
                });
                return (
                  <div
                    key={f.id}
                    className="rounded-xl border border-zinc-800 p-4 text-sm"
                  >
                    <div className="flex items-center gap-3 text-xs text-zinc-500 mb-3">
                      <span>{date}</span>
                      {f.rating && <span>⭐ {f.rating}/5</span>}
                      {f.verdict && (
                        <span className="font-medium">
                          {f.verdict === "keep"
                            ? "✅ keep"
                            : f.verdict === "pivot"
                              ? "🔄 pivot"
                              : "❌ kill"}
                        </span>
                      )}
                    </div>
                    {notes.design && (
                      <div className="mb-2">
                        <div className="text-[10px] font-medium text-zinc-500 uppercase mb-1">
                          Design
                        </div>
                        <div className="text-zinc-300">{notes.design}</div>
                      </div>
                    )}
                    {notes.copy && (
                      <div className="mb-2">
                        <div className="text-[10px] font-medium text-zinc-500 uppercase mb-1">
                          Copy
                        </div>
                        <div className="text-zinc-300">{notes.copy}</div>
                      </div>
                    )}
                    {notes.general && (
                      <div>
                        <div className="text-[10px] font-medium text-zinc-500 uppercase mb-1">
                          Général
                        </div>
                        <div className="text-zinc-300">{notes.general}</div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
