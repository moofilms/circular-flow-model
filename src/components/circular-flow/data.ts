export type NodeId = "households" | "firms" | "factor" | "product";
export type FlowId =
  | "factors"
  | "factor-payments"
  | "goods"
  | "expenditure";
export type FlowKind = "real" | "money";
export type ShowMode = "both" | "real" | "money";

export type NodeInfo = {
  id: NodeId;
  label: string;
  short: string;
  role: string;
  blurb: string;
  bullets: string[];
  color: "factor" | "product" | "heading" | "accent";
};

export type FlowInfo = {
  id: FlowId;
  label: string;
  kind: FlowKind;
  from: NodeId;
  to: NodeId;
  via: NodeId;
  short: string;
  detail: string;
  examples: string[];
  /** Segment labels shown on the diagram (like the textbook figure). */
  segments: string[];
};

export const NODES: Record<NodeId, NodeInfo> = {
  households: {
    id: "households",
    label: "Households",
    short: "Own the factors of production",
    role: "Consumers & resource owners",
    blurb:
      "Households own land, labor, capital, and entrepreneurship. They sell these resources to firms and use the income to buy goods and services.",
    bullets: [
      "Supply factors of production (CELL)",
      "Demand goods & services in the product market",
      "Receive income (wages, rent, interest, profit)",
      "Spend on consumption in the product market",
    ],
    color: "heading",
  },
  firms: {
    id: "firms",
    label: "Firms",
    short: "Produce goods & services",
    role: "Businesses / producers",
    blurb:
      "Firms hire resources from households, produce goods and services, and sell them in the product market. Revenue from sales is paid back out as factor costs.",
    bullets: [
      "Demand factors of production",
      "Supply goods & services",
      "Pay costs (wages, rent, interest, profit)",
      "Earn revenue from household consumption",
    ],
    color: "accent",
  },
  factor: {
    id: "factor",
    label: "Resource Market",
    short: "Factor / input market",
    role: "Where resources are bought & sold",
    blurb:
      "Also called the factor market. Households sell factors of production; firms buy them. Real factors flow toward firms; money income flows toward households.",
    bullets: [
      "Factors: Capital, Entrepreneurship, Land, Labor (CELL)",
      "Households are sellers; firms are buyers",
      "Firms pay costs → households receive income",
      "Real flow → firms · money flow → households",
    ],
    color: "factor",
  },
  product: {
    id: "product",
    label: "Product Market",
    short: "Goods & services market",
    role: "Where outputs are bought & sold",
    blurb:
      "Firms sell finished goods and services; households buy them. Household consumption becomes firm revenue.",
    bullets: [
      "Goods and services flow to households",
      "Firms are sellers; households are buyers",
      "Consumption spending = firm revenue",
      "Real flow → households · money flow → firms",
    ],
    color: "product",
  },
};

export const FLOWS: Record<FlowId, FlowInfo> = {
  factors: {
    id: "factors",
    label: "Factors / inputs",
    kind: "real",
    from: "households",
    to: "firms",
    via: "factor",
    short: "Outer loop · resources to firms",
    detail:
      "Households supply land, labor, capital, and entrepreneurship to firms through the resource market. This is the outer real flow — not money.",
    examples: [
      "Labor hours worked at a firm",
      "Factory space (land/capital) leased",
      "Entrepreneurship organizing production",
    ],
    segments: ["Factors", "Factors / inputs"],
  },
  "factor-payments": {
    id: "factor-payments",
    label: "Costs & income",
    kind: "money",
    from: "firms",
    to: "households",
    via: "factor",
    short: "Inner loop · money for resources",
    detail:
      "Firms pay costs for resources; those payments are household income (wages, rent, interest, profit). Same money flow — labeled Costs on the firm side and Income on the household side.",
    examples: [
      "Wages & salaries (labor)",
      "Rent (land)",
      "Interest (capital)",
      "Profit (entrepreneurship)",
    ],
    segments: ["Costs", "Income"],
  },
  goods: {
    id: "goods",
    label: "Goods & services",
    kind: "real",
    from: "firms",
    to: "households",
    via: "product",
    short: "Outer loop · output to households",
    detail:
      "Firms supply goods and services through the product market. Households receive the real output they consume — the outer real flow on the bottom of the diagram.",
    examples: [
      "Groceries and clothing",
      "Healthcare and education services",
      "Phones, cars, streaming",
    ],
    segments: ["Goods & services"],
  },
  expenditure: {
    id: "expenditure",
    label: "Consumption & revenue",
    kind: "money",
    from: "households",
    to: "firms",
    via: "product",
    short: "Inner loop · money for goods",
    detail:
      "Households spend on consumption; that spending is firm revenue. Same money flow — labeled Consumption on the household side and Revenue on the firm side.",
    examples: [
      "Household shopping at stores",
      "Paying for services",
      "Firm sales revenue",
    ],
    segments: ["Consumption", "Revenue"],
  },
};

export type TourStep = {
  id: string;
  title: string;
  body: string;
  focus: NodeId | FlowId | "all" | "money" | "real";
};

export const TOUR: TourStep[] = [
  {
    id: "intro",
    title: "The basic circular flow",
    body: "A simple market economy has two groups — households and firms — exchanging in two markets. Real things move on the outer loop; money moves on the inner loop in the opposite direction.",
    focus: "all",
  },
  {
    id: "households",
    title: "Households own resources",
    body: "Households (right side) own the factors of production: capital, entrepreneurship, land, and labor (CELL). They sell these to firms and buy goods with the income they earn.",
    focus: "households",
  },
  {
    id: "firms",
    title: "Firms produce output",
    body: "Firms (left side) hire resources, produce goods and services, and sell them. What households spend becomes firm revenue — which is then paid back out as costs.",
    focus: "firms",
  },
  {
    id: "factor",
    title: "Resource (factor) market",
    body: "At the top: households sell resources and firms buy them. Factors flow toward firms (outer); costs/income flow toward households (inner).",
    focus: "factor",
  },
  {
    id: "factors-flow",
    title: "Outer loop: factors → firms",
    body: "The outer coral arrows carry real factors of production from households through the resource market to firms.",
    focus: "factors",
  },
  {
    id: "payments-flow",
    title: "Inner loop: costs → income",
    body: "On the money side, firms pay costs for those resources. Those payments are household income — the teal inner arrows at the top.",
    focus: "factor-payments",
  },
  {
    id: "product",
    title: "Product market",
    body: "At the bottom the roles reverse: firms sell, households buy. Goods flow to households (outer); consumption/revenue flows to firms (inner).",
    focus: "product",
  },
  {
    id: "goods-flow",
    title: "Outer loop: goods → households",
    body: "Finished goods and services leave firms and reach households through the product market — still the outer real loop.",
    focus: "goods",
  },
  {
    id: "spend-flow",
    title: "Inner loop: consumption → revenue",
    body: "Households spend on consumption; that spending becomes firm revenue. Money completes its circuit on the inner loop.",
    focus: "expenditure",
  },
  {
    id: "circle",
    title: "Why it’s a circle",
    body: "Income earned in the resource market is spent in the product market; that spending is firm revenue used to hire resources again. Outer real and inner money run opposite ways — the circular flow of economic activity.",
    focus: "all",
  },
];

export function isNodeId(id: string): id is NodeId {
  return id in NODES;
}

export function isFlowId(id: string): id is FlowId {
  return id in FLOWS;
}
