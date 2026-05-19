import { del } from "@vercel/blob";

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const token = (process.env.BLOB_READ_WRITE_TOKEN || "").trim().replace(/^["']|["']$/g, '');
    if (!token) {
      return res.status(500).json({ error: "BLOB_READ_WRITE_TOKEN is not configured." });
    }

    const { url } = req.body;
    if (!url) {
      return res.status(400).json({ error: "URL is required" });
    }
    
    await del(url, {
      token: token,
    });
    
    return res.status(200).json({ success: true });
  } catch (error: any) {
    console.error("Delete error:", error);
    return res.status(500).json({ error: "Delete failed" });
  }
}
