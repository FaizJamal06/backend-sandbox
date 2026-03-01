const express = require("express");
require("dotenv").config();
const cors = require("cors");
const feedbackRoutes = require("./routes/feedback");
const config = require("./config");

const app = express();

app.use(cors());
app.use(express.json({ limit: "1mb" }));

app.use("/api/feedback", feedbackRoutes);

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use((err, _req, res, _next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Internal server error" });
});

app.listen(config.port, () => {
  console.log(`Backend listening on http://localhost:${config.port}`);
});