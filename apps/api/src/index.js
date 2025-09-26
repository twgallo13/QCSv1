import express from "express";

const app = express();
const PORT = process.env.PORT || 3000;  // keep 3000 since your Codespace shows port 3000 running
app.use(express.json());

// --- In-memory fixtures (stand-in for real DB/rate-card engine) ---
const ratecards = [
  { id: "rc-launch", name: "Launch", version: "1.0.0", updatedAt: "2025-09-26" },
  { id: "rc-scale",  name: "Scale",  version: "1.0.0", updatedAt: "2025-09-26" },
  { id: "rc-prime",  name: "Prime",  version: "1.0.0", updatedAt: "2025-09-26" }
];

// quotes store: id -> record
const quotes = new Map();
let quoteCounter = 1;

// --- Endpoints ---
// Health (kept for sanity)
app.get("/health", (_req, res) => res.json({ ok: true, service: "api" }));

// List rate cards
app.get("/ratecards", (_req, res) => {
  res.json({ ok: true, data: ratecards });
});

// Get one rate card
app.get("/ratecards/:id", (req, res) => {
  const rc = ratecards.find(r => r.id === req.params.id);
  if (!rc) return res.status(404).json({ ok: false, error: "NOT_FOUND" });
  res.json({ ok: true, data: rc });
});

// Preview quote (mock math; integrates real calc engine later)
app.post("/quotes/preview", (req, res) => {
  // Minimal scopeInput: { monthlyOrders, averageOrderValue, averageUnitsPerOrder, rateCardId }
  const { monthlyOrders = 0, averageOrderValue = 0, averageUnitsPerOrder = 1, rateCardId } = req.body || {};

  const rc = ratecards.find(r => r.id === rateCardId) || ratecards[0];
  // Mock cents math: fulfillment per order ~= AOV * 2% floor $0.50 + 0.05 per extra unit
  const aov = Number(averageOrderValue) || 0; // dollars
  const utp = Number(averageUnitsPerOrder) || 1;
  const perOrderFulfillment = Math.max(aov * 0.02, 0.5) + Math.max(0, utp - 1) * 0.05;
  const perOrderSandH = 0.35; // flat mock
  const perOrderTotal = perOrderFulfillment + perOrderSandH;
  const monthlyTotal = perOrderTotal * Number(monthlyOrders || 0);

  const breakdown = {
    perOrder: {
      fulfillment: Number(perOrderFulfillment.toFixed(2)),
      sandh: Number(perOrderSandH.toFixed(2)),
      total: Number(perOrderTotal.toFixed(2))
    },
    monthly: {
      total: Number(monthlyTotal.toFixed(2))
    }
  };

  res.json({
    ok: true,
    rateCard: { id: rc.id, version: rc.version },
    breakdown,
    meta: { versionLocked: false }
  });
});

// Save version-locked quote
app.post("/quotes", (req, res) => {
  const { rateCardId, preview } = req.body || {};
  const rc = ratecards.find(r => r.id === rateCardId);
  if (!rc) return res.status(400).json({ ok: false, error: "INVALID_RATECARD" });

  const id = String(quoteCounter++);
  const record = {
    id,
    rateCardId: rc.id,
    rateCardVersion: rc.version, // version-locked
    totals: preview?.breakdown || null,
    createdAt: new Date().toISOString()
  };
  quotes.set(id, record);
  res.status(201).json({ ok: true, data: record });
});

// Read saved quote
app.get("/quotes/:id", (req, res) => {
  const q = quotes.get(req.params.id);
  if (!q) return res.status(404).json({ ok: false, error: "NOT_FOUND" });
  res.json({ ok: true, data: q });
});

app.listen(PORT, () => {
  console.log(`[QCSv1 API] listening on http://localhost:${PORT}`);
});
