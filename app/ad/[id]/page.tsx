import { supabaseAdmin } from "@/lib/supabase";
import {
  parseBrief,
  ACCENT_COLORS,
  type Ad,
  type AdVersion,
} from "@/lib/types";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import Actions from "./Actions";
import AdPreview from "@/components/AdPreview";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type Params = { id: string };

async function getAd(id: string): Promise<{
  ad: Ad | null;
  versions: AdVersion[];
}> {
  const sb = supabaseAdmin();
  const { data: ad } = await sb
    .from("ads")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!ad) return { ad: null, versions: [] };

  const { data: versions } = await sb
    .from("ad_versions")
    .select("*")
    .eq("ad_id", id)
    .order("version", { ascending: false });

  return {
    ad: ad as Ad,
    versions: (versions as AdVersion[]) || [],
  };
}

const STATUS_CONFIG = {
  pending: {
    label: "En attente",
    cls: "text-zinc-400 bg-zinc-800 border-zinc-700",
  },
  validated: {
    label: "Validée",
    cls: "text-emerald-300 bg-emerald-500/10 border-emerald-500/30",
  },
  declined: {
    label: "Déclinée",
    cls: "text-rose-300 bg-rose-500/10 border-rose-500/30",
  },
};

export default async function AdPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { id } = await params;
  const { ad, versions } = await getAd(id);

  if (!ad) notFound();

  const brief = parseBrief(ad.brief);
  const accent = ACCENT_COLORS[brief?.accent_color || "amber"] || "#fbbf24";
  const statusCfg = STATUS_CONFIG[ad.status];

  return (
    <main className="min-h-screen">
      <div className="max-w-5xl mx-auto px-6 py-10">
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

        <header className="mb-10">
          <div className="flex items-center gap-2 mb-4 flex-wrap">
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
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider border ${statusCfg.cls}`}
            >
              {statusCfg.label}
            </span>
            {ad.version > 1 && (
              <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider bg-amber-500/10 text-amber-300 border border-amber-500/30">
                v{ad.version}
              </span>
            )}
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight leading-[1.05] mb-3">
            {ad.hook_fr}
          </h1>
          {ad.hook_en && (
            <p className="text-lg text-zinc-500 italic">{ad.hook_en}</p>
          )}
        </header>

        {/* Visual previews */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-6 mb-8">
          <div className="flex items-center justify-between mb-5">
            <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">
              Aperçu visuel · 1080×1920
            </div>
            {ad.version > 1 && (
              <div className="text-[10px] text-amber-300 font-semibold">
                Version actuelle : v{ad.version}
              </div>
            )}
          </div>
          <div className="grid md:grid-cols-2 gap-6 justify-items-center">
            {(["fr", "en"] as const).map((lang) => {
              const hook = lang === "fr" ? ad.hook_fr : ad.hook_en;
              const body = lang === "fr" ? brief?.body_fr : brief?.body_en;
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

        {/* Concept description */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-6 mb-8">
          <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 mb-3">
            Concept
          </div>
          <p className="text-zinc-300 leading-relaxed">{ad.concept}</p>
        </div>

        {/* Actions: validate / correct / decline */}
        <div className="rounded-2xl border border-amber-400/20 bg-gradient-to-br from-amber-400/5 to-transparent p-6 mb-8">
          <div className="flex items-center gap-2 mb-5">
            <div
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: "#fbbf24" }}
            />
            <h2 className="text-sm font-bold uppercase tracking-[0.15em] text-amber-300">
              Action
            </h2>
          </div>
          <Actions adId={ad.id} initialStatus={ad.status} />
        </div>

        {/* Version history */}
        {versions.length > 0 && (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-6">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-1.5 h-1.5 rounded-full bg-zinc-500" />
              <h3 className="text-sm font-bold uppercase tracking-[0.15em] text-zinc-400">
                Historique des versions ({versions.length})
              </h3>
            </div>
            <div className="space-y-4">
              {versions.map((v) => {
                const vBrief = parseBrief(v.brief);
                const vAccent =
                  ACCENT_COLORS[vBrief?.accent_color || "amber"] || "#fbbf24";
                const date = new Date(v.created_at).toLocaleString("fr-FR", {
                  dateStyle: "short",
                  timeStyle: "short",
                });
                return (
                  <div
                    key={v.id}
                    className="rounded-xl border border-zinc-800 bg-black/30 p-5"
                  >
                    <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-zinc-500">
                          v{v.version}
                        </span>
                        <span className="text-[10px] text-zinc-600">
                          {date}
                        </span>
                      </div>
                      {v.correction_notes && (
                        <span className="text-[10px] text-amber-400 font-semibold">
                          🔄 Corrigée
                        </span>
                      )}
                    </div>

                    {v.correction_notes && (
                      <div className="mb-4 rounded-lg bg-amber-500/5 border border-amber-500/20 px-3 py-2">
                        <div className="text-[9px] font-bold uppercase tracking-[0.2em] text-amber-400 mb-1">
                          Demande de correction
                        </div>
                        <div className="text-xs text-zinc-300 italic">
                          &quot;{v.correction_notes}&quot;
                        </div>
                      </div>
                    )}

                    {vBrief && (
                      <div className="grid md:grid-cols-2 gap-4 justify-items-center mb-4">
                        {(["fr", "en"] as const).map((lang) => {
                          const hook = lang === "fr" ? v.hook_fr : v.hook_en;
                          const body =
                            lang === "fr" ? vBrief.body_fr : vBrief.body_en;
                          const cta =
                            lang === "fr" ? vBrief.cta_fr : vBrief.cta_en;
                          return (
                            <div
                              key={lang}
                              className="flex flex-col items-center gap-2"
                            >
                              <div className="text-[9px] font-bold uppercase tracking-[0.2em] text-zinc-500">
                                {lang === "fr" ? "🇫🇷 FR" : "🇬🇧 EN"}
                              </div>
                              <AdPreview
                                format={vBrief.format}
                                accent={vAccent}
                                accentName={vBrief.accent_color}
                                hook={hook || ""}
                                body={body || ""}
                                cta={cta || ""}
                                lang={lang}
                                scale={0.32}
                              />
                            </div>
                          );
                        })}
                      </div>
                    )}

                    <div className="grid sm:grid-cols-2 gap-3 text-xs">
                      <div>
                        <div className="text-[9px] font-bold uppercase tracking-[0.2em] text-zinc-500 mb-1">
                          Hook FR
                        </div>
                        <div className="text-zinc-300 font-medium">
                          {v.hook_fr}
                        </div>
                      </div>
                      <div>
                        <div className="text-[9px] font-bold uppercase tracking-[0.2em] text-zinc-500 mb-1">
                          Hook EN
                        </div>
                        <div className="text-zinc-300 font-medium italic">
                          {v.hook_en}
                        </div>
                      </div>
                    </div>
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
