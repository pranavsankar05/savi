import { useState, useMemo } from "react";

type Period = "weekly" | "monthly";

// ─── Data ────────────────────────────────────────────────────────────────────

interface Bubble {
  id: string;
  label: string;
  category: string;
  amount: number;
  size: number; // px diameter
  // rough organic cluster positions (% of container)
  cx: number; // 0–100
  cy: number;
  z: number;
}

interface CategoryRow {
  id: string;
  label: string;
  spent: number;
  budget: number;
}

interface BarGroup {
  label: string;
  primary: number;
  secondary: number;
}

interface TxRow {
  id: string;
  label: string;
  sub: string;
  amount: number;
  time: string;
}

const WEEKLY: {
  bubbles: Bubble[];
  categories: CategoryRow[];
  bars: BarGroup[];
  recent: TxRow[];
  totalSpent: number;
  totalBudget: number;
} = {
  totalSpent: 5154,
  totalBudget: 8000,
  bubbles: [
    { id: "b1", label: "Amazon", category: "shopping",   amount: 1100, size: 118, cx: 50, cy: 48, z: 10 },
    { id: "b2", label: "Swiggy", category: "food",   amount: 220,  size: 68,  cx: 28, cy: 62, z: 7  },
    { id: "b3", label: "Zomato", category: "food",   amount: 185,  size: 60,  cx: 42, cy: 76, z: 6  },
    { id: "b4", label: "Netflix", category: "entertainment",  amount: 649,  size: 96,  cx: 70, cy: 40, z: 9  },
    { id: "b5", label: "Flipkart", category: "shopping", amount: 760,  size: 104, cx: 36, cy: 28, z: 8  },
    { id: "b6", label: "BESCOM", category: "utilities",   amount: 940,  size: 108, cx: 68, cy: 64, z: 8  },
    { id: "b7", label: "Spotify", category: "entertainment",  amount: 119,  size: 52,  cx: 83, cy: 25, z: 5  },
    { id: "b8", label: "Ola", category: "transport",      amount: 181,  size: 58,  cx: 20, cy: 38, z: 6  },
  ],
  categories: [
    { id: "shopping",      label: "Shopping",      spent: 1860, budget: 2000 },
    { id: "food",          label: "Food & Drinks",  spent: 405,  budget: 1000 },
    { id: "entertainment", label: "Entertainment", spent: 768,  budget: 1200 },
    { id: "utilities",     label: "Utilities",     spent: 940,  budget: 1000 },
  ],
  bars: [
    { label: "Mon", primary: 420, secondary: 180 },
    { label: "Tue", primary: 680, secondary: 290 },
    { label: "Wed", primary: 310, secondary: 520 },
    { label: "Thu", primary: 890, secondary: 410 },
    { label: "Fri", primary: 740, secondary: 630 },
    { label: "Sat", primary: 560, secondary: 200 },
    { label: "Sun", primary: 554, secondary: 310 },
  ],
  recent: [
    { id: "r1", label: "Amazon",  sub: "Shopping",      amount: 1100, time: "2h ago"  },
    { id: "r2", label: "BESCOM",  sub: "Utilities",     amount: 940,  time: "1d ago"  },
    { id: "r3", label: "Flipkart",sub: "Shopping",      amount: 760,  time: "2d ago"  },
    { id: "r4", label: "Netflix", sub: "Entertainment", amount: 649,  time: "3d ago"  },
    { id: "r5", label: "Swiggy",  sub: "Food",          amount: 220,  time: "3d ago"  },
  ],
};

