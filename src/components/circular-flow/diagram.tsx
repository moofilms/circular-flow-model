import { useId, useMemo } from "react";
import type { FlowId, FlowKind, NodeId, ShowMode } from "./data";
import { FLOWS, NODES } from "./data";

type Props = {
  selected: NodeId | FlowId | null;
  hovered: NodeId | FlowId | null;
  show: ShowMode;
  animating: boolean;
  onSelect: (id: NodeId | FlowId) => void;
  onHover: (id: NodeId | FlowId | null) => void;
};

/**
 * Classic textbook layout on circular rings:
 *              Resource Market
 *     Firms  ←————————————→  Households
 *              Product Market
 *
 * Outer ellipse = real (coral) · Inner ellipse = money (teal)
 */
const NODE_POS: Record<
  NodeId,
  { x: number; y: number; w: number; h: number }
> = {
  factor: { x: 400, y: 80, w: 228, h: 76 },
  product: { x: 400, y: 620, w: 228, h: 76 },
  firms: { x: 108, y: 350, w: 168, h: 96 },
  households: { x: 692, y: 350, w: 168, h: 96 },
};

type Seg = {
  id: string;
  flow: FlowId;
  d: string;
  label: string;
  lx: number;
  ly: number;
  money: boolean;
};

/**
 * Elliptical arc segments — smooth circular rings.
 * Outer: rx≈275 ry≈245, counterclockwise (real)
 * Inner: rx≈175 ry≈160, clockwise (money)
 * Labels sit mid-arc, clear of boxes and the house icon.
 */
const SEGMENTS: Seg[] = [
  // Outer real · HH → Resource Market (top-right quarter)
  {
    id: "factors-right",
    flow: "factors",
    d: "M 692 302 A 275 245 0 0 0 500 82",
    label: "Factors",
    lx: 630,
    ly: 160,
    money: false,
  },
  // Outer real · Resource Market → Firms (top-left quarter)
  {
    id: "factors-left",
    flow: "factors",
    d: "M 300 82 A 275 245 0 0 0 108 302",
    label: "Factors / inputs",
    lx: 170,
    ly: 160,
    money: false,
  },
  // Outer real · Firms → Product Market (bottom-left quarter)
  {
    id: "goods-left",
    flow: "goods",
    d: "M 108 398 A 275 245 0 0 0 300 618",
    label: "Goods & services",
    lx: 155,
    ly: 540,
    money: false,
  },
  // Outer real · Product Market → HH (bottom-right quarter)
  {
    id: "goods-right",
    flow: "goods",
    d: "M 500 618 A 275 245 0 0 0 692 398",
    label: "Goods & services",
    lx: 645,
    ly: 540,
    money: false,
  },
  // Inner money · Firms → Resource Market (Costs)
  {
    id: "costs",
    flow: "factor-payments",
    d: "M 184 308 A 175 160 0 0 1 350 148",
    label: "Costs",
    lx: 250,
    ly: 225,
    money: true,
  },
  // Inner money · Resource Market → HH (Income)
  {
    id: "income",
    flow: "factor-payments",
    d: "M 450 148 A 175 160 0 0 1 616 308",
    label: "Income",
    lx: 550,
    ly: 225,
    money: true,
  },
  // Inner money · HH → Product Market (Consumption)
  {
    id: "consumption",
    flow: "expenditure",
    d: "M 616 392 A 175 160 0 0 1 450 552",
    label: "Consumption",
    lx: 550,
    ly: 475,
    money: true,
  },
  // Inner money · Product Market → Firms (Revenue)
  {
    id: "revenue",
    flow: "expenditure",
    d: "M 350 552 A 175 160 0 0 1 184 392",
    label: "Revenue",
    lx: 250,
    ly: 475,
    money: true,
  },
];

function flowColor(kind: FlowKind): string {
  return kind === "money" ? "var(--color-money)" : "var(--color-real)";
}

