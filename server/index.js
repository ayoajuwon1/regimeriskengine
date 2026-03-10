import "dotenv/config";

import cors from "cors";
import express from "express";
import OpenAI from "openai";

const PORT = Number(process.env.PORT || 3001);
const MODEL = process.env.OPENAI_MODEL || "gpt-4.1-mini";
const SYSTEM_PROMPT = "You are a senior institutional portfolio risk strategist. Respond only with strict JSON that matches the supplied schema. Keep outputs concise, analytically precise, and suitable for institutional governance review.";

const app = express();

app.use(cors());
app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, model: MODEL });
});

app.post("/api/analyze", async (req, res) => {
  const { prompt, schema, schemaName } = req.body || {};

  if (!prompt || !schema || !schemaName) {
    return res.status(400).json({ error: "Missing prompt, schema, or schemaName." });
  }

  if (!process.env.OPENAI_API_KEY) {
    return res.status(500).json({ error: "Missing OPENAI_API_KEY in the server environment." });
  }

  try {
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const response = await client.responses.create({
      model: MODEL,
      store: false,
      instructions: SYSTEM_PROMPT,
      input: prompt,
      text: {
        format: {
          type: "json_schema",
          name: schemaName,
          schema,
          strict: true,
        },
      },
    });

    const outputText = response.output_text?.trim();
    if (!outputText) {
      throw new Error("OpenAI returned an empty response.");
    }

    return res.json(JSON.parse(outputText));
  } catch (error) {
    const message = error instanceof Error ? error.message : "OpenAI request failed.";
    return res.status(500).json({ error: message });
  }
});

app.listen(PORT, () => {
  console.log(`Regime Risk Engine API listening on http://localhost:${PORT}`);
});
