import type { Meta } from "@/lib/types";

type Props = {
  format: string;
  accent: string;
  accentName: string;
  hook: string;
  body: string;
  cta: string;
  lang: "fr" | "en";
  meta?: Meta;
};

const NAVY = "#0a0a0a";
const BG = "#f4f5f7";

export default function AdRenderer(props: Props) {
  return (
    <div
      style={{
        width: 540,
        height: 960,
        position: "relative",
        background: BG,
        overflow: "hidden",
        fontFamily: "'Inter', system-ui, sans-serif",
        color: NAVY,
      }}
    >
      <BackgroundLayer accent={props.accent} />
      <SafeZone>
        <Stage {...props} />
      </SafeZone>
    </div>
  );
}

function BackgroundLayer({ accent }: { accent: string }) {
  return (
    <>
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `
            radial-gradient(circle at 18% 12%, ${accent}26, transparent 38%),
            radial-gradient(circle at 82% 88%, ${accent}1a, transparent 38%),
            radial-gradient(circle at 82% 12%, #fbbf2422, transparent 38%),
            radial-gradient(circle at 18% 88%, #ef444418, transparent 38%)
          `,
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "radial-gradient(circle, rgba(10,10,10,0.08) 1.2px, transparent 1.4px)",
          backgroundSize: "18px 18px",
          opacity: 0.3,
          pointerEvents: "none",
        }}
      />
    </>
  );
}

function SafeZone({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        position: "absolute",
        top: 210,
        left: 0,
        right: 0,
        height: 540,
        padding: "0 28px",
        zIndex: 30,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        overflow: "hidden",
      }}
    >
      {children}
    </div>
  );
}

function Logo() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        flexShrink: 0,
      }}
    >
      <img
        src="/logo-setsmart.png"
        alt=""
        width={28}
        height={28}
        style={{
          borderRadius: 7,
          objectFit: "cover",
          boxShadow: "0 4px 12px rgba(0,0,0,0.12)",
        }}
      />
      <span
        style={{
          fontSize: 13,
          fontWeight: 800,
          letterSpacing: -0.2,
          color: NAVY,
        }}
      >
        SetSmart
      </span>
    </div>
  );
}

function Cta({ text, accent }: { text: string; accent: string }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      <div
        style={{
          padding: "13px 26px",
          background: NAVY,
          color: "#fff",
          borderRadius: 999,
          fontWeight: 800,
          fontSize: 16,
          letterSpacing: -0.3,
          boxShadow: `0 8px 24px rgba(10,10,10,0.25), 0 0 0 4px ${accent}30`,
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <span
          style={{
            width: 7,
            height: 7,
            borderRadius: 999,
            background: accent,
          }}
        />
        {text}
      </div>
    </div>
  );
}

function Hook({
  text,
  highlight,
  accent,
  size = 38,
}: {
  text: string;
  highlight?: string;
  accent: string;
  size?: number;
}) {
  const parts =
    highlight && text.includes(highlight)
      ? text.split(highlight).flatMap((p, i, arr) =>
          i < arr.length - 1
            ? [
                p,
                <span
                  key={i}
                  style={{
                    display: "inline-block",
                    background: accent,
                    color: NAVY,
                    padding: "0 9px",
                    borderRadius: 7,
                    transform: "rotate(-1.5deg)",
                    margin: "0 1px",
                  }}
                >
                  {highlight}
                </span>,
              ]
            : [p]
        )
      : [text];

  return (
    <div
      style={{
        fontWeight: 900,
        fontSize: size,
        lineHeight: 1.02,
        letterSpacing: -1.1,
        textAlign: "center",
        color: NAVY,
      }}
    >
      {parts}
    </div>
  );
}

function pickHighlight(hook: string): string | undefined {
  const words = hook.split(/\s+/).filter((w) => /^[A-Za-zÀ-ÿ]+$/.test(w));
  if (words.length === 0) return undefined;
  const longest = [...words].sort((a, b) => b.length - a.length)[0];
  if (longest && longest.length >= 4) return longest;
  return undefined;
}

function MiddleColumn({
  children,
  align = "center",
}: {
  children: React.ReactNode;
  align?: "center" | "stretch" | "spread";
}) {
  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        justifyContent:
          align === "spread"
            ? "space-between"
            : align === "stretch"
              ? "stretch"
              : "center",
        gap: 14,
        padding: "12px 0",
        minHeight: 0,
        overflow: "hidden",
      }}
    >
      {children}
    </div>
  );
}

