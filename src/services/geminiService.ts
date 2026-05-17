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
  const response = await fetch("/api/generate-cult", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to generate cult info");
  }

  return response.json();
}

export async function generateCultLogo(name: string, slogan: string): Promise<string> {
  const response = await fetch("/api/generate-logo", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, slogan }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to generate logo");
  }

  const data = await response.json();
  return data.imageUrl || "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=2664&auto=format&fit=crop"; // Fallback
}
