export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { name, slogan } = req.body;
    const seed = encodeURIComponent(name + slogan);
    const imageUrl = `https://api.dicebear.com/7.x/shapes/svg?seed=${seed}&backgroundColor=050505`;
    
    res.status(200).json({ imageUrl });
  } catch (error: any) {
    console.error("Error generating logo:", error);
    res.status(500).json({ error: error.message });
  }
}
