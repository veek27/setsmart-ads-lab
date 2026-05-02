import { NextResponse } from "next/server";
import JSZip from "jszip";
import { supabaseAdmin } from "@/lib/supabase";

export const runtime = "nodejs";
export const maxDuration = 60;

type ShareFile = {
  filename: string;
  url: string;
  lang: "fr" | "en";
  slug: string;
  position: number;
};

export async function POST(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const { filenames } = await request.json();

    if (!Array.isArray(filenames) || filenames.length === 0) {
      return NextResponse.json(
        { ok: false, error: "filenames required (array)" },
        { status: 400 }
      );
    }

    const sb = supabaseAdmin();
    const { data: share } = await sb
      .from("shares")
      .select("files")
      .eq("token", token)
      .maybeSingle();

    if (!share) {
      return NextResponse.json(
        { ok: false, error: "Share not found" },
        { status: 404 }
      );
    }

    const allFiles = share.files as ShareFile[];
    const wanted = allFiles.filter((f) => filenames.includes(f.filename));

    if (wanted.length === 0) {
      return NextResponse.json(
        { ok: false, error: "No matching files" },
        { status: 400 }
      );
    }

    const zip = new JSZip();
    await Promise.all(
      wanted.map(async (f) => {
        const res = await fetch(f.url);
        if (!res.ok) throw new Error(`Fetch ${f.filename} failed`);
        const buf = Buffer.from(await res.arrayBuffer());
        zip.file(f.filename, buf);
      })
    );

    const buffer = await zip.generateAsync({
      type: "nodebuffer",
      compression: "DEFLATE",
      compressionOptions: { level: 6 },
    });

    return new Response(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="setsmart-ads-${Date.now()}.zip"`,
      },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
