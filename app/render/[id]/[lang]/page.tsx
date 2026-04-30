import { supabaseAdmin } from "@/lib/supabase";
import { parseBrief, ACCENT_COLORS, type Ad } from "@/lib/types";
import AdRenderer from "@/components/AdRenderer";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type Params = { id: string; lang: "fr" | "en" };

export default async function RenderPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { id, lang } = await params;

  const sb = supabaseAdmin();
  const { data } = await sb
    .from("ads")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!data) notFound();
  const ad = data as Ad;

  const brief = parseBrief(ad.brief);
  if (!brief) notFound();

  const accent = ACCENT_COLORS[brief.accent_color] || "#fbbf24";
  const hook = lang === "fr" ? ad.hook_fr : ad.hook_en;
  const body = lang === "fr" ? brief.body_fr : brief.body_en;
  const cta = lang === "fr" ? brief.cta_fr : brief.cta_en;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: 540,
        height: 960,
        zIndex: 9999,
        background: "#f4f5f7",
      }}
    >
      <AdRenderer
        format={brief.format}
        accent={accent}
        accentName={brief.accent_color}
        hook={hook || ""}
        body={body || ""}
        cta={cta || ""}
        lang={lang}
        meta={brief.meta}
      />
    </div>
  );
}
