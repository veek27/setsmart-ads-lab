import { anthropic, MODEL } from "./anthropic";
import { PRODUCT_CONTEXT, STYLE_GUIDE, COPY_RULES } from "./prompts";
import type { Concept } from "./concepts";
import type { Meta } from "./types";

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
  meta?: Meta;
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

# Copy rules
${COPY_RULES}

# Current concept (the input)
${JSON.stringify(current, null, 2)}

# What the user EXPLICITLY asked to change
${correctionNotes}

# How to interpret the request
Read the user's note carefully and identify ONLY the fields they're talking about:
- "hook"/"headline"/"title"/"accroche" → modify hook_fr and/or hook_en (only the language they mention; if unclear, modify both equivalently)
- "body"/"corps"/"texte"/"sous-titre" → modify body_fr and/or body_en
- "CTA"/"bouton"/"button" → modify cta_fr and/or cta_en
- "color"/"couleur" → modify accent_color
- "format"/"layout"/"structure" → modify "concept" description and "format" if needed
- "table" or "tableau" or "rows" → modify meta.rows
- "tier"/"S/A/B/C/F" → modify meta.tiers
- "conversation"/"DM"/"messages"/"bulles" → modify meta.messages
- "timeline"/"steps"/"étapes" → modify meta.steps
- "before-after"/"avant-après" → modify meta.before_*/after_*
- "split"/"droite"/"gauche" → modify meta.left_*/right_*
- "FR"/"français" → ONLY touch *_fr fields (and meta.*_fr)
- "EN"/"english"/"anglais" → ONLY touch *_en fields (and meta.*_en)

# Anti-patterns (DO NOT)
- DO NOT "improve" or "polish" anything the user didn't ask about
- DO NOT change EN if they only talked about FR (or vice versa)
- DO NOT rename the slug
- DO NOT change format unless explicitly asked
- DO NOT change accent_color unless explicitly asked
- DO NOT translate one side to match the other unless they say "applique pareil"
- DO NOT add emojis you didn't see in the input

# Output
Return ONLY a single raw JSON object (NOT an array). No prose, no markdown, no code fences. Same fields as the input: slug, concept, format, accent_color, hook_fr, hook_en, body_fr, body_en, cta_fr, cta_en, AND a "meta" object if the input had one OR if the format requires structured content.

For each field that the user did NOT ask to change, COPY THE INPUT VALUE VERBATIM.
`.trim();

  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 3000,
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
