import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { screenshotAd } from "@/lib/screenshot";
import {
  createBatchFolder,
  createSubfolder,
  uploadPng,
} from "@/lib/drive";
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
        {
          ok: false,
          error: "Aucune ad validée dans ce batch",
        },
        { status: 400 }
      );
    }

    const ads = validatedAds as Ad[];

    const parentFolderId = process.env.GOOGLE_DRIVE_PARENT_FOLDER_ID;
    if (!parentFolderId) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Drive non configuré. Définis GOOGLE_DRIVE_PARENT_FOLDER_ID + service account.",
        },
        { status: 500 }
      );
    }

    const batchFolder = await createBatchFolder(parentFolderId, batch.date);

    const [frFolder, enFolder] = await Promise.all([
      createSubfolder(batchFolder.folderId, "FR"),
      createSubfolder(batchFolder.folderId, "EN"),
    ]);

    const url = new URL(request.url);
    const baseUrl = `${url.protocol}//${url.host}`;

    let uploaded = 0;
    for (const ad of ads) {
      for (const lang of ["fr", "en"] as const) {
        const renderUrl = `${baseUrl}/render/${ad.id}/${lang}`;
        const png = await screenshotAd(renderUrl);
        const filename = `${ad.position
          ?.toString()
          .padStart(2, "0")}-${ad.slug}.png`;
        const targetFolder = lang === "fr" ? frFolder.folderId : enFolder.folderId;
        await uploadPng(targetFolder, filename, png);
        uploaded++;
      }
    }

    return NextResponse.json({
      ok: true,
      batchId: batch.id,
      batchDate: batch.date,
      adsCount: ads.length,
      filesUploaded: uploaded,
      links: {
        batch: batchFolder.folderUrl,
        fr: frFolder.folderUrl,
        en: enFolder.folderUrl,
      },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[publish] failed:", msg);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
