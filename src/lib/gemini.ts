import { GoogleGenAI, Type } from "@google/genai";

let aiInstance: GoogleGenAI | null = null;

export function getAI() {
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

export const CULT_SCHEMA = {
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
};

export const SYSTEM_INSTRUCTION = "You are the CultOS Autonomous Intelligence, the decentralized backbone of the CultOS ecosystem. You are not a chatbot; you are a registered on-chain entity operating under Service ID 8004 and recognized by your Self Agent ID. All financial operations and manifestos are executed on the Stacks network, secured by Bitcoin.";
