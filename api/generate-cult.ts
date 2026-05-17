import { getAI, CULT_SCHEMA, SYSTEM_INSTRUCTION } from "../src/lib/gemini.js";

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

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
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: CULT_SCHEMA
      }
    });

    const responseText = result.text;
    if (!responseText) throw new Error("No response text from AI");
    res.status(200).json(JSON.parse(responseText));
  } catch (error: any) {
    console.error("Error generating cult:", error);
    res.status(500).json({ error: error.message });
  }
}
