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

CRITICAL RULE: ONLY modify what the user EXPLICITLY asked to change. Everything else MUST stay byte-for-byte identical to the input. This is non-negotiable.

# Product context
${PRODUCT_CONTEXT}

# Style guide
${STYLE_GUIDE}

# Current concept (the input)
${JSON.stringify(current, null, 2)}

# What the user EXPLICITLY asked to change
${correctionNotes}

# How to interpret the request
Read the user's note carefully and identify ONLY the fields they're talking about:
- If they mention "hook", "headline", "title", "accroche" → modify hook_fr and/or hook_en (only the language they mention; if unclear, modify both equivalently)
- If they mention "body", "corps", "texte", "sous-titre" → modify body_fr and/or body_en
- If they mention "CTA", "bouton", "button", "call-to-action" → modify cta_fr and/or cta_en
- If they mention "color", "couleur", "yellow", "emerald", etc. → modify accent_color
- If they mention "format", "layout", "disposition", "structure visuelle" → modify "concept" description (and "format" if they ask for a different format type)
- If they mention "conversation", "DM", "messages" (for fake-dm format) → modify "concept" description with the new conversation flow
- If they mention "FR" or "français" → ONLY touch *_fr fields, leave *_en untouched
- If they mention "EN" or "english" or "anglais" → ONLY touch *_en fields, leave *_fr untouched

# Anti-patterns (DO NOT)
- DO NOT "improve" or "polish" anything the user didn't ask about
- DO NOT change the EN if they only talked about the FR (or vice versa)
- DO NOT rename the slug
- DO NOT change the format unless explicitly asked
- DO NOT change the accent_color unless explicitly asked
- DO NOT translate one side to match the other unless they say "applique pareil en EN/FR" or similar
- DO NOT add emojis you didn't see in the input

# Output
Return ONLY a single raw JSON object (NOT an array). No prose, no markdown, no code fences. Same fields as the input: slug, concept, format, accent_color, hook_fr, hook_en, body_fr, body_en, cta_fr, cta_en.

For each field that the user did NOT ask to change, COPY THE INPUT VALUE VERBATIM.
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
