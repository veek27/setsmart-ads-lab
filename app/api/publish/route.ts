import { NextResponse } from "next/server";
import JSZip from "jszip";
import crypto from "crypto";
import { supabaseAdmin } from "@/lib/supabase";
import { screenshotAd } from "@/lib/screenshot";
import type { Ad, Batch } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 300;

type ShareFile = {
  filename: string;
  url: string;
  lang: "fr" | "en";
  slug: string;
  position: number;
};

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

    const ts = Date.now();
    const frZip = new JSZip();
    const enZip = new JSZip();
    const files: ShareFile[] = [];

    for (const ad of ads) {
      for (const lang of ["fr", "en"] as const) {
        const renderUrl = `${baseUrl}/render/${ad.id}/${lang}`;
        const png = await screenshotAd(renderUrl);
        const filename = `${ad.position
          ?.toString()
          .padStart(2, "0")}-${ad.slug}-${lang}.png`;

        const path = `batches/${batch.date}/${ts}/${lang}/${filename}`;
        const { error: upErr } = await sb.storage
          .from("ads-lab-images")
          .upload(path, png, { contentType: "image/png", upsert: true });
        if (upErr) throw new Error(`Upload PNG failed: ${upErr.message}`);

        const { data: urlData } = sb.storage
          .from("ads-lab-images")
          .getPublicUrl(path);

        files.push({
          filename,
          url: urlData.publicUrl,
          lang,
          slug: ad.slug,
          position: ad.position || 0,
        });

        if (lang === "fr") frZip.file(filename, png);
        else enZip.file(filename, png);
      }
    }

    const [frBuffer, enBuffer] = await Promise.all([
      frZip.generateAsync({
        type: "nodebuffer",
        compression: "DEFLATE",
        compressionOptions: { level: 6 },
      }),
      enZip.generateAsync({
        type: "nodebuffer",
        compression: "DEFLATE",
        compressionOptions: { level: 6 },
      }),
    ]);

    const frPath = `batches/${batch.date}/${ts}/fr.zip`;
    const enPath = `batches/${batch.date}/${ts}/en.zip`;

    const [frUp, enUp] = await Promise.all([
      sb.storage
        .from("ads-lab-images")
        .upload(frPath, frBuffer, {
          contentType: "application/zip",
          upsert: true,
        }),
      sb.storage
        .from("ads-lab-images")
        .upload(enPath, enBuffer, {
          contentType: "application/zip",
          upsert: true,
        }),
    ]);
    if (frUp.error) throw new Error(`Upload FR ZIP: ${frUp.error.message}`);
    if (enUp.error) throw new Error(`Upload EN ZIP: ${enUp.error.message}`);

    const { data: frUrl } = sb.storage
      .from("ads-lab-images")
      .getPublicUrl(frPath);
    const { data: enUrl } = sb.storage
      .from("ads-lab-images")
      .getPublicUrl(enPath);

    const token = crypto.randomBytes(12).toString("base64url");
    const { error: shareErr } = await sb.from("shares").insert({
      token,
      batch_id: batch.id,
      files,
    });
    if (shareErr) throw new Error(`Share creation: ${shareErr.message}`);

    const shareUrl = `${baseUrl}/share/${token}`;

    return NextResponse.json({
      ok: true,
      batchId: batch.id,
      batchDate: batch.date,
      adsCount: ads.length,
      filesGenerated: files.length,
      links: {
        share: shareUrl,
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
