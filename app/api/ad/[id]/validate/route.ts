import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export const runtime = "nodejs";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const sb = supabaseAdmin();

  let notes = "";
  try {
    const body = await request.json();
    notes = (body?.notes || "").toString().trim();
  } catch {}

  const { error: statusErr } = await sb
    .from("ads")
    .update({ status: "validated" })
    .eq("id", id);
  if (statusErr) {
    return NextResponse.json(
      { ok: false, error: statusErr.message },
      { status: 500 }
    );
  }

  if (notes) {
    const { error: feedbackErr } = await sb.from("feedback").insert({
      ad_id: id,
      verdict: "keep",
      notes: JSON.stringify({
        action: "validate",
        general: notes,
      }),
    });
    if (feedbackErr) {
      console.error("[validate] feedback insert failed:", feedbackErr);
    }
  }

  return NextResponse.json({ ok: true });
}
