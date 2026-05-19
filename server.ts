import "dotenv/config";
import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { put } from "@vercel/blob";
import multer from "multer";

const upload = multer({ storage: multer.memoryStorage() });

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Add API upload route
  app.post("/api/upload", upload.single("file"), async (req, res) => {
    try {
      const token = process.env.BLOB_READ_WRITE_TOKEN;
      if (!token) {
        console.error("Upload failed: BLOB_READ_WRITE_TOKEN is missing");
        return res.status(500).json({ error: "Vercel Blob token is missing. Please add BLOB_READ_WRITE_TOKEN to your secrets." });
      }

      const file = req.file;
      if (!file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const { url } = await put(file.originalname, file.buffer, {
        access: 'public',
        token: process.env.BLOB_READ_WRITE_TOKEN,
      });

      res.json({ url });
    } catch (error: any) {
      console.error("Upload error details:", error);
      const message = error?.message || "Internal server error during upload";
      res.status(500).json({ error: message });
    }
  });

  app.post("/api/delete", express.json(), async (req, res) => {
    try {
      if (!process.env.BLOB_READ_WRITE_TOKEN) {
        return res.status(500).json({ error: "Vercel Blob token (BLOB_READ_WRITE_TOKEN) is not configured." });
      }

      const { url } = req.body;
      if (!url) {
        return res.status(400).json({ error: "URL is required" });
      }
      
      const { del } = await import("@vercel/blob");
      await del(url, {
        token: process.env.BLOB_READ_WRITE_TOKEN,
      });
      
      res.json({ success: true });
    } catch (error) {
      console.error("Delete error:", error);
      res.status(500).json({ error: "Delete failed" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