const MONTHLY: typeof WEEKLY = {
  totalSpent: 18920,
  totalBudget: 28000,
  bubbles: [
    { id: "b1", label: "Amazon", category: "shopping",   amount: 4300, size: 128, cx: 50, cy: 48, z: 10 },
    { id: "b2", label: "Swiggy", category: "food",   amount: 870,  size: 84,  cx: 28, cy: 62, z: 7  },
    { id: "b3", label: "Zomato", category: "food",   amount: 640,  size: 76,  cx: 42, cy: 76, z: 6  },
    { id: "b4", label: "Netflix", category: "entertainment",  amount: 649,  size: 72,  cx: 70, cy: 40, z: 9  },
    { id: "b5", label: "Flipkart", category: "shopping", amount: 3200, size: 116, cx: 36, cy: 28, z: 8  },
    { id: "b6", label: "BESCOM", category: "utilities",   amount: 2500, size: 112, cx: 68, cy: 64, z: 8  },
    { id: "b7", label: "Spotify", category: "entertainment",  amount: 119,  size: 48,  cx: 83, cy: 25, z: 5  },
    { id: "b8", label: "Ola", category: "transport",      amount: 580,  size: 74,  cx: 20, cy: 38, z: 6  },
  ],
  categories: [
    { id: "shopping",      label: "Shopping",      spent: 7500,  budget: 10000 },
    { id: "food",          label: "Food & Drinks",  spent: 1510,  budget: 3000  },
    { id: "entertainment", label: "Entertainment", spent: 1268,  budget: 2000  },
    { id: "utilities",     label: "Utilities",     spent: 2500,  budget: 3000  },
  ],
  bars: [
    { label: "Jan", primary: 12400, secondary: 9800  },
    { label: "Feb", primary: 14200, secondary: 11200 },
    { label: "Mar", primary: 9800,  secondary: 13400 },
    { label: "Apr", primary: 16000, secondary: 12000 },
    { label: "May", primary: 13200, secondary: 10600 },
    { label: "Jun", primary: 18920, secondary: 14800 },
  ],
  recent: [
    { id: "r1", label: "Amazon",   sub: "Shopping",      amount: 4300, time: "3d ago"  },
    { id: "r2", label: "Flipkart", sub: "Shopping",      amount: 3200, time: "5d ago"  },
    { id: "r3", label: "PhonePe",  sub: "Utilities",     amount: 2500, time: "8d ago"  },
    { id: "r4", label: "BESCOM",   sub: "Utilities",     amount: 940,  time: "12d ago" },
    { id: "r5", label: "Swiggy",   sub: "Food",          amount: 870,  time: "14d ago" },
  ],
};

// ─── Glass helpers ────────────────────────────────────────────────────────────

// One muted shade per category — used for the category progress bars and
// bubble aria-labels (bubbles themselves are no longer tinted by category).
// Kept low-saturation on purpose so the palette stays minimal.
const CATEGORY_COLORS: Record<string, { rgb: string; label: string }> = {
  shopping: { rgb: "121,141,255", label: "Shopping" },
  food: { rgb: "255,146,120", label: "Food & Drinks" },
  entertainment: { rgb: "186,150,255", label: "Entertainment" },
  utilities: { rgb: "110,205,190", label: "Utilities" },
  transport: { rgb: "230,190,110", label: "Transport" },
  general: { rgb: "255,255,255", label: "General" },
};

// 3D glass sphere — single light source, organic silhouette, transparent
// core / tinted rim so the blurred backdrop shows through the middle
function seedFrom(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return h % 20;
}

function soapBubble(seed: number): React.CSSProperties {
  // No per-category color — every bubble uses the same neutral glass tone.
  // A plain white-to-white gradient has almost no tonal range to read as
  // curvature, so a faint cool-white-to-neutral-gray sweep gives every
  // bubble the same subtle 3D shading without tinting any of them.
  const rgb = "225,235,255";
  const rgbDark = "90,94,104";

  // Deterministic per-bubble jitter so no two bubbles share an identical
  // highlight position or silhouette
  const hx = 28 + (seed % 10); // 28–37%
  const hy = 22 + (seed % 8) - (seed % 3);
  const r1 = 49 + (seed % 4);
  const r2 = 51 - (seed % 3);
  const r3 = 48 + (seed % 5);
  const r4 = 52 - (seed % 4);

  return {
    // Slightly irregular blob instead of a perfect circle
    borderRadius: `${r1}% ${100 - r1}% ${r2}% ${100 - r2}% / ${r3}% ${r4}% ${100 - r4}% ${100 - r3}%`,
    background: [
      // Small, bright, tight glossy hotspot — the "wet" glint, jittered per bubble
      `radial-gradient(circle at ${hx}% ${hy}%, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0.3) 3%, transparent 11%)`,
      // Transparent CORE, tinted RIM — a real soap film is most see-through in
      // the middle and most colored at the edge (longer optical path through
      // the film there). This is what makes it read as "glass" instead of
      // "solid disc": you can see the blurred backdrop through the center.
      `radial-gradient(circle at 50% 50%, transparent 0%, transparent 30%, rgba(${rgb},0.16) 52%, rgba(${rgb},0.36) 74%, rgba(${rgbDark},0.42) 100%)`,
    ].join(", "),
    border: `1px solid rgba(${rgb},0.32)`,
    boxShadow: [
      // Drop shadow — grounds the sphere
      "0 10px 22px rgba(0,0,0,0.4)",
      // Fresnel rim — bright on the lit side, sells "glass" over "flat circle"
      "0 -1px 2px rgba(255,255,255,0.22)",
      // Dark rim on the shadow side, opposite the light — carries the
      // directional shading (fill itself stays transparent)
      `inset -6px -8px 12px rgba(${rgbDark},0.38)`,
      // Soft inner glow near the lit edge
      "inset 4px 6px 8px rgba(255,255,255,0.10)",
    ].join(", "),
    backdropFilter: "blur(4px) saturate(1.6)",
    WebkitBackdropFilter: "blur(4px) saturate(1.6)",
  };
}

