import express from "express";
import cors from "cors";
import { rateCards } from "./data.js";
import { quoteBreakdown } from "../../../packages/calc/src/index.js";
import { validateRequest, PreviewDto } from "./dto.js";
import { MemoryQuoteRepository } from "./quotes/quote.repo.memory.js";

const app = express();
const PORT = process.env.PORT || 4000;  // Changed to 4000 as expected port

// Enable CORS
app.use(cors({
  origin: [/\.app\.github\.dev$/, 'http://localhost:3001'],
  credentials: true,
}));

app.use(express.json());

// Initialize repository based on environment
let quoteRepo;
if (process.env.USE_FIREBASE === 'true') {
  const { FirestoreQuoteRepository } = await import('./quotes/quote.repo.firestore.js');
  quoteRepo = new FirestoreQuoteRepository();
} else {
  quoteRepo = new MemoryQuoteRepository();
}

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
app.post("/quotes/preview", validateRequest(PreviewDto), (req, res) => {
  const { rateCardId, scopeInput } = req.validatedBody;
  const rateCard = rateCards.find(r => r.id === rateCardId) || rateCards[0];
  const result = quoteBreakdown(scopeInput, rateCard);
  const normalizedScope = {
    ...scopeInput,
    averageOrderValueCents: Number(scopeInput.averageOrderValueCents || 0)
  };
  return res.json({ ...result, scopeInput: normalizedScope });
});

// Save version-locked quote
app.post("/quotes", validateRequest(PreviewDto), async (req, res) => {
  try {
    const { rateCardId, scopeInput } = req.validatedBody;
    const rateCard = rateCards.find(r => r.id === rateCardId) || rateCards[0];
    const result = quoteBreakdown(scopeInput, rateCard);
    const normalizedScope = {
      ...scopeInput,
      averageOrderValueCents: Number(scopeInput.averageOrderValueCents || 0)
    };

    const saved = await quoteRepo.save({
      rateCardId: rateCard.id,
      scopeInput: normalizedScope,
      totalsCents: result.totalsCents
    });
    
    return res.json({ ok: true, id: saved.id, totalsCents: saved.totalsCents, scopeInput: normalizedScope });
  } catch (error) {
    return res.status(500).json({ ok: false, error: error.message });
  }
});

// List all quotes
app.get("/quotes", async (req, res) => {
  try {
    const quotes = await quoteRepo.list();
    res.json(quotes);
  } catch (error) {
    return res.status(500).json({ ok: false, error: error.message });
  }
});

// Read saved quote
app.get("/quotes/:id", async (req, res) => {
  try {
    const q = await quoteRepo.get(req.params.id);
    if (!q) return res.status(404).json({ ok: false, error: "NOT_FOUND" });
    res.json({ ok: true, data: q });
  } catch (error) {
    return res.status(500).json({ ok: false, error: error.message });
  }
});

// Preview with newer rate card
app.get("/quotes/:id/preview-newer", async (req, res) => {
  try {
    const saved = await quoteRepo.get(req.params.id);
    if (!saved) return res.status(404).json({ ok: false, error: "NOT_FOUND" });
    
    const latest = rateCards[rateCards.length - 1];
    const newer = quoteBreakdown(saved.scopeInput || {}, latest);
    
    res.json({
      ok: true,
      savedQuoteId: req.params.id,
      previousRateCardId: saved.rateCardId,
      latestRateCardId: latest.id,
      totalsCents: newer.totalsCents,
      meta: { engine: "qcsv1-calc", note: "Preview with newer rate" }
    });
  } catch (error) {
    return res.status(500).json({ ok: false, error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`[QCSv1 API] listening on http://localhost:${PORT}`);
});
