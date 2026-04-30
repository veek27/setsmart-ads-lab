import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { correctConcept } from "@/lib/correction";
import { parseBrief } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 120;

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { notes } = await request.json();

    if (!notes || typeof notes !== "string" || notes.trim().length < 3) {
      return NextResponse.json(
        { ok: false, error: "Correction notes required (3+ chars)" },
        { status: 400 }
      );
    }

    const sb = supabaseAdmin();

    const { data: ad, error: fetchErr } = await sb
      .from("ads")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (fetchErr || !ad) {
      return NextResponse.json(
        { ok: false, error: "Ad not found" },
        { status: 404 }
      );
    }

    const brief = parseBrief(ad.brief);
    if (!brief) {
      return NextResponse.json(
        { ok: false, error: "Ad brief is malformed" },
        { status: 500 }
      );
    }

    const { error: snapshotErr } = await sb.from("ad_versions").insert({
      ad_id: id,
      version: ad.version,
      hook_fr: ad.hook_fr,
      hook_en: ad.hook_en,
      brief: ad.brief,
      correction_notes: null,
    });
    if (snapshotErr) {
      return NextResponse.json(
        { ok: false, error: `Snapshot failed: ${snapshotErr.message}` },
        { status: 500 }
      );
    }

    const revised = await correctConcept(
      {
        slug: ad.slug,
        concept: ad.concept,
        format: brief.format,
        accent_color: brief.accent_color,
        hook_fr: ad.hook_fr || "",
        hook_en: ad.hook_en || "",
        body_fr: brief.body_fr,
        body_en: brief.body_en,
        cta_fr: brief.cta_fr,
        cta_en: brief.cta_en,
      },
      notes
    );

    const newBrief = JSON.stringify({
      format: revised.format,
      accent_color: revised.accent_color,
      body_fr: revised.body_fr,
      body_en: revised.body_en,
      cta_fr: revised.cta_fr,
      cta_en: revised.cta_en,
    });

    const { error: updateErr } = await sb
      .from("ads")
      .update({
        concept: revised.concept,
        hook_fr: revised.hook_fr,
        hook_en: revised.hook_en,
        brief: newBrief,
        version: ad.version + 1,
        status: "pending",
      })
      .eq("id", id);

    if (updateErr) {
      return NextResponse.json(
        { ok: false, error: `Update failed: ${updateErr.message}` },
        { status: 500 }
      );
    }

    await sb
      .from("ad_versions")
      .update({ correction_notes: notes })
      .eq("ad_id", id)
      .eq("version", ad.version);

    return NextResponse.json({
      ok: true,
      newVersion: ad.version + 1,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
