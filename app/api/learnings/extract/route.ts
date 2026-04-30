import { NextResponse } from "next/server";
import { extractLearnings } from "@/lib/learnings";

export const runtime = "nodejs";
export const maxDuration = 120;

export async function POST() {
  try {
    const result = await extractLearnings();
    return NextResponse.json({ ok: true, ...result });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