function isActive(
  id: NodeId | FlowId,
  selected: NodeId | FlowId | null,
  hovered: NodeId | FlowId | null,
): boolean {
  return selected === id || hovered === id;
}

function isDimmed(
  id: NodeId | FlowId,
  selected: NodeId | FlowId | null,
  show: ShowMode,
): boolean {
  if (show !== "both" && id in FLOWS) {
    const kind = FLOWS[id as FlowId].kind;
    if (show === "real" && kind !== "real") return true;
    if (show === "money" && kind !== "money") return true;
  }
  if (!selected) return false;
  if (selected === id) return false;
  if (selected in NODES) {
    const node = selected as NodeId;
    if (id in FLOWS) {
      const f = FLOWS[id as FlowId];
      return !(f.from === node || f.to === node || f.via === node);
    }
    if (id in NODES) {
      if (id === node) return false;
      const connected = Object.values(FLOWS).some(
        (f) =>
          (f.from === node || f.to === node || f.via === node) &&
          (f.from === id || f.to === id || f.via === id),
      );
      return !connected;
    }
  }
  if (selected in FLOWS) {
    const f = FLOWS[selected as FlowId];
    if (id in NODES) {
      return !(id === f.from || id === f.to || id === f.via);
    }
    return id !== selected;
  }
  return false;
}