// Minimal frosted glass for cards and tx icons
const glassBubble: React.CSSProperties = {
  background: "rgba(255,255,255,0.07)",
  border: "1px solid rgba(255,255,255,0.14)",
  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.18), 0 2px 12px rgba(0,0,0,0.3)",
  backdropFilter: "blur(16px)",
  WebkitBackdropFilter: "blur(16px)",
};

const glassCard: React.CSSProperties = {
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.1)",
  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.08), 0 2px 16px rgba(0,0,0,0.4)",
  backdropFilter: "blur(24px)",
  WebkitBackdropFilter: "blur(24px)",
};

// ─── Bubble physics ──────────────────────────────────────────────────────────

const BW = 354;   // layout canvas width  (px)
const BH = 310;   // layout canvas height (px)
const HOVER_SCALE = 1.16;
const PUSH_GAP = 2; // tight pack — nearly touching

function computeBubblePositions(
  bubbles: Bubble[],
  hoveredId: string | null
): Record<string, { x: number; y: number }> {
  const nodes = bubbles.map((b) => ({
    id: b.id,
    x: (b.cx / 100) * BW,
    y: (b.cy / 100) * BH,
    r: (b.size / 2) * (b.id === hoveredId ? HOVER_SCALE : 1),
    pinned: b.id === hoveredId,
  }));

  for (let iter = 0; iter < 160; iter++) {
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i];
        const b = nodes[j];
        let dx = b.x - a.x;
        let dy = b.y - a.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 0.01;
        const minDist = a.r + b.r + PUSH_GAP;
        if (dist < minDist) {
          const correction = (minDist - dist) / dist;
          if (a.pinned) {
            b.x += dx * correction;
            b.y += dy * correction;
          } else if (b.pinned) {
            a.x -= dx * correction;
            a.y -= dy * correction;
          } else {
            const half = correction * 0.5;
            a.x -= dx * half;
            a.y -= dy * half;
            b.x += dx * half;
            b.y += dy * half;
          }
        }
      }
      // keep inside canvas
      const n = nodes[i];
      n.x = Math.max(n.r + 2, Math.min(BW - n.r - 2, n.x));
      n.y = Math.max(n.r + 2, Math.min(BH - n.r - 2, n.y));
    }
  }
  return Object.fromEntries(nodes.map((n) => [n.id, { x: n.x, y: n.y }]));
}

// ─── Bubble Cloud ─────────────────────────────────────────────────────────────