function Stage(props: Props) {
  const { format, hook } = props;
  const highlight = pickHighlight(hook);
  const stageProps = { ...props, highlight };

  switch (format) {
    case "single-stat":
    case "shock-stat":
      return <StatStage {...stageProps} />;
    case "split-screen":
      return <SplitStage {...stageProps} />;
    case "tier-list":
      return <TierStage {...stageProps} />;
    case "fake-dm":
      return <DmStage {...stageProps} />;
    case "before-after":
      return <BeforeAfterStage {...stageProps} />;
    case "comparison-table":
      return <ComparisonStage {...stageProps} />;
    case "fake-tweet":
      return <TweetStage {...stageProps} />;
    case "minimal-quote":
      return <QuoteStage {...stageProps} />;
    case "narrative":
      return <NarrativeStage {...stageProps} />;
    default:
      return <DefaultStage {...stageProps} />;
  }
}

type StageProps = Props & { highlight?: string };

function pick(lang: "fr" | "en", fr?: string, en?: string): string {
  return (lang === "fr" ? fr : en) || "";
}

function DefaultStage({ hook, body, cta, accent, highlight }: StageProps) {
  return (
    <>
      <Logo />
      <MiddleColumn>
        <Hook text={hook} highlight={highlight} accent={accent} size={42} />
        <div
          style={{
            textAlign: "center",
            fontSize: 18,
            fontWeight: 600,
            color: "#3f3f46",
            lineHeight: 1.35,
            padding: "0 8px",
          }}
        >
          {body}
        </div>
      </MiddleColumn>
      <Cta text={cta} accent={accent} />
    </>
  );
}

function StatStage({ hook, body, cta, accent }: StageProps) {
  const numberMatch = hook.match(/\d+[\d:.,]*\s*[a-zA-Z%€$]*/);
  const number = numberMatch ? numberMatch[0].trim() : hook;
  const rest = numberMatch ? hook.replace(numberMatch[0], "").trim() : "";

  return (
    <>
      <Logo />
      <MiddleColumn align="spread">
        <div
          style={{
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 10,
          }}
        >
          <div
            style={{
              fontSize: 11,
              fontWeight: 800,
              letterSpacing: 2,
              color: accent,
              textTransform: "uppercase",
            }}
          >
            ▌ Stat du jour
          </div>
          <div
            style={{
              fontSize: 160,
              fontWeight: 900,
              letterSpacing: -8,
              lineHeight: 0.88,
              color: NAVY,
            }}
          >
            {number}
          </div>
          {rest && (
            <div
              style={{
                fontSize: 26,
                fontWeight: 800,
                color: NAVY,
                letterSpacing: -0.5,
                lineHeight: 1.05,
                marginTop: 4,
              }}
            >
              {rest}
            </div>
          )}
        </div>
        <div
          style={{
            background: "#fff",
            borderRadius: 14,
            padding: "14px 18px",
            boxShadow: "0 8px 24px rgba(0,0,0,0.06)",
            textAlign: "center",
            fontSize: 16,
            fontWeight: 600,
            color: NAVY,
            lineHeight: 1.35,
          }}
        >
          {body}
        </div>
      </MiddleColumn>
      <Cta text={cta} accent={accent} />
    </>
  );
}

function SplitStage({ hook, cta, accent, highlight, lang, meta }: StageProps) {
  const left =
    pick(lang, meta?.left_fr, meta?.left_en) ||
    (lang === "fr" ? "Setter humain" : "Human setter");
  const right =
    pick(lang, meta?.right_fr, meta?.right_en) || "SetSmart";

  return (
    <>
      <Logo />
      <MiddleColumn>
        <Hook text={hook} highlight={highlight} accent={accent} size={32} />
        <div style={{ display: "flex", gap: 12 }}>
          <SideCard
            label="❌"
            title={lang === "fr" ? "Humain" : "Human"}
            text={left}
            tone="bad"
            color="#ef4444"
          />
          <SideCard
            label="✅"
            title="SetSmart"
            text={right}
            tone="good"
            color={accent}
          />
        </div>
      </MiddleColumn>
      <Cta text={cta} accent={accent} />
    </>
  );
}

