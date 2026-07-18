"use client";

export interface Point {
  label: string;
  value: number;
}

// Grouped/stacked-friendly simple bar chart with two optional series.
export function BarChart({
  data,
  height = 200,
  color = "var(--brand)",
  secondary,
  secondaryColor = "var(--ok)",
}: {
  data: Point[];
  height?: number;
  color?: string;
  secondary?: Point[];
  secondaryColor?: string;
}) {
  const all = [...data.map((d) => d.value), ...(secondary?.map((d) => d.value) ?? [])];
  const max = Math.max(1, ...all);
  const barGroupW = 100 / data.length;

  return (
    <div style={{ width: "100%" }}>
      <svg
        viewBox={`0 0 100 ${height}`}
        preserveAspectRatio="none"
        style={{ width: "100%", height }}
      >
        {[0.25, 0.5, 0.75, 1].map((g) => (
          <line
            key={g}
            x1={0}
            x2={100}
            y1={height - g * (height - 20)}
            y2={height - g * (height - 20)}
            stroke="var(--border)"
            strokeWidth={0.3}
          />
        ))}
        {data.map((d, i) => {
          const hasSecondary = secondary && secondary.length === data.length;
          const groupX = i * barGroupW;
          const barW = hasSecondary ? barGroupW * 0.32 : barGroupW * 0.5;
          const h1 = (d.value / max) * (height - 20);
          return (
            <g key={i}>
              <rect
                x={groupX + barGroupW / 2 - (hasSecondary ? barW + 1 : barW / 2)}
                y={height - h1}
                width={barW}
                height={Math.max(0, h1)}
                fill={color}
                rx={0.8}
              />
              {hasSecondary && (
                <rect
                  x={groupX + barGroupW / 2 + 1}
                  y={height - (secondary![i].value / max) * (height - 20)}
                  width={barW}
                  height={Math.max(
                    0,
                    (secondary![i].value / max) * (height - 20),
                  )}
                  fill={secondaryColor}
                  rx={0.8}
                />
              )}
            </g>
          );
        })}
      </svg>
      <div className="flex justify-between mt-2" style={{ fontSize: "0.66rem", color: "var(--muted)" }}>
        {data.map((d, i) => (
          <span key={i} style={{ flex: 1, textAlign: "center" }}>
            {d.label}
          </span>
        ))}
      </div>
    </div>
  );
}

export function LineChart({
  data,
  height = 200,
  color = "var(--brand)",
}: {
  data: Point[];
  height?: number;
  color?: string;
}) {
  const max = Math.max(1, ...data.map((d) => d.value));
  const w = 100;
  const pad = 4;
  const step = data.length > 1 ? (w - pad * 2) / (data.length - 1) : 0;
  const pts = data.map((d, i) => {
    const x = pad + i * step;
    const y = height - 12 - (d.value / max) * (height - 24);
    return [x, y] as const;
  });
  const path = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p[0]} ${p[1]}`).join(" ");
  const area =
    pts.length > 0
      ? `${path} L ${pts[pts.length - 1][0]} ${height} L ${pts[0][0]} ${height} Z`
      : "";

  return (
    <div style={{ width: "100%" }}>
      <svg
        viewBox={`0 0 100 ${height}`}
        preserveAspectRatio="none"
        style={{ width: "100%", height }}
      >
        <defs>
          <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.35" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0.33, 0.66, 1].map((g) => (
          <line
            key={g}
            x1={0}
            x2={100}
            y1={height - 12 - g * (height - 24)}
            y2={height - 12 - g * (height - 24)}
            stroke="var(--border)"
            strokeWidth={0.3}
          />
        ))}
        {area && <path d={area} fill="url(#areaGrad)" />}
        <path
          d={path}
          fill="none"
          stroke={color}
          strokeWidth={1.2}
          strokeLinejoin="round"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
        {pts.map((p, i) => (
          <circle key={i} cx={p[0]} cy={p[1]} r={1} fill={color} />
        ))}
      </svg>
      <div className="flex justify-between mt-2" style={{ fontSize: "0.66rem", color: "var(--muted)" }}>
        {data.map((d, i) => (
          <span key={i} style={{ flex: 1, textAlign: "center" }}>
            {d.label}
          </span>
        ))}
      </div>
    </div>
  );
}

export function Donut({
  segments,
  size = 140,
}: {
  segments: { value: number; color: string; label: string }[];
  size?: number;
}) {
  const total = segments.reduce((s, x) => s + x.value, 0) || 1;
  const r = 55;
  const c = 2 * Math.PI * r;
  // Precompute each segment's length and cumulative offset (no mutation in render).
  const arcs = segments.reduce<{ len: number; offset: number; color: string }[]>(
    (acc, s) => {
      const len = (s.value / total) * c;
      const offset = acc.length ? acc[acc.length - 1].offset + acc[acc.length - 1].len : 0;
      acc.push({ len, offset, color: s.color });
      return acc;
    },
    [],
  );
  return (
    <div className="flex items-center gap-5">
      <svg viewBox="0 0 140 140" style={{ width: size, height: size }}>
        <circle cx="70" cy="70" r={r} fill="none" stroke="var(--border)" strokeWidth="16" />
        {arcs.map((a, i) => (
          <circle
            key={i}
            cx="70"
            cy="70"
            r={r}
            fill="none"
            stroke={a.color}
            strokeWidth="16"
            strokeDasharray={`${a.len} ${c - a.len}`}
            strokeDashoffset={-a.offset}
            transform="rotate(-90 70 70)"
            strokeLinecap="butt"
          />
        ))}
      </svg>
      <div className="space-y-1.5">
        {segments.map((s, i) => (
          <div key={i} className="flex items-center gap-2 text-sm">
            <span
              className="inline-block rounded-full"
              style={{ width: 10, height: 10, background: s.color }}
            />
            <span style={{ color: "var(--fg-2)" }}>{s.label}</span>
            <span className="font-semibold ml-1">{s.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
