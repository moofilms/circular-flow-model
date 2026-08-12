import {
  ArrowRight,
  Building2,
  CircleDollarSign,
  Home,
  Package,
  Store,
  X,
} from "lucide-react";
import type { FlowId, NodeId } from "./data";
import { FLOWS, NODES, isFlowId, isNodeId } from "./data";

type Props = {
  selected: NodeId | FlowId | null;
  onClear: () => void;
  onSelect: (id: NodeId | FlowId) => void;
};

const NODE_ICON = {
  households: Home,
  firms: Building2,
  factor: Store,
  product: Package,
} as const;

export function DetailPanel({ selected, onClear, onSelect }: Props) {
  if (!selected) {
    return (
      <aside className="nb-card flex flex-col gap-4 p-5 sm:p-6">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-fg-subtle">
            Inspector
          </p>
          <h2 className="mt-1 text-xl font-semibold tracking-tight text-heading">
            Click to explore
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-fg-muted">
            Select any box, arrow, or label. The{" "}
            <strong className="font-semibold text-fg">outer loop</strong> carries
            real factors and goods; the{" "}
            <strong className="font-semibold text-fg">inner loop</strong> carries
            money (costs, income, consumption, revenue).
          </p>
        </div>

        <div className="grid gap-2.5">
          {(Object.keys(NODES) as NodeId[]).map((id) => {
            const n = NODES[id];
            const Icon = NODE_ICON[id];
            return (
              <button
                key={id}
                type="button"
                onClick={() => onSelect(id)}
                className="nb-btn justify-start gap-3 rounded-xl px-3.5 py-3 text-left text-sm"
              >
                <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-surface-muted text-fg-muted">
                  <Icon className="size-4" aria-hidden />
                </span>
                <span className="min-w-0">
                  <span className="block font-semibold text-fg">{n.label}</span>
                  <span className="block text-xs text-fg-subtle">{n.short}</span>
                </span>
              </button>
            );
          })}
        </div>

        <div className="nb-well mt-1 px-4 py-3.5">
          <p className="text-xs font-semibold uppercase tracking-wide text-fg-subtle">
            Layout tip
          </p>
          <p className="mt-1.5 text-sm leading-snug text-fg-muted">
            Firms sit on the left, households on the right — same as the classic
            textbook figure. Outer coral = real; inner teal = money.
          </p>
        </div>
      </aside>
    );
  }

  if (isNodeId(selected)) {
    const node = NODES[selected];
    const Icon = NODE_ICON[selected];
    const related = Object.values(FLOWS).filter(
      (f) => f.from === selected || f.to === selected || f.via === selected,
    );

    return (
      <aside className="nb-card flex flex-col gap-4 p-5 sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <span
              className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-border"
              style={{
                background:
                  selected === "households"
                    ? "#efe6f8"
                    : selected === "firms"
                      ? "#e8e6f6"
                      : selected === "factor"
                        ? "var(--color-factor-soft)"
                        : "var(--color-factor-soft)",
                color:
                  selected === "households"
                    ? "#8b6bb5"
                    : selected === "firms"
                      ? "#7a74b8"
                      : "var(--color-factor)",
              }}
            >
              <Icon className="size-5" aria-hidden />
            </span>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-fg-subtle">
                {node.role}
              </p>
              <h2 className="mt-0.5 text-xl font-semibold tracking-tight text-heading">
                {node.label}
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClear}
            className="nb-btn size-9 shrink-0 justify-center p-0"
            aria-label="Clear selection"
          >
            <X className="size-4 opacity-70" />
          </button>
        </div>

        <p className="text-sm leading-relaxed text-fg-muted">{node.blurb}</p>

        <ul className="grid gap-2">
          {node.bullets.map((b) => (
            <li
              key={b}
              className="nb-stat flex items-start gap-2.5 px-3.5 py-2.5 text-sm text-fg"
            >
              <span
                className="mt-1.5 size-1.5 shrink-0 rounded-full"
                style={{
                  background:
                    selected === "factor" || selected === "product"
                      ? "var(--color-factor)"
                      : "var(--color-heading)",
                }}
              />
              {b}
            </li>
          ))}
        </ul>

        <div>
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-fg-subtle">
            Connected flows
          </p>
          <div className="flex flex-wrap gap-2">
            {related.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => onSelect(f.id)}
                className="nb-chip px-3 py-1.5 text-xs transition hover:brightness-[0.98] active:scale-[0.98]"
                style={{
                  background:
                    f.kind === "money"
                      ? "var(--color-money-soft)"
                      : "var(--color-real-soft)",
                  color:
                    f.kind === "money"
                      ? "var(--color-money)"
                      : "var(--color-real)",
                  borderColor:
                    f.kind === "money"
                      ? "color-mix(in oklab, var(--color-money) 30%, var(--color-border))"
                      : "color-mix(in oklab, var(--color-real) 30%, var(--color-border))",
                }}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </aside>
    );
  }

  if (isFlowId(selected)) {
    const flow = FLOWS[selected];
    return (
      <aside className="nb-card flex flex-col gap-4 p-5 sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p
              className="text-[11px] font-semibold uppercase tracking-[0.14em]"
              style={{
                color:
                  flow.kind === "money"
                    ? "var(--color-money)"
                    : "var(--color-real)",
              }}
            >
              {flow.kind === "money" ? "Inner · money flow" : "Outer · real flow"}
            </p>
            <h2 className="mt-0.5 text-xl font-semibold tracking-tight text-heading">
              {flow.label}
            </h2>
            <p className="mt-1 text-sm text-fg-subtle">{flow.short}</p>
          </div>
          <button
            type="button"
            onClick={onClear}
            className="nb-btn size-9 shrink-0 justify-center p-0"
            aria-label="Clear selection"
          >
            <X className="size-4 opacity-70" />
          </button>
        </div>

        {flow.segments.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {flow.segments.map((s) => (
              <span
                key={s}
                className="nb-chip px-2.5 py-1 text-xs"
                style={{
                  background:
                    flow.kind === "money"
                      ? "var(--color-money-soft)"
                      : "var(--color-real-soft)",
                  color:
                    flow.kind === "money"
                      ? "var(--color-money)"
                      : "var(--color-real)",
                  borderColor:
                    flow.kind === "money"
                      ? "color-mix(in oklab, var(--color-money) 28%, var(--color-border))"
                      : "color-mix(in oklab, var(--color-real) 28%, var(--color-border))",
                }}
              >
                {flow.kind === "money" ? `$ ${s}` : s}
              </span>
            ))}
          </div>
        )}

        <div className="nb-well flex flex-wrap items-center gap-2 px-3.5 py-3 text-sm font-semibold text-fg">
          <button
            type="button"
            onClick={() => onSelect(flow.from)}
            className="underline decoration-border-strong underline-offset-2 transition hover:text-heading"
          >
            {NODES[flow.from].label}
          </button>
          <ArrowRight className="size-3.5 text-fg-subtle" aria-hidden />
          <button
            type="button"
            onClick={() => onSelect(flow.via)}
            className="underline decoration-border-strong underline-offset-2 transition hover:text-heading"
          >
            {NODES[flow.via].label}
          </button>
          <ArrowRight className="size-3.5 text-fg-subtle" aria-hidden />
          <button
            type="button"
            onClick={() => onSelect(flow.to)}
            className="underline decoration-border-strong underline-offset-2 transition hover:text-heading"
          >
            {NODES[flow.to].label}
          </button>
        </div>

        <p className="text-sm leading-relaxed text-fg-muted">{flow.detail}</p>

        <div>
          <p className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-fg-subtle">
            <CircleDollarSign className="size-3.5" aria-hidden />
            Examples
          </p>
          <ul className="grid gap-2">
            {flow.examples.map((ex) => (
              <li key={ex} className="nb-stat px-3.5 py-2.5 text-sm text-fg">
                {ex}
              </li>
            ))}
          </ul>
        </div>

        <div
          className="rounded-xl border px-4 py-3 text-sm leading-snug"
          style={{
            background:
              flow.kind === "money"
                ? "var(--color-money-soft)"
                : "var(--color-real-soft)",
            borderColor:
              flow.kind === "money"
                ? "color-mix(in oklab, var(--color-money) 25%, var(--color-border))"
                : "color-mix(in oklab, var(--color-real) 25%, var(--color-border))",
            color:
              flow.kind === "money"
                ? "var(--color-chip-fg)"
                : "var(--color-heading)",
          }}
        >
          {flow.kind === "money"
            ? "Money rides the inner loop — opposite the real outer loop."
            : "This is the outer real flow — resources or goods, not cash."}
        </div>
      </aside>
    );
  }

  return null;
}