function SideCard({
  label,
  title,
  text,
  tone,
  color,
}: {
  label: string;
  title: string;
  text: string;
  tone: "good" | "bad";
  color: string;
}) {
  return (
    <div
      style={{
        flex: 1,
        background: "#fff",
        border: `2px solid ${color}40`,
        borderRadius: 16,
        padding: "16px 14px",
        boxShadow: "0 8px 24px rgba(0,0,0,0.06)",
      }}
    >
      <div style={{ fontSize: 22, marginBottom: 4 }}>{label}</div>
      <div
        style={{
          fontSize: 12,
          fontWeight: 800,
          color: tone === "good" ? color : "#ef4444",
          marginBottom: 6,
          textTransform: "uppercase",
          letterSpacing: 0.5,
        }}
      >
        {title}
      </div>
      <div
        style={{
          fontSize: 13,
          fontWeight: 600,
          color: NAVY,
          lineHeight: 1.3,
        }}
      >
        {text}
      </div>
    </div>
  );
}

const DEFAULT_TIERS_FR = [
  { tier: "S", label: "SetSmart" },
  { tier: "A", label: "Top agences" },
  { tier: "B", label: "Freelancers" },
  { tier: "C", label: "Le pote dev" },
  { tier: "F", label: "DM ignorés" },
];
const DEFAULT_TIERS_EN = [
  { tier: "S", label: "SetSmart" },
  { tier: "A", label: "Top agencies" },
  { tier: "B", label: "Freelancers" },
  { tier: "C", label: "Your dev friend" },
  { tier: "F", label: "Unread DMs" },
];

function TierStage({ hook, cta, accent, highlight, lang, meta }: StageProps) {
  const tierColors: Record<string, string> = {
    S: accent,
    A: "#10b981",
    B: "#fbbf24",
    C: "#f97316",
    F: "#ef4444",
  };
  const tiers =
    meta?.tiers?.map((t) => ({
      tier: t.tier,
      label: pick(lang, t.label_fr, t.label_en),
    })) || (lang === "fr" ? DEFAULT_TIERS_FR : DEFAULT_TIERS_EN);

  return (
    <>
      <Logo />
      <MiddleColumn>
        <Hook text={hook} highlight={highlight} accent={accent} size={26} />
        <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
          {tiers.map((t) => (
            <div
              key={t.tier}
              style={{
                display: "flex",
                alignItems: "center",
                background: "#fff",
                borderRadius: 10,
                overflow: "hidden",
                boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
              }}
            >
              <div
                style={{
                  width: 48,
                  background: tierColors[t.tier] || "#71717a",
                  color: "#fff",
                  fontSize: 22,
                  fontWeight: 900,
                  textAlign: "center",
                  padding: "9px 0",
                }}
              >
                {t.tier}
              </div>
              <div
                style={{
                  flex: 1,
                  padding: "9px 14px",
                  fontSize: 14,
                  fontWeight: 700,
                  color: NAVY,
                }}
              >
                {t.label}
              </div>
            </div>
          ))}
        </div>
      </MiddleColumn>
      <Cta text={cta} accent={accent} />
    </>
  );
}

const DEFAULT_DM_FR = [
  { side: "them" as const, text: "Hey 👋 Tu cherches quoi ?" },
  { side: "me" as const, text: "Plus de leads qualifiés" },
  { side: "them" as const, text: "Ton budget pub/mois ?" },
  { side: "me" as const, text: "3-5k €" },
  { side: "them" as const, text: "Demain 14h ça marche ?" },
  { side: "me" as const, text: "Oui" },
];
const DEFAULT_DM_EN = [
  { side: "them" as const, text: "Hey 👋 What are you after?" },
  { side: "me" as const, text: "More qualified leads" },
  { side: "them" as const, text: "Monthly ad budget?" },
  { side: "me" as const, text: "$3-5k" },
  { side: "them" as const, text: "Tomorrow 2pm work?" },
  { side: "me" as const, text: "Yes" },
];

