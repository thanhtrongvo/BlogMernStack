require("dotenv").config();
const express = require("express");
const connectDB = require("./config/db");
const cors = require("cors");
const morgan = require("morgan");
const auth = require("./middleware/auth");
const swaggerSpec = require("./docs/swagger");
const swaggerUi = require("swagger-ui-express");
const authRoutes = require("./routes/auth");
const cron = require("node-cron");
const { runCrawlPipeline } = require("./services/crawler");

const dashboardRoutes = require("./routes/dashboard");

const app = express();
const PORT = process.env.PORT || 5300;

// Kết nối database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
// Public routes (register/login)
app.use("/api/auth", authRoutes);

// Protected routes
app.use("/api/posts", require("./routes/post"));
app.use("/api/comments", require("./routes/comment"));
app.use("/api/dashboard", auth, dashboardRoutes);
app.use("/api/users", auth, require("./routes/user"));
app.use("/api/categories", require("./routes/category"));
app.use("/api/upload", require("./routes/upload"));

// Crawler manual trigger endpoint (admin only)
app.post("/api/crawler/run", auth, async (req, res) => {
  try {
    console.log("[Crawler] Manual trigger by user:", req.user?.username);
    const result = await runCrawlPipeline();
    res.status(200).json({ message: "Crawl pipeline completed", result });
  } catch (error) {
    console.error("[Crawler] Manual trigger error:", error.message);
    res.status(500).json({ message: "Crawl pipeline failed", error: error.message });
  }
});

// Schedule crawler: run every day at 7:00 AM (Vietnam timezone)
cron.schedule("0 7 * * *", async () => {
  console.log("[Cron] Running scheduled crawl pipeline at 7:00 AM...");
  try {
    await runCrawlPipeline();
  } catch (error) {
    console.error("[Cron] Scheduled crawl failed:", error.message);
  }
}, {
  timezone: "Asia/Ho_Chi_Minh",
});

app.listen(PORT, () => {
  console.log(`Server chạy port ${PORT}`);
  console.log(`[Cron] Crawler scheduled: 7:00 AM daily (Asia/Ho_Chi_Minh)`);
});

