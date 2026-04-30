import { anthropic, MODEL } from "./anthropic";
import { buildBatchPrompt } from "./prompts";

export type Concept = {
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

export async function generateConcepts(
  recentLearnings: string = ""
): Promise<Concept[]> {
  const prompt = buildBatchPrompt(recentLearnings);

  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 8000,
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

  const concepts = JSON.parse(cleaned);
  if (!Array.isArray(concepts)) {
    throw new Error("Claude did not return a JSON array");
  }
  if (concepts.length !== 10) {
    console.warn(
      `Expected 10 concepts, got ${concepts.length}. Continuing anyway.`
    );
  }

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

  for (const c of concepts) {
    for (const f of required) {
      if (typeof c[f] !== "string") {
        throw new Error(
          `Concept missing field: ${f} (got ${JSON.stringify(c)})`
        );
      }
    }
  }

  return concepts as Concept[];
}
