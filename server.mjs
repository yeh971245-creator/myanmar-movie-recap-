import express from "express";
import OpenAI from "openai";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;
const model = process.env.OPENAI_MODEL || "gpt-6-luna";

app.use(express.json({ limit: "1mb" }));
app.use(express.static(__dirname));

app.post("/api/recap", async (req, res) => {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({
        error: "OPENAI_API_KEY မထည့်ရသေးပါ။ Hosting ရဲ့ Environment Variables ထဲမှာ ထည့်ပါ။"
      });
    }

    const { story, style = "မြန်မာ Storytelling", length = "Medium" } = req.body ?? {};

    if (typeof story !== "string" || !story.trim()) {
      return res.status(400).json({ error: "Movie story / notes ထည့်ပေးပါ။" });
    }

    const client = new OpenAI({ apiKey });

    const response = await client.responses.create({
      model,
      instructions:
        "You are a Myanmar movie recap script writer. Write an original Burmese-language recap script based only on the user's supplied story/notes. Do not reproduce copyrighted movie dialogue verbatim. Keep the narration engaging and suitable for a short-form video.",
      input: `Style: ${style}
Length: ${length}

Movie story / notes:
${story.trim()}

Return only the Burmese recap narration script, with short paragraphs suitable for voice-over.`,
    });

    return res.json({ script: response.output_text ?? "" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      error: "AI script ထုတ်ရာမှာ အမှားဖြစ်ပါတယ်။ API key, model name နဲ့ server logs ကို စစ်ပါ။"
    });
  }
});

app.get("/health", (_req, res) => {
  res.json({ ok: true, model });
});

app.listen(port, () => {
  console.log(`Recap MM running on http://localhost:${port}`);
});
