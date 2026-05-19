import express from "express";
import cors from "cors";
import apiRouter from "../src/api-handler.ts";

const app = express();

app.use(cors());

// Vercel functions handle the /api prefix based on the filename or vercel.json
// If we route /api/* to this file, we handle the nesting here.
app.use("/api", apiRouter);

export default app;
