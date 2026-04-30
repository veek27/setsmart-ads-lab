import { anthropic, MODEL } from "./anthropic";
import { PRODUCT_CONTEXT, STYLE_GUIDE } from "./prompts";
import type { Concept } from "./concepts";

type CurrentAd = {
  slug: string;
  concept: string;
  format: string;
  accent_color: string;
  hook_fr: string;
  hook_en: string;
  body_fr: string;
  body_en: string;
  cta_fr: string;
  cta_en: string;
};

export async function correctConcept(
  current: CurrentAd,
  correctionNotes: string
): Promise<Concept> {
  const prompt = `
You are revising an existing SetSmart ad concept based on user feedback.

# Product context
${PRODUCT_CONTEXT}

# Style guide
${STYLE_GUIDE}

# Current concept
${JSON.stringify(current, null, 2)}

# What the user wants changed
${correctionNotes}

# Your task
Output a single REVISED concept JSON, keeping the SAME slug, format, and accent_color (unless the feedback explicitly asks to change them). Update hooks, body, CTA, and concept description to address the feedback. Both French and English versions must reflect the change equivalently — never just translate, recompose so each version feels native.

If the feedback is about the visual concept (e.g. "the layout doesn't work"), revise the "concept" description AND the format if necessary.

If the feedback is about copy (e.g. "hook too long"), keep the format and revise hooks/body/CTA.

# Output
Return ONLY a single raw JSON object (NOT an array). No prose, no markdown, no code fences. Same fields as the input: slug, concept, format, accent_color, hook_fr, hook_en, body_fr, body_en, cta_fr, cta_en.
`.trim();

  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 2000,
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

  const concept = JSON.parse(cleaned) as Concept;

  const required: (keyof Concept)[] = [
    "slug",
    "concept",
    "format",
    "accent_color",
    "hook_fr",
    "hook_en",
    "body_fr",
    "body_en",
    "cta_fr",
    "cta_en",
  ];
  for (const f of required) {
    if (typeof concept[f] !== "string") {
      throw new Error(`Revised concept missing field: ${f}`);
    }
  }

  return concept;
}
