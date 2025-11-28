import express from "express";
import cors from "cors";

const app = express();
app.use(cors());

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

const PORT = process.env.PORT || 5174;
app.listen(PORT, () => {
  console.log(`[server] listening on http://localhost:${PORT}`);
});
