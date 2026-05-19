import express from "express";
import { put, del } from "@vercel/blob";
import multer from "multer";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Health check endpoint
router.get("/health", (req, res) => {
  res.json({ status: "ok", mode: process.env.NODE_ENV });
});

// Add API upload route
router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    const token = (process.env.BLOB_READ_WRITE_TOKEN || "").trim().replace(/^["']|["']$/g, '');
    
    if (!token) {
      return res.status(500).json({ error: "BLOB_READ_WRITE_TOKEN is missing. Please add it to your environment variables." });
    }

    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: "No file uploaded." });
    }

    const filename = `${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    
    const blob = await put(filename, file.buffer, {
      access: 'public',
      token: token,
    });

    res.json({ url: blob.url });
  } catch (error: any) {
    console.error("Vercel Blob Upload Error:", error);
    res.status(500).json({ error: error?.message || "Internal server error during upload" });
  }
});

router.post("/delete", express.json(), async (req, res) => {
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
    
    res.json({ success: true });
  } catch (error) {
    console.error("Delete error:", error);
    res.status(500).json({ error: "Delete failed" });
  }
});

export default router;
