export const PRODUCT_CONTEXT = `
SetSmart is an AI that replaces human setters/sales-reps for businesses doing outbound prospecting, lead qualification, and customer service. It runs 24/7, doesn't quit, doesn't get tired, costs a fraction of a human, integrates with Calendly/Cal.com/GHL, and handles multi-language conversations natively.

Target customers: agencies, coaches, consultants, info-product creators, B2B SaaS doing sales — anyone who currently has (or wants to avoid hiring) a team of humans to chat with leads on Instagram DM, WhatsApp, or via web chat.

Core pain points we hit:
- Human setters quit, are inconsistent, expensive (€2k-€5k/month each), need management
- Leads get stale waiting hours/days for a reply
- Setters get distracted, miss messages, mess up qualifications
- Time zones / nights / weekends = lost leads
- Hard to scale (each new setter = new hiring cycle)

Core value prop angles to mix:
1. Cost savings (one AI = 5-10 humans)
2. Speed (replies in seconds 24/7)
3. Consistency (zero bad days, never tilts)
4. Scale (handles 1 or 10000 leads same effort)
5. Quality (asks the right questions, books the call, doesn't pressure)
6. No drama (no HR, no quitting, no sick days)

Brand tone: punchy, founder-friendly, slightly cheeky, never corporate. We talk to operators who hate fluff.
`.trim();

export const STYLE_GUIDE = `
Visual identity (matches existing SetSmart creatives):
- Format: 1080×1920 vertical (9:16, Instagram Story / Reels)
- Background: light off-white #f4f5f7 (NOT dark — SetSmart's existing creatives use a light, friendly base with playful color accents)
- Text: navy-black #0a0a0a primary, muted #6b7280 secondary
- Accent palette (pick 1-2 per concept, never all):
  * yellow #fbbf24 / amber #f59e0b (highlight boxes, "good" side)
  * green #10b981 (positive, AI side, "win")
  * red #ef4444 / dark red #991b1b (pain, "bad" side, urgent)
  * navy #0a0a0a (contrast badges)
- Typography: Inter, weights 400/600/700/800/900. Hooks use 900-weight, big size (32-44px in 540px canvas). Tight tracking (-1px).
- Decorative bg: subtle radial-gradient color blobs in corners + dot pattern overlay (low opacity)

Hook treatment:
- Highlighted keywords use a colored background box (yellow most often) with slight rotation (-2° or +2°) — gives it sticker/playful feel
- "VS" or contrast words can be in a navy chip, rotated opposite direction
- Don't be afraid of size — hook should be impossible to miss

Layout patterns from existing work:
- Safe zone: keep all critical content within vertical 22%-78% of canvas (TikTok/Instagram safe area)
- Logo at top center (~25% from top, small 30px circular)
- Hook just below logo
- Visual content (cards, chart, comparison) in middle 50%
- CTA at bottom

Copy rules:
- Hook ≤ 8 words, punchy. Question, stat, or contrast. French = slightly playful/cheeky, English = slightly more direct.
- Body: 1 short sentence OR 2-3 ultra-short bullets (≤ 6 words each)
- CTA: imperative, ≤ 5 words. Points to SetSmart product
- No emojis in hooks. Sparingly elsewhere.
- French and English convey the SAME idea, not literal translations.
`.trim();

export const buildBatchPrompt = (recentLearnings: string) => `
You are generating 10 distinct ad concepts for SetSmart's daily marketing batch.

# Product context
${PRODUCT_CONTEXT}

# Style guide
${STYLE_GUIDE}

# What I learned from past batches
${recentLearnings || "(no feedback yet — first batch)"}

# Your task
Generate exactly 10 ad concepts. Each concept must be ANGLED differently — don't make 10 variations of the same idea. Mix:
- different value-prop angles (cost / speed / consistency / scale / quality / no drama)
- different formats (split-screen comparison, single bold stat, fake-DM screenshot, before/after, tier list, fake-Apple-keynote, fake-LinkedIn post, etc.)
- different emotional registers (rational / funny / aggressive / reassuring)

For each concept, output a JSON object with these fields:
- "slug": short kebab-case id, unique within the batch (e.g. "split-stress-vs-zen", "tier-list-setters")
- "concept": one sentence describing the visual concept (what the eye sees)
- "format": one of: "split-screen", "single-stat", "fake-dm", "before-after", "tier-list", "fake-tweet", "comparison-table", "minimal-quote", "shock-stat", "narrative"
- "accent_color": one of "emerald", "amber", "rose", "sky", "violet"
- "hook_fr": the hook in French (≤ 8 words)
- "hook_en": the hook in English (≤ 8 words)
- "body_fr": short body copy in French (1 sentence or 2-3 micro-bullets)
- "body_en": same in English
- "cta_fr": French CTA (≤ 5 words)
- "cta_en": English CTA (≤ 5 words)

# Output format
Return ONLY a JSON array of 10 objects, no prose, no markdown, no code fences. Just the raw JSON array.
`.trim();
