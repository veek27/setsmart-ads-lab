import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      ad_id,
      rating,
      verdict,
      design_notes,
      copy_notes,
      general_notes,
      screenshot_urls,
    } = body;

    if (!ad_id || typeof ad_id !== "string") {
      return NextResponse.json(
        { ok: false, error: "ad_id required" },
        { status: 400 }
      );
    }

    const sb = supabaseAdmin();

    const notes = JSON.stringify({
      design: design_notes || "",
      copy: copy_notes || "",
      general: general_notes || "",
      screenshots: Array.isArray(screenshot_urls) ? screenshot_urls : [],
    });

    const { data, error } = await sb
      .from("feedback")
      .insert({
        ad_id,
        rating: typeof rating === "number" ? rating : null,
        verdict: ["keep", "pivot", "kill"].includes(verdict) ? verdict : null,
        notes,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { ok: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true, feedback: data });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
