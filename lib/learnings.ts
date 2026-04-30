import { anthropic, MODEL } from "./anthropic";
import { supabaseAdmin } from "./supabase";
import { PRODUCT_CONTEXT } from "./prompts";

export type Learning = {
  id: string;
  pattern: string;
  category: string | null;
  frequency: number;
  last_seen: string;
  created_at: string;
};

type ExtractedLearning = {
  pattern: string;
  category: string;
  frequency: number;
};

export async function extractLearnings(): Promise<{
  count: number;
  learnings: ExtractedLearning[];
}> {
  const sb = supabaseAdmin();

  const { data: feedbackRows } = await sb
    .from("feedback")
    .select("verdict, notes, created_at")
    .order("created_at", { ascending: false })
    .limit(200);

  if (!feedbackRows || feedbackRows.length === 0) {
    return { count: 0, learnings: [] };
  }

  const feedbackForPrompt = feedbackRows
    .map((f) => {
      let parsed: { action?: string; general?: string } = {};
      try {
        parsed = JSON.parse(f.notes || "{}");
      } catch {}
      const action = parsed.action || f.verdict || "?";
      const note = parsed.general || "";
      return note ? `[${action}] ${note}` : null;
    })
    .filter((s): s is string => !!s)
    .join("\n");

  if (!feedbackForPrompt) {
    return { count: 0, learnings: [] };
  }

  const { data: existing } = await sb
    .from("learnings")
    .select("pattern, category, frequency");

  const existingForPrompt =
    (existing || [])
      .map((l) => `- [${l.category}] ${l.pattern} (×${l.frequency})`)
      .join("\n") || "(none)";

  const prompt = `
You are maintaining a long-term memory of rules for SetSmart's daily ad generation system. Your output guides future Claude calls to avoid repeating mistakes and reproduce what works.

# Product context
${PRODUCT_CONTEXT}

# Existing rules (the current memory)
${existingForPrompt}

# Recent user feedback on past ads
Each line is one piece of feedback. The action shows what the user did with that ad:
- [validate] = the user kept this ad. The note says WHAT WORKED.
- [decline] = the user rejected this ad. The note says WHAT DIDN'T WORK.
- [correct] = the user requested a regeneration. The note says WHAT TO CHANGE.

${feedbackForPrompt}

# Your task
Output an updated list of memory rules. Each rule must be:
- CONCRETE and ACTIONABLE — a future Claude reading the rule should know exactly what to do or avoid
- ONE sentence
- Tagged with a category: "design" / "copy" / "format" / "tone" / "general"

Rules:
- Merge similar feedback items into a single rule (don't duplicate)
- Increment frequency when multiple feedback items support the same rule
- Keep important existing rules even if not reinforced (decay slowly, not instantly)
- DROP rules that contradict newer feedback
- DROP vague rules ("be better", "more punchy")
- Aim for 8-25 rules total — quality over quantity

# Output
Return ONLY a JSON array, no prose, no markdown, no code fences. Each item:
{
  "pattern": "the rule, one concrete actionable sentence",
  "category": "design" | "copy" | "format" | "tone" | "general",
  "frequency": integer (count of feedback items supporting this rule, including past)
}
`.trim();

  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 4000,
    messages: [{ role: "user", content: prompt }],
  });

  const text = response.content
    .filter((c) => c.type === "text")
    .map((c) => (c as { type: "text"; text: string }).text)
    .join("");

  const cleaned = text
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```\s*$/i, "")
    .trim();

  const parsed = JSON.parse(cleaned);
  if (!Array.isArray(parsed)) {
    throw new Error("Learnings extractor did not return an array");
  }

  const learnings: ExtractedLearning[] = parsed.filter(
    (l) =>
      typeof l.pattern === "string" &&
      typeof l.category === "string" &&
      typeof l.frequency === "number"
  );

  await sb.from("learnings").delete().neq("id", "00000000-0000-0000-0000-000000000000");

  if (learnings.length > 0) {
    const rows = learnings.map((l) => ({
      pattern: l.pattern,
      category: l.category,
      frequency: l.frequency,
      last_seen: new Date().toISOString(),
    }));
    const { error } = await sb.from("learnings").insert(rows);
    if (error) {
      throw new Error(`Failed to insert learnings: ${error.message}`);
    }
  }

  return { count: learnings.length, learnings };
}
