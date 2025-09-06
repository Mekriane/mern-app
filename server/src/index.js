import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// --- Middlewares
app.use(cors());                 // en prod, tu peux restreindre: cors({ origin: "https://ton-domaine" })
app.use(express.json());

// --- Connexion MongoDB
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/mern";
mongoose.connection.on("connected", () => console.log("✅ MongoDB connecté"));
mongoose.connection.on("error", (err) => console.error("❌ MongoDB erreur:", err.message));

async function connectDB() {
  try {
    await mongoose.connect(MONGO_URI);
  } catch (err) {
    console.error("❌ Échec de connexion MongoDB:", err.message);
    // on ne sort pas du process en dev, mais en prod tu peux faire: process.exit(1);
  }
}

// --- Routes API
app.get("/api/health", (_, res) => res.json({ ok: true, ts: Date.now() }));
app.get("/api/dbping", (_, res) => {
  // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
  res.json({ readyState: mongoose.connection.readyState });
});

// --- Serveur frontend (prod uniquement)
if (process.env.NODE_ENV === "production") {
  const clientBuild = path.join(__dirname, "..", "..", "client", "build");
  app.use(express.static(clientBuild));

  // Catch-all SPA APRES les routes API
  app.get("*", (req, res) => {
    res.sendFile(path.join(clientBuild, "index.html"));
  });
}

// --- Démarrage serveur
const port = process.env.PORT || 8080;

async function start() {
  await connectDB();
  app.listen(port, () => console.log(`🚀 Server sur http://localhost:${port} (env: ${process.env.NODE_ENV || "development"})`));
}

start();

// --- Arrêt propre
function shutdown(signal) {
  console.log(`\n${signal} reçu: arrêt...`);
  mongoose.connection.close(false, () => {
    console.log("🛑 Connexion MongoDB fermée");
    process.exit(0);
  });
}
process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
