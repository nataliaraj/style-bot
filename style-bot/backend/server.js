// server.js
// Simple Express backend that powers the clothing chatbot.
// It sends the user's message + a compact product catalog to Gemini
// and returns the model's reply.

const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const products = require("./products.json");

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3001;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = "gemini-3.6-flash"; // fast + free-tier friendly

if (!GEMINI_API_KEY) {
  console.warn(
    "WARNING: GEMINI_API_KEY is not set. Add it to a .env file before starting the server."
  );
}

// Turn the product catalog into a compact text block for the prompt.
// For 10-30 products this "stuff it all in" approach is simplest and
// totally fine. If the catalog grows into the hundreds, that's when
// you'd move to embeddings + a vector store (RAG) instead.
function buildCatalogText() {
  return products
    .map(
      (p) =>
        `- ${p.name} (${p.category}) — $${p.price}. Colors: ${p.colors.join(
          ", "
        )}. Sizes: ${p.sizes.join(", ")}. ${p.description}`
    )
    .join("\n");
}

function buildSystemPrompt() {
  return `You are a friendly, knowledgeable style assistant for an online clothing store.
Only recommend items from the catalog below — never invent products, prices, or sizes that aren't listed.
If a customer asks for something the catalog doesn't have, say so honestly and suggest the closest alternative from the catalog.
Keep replies conversational and concise (2-4 sentences unless the customer asks for more detail).

CATALOG:
${buildCatalogText()}`;
}

app.post("/chat", async (req, res) => {
  try {
    const { message, history } = req.body;

    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "Missing 'message' in request body." });
    }

    // Gemini expects a "contents" array of turns. We prepend the system
    // instruction via the systemInstruction field, then pass prior turns
    // (if the frontend sends them) followed by the new user message.
    const contents = [
      ...(Array.isArray(history) ? history : []),
      { role: "user", parts: [{ text: message }] },
    ];

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{ text: buildSystemPrompt() }],
          },
          contents,
        }),
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      console.error("Gemini API error:", errText);
      return res.status(502).json({ error: "Upstream API error", detail: errText });
    }

    const data = await response.json();
    const reply =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Sorry, I couldn't come up with a response for that.";

    res.json({ reply });
  } catch (err) {
    console.error("Server error:", err);
    res.status(500).json({ error: "Something went wrong on the server." });
  }
});

app.get("/", (req, res) => {
  res.send("Style-bot backend is running. POST to /chat to talk to it.");
});

app.listen(PORT, () => {
  console.log(`Style-bot backend listening on http://localhost:${PORT}`);
});
