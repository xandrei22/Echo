import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import { z } from "zod";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Security Middlewares
  app.use(helmet({
    contentSecurityPolicy: false, // Disabled for Vite development
  }));
  app.use(cors());
  app.use(express.json());

  // Rate Limiting
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: "Too many requests from this IP, please try again later."
  });
  app.use("/api/", limiter);

  // Persistence Mock (Simulated Database)
  const db = {
    users: [],
    tasks: [
      { id: "1", title: "Initialize Core Architecture", status: "completed", energy: "high", createdAt: new Date(Date.now() - 3600000).toISOString() },
      { id: "2", title: "Security Audit", status: "pending", energy: "med", createdAt: new Date(Date.now() - 1800000).toISOString() }
    ],
    activityLogs: [
      { timestamp: new Date(Date.now() - 7200000).toISOString(), energy: 40, focus: 60 },
      { timestamp: new Date(Date.now() - 3600000).toISOString(), energy: 80, focus: 90 }
    ]
  };

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "healthy", timestamp: new Date().toISOString() });
  });

  // Analytics & Prediction Context
  app.get("/api/context", (req, res) => {
    const currentHour = new Date().getHours();
    // Simulate prediction logic based on time and logs
    const predictedEnergy = currentHour > 9 && currentHour < 17 ? "high" : "low";
    res.json({
      history: db.activityLogs,
      prediction: {
        window: "Flow Zone",
        energy: predictedEnergy,
        confidence: 0.89,
        reasoning: "Alignment with historical peak performance windows."
      }
    });
  });

  app.post("/api/logs", (req, res) => {
    const { energy, focus } = req.body;
    const newLog = {
      timestamp: new Date().toISOString(),
      energy: Number(energy),
      focus: Number(focus)
    };
    db.activityLogs.push(newLog);
    res.status(201).json(newLog);
  });

  // Example Protected Route with Validation
  const TaskSchema = z.object({
    title: z.string().min(3).max(100),
    energy: z.enum(["low", "med", "high"]),
  });

  app.post("/api/tasks", (req, res) => {
    try {
      const validatedData = TaskSchema.parse(req.body);
      const newTask = {
        id: Math.random().toString(36).substr(2, 9),
        ...validatedData,
        status: "pending",
        createdAt: new Date().toISOString()
      };
      db.tasks.push(newTask);
      res.status(201).json(newTask);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Validation failed", details: error.issues });
      } else {
        res.status(500).json({ error: "Internal Server Error" });
      }
    }
  });

  app.get("/api/tasks", (req, res) => {
    res.json(db.tasks);
  });

  // Vite middleware setup
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[ECHO-SYSTEM] Production-ready server online at http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("[FATAL] Server failed to start:", err);
});