function DmStage({ hook, body, cta, accent, highlight, lang, meta }: StageProps) {
  const messages =
    meta?.messages?.map((m) => ({
      side: m.side,
      text: pick(lang, m.text_fr, m.text_en),
    })) || (lang === "fr" ? DEFAULT_DM_FR : DEFAULT_DM_EN);

  return (
    <>
      <Logo />
      <MiddleColumn>
        <Hook text={hook} highlight={highlight} accent={accent} size={26} />
        <div
          style={{
            background: "#fff",
            borderRadius: 16,
            padding: "12px 14px",
            boxShadow: "0 12px 32px rgba(0,0,0,0.1)",
          }}
        >
          <div
            style={{
              display: "flex",
              gap: 8,
              marginBottom: 8,
              paddingBottom: 8,
              borderBottom: "1px solid #f4f5f7",
              alignItems: "center",
            }}
          >
            <div
              style={{
                width: 26,
                height: 26,
                borderRadius: 999,
                background: accent,
              }}
            />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, fontWeight: 700 }}>SetSmart</div>
              <div style={{ fontSize: 9, color: "#10b981" }}>● Active</div>
            </div>
          </div>
          {messages.map((m, i) => (
            <Bubble key={i} side={m.side} text={m.text} />
          ))}
          <div
            style={{
              marginTop: 8,
              padding: "8px 10px",
              background: `${accent}15`,
              border: `1.5px solid ${accent}`,
              borderRadius: 10,
              display: "flex",
              alignItems: "center",
              gap: 8,
              fontSize: 11,
              fontWeight: 700,
              color: NAVY,
            }}
          >
            <span style={{ fontSize: 14 }}>📅</span>
            <span>
              {lang === "fr"
                ? "RDV pris · Demain 14:00"
                : "Booked · Tomorrow 2pm"}
            </span>
          </div>
        </div>
        <div
          style={{
            textAlign: "center",
            fontSize: 13,
            fontWeight: 600,
            color: "#3f3f46",
            lineHeight: 1.3,
          }}
        >
          {body}
        </div>
      </MiddleColumn>
      <Cta text={cta} accent={accent} />
    </>
  );
}

function Bubble({
  side,
  text,
}: {
  side: "me" | "them";
  text: string;
}) {
  const me = side === "me";
  return (
    <div
      style={{
        display: "flex",
        justifyContent: me ? "flex-end" : "flex-start",
        marginBottom: 4,
      }}
    >
      <div
        style={{
          background: me ? NAVY : "#eef0f3",
          color: me ? "#fff" : NAVY,
          padding: "7px 11px",
          borderRadius: 12,
          fontSize: 11,
          fontWeight: 600,
          maxWidth: "75%",
        }}
      >
        {text}
      </div>
    </div>
  );
}

function BeforeAfterStage({
  hook,
  body,
  cta,
  accent,
  highlight,
  lang,
  meta,
}: StageProps) {
  const before =
    pick(lang, meta?.before_fr, meta?.before_en) ||
    (lang === "fr"
      ? "5 setters · €3k chacun · drama RH"
      : "5 setters · $3k each · HR drama");
  const after =
    pick(lang, meta?.after_fr, meta?.after_en) ||
    (lang === "fr"
      ? "SetSmart · 24/7 · zero drama"
      : "SetSmart · 24/7 · zero drama");

  return (
    <>
      <Logo />
      <MiddleColumn>
        <Hook text={hook} highlight={highlight} accent={accent} size={36} />
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div
            style={{
              background: "#fff",
              border: "2px solid #ef444430",
              borderRadius: 14,
              padding: "12px 16px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
            }}
          >
            <div
              style={{
                fontSize: 11,
                fontWeight: 800,
                color: "#ef4444",
                letterSpacing: 0.5,
                marginBottom: 4,
              }}
            >
              {lang === "fr" ? "AVANT" : "BEFORE"}
            </div>
            <div style={{ fontSize: 15, fontWeight: 700, color: NAVY }}>
              {before}
            </div>
          </div>
          <div
            style={{
              background: "#fff",
              border: `2px solid ${accent}50`,
              borderRadius: 14,
              padding: "12px 16px",
              boxShadow: `0 8px 24px ${accent}30`,
            }}
          >
            <div
              style={{
                fontSize: 11,
                fontWeight: 800,
                color: accent,
                letterSpacing: 0.5,
                marginBottom: 4,
              }}
            >
              {lang === "fr" ? "APRÈS" : "AFTER"}
            </div>
            <div style={{ fontSize: 16, fontWeight: 800, color: NAVY }}>
              {after}
            </div>
          </div>
        </div>
        <div
          style={{
            textAlign: "center",
            fontSize: 13,
            fontWeight: 600,
            color: "#3f3f46",
            lineHeight: 1.3,
            padding: "0 8px",
          }}
        >
          {body}
        </div>
      </MiddleColumn>
      <Cta text={cta} accent={accent} />
    </>
  );
}

