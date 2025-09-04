import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import healthRouter from "./routes/health.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

// Connexion MongoDB (via .env)
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/mern";
mongoose
  .connect(MONGO_URI)
  .then(() => console.log("✅ MongoDB connecté"))
  .catch((err) => console.error("❌ MongoDB erreur:", err.message));

// Routes API
app.use("/api/health", healthRouter);

// En prod, servir le build React
const clientBuild = path.join(__dirname, "..", "..", "client", "build");
app.use(express.static(clientBuild));
app.get("*", (req, res) => {
  res.sendFile(path.join(clientBuild, "index.html"));
});

// Port (Azure fixe process.env.PORT)
const port = process.env.PORT || 8080;
app.listen(port, () => console.log(`🚀 Server sur http://localhost:${port}`));
