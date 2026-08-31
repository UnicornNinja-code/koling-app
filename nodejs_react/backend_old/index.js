import http from "http";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import compression from "compression";

import { pool, env, redisClient } from "./src/config/index.js";
import authRoutes from "./src/routes/authRoutes.js";
import userRoutes from "./src/routes/userRoutes.js";
import poiCategoryRoutes from "./src/routes/poiCategoryRoutes.js";
import poiRoutes from "./src/routes/poiRoutes.js";
import roadRoutes from "./src/routes/roadRoutes.js";
import weatherRoutes from "./src/routes/weatherRoutes.js";
import competitorRoutes from "./src/routes/competitorRoutes.js";
import dssRoutes from "./src/routes/dssRoutes.js";
import distributionRoutes from "./src/routes/distributionRoutes.js";
import armadaRoutes from "./src/routes/armadaRoutes.js";
import riderOperationalRoutes from "./src/routes/riderOperationalRoutes.js";
import auditRoutes from "./src/routes/auditRoutes.js";
import cronRoutes from "./src/routes/cronRoutes.js";
import lbsRoutes from "./src/routes/lbsRoutes.js";
import zoneRoutes from "./src/routes/zoneRoutes.js";
import candidateSellingLocationRoutes from "./src/routes/candidateSellingLocationRoutes.js";
import systemSettingRoutes from "./src/routes/systemSettingRoutes.js";
import productRoutes from "./src/routes/productRoutes.js";
import salesRoutes from "./src/routes/salesRoutes.js";
import dashboardRoutes from "./src/routes/dashboardRoutes.js";

// Initialize BullMQ Background Workers
import "./src/workers/overpassWorker.js";
import "./src/workers/armadaHoldWorker.js";
import "./src/workers/notificationWorker.js";

// Initialize Socket.io Real-Time & LBS Handlers
import { socketManager } from "./src/socket/socketManager.js";
import { registerLbsSocketHandlers } from "./src/socket/lbsHandler.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import cors from "cors";
import cookieParser from "cookie-parser";
import { apiLimiter } from "./src/middlewares/rateLimiterMiddleware.js";

const app = express();
const server = http.createServer(app);

// 0. Enable CORS Middleware (Cross-Origin Resource Sharing for Front-End Vite Dev Server)
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      const allowedOrigins = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://localhost:9000",
        "http://localhost:5000",
      ];
      if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === "development") {
        return callback(null, true);
      }
      return callback(new Error("Blocked by CORS policy"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"],
  })
);

// Initialize Socket.io Server & Handlers
const io = socketManager.init(server);
registerLbsSocketHandlers(io);

// 1. Level-9 HTTP Payload Compression (Gzip/Brotli for GeoJSON optimization)
app.use(
  compression({
    level: 9,
    threshold: 512,
    filter: (req, res) => {
      if (req.headers["x-no-compression"]) return false;
      return compression.filter(req, res);
    },
  })
);

// 2. Global Distributed Rate Limiter for API Endpoints
app.use("/api", apiLimiter);

// 2. Cookie Parser (Read refresh token from HTTP-Only cookie)
app.use(cookieParser());

// 3. Express JSON Body Parser
app.use(express.json());

// 3. Static GeoJSON File Serving with Cache-Control Header
app.use(
  "/data-map",
  express.static(path.join(__dirname, "public"), {
    maxAge: "1d",
    setHeaders: (res) => {
      res.setHeader("Cache-Control", "public, max-age=86400");
    },
  })
);

// 4. Register Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/poi-categories", poiCategoryRoutes);
app.use("/api/pois", poiRoutes);
app.use("/api/roads", roadRoutes);
app.use("/api/weathers", weatherRoutes);
app.use("/api/competitors", competitorRoutes);
app.use("/api/dss", dssRoutes);
app.use("/api/distribution", distributionRoutes);
app.use("/api/armadas", armadaRoutes);
app.use("/api/fleets", armadaRoutes);
app.use("/api/rider", riderOperationalRoutes);
app.use("/api/audit-logs", auditRoutes);
app.use("/api/cron-management", cronRoutes);
app.use("/api/lbs", lbsRoutes);
app.use("/api/zones", zoneRoutes);
app.use("/api/candidate-selling-locations", candidateSellingLocationRoutes);
app.use("/api/system-settings", systemSettingRoutes);
app.use("/api/products", productRoutes);
app.use("/api/sales", salesRoutes);
app.use("/api/dashboard", dashboardRoutes);

// Global Centralized Error Handling Middleware
app.use((err, req, res, next) => {
  console.error("💥 Global Server Error:", err);
  const statusCode = err.statusCode || err.status || 500;
  return res.status(statusCode).json({
    status: "error",
    statusCode,
    code: err.code || undefined,
    msg: err.message || "Internal Server Error",
    details: err.details || undefined,
  });
});

async function startServer() {
  try {
    // Check Database connection
    await pool.query("SELECT 1");
    console.log("🐘 PostgreSQL & PostGIS Terhubung!");

    // Start Express HTTP + WebSockets Server
    server.listen(env.PORT, () => {
      console.log(`🚀 HTTP & Socket.io Real-Time Server running on http://localhost:${env.PORT} [${env.NODE_ENV}]`);
    });
  } catch (error) {
    console.error("❌ Gagal menyalakan server:", error.message);
    process.exit(1);
  }
}

export { app, server, startServer };

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  startServer();
}
