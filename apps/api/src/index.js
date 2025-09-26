import express from "express";
const app = express();
const PORT = process.env.PORT || 4000;
app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "api" });
});
app.listen(PORT, () => {
  console.log(`[QCSv1 API] listening on http://localhost:${PORT}`);
});
