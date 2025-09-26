import express from "express";
import { rateCards, quotes } from "./data.js";
import { quoteBreakdown } from "../../../packages/calc/src/index.js";

const app = express();
const PORT = process.env.PORT || 3000;  // keep 3000 since your Codespace shows port 3000 running
app.use(express.json());

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

// Preview quote using real calc engine
app.post("/quotes/preview", (req, res) => {
  const { rateCardId, scopeInput } = req.body || {};
  const rateCard = rateCards.find(r => r.id === rateCardId) || rateCards[0];
  const result = quoteBreakdown(scopeInput || {}, rateCard);
  return res.json(result);
});

// Save version-locked quote
app.post("/quotes", (req, res) => {
  const { rateCardId, scopeInput } = req.body || {};
  const rateCard = rateCards.find(r => r.id === rateCardId) || rateCards[0];
  const result = quoteBreakdown(scopeInput || {}, rateCard);
  const id = Math.random().toString(36).slice(2,10);
  const record = { 
    id, 
    rateCardId: rateCard.id, 
    rateCardVersion: rateCard.version,
    input: scopeInput, 
    ...result, 
    createdAt: new Date().toISOString() 
  };
  quotes.set(id, record);
  return res.json({ id });
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
  const newer = quoteBreakdown(saved.input || {}, latest);
  
  res.json({
    ok: true,
    savedQuoteId: req.params.id,
    previousRateCardId: saved.rateCardId,
    latestRateCardId: latest.id,
    totalsCents: newer.totalsCents,
    meta: { engine: "qcsv1-calc", note: "Preview with newer rate" }
  });
});

app.listen(PORT, () => {
  console.log(`[QCSv1 API] listening on http://localhost:${PORT}`);
});
