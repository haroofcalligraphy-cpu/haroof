import "dotenv/config";
import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { put } from "@vercel/blob";
import multer from "multer";
import cors from "cors";

const upload = multer({ storage: multer.memoryStorage() });

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  
  // Simple request logger
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
  });

  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", env: process.env.NODE_ENV });
  });

  // Add API upload route
  app.all("/api/upload", (req, res, next) => {
    if (req.method !== "POST") {
      console.warn(`Method ${req.method} not allowed for /api/upload`);
      return res.status(405).json({ error: `Method ${req.method} not allowed. Use POST.` });
    }
    next();
  }, upload.single("file"), async (req, res) => {
    try {
      console.log("Processing upload request...");
      const token = (process.env.BLOB_READ_WRITE_TOKEN || "").trim().replace(/^["']|["']$/g, '');
      
      if (!token) {
        console.error("Upload failed: BLOB_READ_WRITE_TOKEN is missing or empty");
        return res.status(500).json({ error: "Vercel Blob token is missing. Please add BLOB_READ_WRITE_TOKEN to your secrets in AI Studio." });
      }

      const file = req.file;
      if (!file) {
        console.error("Upload failed: No file in request");
        return res.status(400).json({ error: "No file uploaded in the request. Please select an image." });
      }

      console.log(`Starting upload for file: ${file.originalname} (${file.size} bytes)`);

      const filename = `${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      
      const blob = await put(filename, file.buffer, {
        access: 'public',
        token: token,
      });

      console.log("Upload successful:", blob.url);
      res.json({ url: blob.url });
    } catch (error: any) {
      console.error("Vercel Blob Upload Error:", error);
      const message = error?.message || "Internal server error during upload to Vercel Blob";
      res.status(500).json({ error: message });
    }
  });

  app.post("/api/delete", express.json(), async (req, res) => {
    try {
      const token = (process.env.BLOB_READ_WRITE_TOKEN || "").trim().replace(/^["']|["']$/g, '');
      if (!token) {
        return res.status(500).json({ error: "Vercel Blob token (BLOB_READ_WRITE_TOKEN) is not configured." });
      }

      const { url } = req.body;
      if (!url) {
        return res.status(400).json({ error: "URL is required" });
      }
      
      const { del } = await import("@vercel/blob");
      await del(url, {
        token: token,
      });
      
      res.json({ success: true });
    } catch (error) {
      console.error("Delete error:", error);
      res.status(500).json({ error: "Delete failed" });
    }
  });

  // Global API error handler
  app.use((err: any, req: any, res: any, next: any) => {
    if (req.path.startsWith('/api')) {
      console.error("API error caught by middleware:", err);
      return res.status(err.status || 500).json({ 
        error: err.message || "Internal Server Error",
        details: err.code
      });
    }
    next(err);
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

  process.on("uncaughtException", (err) => {
    console.error("Uncaught Exception:", err);
  });

  process.on("unhandledRejection", (reason, promise) => {
    console.error("Unhandled Rejection at:", promise, "reason:", reason);
  });
}

startServer();
