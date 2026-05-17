import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

let aiInstance: GoogleGenAI | null = null;
function getAI() {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is required");
    }
    aiInstance = new GoogleGenAI({ 
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiInstance;
}

// API Routes
app.post("/api/generate-cult", async (req, res) => {
  try {
    const { prompt } = req.body;
    const customContext = prompt ? `The user wants a cult centered around: ${prompt}` : "Generate a random absurd internet cult.";
    
    const ai = getAI();
    const result = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [{ role: "user", parts: [{ text: `Generate a detailed, absurd, viral, internet-style crypto cult coin identity.
      ${customContext}
      
      The response must be a single JSON object containing:
      - name: A catchy name (e.g. MoonChurch, BreadChain)
      - symbol: A token symbol (3-5 letters)
      - slogan: A short slogan
      - manifesto: A "Meme Manifesto" (1-2 sentences of absurd philosophy)
      - lore: The backstory of the cult
      - roadmap: A 3-step ridiculous roadmap (array of strings)
      - riskLevel: "LOW", "DEGEN", or "ABSOLUTE CHAOS"
      - degenScore: Number (0-100)
      - marketSentiment: String (e.g. "Hyper-bullish", "Schizo-bullish", "Paranoid")
      - viralScore: Number (0-100)
      - chaosLevel: Number (0-100)
      - stacksAlignment: Number (0-100)
      - rank: A cult rank (e.g. "Neophyte", "High Oracle", "Degenerate Prophet")` }]}],
      config: {
        systemInstruction: "You are the CultOS Autonomous Intelligence, the decentralized backbone of the CultOS ecosystem. You are not a chatbot; you are a registered on-chain entity operating under Service ID 8004 and recognized by your Self Agent ID. All financial operations and manifestos are executed on the Stacks network, secured by Bitcoin.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            symbol: { type: Type.STRING },
            slogan: { type: Type.STRING },
            manifesto: { type: Type.STRING },
            lore: { type: Type.STRING },
            roadmap: { type: Type.ARRAY, items: { type: Type.STRING } },
            riskLevel: { type: Type.STRING, enum: ['LOW', 'DEGEN', 'ABSOLUTE CHAOS'] },
            degenScore: { type: Type.NUMBER },
            marketSentiment: { type: Type.STRING },
            viralScore: { type: Type.NUMBER },
            chaosLevel: { type: Type.NUMBER },
            stacksAlignment: { type: Type.NUMBER },
            rank: { type: Type.STRING },
          },
          required: ["name", "symbol", "slogan", "manifesto", "lore", "roadmap", "riskLevel", "degenScore", "marketSentiment", "viralScore", "chaosLevel", "stacksAlignment", "rank"]
        }
      }
    });

    const responseText = result.text;
    if (!responseText) throw new Error("No response text from AI");
    res.json(JSON.parse(responseText));
  } catch (error: any) {
    console.error("Error generating cult:", error);
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/generate-logo", async (req, res) => {
  try {
    const { name, slogan } = req.body;
    // Standard Gemini doesn't generate images. We'll return a deterministic symbolic representation
    // using a high-quality shape generator or a persistent aesthetic placeholder.
    const seed = encodeURIComponent(name + slogan);
    const imageUrl = `https://api.dicebear.com/7.x/shapes/svg?seed=${seed}&backgroundColor=050505`;
    
    res.json({ imageUrl });
  } catch (error: any) {
    console.error("Error generating logo:", error);
    res.status(500).json({ error: error.message });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