const DEFAULT_ROWS_FR = [
  { label: "Coût/mois", h: "€3-5k", a: "€199" },
  { label: "Vitesse", h: "h/jours", a: "8 sec" },
  { label: "Langues", h: "1-2", a: "30+" },
  { label: "Off", h: "souvent", a: "jamais" },
  { label: "Scale", h: "embauche", a: "0 effort" },
];
const DEFAULT_ROWS_EN = [
  { label: "Cost/mo", h: "$3-5k", a: "$199" },
  { label: "Speed", h: "hrs/days", a: "8 sec" },
  { label: "Languages", h: "1-2", a: "30+" },
  { label: "Sick days", h: "often", a: "never" },
  { label: "Scale", h: "hire more", a: "0 effort" },
];

function ComparisonStage({
  hook,
  cta,
  accent,
  highlight,
  lang,
  meta,
}: StageProps) {
  const rows =
    meta?.rows?.map((r) => ({
      label: pick(lang, r.label_fr, r.label_en),
      h: pick(lang, r.h_fr, r.h_en),
      a: pick(lang, r.a_fr, r.a_en),
    })) || (lang === "fr" ? DEFAULT_ROWS_FR : DEFAULT_ROWS_EN);

  return (
    <>
      <Logo />
      <MiddleColumn>
        <Hook text={hook} highlight={highlight} accent={accent} size={28} />
        <div
          style={{
            background: "#fff",
            borderRadius: 14,
            overflow: "hidden",
            boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1.1fr 1fr 1fr",
              background: "#f4f5f7",
              fontSize: 10,
              fontWeight: 800,
              textTransform: "uppercase",
              letterSpacing: 0.5,
            }}
          >
            <div style={{ padding: "10px 12px" }}>&nbsp;</div>
            <div style={{ padding: "10px 12px", color: "#ef4444" }}>
              {lang === "fr" ? "Humain" : "Human"}
            </div>
            <div style={{ padding: "10px 12px", color: accent }}>SetSmart</div>
          </div>
          {rows.map((r, i) => (
            <div
              key={i}
              style={{
                display: "grid",
                gridTemplateColumns: "1.1fr 1fr 1fr",
                borderTop: "1px solid #e5e7eb",
                fontSize: 12,
                fontWeight: 600,
                background: i === rows.length - 1 ? `${accent}10` : "transparent",
              }}
            >
              <div style={{ padding: "9px 12px", color: "#71717a" }}>
                {r.label}
              </div>
              <div style={{ padding: "9px 12px", color: NAVY }}>{r.h}</div>
              <div
                style={{ padding: "9px 12px", color: accent, fontWeight: 800 }}
              >
                {r.a}
              </div>
            </div>
          ))}
        </div>
      </MiddleColumn>
      <Cta text={cta} accent={accent} />
    </>
  );
}

function TweetStage({ hook, body, cta, accent, highlight, lang }: StageProps) {
  return (
    <>
      <Logo />
      <MiddleColumn align="stretch">
        <div
          style={{
            flex: 1,
            background: "#fff",
            borderRadius: 18,
            padding: "20px 22px",
            boxShadow: "0 12px 32px rgba(0,0,0,0.10)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            gap: 14,
          }}
        >
          <div>
            <div
              style={{
                display: "flex",
                gap: 10,
                alignItems: "center",
                marginBottom: 14,
              }}
            >
              <div
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 999,
                  background: `linear-gradient(135deg, ${accent}, ${accent}90)`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#fff",
                  fontSize: 16,
                  fontWeight: 900,
                }}
              >
                F
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 800 }}>
                  {lang === "fr" ? "Founder anonyme" : "Anonymous founder"}
                </div>
                <div style={{ fontSize: 11, color: "#71717a" }}>
                  @founder · 2h
                </div>
              </div>
              <div
                style={{
                  fontSize: 18,
                  color: "#71717a",
                  letterSpacing: 2,
                }}
              >
                ···
              </div>
            </div>
            <Hook text={hook} highlight={highlight} accent={accent} size={26} />
            <div
              style={{
                marginTop: 12,
                fontSize: 14,
                fontWeight: 500,
                color: "#3f3f46",
                lineHeight: 1.45,
              }}
            >
              {body}
            </div>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              paddingTop: 14,
              borderTop: "1px solid #f4f5f7",
              fontSize: 11,
              color: "#71717a",
              fontWeight: 600,
            }}
          >
            <span>💬 247</span>
            <span>🔁 1.2k</span>
            <span style={{ color: accent }}>♥ 8.4k</span>
            <span>👁 142k</span>
          </div>
        </div>
      </MiddleColumn>
      <Cta text={cta} accent={accent} />
    </>
  );
}

