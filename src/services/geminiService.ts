import { GoogleGenAI, Type } from "@google/genai";

let aiInstance: GoogleGenAI | null = null;
function getAI() {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("GEMINI_API_KEY missing");
      return null;
    }
    aiInstance = new GoogleGenAI({ apiKey });
  }
  return aiInstance;
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
  bitcoinAlignment: number;
  rank: string;
}

export async function generateCultInfo(prompt?: string): Promise<CultInfo> {
  const ai = getAI();
  if (!ai) throw new Error("AI synthesis core unavailable.");
  const customContext = prompt ? `The user wants a cult centered around: ${prompt}` : "Generate a random absurd internet cult.";

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Generate a detailed, absurd, viral, internet-style crypto cult coin identity.
    ${customContext}
    
    The response must include:
    - A catchy name (e.g. MoonChurch, BreadChain)
    - A token symbol (3-5 letters)
    - A short slogan
    - A "Meme Manifesto" (1-2 sentences of absurd philosophy)
    - Lore (the backstory of the cult)
    - A 3-step ridiculous roadmap
    - Risk level (LOW, DEGEN, or ABSOLUTE CHAOS)
    - Degen score (0-100)
    - Market sentiment (e.g. "Hyper-bullish", "Schizo-bullish", "Paranoid")
    - Viral score (0-100)
    - Chaos level (0-100)
    - Bitcoin alignment level (0-100)
    - A cult rank (e.g. "Neophyte", "High Oracle", "Degenerate Prophet")`,
    config: {
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
          bitcoinAlignment: { type: Type.NUMBER },
          rank: { type: Type.STRING },
        },
        required: ["name", "symbol", "slogan", "manifesto", "lore", "roadmap", "riskLevel", "degenScore", "marketSentiment", "viralScore", "chaosLevel", "bitcoinAlignment", "rank"]
      }
    }
  });

  return JSON.parse(response.text);
}

export async function generateCultLogo(name: string, slogan: string): Promise<string> {
  const ai = getAI();
  if (!ai) throw new Error("Visual synthesis core unavailable.");
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
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
        aspectRatio: "1:1"
      },
    },
  });

  for (const part of response.candidates[0].content.parts) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }

  throw new Error("No image data returned from Gemini");
}
