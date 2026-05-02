import { NextResponse } from "next/server";
import JSZip from "jszip";
import { supabaseAdmin } from "@/lib/supabase";
import { screenshotAd } from "@/lib/screenshot";
import type { Ad, Batch } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 300;

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const batchId: string | undefined = body?.batchId;

    const sb = supabaseAdmin();

    let batch: Batch;
    if (batchId) {
      const { data } = await sb
        .from("batches")
        .select("*")
        .eq("id", batchId)
        .maybeSingle();
      if (!data) {
        return NextResponse.json(
          { ok: false, error: "Batch not found" },
          { status: 404 }
        );
      }
      batch = data as Batch;
    } else {
      const { data } = await sb
        .from("batches")
        .select("*")
        .order("date", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (!data) {
        return NextResponse.json(
          { ok: false, error: "No batch found" },
          { status: 404 }
        );
      }
      batch = data as Batch;
    }

    const { data: validatedAds } = await sb
      .from("ads")
      .select("*")
      .eq("batch_id", batch.id)
      .eq("status", "validated")
      .order("position");

    if (!validatedAds || validatedAds.length === 0) {
      return NextResponse.json(
        { ok: false, error: "Aucune ad validée dans ce batch" },
        { status: 400 }
      );
    }

    const ads = validatedAds as Ad[];

    const reqUrl = new URL(request.url);
    const baseUrl = `${reqUrl.protocol}//${reqUrl.host}`;

    const frZip = new JSZip();
    const enZip = new JSZip();

    let processed = 0;
    for (const ad of ads) {
      for (const lang of ["fr", "en"] as const) {
        const renderUrl = `${baseUrl}/render/${ad.id}/${lang}`;
        const png = await screenshotAd(renderUrl);
        const filename = `${ad.position
          ?.toString()
          .padStart(2, "0")}-${ad.slug}.png`;
        if (lang === "fr") {
          frZip.file(filename, png);
        } else {
          enZip.file(filename, png);
        }
        processed++;
      }
    }

    const frBuffer = await frZip.generateAsync({
      type: "nodebuffer",
      compression: "DEFLATE",
      compressionOptions: { level: 6 },
    });
    const enBuffer = await enZip.generateAsync({
      type: "nodebuffer",
      compression: "DEFLATE",
      compressionOptions: { level: 6 },
    });

    const ts = Date.now();
    const frPath = `batches/${batch.date}/${ts}-fr.zip`;
    const enPath = `batches/${batch.date}/${ts}-en.zip`;

    const { error: frUpErr } = await sb.storage
      .from("ads-lab-images")
      .upload(frPath, frBuffer, {
        contentType: "application/zip",
        upsert: true,
      });
    if (frUpErr) throw new Error(`Upload FR ZIP failed: ${frUpErr.message}`);

    const { error: enUpErr } = await sb.storage
      .from("ads-lab-images")
      .upload(enPath, enBuffer, {
        contentType: "application/zip",
        upsert: true,
      });
    if (enUpErr) throw new Error(`Upload EN ZIP failed: ${enUpErr.message}`);

    const { data: frUrl } = sb.storage
      .from("ads-lab-images")
      .getPublicUrl(frPath);
    const { data: enUrl } = sb.storage
      .from("ads-lab-images")
      .getPublicUrl(enPath);

    return NextResponse.json({
      ok: true,
      batchId: batch.id,
      batchDate: batch.date,
      adsCount: ads.length,
      filesGenerated: processed,
      links: {
        fr: frUrl.publicUrl,
        en: enUrl.publicUrl,
      },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[publish] failed:", msg);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
