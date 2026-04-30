type Props = {
  format: string;
  accent: string;
  accentName: string;
  hook: string;
  body: string;
  cta: string;
  lang: "fr" | "en";
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
      }}
    >
      {children}
    </div>
  );
}

function Logo({ small = false }: { small?: boolean }) {
  const size = small ? 24 : 30;
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
        width={size}
        height={size}
        style={{
          borderRadius: 7,
          objectFit: "cover",
          boxShadow: "0 4px 12px rgba(0,0,0,0.12)",
        }}
      />
      <span
        style={{
          fontSize: small ? 12 : 14,
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
          padding: "14px 28px",
          background: NAVY,
          color: "#fff",
          borderRadius: 999,
          fontWeight: 800,
          fontSize: 17,
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

function MiddleColumn({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        gap: 18,
        minHeight: 0,
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

function DefaultStage({ hook, body, cta, accent, highlight }: StageProps) {
  return (
    <>
      <Logo />
      <MiddleColumn>
        <Hook text={hook} highlight={highlight} accent={accent} size={42} />
        <div
          style={{
            textAlign: "center",
            fontSize: 19,
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
  const numberMatch = hook.match(/\d+[\d:]*\s*\w*/);
  const number = numberMatch ? numberMatch[0].trim() : hook;
  const rest = numberMatch ? hook.replace(numberMatch[0], "").trim() : "";

  return (
    <>
      <Logo />
      <MiddleColumn>
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              fontSize: 140,
              fontWeight: 900,
              letterSpacing: -6,
              lineHeight: 0.92,
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
                marginTop: 14,
                color: NAVY,
                letterSpacing: -0.5,
                lineHeight: 1.05,
              }}
            >
              {rest}
            </div>
          )}
        </div>
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

function SplitStage({ hook, body, cta, accent, highlight }: StageProps) {
  const parts = body.split(/[.!?]/).filter((s) => s.trim());
  const left = (parts[0] || "Setter humain").trim();
  const right = (parts[1] || "SetSmart").trim();
  return (
    <>
      <Logo />
      <MiddleColumn>
        <Hook text={hook} highlight={highlight} accent={accent} size={32} />
        <div style={{ display: "flex", gap: 12 }}>
          <SideCard
            label="❌"
            title="Humain"
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
      <div style={{ fontSize: 24, marginBottom: 4 }}>{label}</div>
      <div
        style={{
          fontSize: 13,
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
          fontSize: 14,
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

function TierStage({ hook, cta, accent, highlight }: StageProps) {
  const tiers = [
    { tier: "S", label: "SetSmart", color: accent },
    { tier: "A", label: "Top agencies", color: "#10b981" },
    { tier: "B", label: "Freelancers", color: "#fbbf24" },
    { tier: "C", label: "Ton cousin", color: "#f97316" },
    { tier: "F", label: "DM unread", color: "#ef4444" },
  ];
  return (
    <>
      <Logo />
      <MiddleColumn>
        <Hook text={hook} highlight={highlight} accent={accent} size={26} />
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
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
                  width: 50,
                  background: t.color,
                  color: "#fff",
                  fontSize: 24,
                  fontWeight: 900,
                  textAlign: "center",
                  padding: "10px 0",
                }}
              >
                {t.tier}
              </div>
              <div
                style={{
                  flex: 1,
                  padding: "10px 14px",
                  fontSize: 15,
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

function DmStage({ hook, body, cta, accent, highlight }: StageProps) {
  return (
    <>
      <Logo />
      <MiddleColumn>
        <Hook text={hook} highlight={highlight} accent={accent} size={28} />
        <div
          style={{
            background: "#fff",
            borderRadius: 16,
            padding: 16,
            boxShadow: "0 12px 32px rgba(0,0,0,0.1)",
          }}
        >
          <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: 999,
                background: accent,
              }}
            />
            <div>
              <div style={{ fontSize: 12, fontWeight: 700 }}>SetSmart</div>
              <div style={{ fontSize: 9, color: "#71717a" }}>Active now</div>
            </div>
          </div>
          <Bubble side="them" text="Hey 👋 Tu cherches quoi ?" />
          <Bubble side="me" text="Plus de leads qualifiés" />
          <Bubble side="them" text="Quel budget/mois ?" />
          <Bubble side="me" text="3-5k €" />
          <Bubble
            side="them"
            text="Parfait. Slot demain 14h ?"
            highlight={accent}
          />
        </div>
        <div
          style={{
            textAlign: "center",
            fontSize: 14,
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
  highlight,
}: {
  side: "me" | "them";
  text: string;
  highlight?: string;
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
          background: highlight || (me ? NAVY : "#eef0f3"),
          color: highlight || me ? "#fff" : NAVY,
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
}: StageProps) {
  return (
    <>
      <Logo />
      <MiddleColumn>
        <Hook text={hook} highlight={highlight} accent={accent} size={36} />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 10,
          }}
        >
          <div
            style={{
              background: "#fff",
              border: "2px solid #ef444430",
              borderRadius: 14,
              padding: "14px 18px",
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
              AVANT
            </div>
            <div style={{ fontSize: 16, fontWeight: 700, color: NAVY }}>
              5 setters · €3k chacun · drama RH
            </div>
          </div>
          <div
            style={{
              background: "#fff",
              border: `2px solid ${accent}50`,
              borderRadius: 14,
              padding: "14px 18px",
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
              APRÈS
            </div>
            <div style={{ fontSize: 18, fontWeight: 800, color: NAVY }}>
              SetSmart · 24/7 · zero drama
            </div>
          </div>
        </div>
        <div
          style={{
            textAlign: "center",
            fontSize: 14,
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

function ComparisonStage({ hook, cta, accent, highlight }: StageProps) {
  const rows = [
    { label: "Coût/mois", h: "€3-5k", a: "€199" },
    { label: "Vitesse", h: "h/jours", a: "8 sec" },
    { label: "Langues", h: "1-2", a: "30+" },
    { label: "Maladie", h: "oui", a: "jamais" },
    { label: "Scale", h: "embauche", a: "0 effort" },
  ];
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
              fontSize: 11,
              fontWeight: 800,
              textTransform: "uppercase",
              letterSpacing: 0.5,
            }}
          >
            <div style={{ padding: "10px 12px" }}>&nbsp;</div>
            <div style={{ padding: "10px 12px", color: "#ef4444" }}>Humain</div>
            <div style={{ padding: "10px 12px", color: accent }}>SetSmart</div>
          </div>
          {rows.map((r, i) => (
            <div
              key={r.label}
              style={{
                display: "grid",
                gridTemplateColumns: "1.1fr 1fr 1fr",
                borderTop: "1px solid #e5e7eb",
                fontSize: 13,
                fontWeight: 600,
                background: i === rows.length - 1 ? `${accent}10` : "transparent",
              }}
            >
              <div style={{ padding: "10px 12px", color: "#71717a" }}>
                {r.label}
              </div>
              <div style={{ padding: "10px 12px", color: NAVY }}>{r.h}</div>
              <div
                style={{ padding: "10px 12px", color: accent, fontWeight: 800 }}
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

function TweetStage({ hook, body, cta, accent, highlight }: StageProps) {
  return (
    <>
      <Logo />
      <MiddleColumn>
        <div
          style={{
            background: "#fff",
            borderRadius: 16,
            padding: 18,
            boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
          }}
        >
          <div
            style={{
              display: "flex",
              gap: 10,
              alignItems: "center",
              marginBottom: 12,
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 999,
                background: "#e5e7eb",
              }}
            />
            <div>
              <div style={{ fontSize: 13, fontWeight: 800 }}>
                Founder Anonyme
              </div>
              <div style={{ fontSize: 10, color: "#71717a" }}>· 2h</div>
            </div>
          </div>
          <Hook text={hook} highlight={highlight} accent={accent} size={22} />
          <div
            style={{
              marginTop: 10,
              fontSize: 13,
              fontWeight: 500,
              color: "#3f3f46",
              lineHeight: 1.4,
            }}
          >
            {body}
          </div>
        </div>
      </MiddleColumn>
      <Cta text={cta} accent={accent} />
    </>
  );
}

function QuoteStage({ hook, body, cta, accent, highlight }: StageProps) {
  return (
    <>
      <Logo />
      <MiddleColumn>
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              fontSize: 56,
              color: accent,
              lineHeight: 0.9,
              fontWeight: 900,
              marginBottom: 6,
            }}
          >
            &ldquo;
          </div>
          <Hook text={hook} highlight={highlight} accent={accent} size={36} />
        </div>
        <div
          style={{
            fontSize: 16,
            fontWeight: 500,
            color: "#3f3f46",
            fontStyle: "italic",
            lineHeight: 1.4,
            textAlign: "center",
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

function NarrativeStage({ hook, body, cta, accent, highlight }: StageProps) {
  return (
    <>
      <Logo />
      <MiddleColumn>
        <Hook text={hook} highlight={highlight} accent={accent} size={28} />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          {[
            { time: "9:00", text: "47 DMs unread" },
            { time: "9:01", text: "Setter sick" },
            { time: "9:03", text: "✅ SetSmart cleared inbox" },
          ].map((step, i) => (
            <div
              key={i}
              style={{
                background: "#fff",
                border: i === 2 ? `2px solid ${accent}` : "1px solid #e5e7eb",
                borderRadius: 12,
                padding: "10px 14px",
                display: "flex",
                gap: 12,
                alignItems: "center",
                boxShadow: i === 2 ? `0 8px 24px ${accent}30` : "none",
              }}
            >
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 800,
                  color: i === 2 ? accent : "#71717a",
                  fontFamily: "monospace",
                }}
              >
                {step.time}
              </div>
              <div
                style={{
                  fontSize: 14,
                  fontWeight: i === 2 ? 800 : 600,
                  color: NAVY,
                }}
              >
                {step.text}
              </div>
            </div>
          ))}
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
