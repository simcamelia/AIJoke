// server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

// Setup __dirname (since we’re using ES modules with "type":"module")
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ Serve static files (your frontend lives in /public)
app.use(express.static(path.join(__dirname, "public")));

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// === API endpoint for jokes ===
app.get("/joke", async (req, res) => {
  try {
    const topic = (req.query.topic || "").toString().trim();
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.9,
      messages: [
        { role: "system", content: "You are a witty comedian. Keep jokes clean, 1–2 sentences max." },
        { role: "user", content: `Tell me a short, clean, one-liner joke${topic ? ` about ${topic}` : ""}.` }
      ]
    });

    const text = completion.choices?.[0]?.message?.content?.trim() || "No joke this time 😅";
    res.json({ joke: text });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to generate joke." });
  }
});

// ✅ Fallback: serve index.html for all other routes (so "/" shows your UI)
app.get("*", (_req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

const port = process.env.PORT || 8080;
app.listen(port, () => console.log(`🚀 Server running on http://localhost:${port}`));
