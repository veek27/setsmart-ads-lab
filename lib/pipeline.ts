import { supabaseAdmin } from "./supabase";
import { generateConcepts, type Concept } from "./concepts";

export type RunResult = {
  date: string;
  batchId: string;
  conceptsCount: number;
  durationMs: number;
};

function todayParis(): string {
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Paris",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return fmt.format(new Date());
}

async function getRecentLearnings(): Promise<string> {
  const sb = supabaseAdmin();
  const { data } = await sb
    .from("learnings")
    .select("pattern, frequency")
    .order("frequency", { ascending: false })
    .limit(20);
  if (!data || data.length === 0) return "";
  return data.map((l) => `- ${l.pattern} (seen ${l.frequency}×)`).join("\n");
}

export async function runDailyBatch(): Promise<RunResult> {
  const started = Date.now();
  const sb = supabaseAdmin();
  const date = todayParis();

  const { data: existing } = await sb
    .from("batches")
    .select("id, status")
    .eq("date", date)
    .maybeSingle();

  if (existing && existing.status === "done") {
    return {
      date,
      batchId: existing.id,
      conceptsCount: 0,
      durationMs: Date.now() - started,
    };
  }

  const { data: batch, error: batchErr } = existing
    ? await sb
        .from("batches")
        .update({ status: "running" })
        .eq("id", existing.id)
        .select()
        .single()
    : await sb
        .from("batches")
        .insert({ date, status: "running" })
        .select()
        .single();

  if (batchErr || !batch) {
    throw new Error(`Failed to create batch: ${batchErr?.message}`);
  }

  let concepts: Concept[];
  try {
    const learnings = await getRecentLearnings();
    concepts = await generateConcepts(learnings);
  } catch (e) {
    await sb.from("batches").update({ status: "failed" }).eq("id", batch.id);
    throw e;
  }

  const rows = concepts.map((c, i) => ({
    batch_id: batch.id,
    slug: c.slug,
    concept: c.concept,
    hook_fr: c.hook_fr,
    hook_en: c.hook_en,
    brief: JSON.stringify({
      format: c.format,
      accent_color: c.accent_color,
      body_fr: c.body_fr,
      body_en: c.body_en,
      cta_fr: c.cta_fr,
      cta_en: c.cta_en,
    }),
    position: i + 1,
  }));

  const { error: insertErr } = await sb.from("ads").insert(rows);
  if (insertErr) {
    await sb.from("batches").update({ status: "failed" }).eq("id", batch.id);
    throw new Error(`Failed to insert ads: ${insertErr.message}`);
  }

  await sb
    .from("batches")
    .update({
      status: "done",
      summary: `${concepts.length} concepts generated`,
    })
    .eq("id", batch.id);

  return {
    date,
    batchId: batch.id,
    conceptsCount: concepts.length,
    durationMs: Date.now() - started,
  };
}
