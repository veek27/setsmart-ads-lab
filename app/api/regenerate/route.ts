import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { runDailyBatch } from "@/lib/pipeline";

export const runtime = "nodejs";
export const maxDuration = 300;

function isValidDate(s: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(s);
}

export async function POST(request: Request) {
  try {
    const { date } = await request.json().catch(() => ({}));
    if (!date || !isValidDate(date)) {
      return NextResponse.json(
        { ok: false, error: "Date invalide (format YYYY-MM-DD requis)" },
        { status: 400 }
      );
    }

    const sb = supabaseAdmin();
    const { error: delErr } = await sb
      .from("batches")
      .delete()
      .eq("date", date);
    if (delErr) {
      return NextResponse.json(
        { ok: false, error: `Suppression échouée: ${delErr.message}` },
        { status: 500 }
      );
    }

    const result = await runDailyBatch(date);
    return NextResponse.json({ ok: true, ...result });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
