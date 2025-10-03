import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.get("/", (_, res) => res.send("✅ AI Joke API running"));

app.get("/joke", async (req, res) => {
  try {
    const topic = (req.query.topic || "").toString().trim();
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.9,
      messages: [
        {
          role: "system",
          content:
            "You are a witty comedian. Keep jokes clean, 1–2 sentences max.",
        },
        {
          role: "user",
          content: `Tell me a short, clean, one-liner joke${
            topic ? ` about ${topic}` : ""
          }.`,
        },
      ],
    });
    const text =
      completion.choices?.[0]?.message?.content?.trim() ||
      "No joke this time 😅";
    res.json({ joke: text });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to generate joke." });
  }
});

const port = process.env.PORT || 8080;
app.listen(port, () =>
  console.log(`🚀 Server running on http://localhost:${port}`)
);
