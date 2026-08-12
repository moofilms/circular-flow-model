import { useMemo, useState } from "react";
import { RotateCcw, TrendingUp } from "lucide-react";
import { BASE_INCOME } from "./data";

/**
 * Simple two-sector playground: household income from factor payments
 * becomes consumption; firms pay that income back as factor costs.
 * Illustrative — not a full national-accounts model.
 */
export function IncomePlayground() {
  const [income, setIncome] = useState(BASE_INCOME);
  const [consumeShare, setConsumeShare] = useState(1); // basic model: all spent

  const flows = useMemo(() => {
    const factorPayments = income;
    const expenditure = Math.round(income * consumeShare * 10) / 10;
    const firmRevenue = expenditure;
    const firmCosts = factorPayments;
    const balanced = Math.abs(firmRevenue - firmCosts) < 0.05;
    return { factorPayments, expenditure, firmRevenue, firmCosts, balanced };
  }, [income, consumeShare]);

  return (
    <section className="nb-card p-5 sm:p-6">
      <header className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-heading sm:text-xl">
            Income loop playground
          </h2>
          <p className="mt-0.5 text-sm text-fg-subtle">
            In the basic model, household income is spent on goods — that
            spending becomes firm revenue, paid back out as factor income.
          </p>
        </div>
        <button
          type="button"
          className="nb-btn px-3.5 py-2 text-xs"
          onClick={() => {
            setIncome(BASE_INCOME);
            setConsumeShare(1);
          }}
        >
          <RotateCcw className="size-3.5 opacity-70" aria-hidden />
          Reset
        </button>
      </header>

      <div className="grid gap-5 lg:grid-cols-2">
        <div className="space-y-5">
          <label className="block">
            <div className="mb-2 flex items-baseline justify-between gap-2">
              <span className="text-xs font-semibold uppercase tracking-wide text-fg-subtle">
                Household income (factor payments)
              </span>
              <span className="text-sm font-bold tabular-nums text-fg">
                ${income}B
              </span>
            </div>
            <input
              type="range"
              min={40}
              max={200}
              step={5}
              value={income}
              onChange={(e) => setIncome(Number(e.target.value))}
              className="w-full accent-[var(--color-accent)]"
            />
            <p className="mt-1.5 text-xs text-fg-subtle">
              Wages + rent + interest + profit paid by firms
            </p>
          </label>

          <label className="block">
            <div className="mb-2 flex items-baseline justify-between gap-2">
              <span className="text-xs font-semibold uppercase tracking-wide text-fg-subtle">
                Share spent on goods
              </span>
              <span className="text-sm font-bold tabular-nums text-fg">
                {Math.round(consumeShare * 100)}%
              </span>
            </div>
            <input
              type="range"
              min={0.5}
              max={1}
              step={0.05}
              value={consumeShare}
              onChange={(e) => setConsumeShare(Number(e.target.value))}
              className="w-full accent-[var(--color-heading)]"
            />
            <p className="mt-1.5 text-xs text-fg-subtle">
              Basic textbook model assumes 100% is consumed (no saving leakages
              yet)
            </p>
          </label>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Stat
            label="Factor payments → HH"
            value={`$${flows.factorPayments}B`}
            hint="Money to households"
            tone="money"
          />
          <Stat
            label="Consumer spending → firms"
            value={`$${flows.expenditure}B`}
            hint="Money to firms"
            tone="money"
          />
          <Stat
            label="Firm revenue"
            value={`$${flows.firmRevenue}B`}
            hint="Equals expenditure"
            tone="product"
          />
          <Stat
            label="Firm factor costs"
            value={`$${flows.firmCosts}B`}
            hint="Equals income paid"
            tone="factor"
          />
        </div>
      </div>

      <div
        className="mt-5 flex items-start gap-3 rounded-xl border px-4 py-3.5"
        style={{
          background: flows.balanced
            ? "var(--color-money-soft)"
            : "var(--color-warn-soft)",
          borderColor: flows.balanced
            ? "color-mix(in oklab, var(--color-money) 28%, var(--color-border))"
            : "color-mix(in oklab, var(--color-warn) 30%, var(--color-border))",
        }}
      >
        <TrendingUp
          className="mt-0.5 size-4 shrink-0"
          style={{
            color: flows.balanced
              ? "var(--color-money)"
              : "var(--color-warn)",
          }}
          aria-hidden
        />
        <p className="text-sm leading-snug text-fg">
          {flows.balanced ? (
            <>
              <strong className="font-semibold">Loop closed.</strong> At 100%
              consumption, income earned in the factor market equals spending
              in the product market — the circular flow balances.
            </>
          ) : (
            <>
              <strong className="font-semibold">
                Saving leakage (${Math.round((income - flows.expenditure) * 10) / 10}B).
              </strong>{" "}
              In a fuller model, banks, government, and the foreign sector
              re-inject funds. This playground shows why the basic closed loop
              needs 100% spending to balance without them.
            </>
          )}
        </p>
      </div>
    </section>
  );
}

function Stat({
  label,
  value,
  hint,
  tone,
}: {
  label: string;
  value: string;
  hint: string;
  tone: "money" | "product" | "factor";
}) {
  const color =
    tone === "money"
      ? "var(--color-money)"
      : tone === "product"
        ? "var(--color-product)"
        : "var(--color-factor)";
  return (
    <div className="nb-stat px-3.5 py-3">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-fg-subtle">
        {label}
      </p>
      <p
        className="mt-1 text-xl font-bold tabular-nums tracking-tight"
        style={{ color }}
      >
        {value}
      </p>
      <p className="mt-0.5 text-xs text-fg-subtle">{hint}</p>
    </div>
  );
}
