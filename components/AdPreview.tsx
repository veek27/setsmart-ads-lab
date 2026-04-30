import AdRenderer from "./AdRenderer";

type Props = {
  format: string;
  accent: string;
  accentName: string;
  hook: string;
  body: string;
  cta: string;
  lang: "fr" | "en";
  scale?: number;
};

export default function AdPreview({ scale = 1, ...props }: Props) {
  return (
    <div
      style={{
        width: 540 * scale,
        height: 960 * scale,
        position: "relative",
        overflow: "hidden",
        borderRadius: 18 * scale,
        boxShadow: "0 25px 70px rgba(0,0,0,.45)",
      }}
    >
      <div
        style={{
          width: 540,
          height: 960,
          transform: `scale(${scale})`,
          transformOrigin: "top left",
          position: "absolute",
          top: 0,
          left: 0,
        }}
      >
        <AdRenderer {...props} />
      </div>
    </div>
  );
}
