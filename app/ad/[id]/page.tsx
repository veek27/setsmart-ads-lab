import { supabaseAdmin } from "@/lib/supabase";
import {
  parseBrief,
  ACCENT_COLORS,
  type Ad,
  type FeedbackRow,
} from "@/lib/types";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import FeedbackForm from "./FeedbackForm";
import AdPreview from "@/components/AdPreview";

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
  const accent = ACCENT_COLORS[brief?.accent_color || "amber"] || "#fbbf24";

  return (
    <main className="min-h-screen">
      <div className="max-w-5xl mx-auto px-6 py-10">
        {/* Top nav */}
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

        {/* Header */}
        <header className="mb-10">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-[10px] font-mono text-zinc-600 font-semibold">
              #{ad.position?.toString().padStart(2, "0")}
            </span>
            <span
              className="text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider"
              style={{
                background: `${accent}15`,
                color: accent,
                border: `1px solid ${accent}30`,
              }}
            >
              {brief?.format || "—"}
            </span>
            <span className="text-[10px] font-mono text-zinc-600">
              {ad.slug}
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight leading-[1.05] mb-3">
            {ad.hook_fr}
          </h1>
          {ad.hook_en && (
            <p className="text-lg text-zinc-500 italic">{ad.hook_en}</p>
          )}
        </header>

        {/* Concept card */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-6 mb-8 relative overflow-hidden">
          <div
            className="absolute top-0 left-0 right-0 h-[2px]"
            style={{ background: accent }}
          />
          <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 mb-3">
            Concept visuel
          </div>
          <p className="text-zinc-300 leading-relaxed">{ad.concept}</p>
        </div>

        {/* Visual previews FR / EN */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-6 mb-8">
          <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 mb-5">
            Aperçu visuel · 1080×1920 (9:16)
          </div>
          <div className="grid md:grid-cols-2 gap-6 justify-items-center">
            {(["fr", "en"] as const).map((lang) => {
              const hook = lang === "fr" ? ad.hook_fr : ad.hook_en;
              const body =
                lang === "fr" ? brief?.body_fr : brief?.body_en;
              const cta = lang === "fr" ? brief?.cta_fr : brief?.cta_en;
              return (
                <div key={lang} className="flex flex-col items-center gap-3">
                  <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">
                    {lang === "fr" ? "🇫🇷  Français" : "🇬🇧  English"}
                  </div>
                  <AdPreview
                    format={brief?.format || "default"}
                    accent={accent}
                    accentName={brief?.accent_color || "amber"}
                    hook={hook || ""}
                    body={body || ""}
                    cta={cta || ""}
                    lang={lang}
                    scale={0.55}
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* Copy breakdown */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-6 mb-12">
          <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 mb-5">
            Copy breakdown
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                label: "🇫🇷  FR",
                hook: ad.hook_fr,
                body: brief?.body_fr,
                cta: brief?.cta_fr,
              },
              {
                label: "🇬🇧  EN",
                hook: ad.hook_en,
                body: brief?.body_en,
                cta: brief?.cta_en,
              },
            ].map((v, i) => (
              <div key={i} className="space-y-3">
                <div className="text-xs font-semibold text-zinc-400">
                  {v.label}
                </div>
                {v.hook && (
                  <div>
                    <div className="text-[9px] font-bold text-zinc-600 uppercase tracking-[0.2em] mb-1">
                      Hook
                    </div>
                    <div className="text-sm font-bold">{v.hook}</div>
                  </div>
                )}
                {v.body && (
                  <div>
                    <div className="text-[9px] font-bold text-zinc-600 uppercase tracking-[0.2em] mb-1">
                      Body
                    </div>
                    <div className="text-sm text-zinc-300">{v.body}</div>
                  </div>
                )}
                {v.cta && (
                  <div>
                    <div className="text-[9px] font-bold text-zinc-600 uppercase tracking-[0.2em] mb-1">
                      CTA
                    </div>
                    <div
                      className="inline-block px-3 py-1 rounded-md text-xs font-bold"
                      style={{ background: accent, color: "#000" }}
                    >
                      {v.cta}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Feedback form */}
        <div className="rounded-2xl border border-amber-400/20 bg-gradient-to-br from-amber-400/5 to-transparent p-6 mb-8">
          <div className="flex items-center gap-2 mb-5">
            <div
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: "#fbbf24" }}
            />
            <h2 className="text-sm font-bold uppercase tracking-[0.15em] text-amber-300">
              Ton feedback
            </h2>
          </div>
          <p className="text-xs text-zinc-500 mb-6">
            Ce que tu écris sera utilisé pour améliorer le batch de demain. Sois
            franc — &quot;c&apos;est nul parce que…&quot; est plus utile
            qu&apos;un &quot;j&apos;aime pas&quot;.
          </p>
          <FeedbackForm adId={ad.id} />
        </div>

        {/* Past feedback */}
        {feedback.length > 0 && (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-6">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-1.5 h-1.5 rounded-full bg-zinc-500" />
              <h3 className="text-sm font-bold uppercase tracking-[0.15em] text-zinc-400">
                Historique ({feedback.length})
              </h3>
            </div>
            <div className="space-y-3">
              {feedback.map((f) => {
                const notes = parseFeedbackNotes(f.notes);
                const date = new Date(f.created_at).toLocaleString("fr-FR", {
                  dateStyle: "short",
                  timeStyle: "short",
                });
                const verdictBadge =
                  f.verdict === "keep"
                    ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
                    : f.verdict === "pivot"
                      ? "text-amber-300 bg-amber-500/10 border-amber-500/20"
                      : f.verdict === "kill"
                        ? "text-rose-400 bg-rose-500/10 border-rose-500/20"
                        : "text-zinc-500 bg-zinc-800 border-zinc-700";
                return (
                  <div
                    key={f.id}
                    className="rounded-xl border border-zinc-800 bg-black/30 p-4"
                  >
                    <div className="flex items-center gap-3 mb-3 text-xs">
                      <span className="text-zinc-600">{date}</span>
                      {f.rating && (
                        <span className="text-amber-300 font-bold">
                          {f.rating}/5
                        </span>
                      )}
                      {f.verdict && (
                        <span
                          className={`px-2 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wider ${verdictBadge}`}
                        >
                          {f.verdict}
                        </span>
                      )}
                    </div>
                    {notes.design && (
                      <div className="mb-3 text-sm">
                        <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-amber-400 mr-2">
                          Design
                        </span>
                        <span className="text-zinc-300">{notes.design}</span>
                      </div>
                    )}
                    {notes.copy && (
                      <div className="mb-3 text-sm">
                        <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-emerald-400 mr-2">
                          Copy
                        </span>
                        <span className="text-zinc-300">{notes.copy}</span>
                      </div>
                    )}
                    {notes.general && (
                      <div className="text-sm">
                        <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-zinc-500 mr-2">
                          Général
                        </span>
                        <span className="text-zinc-300">{notes.general}</span>
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
