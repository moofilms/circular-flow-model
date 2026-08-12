import { useCallback, useEffect, useState } from "react";
import {
  ArrowLeftRight,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Layers,
  Pause,
  Play,
  RotateCcw,
} from "lucide-react";
import type { FlowId, NodeId, ShowMode } from "./data";
import { FLOWS, NODES, TOUR, isFlowId, isNodeId } from "./data";
import { CircularFlowDiagram } from "./diagram";
import { DetailPanel } from "./detail-panel";
import { IncomePlayground } from "./playground";

export function CircularFlowApp() {
  const [selected, setSelected] = useState<NodeId | FlowId | null>(null);
  const [hovered, setHovered] = useState<NodeId | FlowId | null>(null);
  const [show, setShow] = useState<ShowMode>("both");
  const [animating, setAnimating] = useState(true);
  const [tourStep, setTourStep] = useState<number | null>(null);

  const inTour = tourStep !== null;
  const step = inTour ? TOUR[tourStep!] : null;

  const applyTourFocus = useCallback((focus: (typeof TOUR)[0]["focus"]) => {
    if (focus === "all") {
      setSelected(null);
      setShow("both");
      return;
    }
    if (focus === "money") {
      setSelected(null);
      setShow("money");
      return;
    }
    if (focus === "real") {
      setSelected(null);
      setShow("real");
      return;
    }
    if (isNodeId(focus) || isFlowId(focus)) {
      setSelected(focus);
      if (isFlowId(focus)) {
        setShow(FLOWS[focus].kind === "money" ? "money" : "real");
      } else {
        setShow("both");
      }
    }
  }, []);

  useEffect(() => {
    if (step) applyTourFocus(step.focus);
  }, [step, applyTourFocus]);

  const reset = () => {
    setSelected(null);
    setHovered(null);
    setShow("both");
    setAnimating(true);
    setTourStep(null);
  };

  const startTour = () => {
    setTourStep(0);
    setAnimating(true);
  };

  const nextTour = () => {
    if (tourStep === null) return;
    if (tourStep >= TOUR.length - 1) {
      setTourStep(null);
      setSelected(null);
      setShow("both");
      return;
    }
    setTourStep(tourStep + 1);
  };

  const prevTour = () => {
    if (tourStep === null || tourStep <= 0) return;
    setTourStep(tourStep - 1);
  };

  return (
    <div className="mx-auto max-w-7xl px-3 pb-16 pt-[calc(var(--grok-banner-h,0px)+1rem)] sm:px-6 sm:pt-[calc(var(--grok-banner-h,0px)+1.75rem)]">
      <header className="mb-7 max-w-2xl sm:mb-9">
        <span className="nb-chip px-3.5 py-1.5 text-[11px] uppercase tracking-[0.16em] text-fg-muted">
          AP Macroeconomics
        </span>
        <h1 className="mt-4 text-3xl font-bold tracking-[-0.03em] text-heading sm:text-4xl md:text-[2.35rem] md:leading-[1.08]">
          Circular Flow Model
        </h1>
        <p className="mt-3 max-w-xl text-base leading-relaxed text-fg-muted sm:text-[1.05rem]">
          How households and firms exchange resources, goods, and money through
          the resource and product markets — outer real loop, inner money loop.
        </p>
      </header>

      <div className="mb-5 flex flex-wrap items-center gap-2.5">
        <button type="button" className="nb-btn px-4 py-2.5 text-sm" onClick={reset}>
          <RotateCcw className="size-3.5 opacity-70" aria-hidden />
          Reset
        </button>
        <button
          type="button"
          className={`nb-btn px-4 py-2.5 text-sm ${inTour ? "nb-btn-active" : ""}`}
          onClick={() => (inTour ? setTourStep(null) : startTour())}
          aria-pressed={inTour}
        >
          <BookOpen className="size-3.5 opacity-70" aria-hidden />
          {inTour ? "Exit tour" : "Guided tour"}
        </button>
        <button
          type="button"
          className={`nb-btn px-4 py-2.5 text-sm ${animating ? "nb-btn-active" : ""}`}
          onClick={() => setAnimating((a) => !a)}
          aria-pressed={animating}
        >
          {animating ? (
            <Pause className="size-3.5 opacity-70" aria-hidden />
          ) : (
            <Play className="size-3.5 opacity-70" aria-hidden />
          )}
          {animating ? "Pause flow" : "Animate flow"}
        </button>
      </div>

      <div className="nb-strip mb-6">
        <div
          className="h-1.5 w-full"
          style={{
            background:
              "linear-gradient(90deg, #e07a5f 0%, #e8b86d 35%, #7bc9a6 65%, #3d8fd1 100%)",
          }}
        />
        <div className="flex flex-col gap-3 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className="inline-flex items-center gap-1.5 font-medium text-fg-muted">
              <Layers className="size-3.5" aria-hidden />
              Show flows
            </span>
            <span className="text-fg-subtle">·</span>
            {(
              [
                ["both", "Both"],
                ["real", "Outer · real"],
                ["money", "Inner · money"],
              ] as const
            ).map(([mode, label]) => (
              <button
                key={mode}
                type="button"
                onClick={() => {
                  setShow(mode);
                  if (inTour) setTourStep(null);
                }}
                className={`nb-chip cursor-pointer px-2.5 py-0.5 text-xs transition hover:brightness-[0.98] active:scale-[0.98] ${
                  show === mode ? "" : "opacity-80"
                }`}
                style={
                  show === mode
                    ? mode === "real"
                      ? {
                          background: "var(--color-real-soft)",
                          color: "var(--color-real)",
                          borderColor:
                            "color-mix(in oklab, var(--color-real) 30%, var(--color-border))",
                        }
                      : mode === "money"
                        ? {
                            background: "var(--color-money-soft)",
                            color: "var(--color-money)",
                            borderColor:
                              "color-mix(in oklab, var(--color-money) 30%, var(--color-border))",
                          }
                        : {
                            background:
                              "linear-gradient(180deg, #f4fbf9 0%, var(--color-accent-soft) 100%)",
                            color: "var(--color-chip-fg)",
                            borderColor:
                              "color-mix(in oklab, var(--color-accent) 25%, var(--color-border))",
                          }
                    : undefined
                }
                aria-pressed={show === mode}
              >
                {label}
              </button>
            ))}
          </div>
          <p className="text-sm text-fg-muted">
            Outer coral = factors & goods · Inner teal = costs, income,
            consumption, revenue
          </p>
        </div>
      </div>

      {inTour && step && (
        <div className="nb-card mb-5 border-accent/20 p-4 sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-accent">
                Tour · Step {tourStep! + 1} of {TOUR.length}
              </p>
              <h2 className="mt-1 text-lg font-semibold tracking-tight text-heading">
                {step.title}
              </h2>
              <p className="mt-1.5 text-sm leading-relaxed text-fg-muted">
                {step.body}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                className="nb-btn size-10 justify-center p-0"
                onClick={prevTour}
                disabled={tourStep === 0}
                aria-label="Previous step"
              >
                <ChevronLeft className="size-4" />
              </button>
              <button
                type="button"
                className="nb-btn nb-btn-active px-4 py-2.5 text-sm"
                onClick={nextTour}
              >
                {tourStep! >= TOUR.length - 1 ? "Finish" : "Next"}
                {tourStep! < TOUR.length - 1 && (
                  <ChevronRight className="size-3.5 opacity-80" aria-hidden />
                )}
              </button>
            </div>
          </div>
          <div className="mt-3.5 flex gap-1">
            {TOUR.map((t, i) => (
              <button
                key={t.id}
                type="button"
                aria-label={`Go to step ${i + 1}`}
                onClick={() => setTourStep(i)}
                className="h-1.5 flex-1 rounded-full transition"
                style={{
                  background:
                    i === tourStep
                      ? "var(--color-accent)"
                      : i < (tourStep ?? 0)
                        ? "color-mix(in oklab, var(--color-accent) 45%, var(--color-border))"
                        : "var(--color-border)",
                }}
              />
            ))}
          </div>
        </div>
      )}

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.7fr)_22rem]">
        <section className="nb-card flex max-w-full flex-col gap-3 overflow-hidden p-2 sm:p-4 md:p-5">
          <header className="flex items-start justify-between gap-3 px-1 pt-1">
            <div>
              <h2 className="text-lg font-semibold tracking-tight text-heading sm:text-xl">
                Basic two-sector model
              </h2>
              <p className="mt-0.5 text-xs text-fg-subtle sm:text-sm">
                Firms · Households · Resource market · Product market
              </p>
            </div>
            <span
              className="nb-chip shrink-0 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide"
              style={{
                background:
                  "linear-gradient(180deg, #f4fbf9 0%, var(--color-accent-soft) 100%)",
                color: "var(--color-chip-fg)",
                borderColor:
                  "color-mix(in oklab, var(--color-accent) 25%, var(--color-border))",
              }}
            >
              Closed economy
            </span>
          </header>

          <div
            className="nb-well relative overflow-hidden px-0 py-1 sm:px-2 sm:py-2"
            onClick={() => {
              if (!inTour) setSelected(null);
            }}
          >
            <CircularFlowDiagram
              selected={selected}
              hovered={hovered}
              show={show}
              animating={animating}
              onSelect={(id) => {
                if (inTour) setTourStep(null);
                setSelected(id);
              }}
              onHover={setHovered}
            />
          </div>
        </section>

        <DetailPanel
          selected={selected}
          onClear={() => setSelected(null)}
          onSelect={setSelected}
        />
      </div>

      <section className="mt-8">
        <h2 className="mb-1 text-lg font-semibold tracking-tight text-heading sm:text-xl">
          The four pieces
        </h2>
        <p className="mb-4 max-w-2xl text-sm text-fg-muted">
          Two decision-makers and two markets — the same layout as the classic
          textbook diagram.
        </p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {(["firms", "households", "factor", "product"] as NodeId[]).map(
            (id) => {
              const n = NODES[id];
              const tone =
                id === "households" || id === "firms"
                  ? "#7a74b8"
                  : "var(--color-factor)";
              const soft =
                id === "households"
                  ? "#efe6f8"
                  : id === "firms"
                    ? "#e8e6f6"
                    : "var(--color-factor-soft)";
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => {
                    setSelected(id);
                    setTourStep(null);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="nb-card p-4 text-left transition hover:-translate-y-0.5 hover:shadow-[var(--shadow-btn-hover)]"
                >
                  <span
                    className="nb-chip px-2 py-0.5 text-[10px] uppercase tracking-wide"
                    style={{
                      background: soft,
                      color: tone,
                      borderColor: `color-mix(in oklab, ${tone} 28%, var(--color-border))`,
                    }}
                  >
                    {id === "factor" || id === "product" ? "Market" : "Sector"}
                  </span>
                  <h3 className="mt-2.5 text-base font-semibold tracking-tight text-fg">
                    {n.label}
                  </h3>
                  <p className="mt-1 text-xs leading-relaxed text-fg-muted">
                    {n.short}
                  </p>
                </button>
              );
            },
          )}
        </div>
      </section>

      <section className="mt-8">
        <h2 className="mb-1 text-lg font-semibold tracking-tight text-heading sm:text-xl">
          Outer real · Inner money
        </h2>
        <p className="mb-4 max-w-2xl text-sm text-fg-muted">
          Same markets, opposite directions — matching the Costs / Income /
          Revenue / Consumption labels on the figure.
        </p>
        <div className="grid gap-4 lg:grid-cols-2">
          <CompareCard
            title="Resource market"
            subtitle="Top · households sell · firms buy"
            realLabel="Factors / inputs"
            realDetail="Outer loop: resources flow from households to firms."
            moneyLabel="Costs → Income"
            moneyDetail="Inner loop: firms pay costs; households receive income."
            onReal={() => {
              setSelected("factors");
              setShow("real");
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            onMoney={() => {
              setSelected("factor-payments");
              setShow("money");
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          />
          <CompareCard
            title="Product market"
            subtitle="Bottom · firms sell · households buy"
            realLabel="Goods & services"
            realDetail="Outer loop: output flows from firms to households."
            moneyLabel="Consumption → Revenue"
            moneyDetail="Inner loop: household spending becomes firm revenue."
            onReal={() => {
              setSelected("goods");
              setShow("real");
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            onMoney={() => {
              setSelected("expenditure");
              setShow("money");
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          />
        </div>
      </section>

      <section className="nb-strip mt-8">
        <div
          className="h-1.5 w-full"
          style={{
            background:
              "linear-gradient(90deg, #3d8fd1 0%, #2f9b8a 50%, #e07a5f 100%)",
          }}
        />
        <div className="px-4 py-5 sm:px-6">
          <div className="mb-4 flex items-center gap-2">
            <ArrowLeftRight className="size-4 text-fg-muted" aria-hidden />
            <h2 className="text-base font-semibold tracking-tight text-heading sm:text-lg">
              Factors of production — CELL
            </h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                letter: "C",
                name: "Capital",
                pay: "Interest",
                note: "Tools, machines, buildings used to produce",
              },
              {
                letter: "E",
                name: "Entrepreneurship",
                pay: "Profit",
                note: "Organizing resources & taking risk",
              },
              {
                letter: "L",
                name: "Land",
                pay: "Rent",
                note: "Natural resources & location",
              },
              {
                letter: "L",
                name: "Labor",
                pay: "Wages",
                note: "Human effort and skills",
              },
            ].map((f) => (
              <div key={f.name} className="nb-stat px-3.5 py-3.5">
                <div className="flex items-baseline gap-2">
                  <span className="text-xl font-bold text-factor">{f.letter}</span>
                  <span className="text-sm font-semibold text-fg">{f.name}</span>
                </div>
                <p className="mt-1.5 text-xs text-fg-muted">{f.note}</p>
                <p className="mt-2 text-[11px] font-semibold uppercase tracking-wide text-money">
                  Paid as {f.pay}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="mt-8">
        <IncomePlayground />
      </div>

      <section className="nb-card mt-8 p-5 sm:p-6">
        <h2 className="text-lg font-semibold tracking-tight text-heading sm:text-xl">
          Why it's a circle
        </h2>
        <ol className="mt-4 grid gap-3 sm:grid-cols-2">
          {[
            {
              n: "1",
              t: "Households supply resources",
              d: "They own CELL and sell them in the resource market.",
            },
            {
              n: "2",
              t: "Firms pay costs → income",
              d: "Wages, rent, interest, and profit become household income.",
            },
            {
              n: "3",
              t: "Households consume",
              d: "Income is spent on goods and services in the product market.",
            },
            {
              n: "4",
              t: "Firms earn revenue",
              d: "Spending is firm revenue, used to hire resources again.",
            },
          ].map((s) => (
            <li key={s.n} className="nb-stat flex gap-3 px-4 py-3.5">
              <span
                className="flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
                style={{
                  background:
                    "linear-gradient(160deg, var(--color-heading) 0%, color-mix(in oklab, var(--color-heading) 70%, var(--color-coral)) 100%)",
                }}
              >
                {s.n}
              </span>
              <div>
                <p className="font-semibold text-fg">{s.t}</p>
                <p className="mt-0.5 text-sm text-fg-muted">{s.d}</p>
              </div>
            </li>
          ))}
        </ol>
        <p className="mt-5 text-sm leading-relaxed text-fg-muted">
          Real flows run on the outer loop; money runs on the inner loop the
          opposite way. Add banks, government, or foreign trade and you get
          injections and leakages — but the core household–firm exchange stays
          the same.
        </p>
      </section>
    </div>
  );
}

function CompareCard({
  title,
  subtitle,
  realLabel,
  realDetail,
  moneyLabel,
  moneyDetail,
  onReal,
  onMoney,
}: {
  title: string;
  subtitle: string;
  realLabel: string;
  realDetail: string;
  moneyLabel: string;
  moneyDetail: string;
  onReal: () => void;
  onMoney: () => void;
}) {
  return (
    <div className="nb-card flex flex-col gap-3 p-5">
      <header>
        <h3 className="text-base font-semibold tracking-tight text-heading">
          {title}
        </h3>
        <p className="text-xs text-fg-subtle">{subtitle}</p>
      </header>
      <button
        type="button"
        onClick={onReal}
        className="rounded-xl border px-3.5 py-3 text-left transition hover:brightness-[0.99] active:scale-[0.995]"
        style={{
          background: "var(--color-real-soft)",
          borderColor:
            "color-mix(in oklab, var(--color-real) 28%, var(--color-border))",
        }}
      >
        <p className="text-[11px] font-semibold uppercase tracking-wide text-real">
          Outer · real
        </p>
        <p className="mt-0.5 text-sm font-semibold text-fg">{realLabel}</p>
        <p className="mt-1 text-xs leading-relaxed text-fg-muted">{realDetail}</p>
      </button>
      <button
        type="button"
        onClick={onMoney}
        className="rounded-xl border px-3.5 py-3 text-left transition hover:brightness-[0.99] active:scale-[0.995]"
        style={{
          background: "var(--color-money-soft)",
          borderColor:
            "color-mix(in oklab, var(--color-money) 28%, var(--color-border))",
        }}
      >
        <p className="text-[11px] font-semibold uppercase tracking-wide text-money">
          Inner · money
        </p>
        <p className="mt-0.5 text-sm font-semibold text-fg">{moneyLabel}</p>
        <p className="mt-1 text-xs leading-relaxed text-fg-muted">{moneyDetail}</p>
      </button>
    </div>
  );
}
