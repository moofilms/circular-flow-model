import { useCallback, useEffect, useState } from "react";
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
  RotateCcw,
} from "lucide-react";
import type { FlowId, NodeId, ShowMode } from "./data";
import { FLOWS, TOUR, isFlowId, isNodeId } from "./data";
import { CircularFlowDiagram } from "./diagram";
import { DetailPanel } from "./detail-panel";

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

  const exitTour = () => {
    setTourStep(null);
    setShow("both");
  };

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
              if (inTour) {
                exitTour();
                setSelected(null);
                return;
              }
              setSelected(null);
            }}
          >
            <CircularFlowDiagram
              selected={selected}
              hovered={hovered}
              show={show}
              animating={animating}
              onSelect={(id) => {
                if (inTour) exitTour();
                setSelected(id);
              }}
              onHover={setHovered}
            />
          </div>
        </section>

        {inTour && step ? (
          <aside className="nb-card flex flex-col gap-4 border-accent/20 p-5 sm:p-6">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-accent">
                Tour · Step {tourStep! + 1} of {TOUR.length}
              </p>
              <h2 className="mt-1 text-xl font-semibold tracking-tight text-heading">
                {step.title}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-fg-muted">
                {step.body}
              </p>
            </div>
            <div className="flex items-center gap-2">
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
              <button
                type="button"
                className="nb-btn ml-auto px-3 py-2.5 text-sm"
                onClick={() => {
                  exitTour();
                  setSelected(null);
                }}
              >
                Close
              </button>
            </div>
            <div className="flex gap-1">
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
          </aside>
        ) : (
          <DetailPanel
            selected={selected}
            onClear={() => setSelected(null)}
            onSelect={setSelected}
          />
        )}
      </div>

      <div className="mt-6">
        <button
          type="button"
          className={`nb-btn px-4 py-2.5 text-sm ${inTour ? "nb-btn-active" : ""}`}
          onClick={() => (inTour ? (exitTour(), setSelected(null)) : startTour())}
          aria-pressed={inTour}
        >
          <BookOpen className="size-3.5 opacity-70" aria-hidden />
          {inTour ? "Exit tour" : "Guided tour"}
        </button>
      </div>
    </div>
  );
}