function BubbleCloud({ bubbles }: { bubbles: Bubble[] }) {
  const [hovered, setHovered] = useState<string | null>(null);

  // Settled base positions (no hover) — recomputed only when bubble data changes
  const basePos = useMemo(() => computeBubblePositions(bubbles, null), [bubbles]);

  // Positions with hovered bubble expanded + others pushed away
  const livePos = useMemo(
    () => (hovered ? computeBubblePositions(bubbles, hovered) : basePos),
    [bubbles, hovered, basePos]
  );

  return (
    <div
      className="relative w-full"
      style={{ height: BH }}
    >
      {bubbles.map((b) => {
        const isHovered = hovered === b.id;
        const pos = livePos[b.id] ?? basePos[b.id];
        const textColor = "rgba(255,255,255,0.88)";
        const subColor = "rgba(255,255,255,0.55)";
        return (
          <button
            key={b.id}
            onMouseEnter={() => setHovered(b.id)}
            onMouseLeave={() => setHovered(null)}
            onTouchStart={() => setHovered(b.id)}
            onTouchEnd={() => setHovered(null)}
            className="absolute flex flex-col items-center justify-center rounded-full select-none"
            style={{
              width: b.size,
              height: b.size,
              left: pos.x,
              top: pos.y,
              transform: `translate(-50%, -50%) scale(${isHovered ? HOVER_SCALE : 1})`,
              zIndex: isHovered ? 20 : b.z,
              transition:
                "left 0.44s cubic-bezier(0.22,1,0.36,1), top 0.44s cubic-bezier(0.22,1,0.36,1), transform 0.36s cubic-bezier(0.34,1.4,0.64,1)",
              willChange: "left, top, transform",
              ...soapBubble(seedFrom(b.id)),
            }}
            aria-label={`${b.label} ₹${b.amount}, ${(CATEGORY_COLORS[b.category] || CATEGORY_COLORS.general).label}`}
          >
            <span
              className="font-semibold text-center leading-none relative z-10"
              style={{
                fontSize: b.size < 68 ? 9 : b.size < 88 ? 11 : 13,
                color: textColor,
                fontFamily: "'DM Mono', monospace",
                letterSpacing: "-0.02em",
                textShadow: "0 1px 3px rgba(0,0,0,0.4)",
              }}
            >
              ₹{b.amount >= 1000 ? `${(b.amount / 1000).toFixed(1)}k` : b.amount}
            </span>
            {b.size >= 70 && (
              <span
                className="text-center leading-none mt-0.5 relative z-10"
                style={{
                  fontSize: b.size < 88 ? 8 : 9,
                  color: subColor,
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontWeight: 600,
                  letterSpacing: "0.01em",
                }}
              >
                {b.label}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

// ─── Section label ────────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p
      className="text-xs font-medium tracking-widest mb-3"
      style={{ color: "rgba(255,255,255,0.3)", fontFamily: "'DM Mono', monospace" }}
    >
      {children}
    </p>
  );
}

// ─── Category Progress Bars ───────────────────────────────────────────────────

function CategoryBars({ categories }: { categories: CategoryRow[] }) {
  return (
    <div className="flex flex-col gap-5">
      {categories.map((cat) => {
        const pct = Math.min(Math.round((cat.spent / cat.budget) * 100), 100);
        const isDanger = pct >= 90;
        const isWarn = pct >= 70;
        // Healthy bars use the category's own established hue (same as its
        // bubble used to be) instead of a separate accent color
        const catRgb = (CATEGORY_COLORS[cat.id] || CATEGORY_COLORS.general).rgb;
        const trackColor = isDanger
          ? "rgba(239,68,68,0.85)"
          : isWarn
          ? "rgba(234,179,8,0.8)"
          : `rgba(${catRgb},0.85)`;
        return (
          <div key={cat.id}>
            <div className="flex items-center justify-between mb-1.5">
              <span
                className="text-xs font-medium"
                style={{ color: "rgba(255,255,255,0.55)", fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              >
                {cat.label}
              </span>
              <span
                className="text-xs font-semibold"
                style={{ color: trackColor, fontFamily: "'DM Mono', monospace" }}
              >
                {pct}%
              </span>
            </div>
            {/* Track */}
            <div
              className="relative h-[10px] rounded-full overflow-hidden"
              style={{ background: "rgba(255,255,255,0.07)" }}
            >
              {/* Filled */}
              <div
                className="absolute left-0 top-0 h-full rounded-full transition-all duration-700"
                style={{
                  width: `${pct}%`,
                  background: trackColor,
                  boxShadow: `0 0 6px ${trackColor}`,
                }}
              />
              {/* Glass sheen on track */}
              <div
                className="absolute inset-0 rounded-full pointer-events-none"
                style={{
                  background:
                    "linear-gradient(180deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0) 100%)",
                }}
              />
            </div>
            <div className="flex justify-between mt-1">
              <span
                className="text-xs"
                style={{ color: "rgba(255,255,255,0.50)", fontFamily: "'DM Mono', monospace" }}
              >
                ₹{cat.spent.toLocaleString("en-IN")}
              </span>
              <span
                className="text-xs"
                style={{ color: "rgba(255,255,255,0.2)", fontFamily: "'DM Mono', monospace" }}
              >
                / ₹{cat.budget.toLocaleString("en-IN")}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Bar Chart ────────────────────────────────────────────────────────────────

function BarChart({ bars, period }: { bars: BarGroup[]; period: Period }) {
  const maxVal = Math.max(...bars.flatMap((b) => [b.primary, b.secondary]));
  const chartHeight = 140;

  return (
    <div>
      <div className="flex items-end gap-2 mb-2" style={{ height: chartHeight }}>
        {bars.map((bar) => {
          const h1 = Math.round((bar.primary / maxVal) * chartHeight);
          const h2 = Math.round((bar.secondary / maxVal) * chartHeight);
          return (
            <div key={bar.label} className="flex-1 flex items-end gap-0.5">
              {/* Primary bar — warm gold, complements the ambient glow instead of plain white */}
              <div
                className="flex-1 rounded-t-md transition-all duration-500"
                style={{
                  height: h1,
                  background: "linear-gradient(180deg, rgba(224,168,92,0.8) 0%, rgba(196,140,70,0.55) 100%)",
                  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.3)",
                  minWidth: 6,
                }}
              />
              {/* Secondary bar — warm muted neutral, quiet contrast against the gold */}
              <div
                className="flex-1 rounded-t-md transition-all duration-500"
                style={{
                  height: h2,
                  background: "rgba(214,180,150,0.28)",
                  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.15)",
                  minWidth: 6,
                }}
              />
            </div>
          );
        })}
      </div>
      {/* Baseline */}
      <div
        className="w-full mb-2"
        style={{ height: 1, background: "rgba(255,255,255,0.1)" }}
      />
      {/* Labels */}
      <div className="flex gap-2">
        {bars.map((bar) => (
          <div
            key={bar.label}
            className="flex-1 text-center text-xs"
            style={{ color: "rgba(255,255,255,0.3)", fontFamily: "'DM Mono', monospace" }}
          >
            {bar.label}
          </div>
        ))}
      </div>
      {/* Legend */}
      <div className="flex items-center gap-4 mt-3">
        <div className="flex items-center gap-1.5">
          <div
            className="w-2.5 h-2.5 rounded-sm"
            style={{ background: "rgba(224,168,92,0.85)" }}
          />
          <span
            className="text-xs"
            style={{ color: "rgba(255,255,255,0.55)", fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            {period === "weekly" ? "This week" : "This month"}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <div
            className="w-2.5 h-2.5 rounded-sm"
            style={{ background: "rgba(255,255,255,0.18)" }}
          />
          <span
            className="text-xs"
            style={{ color: "rgba(255,255,255,0.55)", fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            {period === "weekly" ? "Last week" : "Last month"}
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Recent Transactions ──────────────────────────────────────────────────────

function TxList({ rows }: { rows: TxRow[] }) {
  return (
    <div className="flex flex-col">
      {rows.map((tx, i) => (
        <div
          key={tx.id}
          className="flex items-center gap-3 py-3"
          style={{
            borderBottom:
              i < rows.length - 1 ? "1px solid rgba(255,255,255,0.06)" : "none",
          }}
        >
          {/* Icon placeholder — initials in glass circle */}
          <div
            className="w-9 h-9 rounded-full shrink-0 flex items-center justify-center text-xs font-semibold"
            style={{
              ...glassBubble,
              fontSize: 11,
              color: "rgba(255,255,255,0.7)",
              fontFamily: "'Plus Jakarta Sans', sans-serif",
            }}
          >
            {tx.label.slice(0, 2).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p
              className="text-sm font-medium truncate"
              style={{ color: "rgba(255,255,255,0.85)" }}
            >
              {tx.label}
            </p>
            <p
              className="text-xs"
              style={{ color: "rgba(255,255,255,0.3)", fontFamily: "'DM Mono', monospace" }}
            >
              {tx.sub} · {tx.time}
            </p>
          </div>
          <p
            className="text-sm font-semibold shrink-0"
            style={{ color: "rgba(255,255,255,0.7)", fontFamily: "'DM Mono', monospace" }}
          >
            −₹{tx.amount.toLocaleString("en-IN")}
          </p>
        </div>
      ))}
    </div>
  );
}

// ─── Budget Summary Bar ───────────────────────────────────────────────────────

function BudgetSummary({ spent, budget }: { spent: number; budget: number }) {
  const pct = Math.min(Math.round((spent / budget) * 100), 100);
  const remaining = budget - spent;
  const isWarn = pct >= 70;
  const isDanger = pct >= 90;
  const fillColor = isDanger ? "rgba(239,68,68,0.9)" : isWarn ? "rgba(234,179,8,0.85)" : "rgba(224,168,92,0.9)";

  return (
    <div
      className="rounded-2xl p-4"
      style={glassCard}
    >
      <div className="flex items-end justify-between mb-3">
        <div>
          <p
            className="text-xs mb-1"
            style={{ color: "rgba(255,255,255,0.3)", fontFamily: "'DM Mono', monospace", letterSpacing: "0.08em" }}
          >
            TOTAL SPENT
          </p>
          <p
            className="text-2xl font-semibold tracking-tight"
            style={{ fontFamily: "'DM Mono', monospace", color: "rgba(255,255,255,0.92)" }}
          >
            ₹{spent.toLocaleString("en-IN")}
          </p>
        </div>
        <div className="text-right">
          <p
            className="text-xs mb-1"
            style={{ color: "rgba(255,255,255,0.3)", fontFamily: "'DM Mono', monospace", letterSpacing: "0.08em" }}
          >
            BUDGET
          </p>
          <p
            className="text-lg font-medium"
            style={{ color: "rgba(255,255,255,0.4)", fontFamily: "'DM Mono', monospace" }}
          >
            ₹{budget.toLocaleString("en-IN")}
          </p>
        </div>
      </div>

      <div
        className="relative h-3 rounded-full overflow-hidden"
        style={{ background: "rgba(255,255,255,0.07)" }}
      >
        <div
          className="absolute left-0 top-0 h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, background: fillColor, boxShadow: `0 0 8px ${fillColor}` }}
        />
        <div
          className="absolute inset-0 rounded-full pointer-events-none"
          style={{ background: "linear-gradient(180deg, rgba(255,255,255,0.15) 0%, transparent 60%)" }}
        />
      </div>

      <div className="flex justify-between mt-2">
        <span
          className="text-xs"
          style={{ color: "rgba(255,255,255,0.3)", fontFamily: "'DM Mono', monospace" }}
        >
          {pct}% used
        </span>
        <span
          className="text-xs font-medium"
          style={{ color: isDanger ? "rgba(239,68,68,0.9)" : isWarn ? "rgba(234,179,8,0.85)" : "rgba(255,255,255,0.3)", fontFamily: "'DM Mono', monospace" }}
        >
          {isDanger ? "Over limit" : `₹${remaining.toLocaleString("en-IN")} remaining`}
        </span>
      </div>
    </div>
  );
}

// ─── Hamburger Drawer ─────────────────────────────────────────────────────────

function Drawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  return (
    <div
      className="absolute inset-0 z-50"
      style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(6px)" }}
      onClick={onClose}
    >
      <div
        className="absolute right-0 top-0 h-full flex flex-col pt-14 pb-8 px-6 gap-1"
        style={{ width: 200, ...glassCard, borderLeft: "1px solid rgba(255,255,255,0.1)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <p
          className="text-xs font-medium tracking-widest mb-4"
          style={{ color: "rgba(255,255,255,0.50)", fontFamily: "'DM Mono', monospace" }}
        >
          MENU
        </p>
        {["Dashboard", "All Transactions", "Budgets", "Reports", "Notifications", "Settings"].map((item) => (
          <button
            key={item}
            className="text-left text-sm font-medium py-2.5 transition-colors duration-150"
            style={{ color: "rgba(255,255,255,0.65)" }}
            onClick={onClose}
          >
            {item}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Root App ─────────────────────────────────────────────────────────────────

export default function App() {
  const [period, setPeriod] = useState<Period>("weekly");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const data = period === "weekly" ? WEEKLY : MONTHLY;

  return (
    <div
      className="flex justify-center items-start"
      style={{ background: "#080808", minHeight: "100vh" }}
    >
      {/* Phone canvas */}
      <div
        className="relative flex flex-col"
        style={{
          width: "100%",
          maxWidth: 390,
          minHeight: "100vh",
          background: "#000",
          overflow: "clip",
        }}
      >
        {/* Fixed dot grid — continuous across entire scroll */}
        <div
          className="pointer-events-none"
          style={{
            position: "fixed",
            top: 0,
            left: "50%",
            transform: "translateX(-50%)",
            width: "100%",
            maxWidth: 390,
            height: "100vh",
            backgroundImage:
              "radial-gradient(circle, rgba(255,255,255,0.2) 1px, transparent 1px)",
            backgroundSize: "20px 20px",
            zIndex: 0,
          }}
        />
        {/* Minimal, dark ambient glow — muted pinkish-purple, concentrated
            near the bubble cluster rather than a bright corner-to-corner wash */}
        <div
          className="pointer-events-none"
          style={{
            position: "fixed",
            top: 0,
            left: "50%",
            transform: "translateX(-50%)",
            width: "100%",
            maxWidth: 390,
            height: "100vh",
            background:
              "radial-gradient(circle 460px at 50% 36%, rgba(150,90,160,0.4) 0%, rgba(110,55,125,0.26) 32%, rgba(65,30,78,0.15) 58%, transparent 80%), radial-gradient(ellipse 125% 78% at 50% 40%, rgba(60,26,68,0.18) 0%, transparent 75%)",
            zIndex: 1,
          }}
        />
        {/* Grain overlay — fixed, sits above the gradient */}
        <div
          className="pointer-events-none"
          style={{
            position: "fixed",
            top: 0,
            left: "50%",
            transform: "translateX(-50%)",
            width: "100%",
            maxWidth: 390,
            height: "100vh",
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.72' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E\")",
            backgroundRepeat: "repeat",
            backgroundSize: "140px 140px",
            opacity: 0.34,
            mixBlendMode: "overlay",
            zIndex: 2,
          }}
        />

        <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />

        {/* Content sits above gradient + grain */}
        <div className="relative flex flex-col flex-1 overflow-hidden" style={{ zIndex: 3 }}>

        {/* Status strip */}
        <div
          className="flex items-center justify-between px-5 pt-3.5 pb-1 shrink-0"
          style={{ color: "rgba(255,255,255,0.5)" }}
        >
          <span
            className="text-xs font-medium"
            style={{ fontFamily: "'DM Mono', monospace" }}
          >
            9:41
          </span>
          {/* Signal icons — pure SVG, no emoji */}
          <div className="flex items-center gap-2">
            {/* Signal bars */}
            <svg width="17" height="11" viewBox="0 0 17 11" fill="none">
              <rect x="0"  y="7" width="3" height="4"  rx="0.5" fill="rgba(255,255,255,0.5)" />
              <rect x="4.5" y="5" width="3" height="6"  rx="0.5" fill="rgba(255,255,255,0.5)" />
              <rect x="9"  y="2.5" width="3" height="8.5" rx="0.5" fill="rgba(255,255,255,0.5)" />
              <rect x="13.5" y="0" width="3" height="11" rx="0.5" fill="rgba(255,255,255,0.5)" />
            </svg>
            {/* Wifi */}
            <svg width="14" height="11" viewBox="0 0 14 11" fill="none">
              <path d="M7 8.5 A1 1 0 1 1 7 10.5 A1 1 0 1 1 7 8.5" fill="rgba(255,255,255,0.5)" />
              <path d="M4.2 6.8 Q7 4.5 9.8 6.8" stroke="rgba(255,255,255,0.5)" strokeWidth="1.2" fill="none" strokeLinecap="round" />
              <path d="M2 4.8 Q7 1 12 4.8" stroke="rgba(255,255,255,0.5)" strokeWidth="1.2" fill="none" strokeLinecap="round" />
            </svg>
            {/* Battery */}
            <svg width="22" height="11" viewBox="0 0 22 11" fill="none">
              <rect x="0" y="1" width="19" height="9" rx="2" stroke="rgba(255,255,255,0.45)" strokeWidth="1" />
              <rect x="1.5" y="2.5" width="13" height="6" rx="1" fill="rgba(255,255,255,0.5)" />
              <path d="M20 3.5 V7.5" stroke="rgba(255,255,255,0.45)" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
        </div>

        {/* Top nav */}
        <header className="flex items-center justify-between px-5 py-3 shrink-0">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
              <circle cx="13" cy="13" r="12" stroke="rgba(255,255,255,0.50)" strokeWidth="1" />
              <circle cx="13" cy="13" r="12" fill="url(#logoGlass)" />
              <path d="M8 13.5 L11.5 17 L18 9.5" stroke="rgba(255,255,255,0.85)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              <defs>
                <radialGradient id="logoGlass" cx="35%" cy="30%" r="65%">
                  <stop offset="0%" stopColor="rgba(255,255,255,0.2)" />
                  <stop offset="100%" stopColor="rgba(255,255,255,0.03)" />
                </radialGradient>
              </defs>
            </svg>
            <span
              className="text-base font-semibold tracking-tight"
              style={{ color: "rgba(255,255,255,0.88)", letterSpacing: "-0.03em" }}
            >
              Savi
            </span>
          </div>

          {/* Hamburger — 3 even lines, classic menu icon */}
          <button
            onClick={() => setDrawerOpen(true)}
            className="flex flex-col items-center justify-center w-9 h-9 rounded-xl"
            style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)", gap: 3 }}
            aria-label="Open menu"
          >
            <span
              className="block rounded-full"
              style={{ width: 16, height: 1.5, background: "rgba(255,255,255,0.7)" }}
            />
            <span
              className="block rounded-full"
              style={{ width: 16, height: 1.5, background: "rgba(255,255,255,0.7)" }}
            />
            <span
              className="block rounded-full"
              style={{ width: 16, height: 1.5, background: "rgba(255,255,255,0.7)" }}
            />
          </button>
        </header>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto">

          {/* Period toggle */}
          <div className="flex items-center justify-between px-5 mb-4">
            <p
              className="text-lg font-semibold tracking-tight"
              style={{ color: "rgba(255,255,255,0.88)", letterSpacing: "-0.03em" }}
            >
              Overview
            </p>
            <div
              className="flex rounded-full p-0.5"
              style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.09)" }}
            >
              {(["weekly", "monthly"] as Period[]).map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className="px-3.5 py-1.5 rounded-full text-xs font-medium capitalize transition-all duration-200"
                  style={{
                    background: period === p ? "rgba(255,255,255,0.14)" : "transparent",
                    color: period === p ? "rgba(255,255,255,0.88)" : "rgba(255,255,255,0.55)",
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                  }}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* — Bubble cluster — */}
          <div className="px-4 mb-6">
            <BubbleCloud bubbles={data.bubbles} />
          </div>

          {/* — Budget summary — */}
          <div className="px-4 mb-6">
            <BudgetSummary spent={data.totalSpent} budget={data.totalBudget} />
          </div>

          {/* — Category breakdown — */}
          <div className="px-4 mb-6">
            <SectionLabel>BY CATEGORY</SectionLabel>
            <CategoryBars categories={data.categories} />
          </div>

          {/* — Spending chart — */}
          <div className="px-4 mb-6">
            <SectionLabel>SPENDING TREND</SectionLabel>
            <div className="rounded-2xl p-4" style={glassCard}>
              <BarChart bars={data.bars} period={period} />
            </div>
          </div>

          {/* — Recent transactions — */}
          <div className="px-4 mb-8">
            <div className="flex items-center justify-between mb-3">
              <SectionLabel>RECENT</SectionLabel>
              <button
                className="text-xs font-medium"
                style={{ color: "rgba(255,255,255,0.3)", fontFamily: "'DM Mono', monospace" }}
              >
                see all
              </button>
            </div>
            <div className="rounded-2xl px-4" style={glassCard}>
              <TxList rows={data.recent} />
            </div>
          </div>

          {/* Home indicator */}
          <div className="flex justify-center pb-5">
            <div
              className="rounded-full"
              style={{ width: 100, height: 4, background: "rgba(255,255,255,0.18)" }}
            />
          </div>
        </div>
        </div>{/* end content wrapper */}
      </div>
    </div>
  );
}
