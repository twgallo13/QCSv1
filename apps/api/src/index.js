import express from "express";
import { rateCards, quotes } from "./data.js";

const app = express();
const PORT = process.env.PORT || 3000;  // keep 3000 since your Codespace shows port 3000 running
app.use(express.json());

let quoteCounter = 1;

// --- Endpoints ---
// Health (kept for sanity)
app.get("/health", (_req, res) => res.json({ ok: true, service: "api" }));

// List rate cards
app.get("/ratecards", (_req, res) => {
  res.json({ ok: true, data: rateCards });
});

// Get one rate card
app.get("/ratecards/:id", (req, res) => {
  const rc = rateCards.find(r => r.id === req.params.id);
  if (!rc) return res.status(404).json({ ok: false, error: "NOT_FOUND" });
  res.json({ ok: true, data: rc });
});

// Get latest rate card
app.get("/ratecards/latest", (_req, res) => {
  const latest = rateCards[rateCards.length - 1];
  res.json({ item: latest });
});

// Preview quote (mock math; integrates real calc engine later)
app.post("/quotes/preview", (req, res) => {
  // Minimal scopeInput: { monthlyOrders, averageOrderValue, averageUnitsPerOrder, rateCardId }
  const { monthlyOrders = 0, averageOrderValue = 0, averageUnitsPerOrder = 1, rateCardId } = req.body || {};

  const rc = rateCards.find(r => r.id === rateCardId) || rateCards[0];
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
  const rc = rateCards.find(r => r.id === rateCardId);
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

// Preview with newer rate card
app.get("/quotes/:id/preview-newer", (req, res) => {
  const saved = quotes.get(req.params.id);
  if (!saved) return res.status(404).json({ ok: false, error: "NOT_FOUND" });
  
  const latest = rateCards[rateCards.length - 1];
  
  // Mock totals with slight variations (+3% on Fulfillment, etc.)
  const savedTotals = saved.totals || {};
  const mockTotals = {
    Storage: Math.round((savedTotals.Storage || 0) * 1.02), // +2%
    Fulfillment: Math.round((savedTotals.Fulfillment || 0) * 1.03), // +3%
    Labor: Math.round((savedTotals.Labor || 0) * 1.01), // +1%
    CS: Math.round((savedTotals.CS || 0) * 1.02), // +2%
    Surcharges: Math.round((savedTotals.Surcharges || 0) * 1.01), // +1%
    Admin: Math.round((savedTotals.Admin || 0) * 1.01), // +1%
    grandTotal: 0 // Will be calculated
  };
  
  // Calculate grand total
  mockTotals.grandTotal = Object.keys(mockTotals)
    .filter(key => key !== 'grandTotal')
    .reduce((sum, key) => sum + mockTotals[key], 0);
  
  res.json({
    ok: true,
    savedQuoteId: req.params.id,
    previousRateCardId: saved.rateCardId,
    latestRateCardId: latest.id,
    totalsCents: mockTotals,
    meta: { note: "Mock preview with newer rate card" }
  });
});

app.listen(PORT, () => {
  console.log(`[QCSv1 API] listening on http://localhost:${PORT}`);
});
