import { GoogleGenAI, Type } from "@google/genai";
import 'dotenv/config';

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
    console.error("No API key");
    process.exit(1);
}
const ai = new GoogleGenAI({ apiKey });

async function test() {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: "Generate a detailed crypto cult coin identity.",
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
    console.log("Success:", !!response.text);
  } catch (err) {
    console.error("Gemini Error:", err);
  }
}
test();
