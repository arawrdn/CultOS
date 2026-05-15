import { GoogleGenAI, Type } from "@google/genai";

let aiInstance: GoogleGenAI | null = null;
function getAI() {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error("GEMINI_API_KEY is missing from environment");
      throw new Error("GEMINI_API_KEY is not set. If you are on Vercel, add it to Environment Variables. If in AI Studio, ensure it is in the Secrets panel.");
    }
    aiInstance = new GoogleGenAI({ apiKey });
  }
  return aiInstance;
}

// Simple retry helper
async function withRetry<T>(fn: () => Promise<T>, retries = 3, delay = 1000): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (retries <= 0) throw error;
    // Check for rate limit or transient errors
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (errorMessage.includes("429") || errorMessage.includes("500") || errorMessage.includes("503") || errorMessage.includes("quota")) {
      console.warn(`Retrying after error: ${errorMessage}. Retries left: ${retries}`);
      await new Promise(resolve => setTimeout(resolve, delay + Math.random() * 1000));
      return withRetry(fn, retries - 1, delay * 2);
    }
    throw error;
  }
}

export interface CultInfo {
  name: string;
  symbol: string;
  slogan: string;
  manifesto: string;
  lore: string;
  roadmap: string[];
  riskLevel: 'LOW' | 'DEGEN' | 'ABSOLUTE CHAOS';
  degenScore: number;
  marketSentiment: string;
  viralScore: number;
  chaosLevel: number;
  stacksAlignment: number;
  rank: string;
}

export async function generateCultInfo(prompt?: string): Promise<CultInfo> {
  const customContext = prompt ? `The user wants a cult centered around: ${prompt}` : "Generate a random absurd internet cult.";

  return withRetry(async () => {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview", 
      contents: `Generate a detailed, absurd, viral, internet-style crypto cult coin identity.
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
      - rank: A cult rank (e.g. "Neophyte", "High Oracle", "Degenerate Prophet")`,
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

    const text = response.text;
    if (!text) {
      throw new Error("No response from AI model");
    }
    return JSON.parse(text);
  });
}

export async function generateCultLogo(name: string, slogan: string): Promise<string> {
  return withRetry(async () => {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash', 
      contents: {
        parts: [
          {
            text: `Create a minimalist, flat design crypto token logo for a cult called "${name}". 
            Slogan: "${slogan}". 
            Style: modern, clean, vector-style icon, centered, solid background, high contrast, cyberpunk or esoteric aesthetic. 
            No text in the logo itself. Just a symbolic representation.`,
          },
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: "1:1",
        },
      },
    });

    if (response.candidates && response.candidates[0].content.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
    }

    throw new Error("No image data returned from Gemini");
  });
}
