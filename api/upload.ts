import { put } from "@vercel/blob";
import multer from "multer";

const upload = multer({ storage: multer.memoryStorage() });

// Helper to run middleware for Vercel Serverless Functions
function runMiddleware(req: any, res: any, fn: any) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result: any) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });
}

// Disable body parsing for Multer to work on Vercel
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: any, res: any) {
  // Add CORS headers for production
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Process the file upload
    await runMiddleware(req, res, upload.single('file'));
    
    // Clean and validate the token
    const token = (process.env.BLOB_READ_WRITE_TOKEN || "").trim().replace(/^["']|["']$/g, '');
    if (!token) {
      return res.status(500).json({ error: "BLOB_READ_WRITE_TOKEN is missing in Vercel environment variables." });
    }

    const file = (req as any).file;
    if (!file) {
      return res.status(400).json({ error: "No file uploaded in the request." });
    }

    const filename = `${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    
    const blob = await put(filename, file.buffer, {
      access: 'public',
      token: token,
    });

    return res.status(200).json({ url: blob.url });
  } catch (error: any) {
    console.error("Vercel Blob Upload Error:", error);
    return res.status(500).json({ error: error?.message || "Internal server error during upload" });
  }
}