function QuoteStage({ hook, body, cta, accent, highlight, lang }: StageProps) {
  return (
    <>
      <Logo />
      <MiddleColumn align="spread">
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              fontSize: 90,
              color: accent,
              lineHeight: 0.7,
              fontWeight: 900,
              opacity: 0.9,
            }}
          >
            &ldquo;
          </div>
        </div>
        <Hook text={hook} highlight={highlight} accent={accent} size={40} />
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              fontSize: 16,
              fontWeight: 500,
              color: "#3f3f46",
              fontStyle: "italic",
              lineHeight: 1.4,
              padding: "0 12px",
              marginBottom: 16,
            }}
          >
            {body}
          </div>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              padding: "8px 16px",
              background: "#fff",
              borderRadius: 999,
              boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
            }}
          >
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: 999,
                background: `linear-gradient(135deg, ${accent}, ${accent}90)`,
              }}
            />
            <div style={{ textAlign: "left" }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: NAVY }}>
                {lang === "fr" ? "Founder, agency 7-figures" : "Founder, 7-fig agency"}
              </div>
              <div style={{ fontSize: 10, color: "#71717a" }}>
                {lang === "fr" ? "Client SetSmart" : "SetSmart customer"}
              </div>
            </div>
          </div>
        </div>
      </MiddleColumn>
      <Cta text={cta} accent={accent} />
    </>
  );
}

const DEFAULT_STEPS_FR = [
  { time: "9:00", text: "47 DMs en attente" },
  { time: "9:01", text: "Setter absent" },
  { time: "9:03", text: "SetSmart a vidé l'inbox" },
];
const DEFAULT_STEPS_EN = [
  { time: "9:00", text: "47 unread DMs" },
  { time: "9:01", text: "Setter off" },
  { time: "9:03", text: "SetSmart cleared inbox" },
];

function NarrativeStage({
  hook,
  body,
  cta,
  accent,
  highlight,
  lang,
  meta,
}: StageProps) {
  const steps =
    meta?.steps?.map((s) => ({
      time: s.time,
      text: pick(lang, s.text_fr, s.text_en),
    })) || (lang === "fr" ? DEFAULT_STEPS_FR : DEFAULT_STEPS_EN);

  return (
    <>
      <Logo />
      <MiddleColumn>
        <Hook text={hook} highlight={highlight} accent={accent} size={28} />
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {steps.map((step, i) => {
            const last = i === steps.length - 1;
            return (
              <div
                key={i}
                style={{
                  background: "#fff",
                  border: last ? `2px solid ${accent}` : "1px solid #e5e7eb",
                  borderRadius: 12,
                  padding: "10px 14px",
                  display: "flex",
                  gap: 12,
                  alignItems: "center",
                  boxShadow: last ? `0 8px 24px ${accent}30` : "none",
                }}
              >
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 800,
                    color: last ? accent : "#71717a",
                    fontFamily: "monospace",
                    minWidth: 42,
                  }}
                >
                  {step.time}
                </div>
                {last && (
                  <span
                    style={{
                      width: 18,
                      height: 18,
                      borderRadius: 999,
                      background: accent,
                      color: "#fff",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 11,
                      fontWeight: 900,
                      flexShrink: 0,
                    }}
                  >
                    ✓
                  </span>
                )}
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: last ? 800 : 600,
                    color: NAVY,
                    flex: 1,
                  }}
                >
                  {step.text}
                </div>
              </div>
            );
          })}
        </div>
        <div
          style={{
            textAlign: "center",
            fontSize: 13,
            fontWeight: 600,
            color: "#3f3f46",
            lineHeight: 1.3,
          }}
        >
          {body}
        </div>
      </MiddleColumn>
      <Cta text={cta} accent={accent} />
    </>
  );
}
