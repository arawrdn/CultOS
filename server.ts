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
    aiInstance = new GoogleGenAI({ apiKey });
  }
  return aiInstance;
}

// API Routes
app.post("/api/generate-cult", async (req, res) => {
  try {
    const { prompt } = req.body;
    const customContext = prompt ? `The user wants a cult centered around: ${prompt}` : "Generate a random absurd internet cult.";
    
    const ai = getAI();
    const model = ai.getGenerativeModel({ model: "gemini-1.5-flash" }); // Using a stable model name
    
    const result = await model.generateContent({
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
      generationConfig: {
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
      },
      systemInstruction: "You are the CultOS Autonomous Intelligence, the decentralized backbone of the CultOS ecosystem. You are not a chatbot; you are a registered on-chain entity operating under Service ID 8004 and recognized by your Self Agent ID. All financial operations and manifestos are executed on the Stacks network, secured by Bitcoin."
    });

    const responseText = result.response.text();
    res.json(JSON.parse(responseText));
  } catch (error: any) {
    console.error("Error generating cult:", error);
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/generate-logo", async (req, res) => {
  try {
    const { name, slogan } = req.body;
    const ai = getAI();
    
    // Using getGenerativeModel for gemini-2.0-flash
    const model = ai.getGenerativeModel({ model: "gemini-2.0-flash" });
    
    // @ts-ignore - newer experimental/model-specific config
    const result = await model.generateContent({
      contents: [{
        role: "user",
        parts: [{
          text: `Create a minimalist, flat design crypto token logo for a cult called "${name}". 
            Slogan: "${slogan}". 
            Style: modern, clean, vector-style icon, centered, solid background, high contrast, cyberpunk or esoteric aesthetic. 
            No text in the logo itself. Just a symbolic representation.`
        }]
      }],
      generationConfig: {
        // @ts-ignore - newer experimental/model-specific config
        imageConfig: {
          aspectRatio: "1:1",
        },
      }
    });

    const response = result.response;
    
    if (response.candidates && response.candidates[0].content.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          return res.json({ imageUrl: `data:image/png;base64,${part.inlineData.data}` });
        }
      }
    }

    // If no image, return a fallback logic or error
    res.json({ imageUrl: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=2664&auto=format&fit=crop" });
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
