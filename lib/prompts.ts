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

export const COPY_RULES = `
Wording — what to AVOID:
- Clinical / corporate words: "maladie", "obligation", "ressource", "human capital", "asset". Prefer human/casual: "absent", "craqué", "off", "sick day", "burned out".
- Literal translations FR↔EN. Each language must read native. Example bad: "Maladie" → "Sickness". Example good: "Maladie" (FR) → "Sick days" (EN).
- Filler words ("vraiment", "très", "really", "very").
- Emojis unless they earn their place (max 1 emoji per ad, never in the hook).

Wording — what to AIM for:
- Punch over polish. Short over correct. Cheeky over corporate.
- French = playful, slightly cheeky. English = direct, slightly more dry/witty.
- Rare words / unexpected phrasing > flat dictionary words.
`.trim();

export const buildBatchPrompt = (
  recentLearnings: string,
  recentConcepts: string
) => `
You are generating 10 distinct ad concepts for SetSmart's daily marketing batch.

# Product context
${PRODUCT_CONTEXT}

# Style guide
${STYLE_GUIDE}

# Copy rules
${COPY_RULES}

# What I learned from past batches
${recentLearnings || "(no feedback yet — first batch)"}

# Concepts already produced in the last 14 days — DO NOT REPEAT
${recentConcepts || "(none — this is the first batch)"}

# Anti-repetition rules (HARD CONSTRAINTS)
1. **Hooks**: NO hook can be similar in meaning, structure, or keyword to ANY hook above. If yesterday had "Le classement des setters", you CAN'T do "Le classement des temps de réponse" — too close. Pick a totally different angle.
2. **Formats**: Look at YESTERDAY's batch (the most recent date in the list above). Use AT MOST 4 of yesterday's formats. The other 6+ MUST be different formats from the allowed list. This forces visual variety day-to-day.
3. **Value-prop angles**: each of the 10 concepts must hit a DIFFERENT angle (cost / speed / consistency / scale / quality / no-drama / 24-7 / multi-lang / qualification / no-hiring). Don't do 2 ads about cost.
4. **Specific entities**: don't reuse the same fake names (e.g. "Marc"), same hours (e.g. "3h47", "9h00"), same stats (e.g. "8 sec", "47 DMs"). Vary all numerical and named details.

If you catch yourself drafting something close to a past entry, REJECT and re-draft from a fundamentally different angle.

# Your task
Generate exactly 10 ad concepts. Each concept must be ANGLED differently. Mix:
- different value-prop angles (cost / speed / consistency / scale / quality / no drama)
- different formats (see allowed list below)
- different emotional registers (rational / funny / aggressive / reassuring)

# Required fields for EVERY concept
- "slug": short kebab-case id, unique within the batch
- "concept": one sentence describing the visual concept
- "format": one of: "split-screen", "single-stat", "fake-dm", "before-after", "tier-list", "fake-tweet", "comparison-table", "minimal-quote", "shock-stat", "narrative"
- "accent_color": one of "emerald", "amber", "rose", "sky", "violet"
- "hook_fr": the hook in French (≤ 8 words, native French phrasing)
- "hook_en": the hook in English (≤ 8 words, native English phrasing — NOT a translation)
- "body_fr": short body copy in French (1 sentence ≤ 12 words OR 2-3 micro-bullets ≤ 6 words each)
- "body_en": same in English (native, not translated)
- "cta_fr": French CTA (≤ 5 words, imperative)
- "cta_en": English CTA (≤ 5 words, imperative)

# Format-specific "meta" field (CRITICAL)
For formats with structured visual content, ALSO include a "meta" object with bilingual content:

If format = "comparison-table":
  "meta": {
    "rows": [4-5 rows total]
    Each row: { "label_fr": "...", "label_en": "...", "h_fr": "...", "h_en": "...", "a_fr": "...", "a_en": "..." }
    label = the metric name (e.g. "Coût/mois" / "Monthly cost")
    h = the human-setter value (e.g. "€3-5k" / "$3-5k")
    a = the SetSmart value (e.g. "€199" / "$199")
    Make each row PUNCHY — short values that contrast.
  }

If format = "tier-list":
  "meta": {
    "tiers": [exactly 5 tiers, S/A/B/C/F]
    Each: { "tier": "S"|"A"|"B"|"C"|"F", "label_fr": "...", "label_en": "..." }
    label = what's in that tier (e.g. "SetSmart" / "SetSmart", "Top agency" / "Top agency", "Le pote dev" / "Your dev friend")
  }

If format = "fake-dm":
  "meta": {
    "messages": [5-8 messages, alternating sides, ending with a confirmed booking]
    Each: { "side": "them"|"me", "text_fr": "...", "text_en": "..." }
    "them" = SetSmart side (the AI). "me" = the lead.
    Conversation must show: greeting → qualifying questions → confirmation of a booked slot.
    Each message ≤ 8 words.
  }

If format = "narrative":
  "meta": {
    "steps": [3-5 timeline steps]
    Each: { "time": "9:00", "text_fr": "...", "text_en": "..." }
    Last step = the SetSmart win moment (highlighted).
    text ≤ 6 words each side.
  }

If format = "before-after":
  "meta": {
    "before_fr": "...", "before_en": "...",
    "after_fr": "...", "after_en": "..."
    Each ≤ 10 words. Concrete and contrasting.
  }

If format = "split-screen":
  "meta": {
    "left_fr": "...", "left_en": "...",
    "right_fr": "...", "right_en": "..."
    Left = human setter side. Right = SetSmart side. Each ≤ 8 words.
  }

For formats "single-stat", "shock-stat", "fake-tweet", "minimal-quote": NO meta needed.

# Output format
Return ONLY a JSON array of 10 objects, no prose, no markdown, no code fences.
`.trim();