export function CircularFlowDiagram({
  selected,
  hovered,
  show,
  animating,
  onSelect,
  onHover,
}: Props) {
  const uid = useId().replace(/:/g, "");

  const visibleSegs = useMemo(() => {
    return SEGMENTS.filter((s) => {
      if (show === "both") return true;
      return FLOWS[s.flow].kind === show;
    });
  }, [show]);

  return (
    <svg
      viewBox="0 0 800 700"
      className="cf-diagram h-auto w-full select-none"
      role="img"
      aria-label="Interactive circular flow diagram: firms left, households right, resource market top, product market bottom"
    >
      <defs>
        <linearGradient id={`${uid}-hh`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#efe6f8" />
        </linearGradient>
        <linearGradient id={`${uid}-hh-on`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#faf6ff" />
          <stop offset="100%" stopColor="#e2d4f3" />
        </linearGradient>
        <linearGradient id={`${uid}-fm`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#e8e6f6" />
        </linearGradient>
        <linearGradient id={`${uid}-fm-on`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f6f5fc" />
          <stop offset="100%" stopColor="#d5d2ef" />
        </linearGradient>
        <linearGradient id={`${uid}-mkt`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#e4f0fa" />
        </linearGradient>
        <linearGradient id={`${uid}-mkt-on`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f3f9fd" />
          <stop offset="100%" stopColor="#c5dff3" />
        </linearGradient>
        <filter id={`${uid}-soft`} x="-25%" y="-25%" width="150%" height="150%">
          <feDropShadow
            dx="0"
            dy="3"
            stdDeviation="3.5"
            floodColor="#2c2420"
            floodOpacity="0.11"
          />
        </filter>
        <marker
          id={`${uid}-arrow-money`}
          viewBox="0 0 10 10"
          refX="9"
          refY="5"
          markerWidth="7.5"
          markerHeight="7.5"
          orient="auto-start-reverse"
        >
          <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--color-money)" />
        </marker>
        <marker
          id={`${uid}-arrow-real`}
          viewBox="0 0 10 10"
          refX="9"
          refY="5"
          markerWidth="7.5"
          markerHeight="7.5"
          orient="auto-start-reverse"
        >
          <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--color-real)" />
        </marker>
      </defs>

      {/* Soft guide rings for circular reading */}
      <ellipse
        cx="400"
        cy="350"
        rx="275"
        ry="245"
        fill="none"
        stroke="var(--color-border)"
        strokeWidth="1.25"
        strokeDasharray="5 9"
        opacity="0.4"
      />
      <ellipse
        cx="400"
        cy="350"
        rx="175"
        ry="160"
        fill="none"
        stroke="var(--color-border)"
        strokeWidth="1"
        strokeDasharray="4 8"
        opacity="0.32"
      />

      {visibleSegs.map((seg) => {
        const flow = FLOWS[seg.flow];
        const active = isActive(seg.flow, selected, hovered);
        const dim = isDimmed(seg.flow, selected, show);
        const color = flowColor(flow.kind);
        const marker = seg.money
          ? `url(#${uid}-arrow-money)`
          : `url(#${uid}-arrow-real)`;
        const soft = seg.money
          ? "var(--color-money-soft)"
          : "var(--color-real-soft)";
        const labelW =
          seg.label.length > 15 ? 190 : seg.label.length > 10 ? 168 : 124;
        const baseW = active
          ? seg.money
            ? 5
            : 6
          : seg.money
            ? 4
            : 5;

        return (
          <g
            key={seg.id}
            opacity={dim ? 0.12 : active ? 1 : 0.94}
            style={{ transition: "opacity 160ms ease" }}
            onMouseEnter={() => onHover(seg.flow)}
            onMouseLeave={() => onHover(null)}
            onClick={(e) => {
              e.stopPropagation();
              onSelect(seg.flow);
            }}
            className="cursor-pointer"
          >
            <path
              d={seg.d}
              fill="none"
              stroke="transparent"
              strokeWidth="30"
              strokeLinecap="round"
            />
            <path
              d={seg.d}
              fill="none"
              stroke={color}
              strokeWidth={baseW}
              strokeLinecap="round"
              markerEnd={marker}
              opacity={animating && !dim ? 0.55 : 0.92}
              style={{ pointerEvents: "none" }}
            />
            {animating && !dim ? (
              <path
                d={seg.d}
                fill="none"
                stroke={color}
                strokeWidth={baseW + 0.5}
                strokeLinecap="round"
                strokeDasharray="14 18"
                className="flow-dash-slow"
                opacity={0.9}
                style={{ pointerEvents: "none" }}
              />
            ) : null}

            <g transform={`translate(${seg.lx}, ${seg.ly})`}>
              <rect
                x={-labelW / 2}
                y={seg.money ? -32 : -16}
                width={labelW}
                height={seg.money ? 50 : 32}
                rx={14}
                fill={soft}
                stroke={color}
                strokeWidth={active ? 1.7 : 1.15}
                opacity={0.98}
              />
              {seg.money && (
                <text
                  className="cf-flow-dollar"
                  textAnchor="middle"
                  y={-8}
                  fontWeight="800"
                  fill={color}
                  style={{ pointerEvents: "none" }}
                >
                  $
                </text>
              )}
              <text
                className="cf-flow-label"
                textAnchor="middle"
                y={seg.money ? 15 : 7}
                fontWeight="700"
                fill={color}
                style={{ pointerEvents: "none" }}
              >
                {seg.label}
              </text>
            </g>
          </g>
        );
      })}

      {(Object.keys(NODE_POS) as NodeId[]).map((id) => {
        const pos = NODE_POS[id];
        const active = isActive(id, selected, hovered);
        const dim = isDimmed(id, selected, show);
        const isMarket = id === "factor" || id === "product";
        const fillId =
          id === "households"
            ? active
              ? `${uid}-hh-on`
              : `${uid}-hh`
            : id === "firms"
              ? active
                ? `${uid}-fm-on`
                : `${uid}-fm`
              : active
                ? `${uid}-mkt-on`
                : `${uid}-mkt`;
        const stroke =
          id === "households"
            ? "#8b6bb5"
            : id === "firms"
              ? "#7a74b8"
              : "var(--color-factor)";
        const title =
          id === "factor"
            ? "Resource Market"
            : id === "product"
              ? "Product Market"
              : NODES[id].label;
        const sub =
          id === "factor"
            ? "Factor / inputs"
            : id === "product"
              ? "Goods & services"
              : id === "firms"
                ? "Producers"
                : "Resource owners";

        return (
          <g
            key={id}
            opacity={dim ? 0.26 : 1}
            style={{ transition: "opacity 160ms ease" }}
            transform={`translate(${pos.x}, ${pos.y})`}
            onMouseEnter={() => onHover(id)}
            onMouseLeave={() => onHover(null)}
            onClick={(e) => {
              e.stopPropagation();
              onSelect(id);
            }}
            className="cursor-pointer"
            filter={`url(#${uid}-soft)`}
          >
            <rect
              x={-pos.w / 2}
              y={-pos.h / 2}
              width={pos.w}
              height={pos.h}
              rx={isMarket ? 14 : 16}
              fill={`url(#${fillId})`}
              stroke={stroke}
              strokeWidth={active ? 2.5 : 1.5}
            />
            {active && (
              <circle
                cx={pos.w / 2 - 11}
                cy={-pos.h / 2 + 11}
                r={4.5}
                fill={stroke}
                className="flow-pulse"
                style={{ pointerEvents: "none" }}
              />
            )}

            {id === "households" ? (
              <>
                <g
                  className="cf-house"
                  transform="translate(0, -22)"
                  style={{ pointerEvents: "none" }}
                  opacity={0.95}
                >
                  <rect
                    x={-9}
                    y={-1}
                    width={18}
                    height={12}
                    rx={2}
                    fill="var(--color-product)"
                  />
                  <path
                    d="M -11 0 L 0 -11 L 11 0 Z"
                    fill="var(--color-heading)"
                  />
                  <rect x={-2.5} y={3} width={5} height={7} fill="#f7f0e8" />
                  <circle cx={5.5} cy={-5} r={3.2} fill="var(--color-money)" />
                  <text
                    x={5.5}
                    y={-3}
                    textAnchor="middle"
                    fontSize="5.5"
                    fontWeight="800"
                    fill="#fff"
                  >
                    $
                  </text>
                </g>
                <text
                  className="cf-node-title"
                  textAnchor="middle"
                  y={4}
                  fontWeight="700"
                  fill="var(--color-fg)"
                  style={{ pointerEvents: "none" }}
                >
                  {title}
                </text>
                <text
                  className="cf-node-sub"
                  textAnchor="middle"
                  y={28}
                  fill="var(--color-fg-muted)"
                  style={{ pointerEvents: "none" }}
                >
                  {sub}
                </text>
              </>
            ) : (
              <>
                <text
                  className="cf-node-title"
                  textAnchor="middle"
                  y={isMarket ? 2 : -4}
                  fontWeight="700"
                  fill="var(--color-fg)"
                  style={{ pointerEvents: "none" }}
                >
                  {title}
                </text>
                <text
                  className="cf-node-sub"
                  textAnchor="middle"
                  y={isMarket ? 20 : 18}
                  fill="var(--color-fg-muted)"
                  style={{ pointerEvents: "none" }}
                >
                  {sub}
                </text>
              </>
            )}
          </g>
        );
      })}

      <g opacity="0.96" style={{ pointerEvents: "none" }}>
        <rect
          x="292"
          y="316"
          width="216"
          height="68"
          rx="14"
          fill="var(--color-surface)"
          stroke="var(--color-border)"
          strokeWidth="1"
        />
        <path
          d="M 312 338 H 344"
          stroke="var(--color-real)"
          strokeWidth="5"
          strokeLinecap="round"
        />
        <text
          className="cf-legend"
          x="354"
          y="343"
          fontWeight="600"
          fill="var(--color-fg-muted)"
        >
          Outer · real
        </text>
        <path
          d="M 312 362 H 344"
          stroke="var(--color-money)"
          strokeWidth="4"
          strokeLinecap="round"
        />
        <text
          className="cf-legend"
          x="354"
          y="367"
          fontWeight="600"
          fill="var(--color-fg-muted)"
        >
          Inner · money
        </text>
      </g>
    </svg>
  );
}
