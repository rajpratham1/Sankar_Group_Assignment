require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { createLeadsTable } = require("./config/initDb");
const leadRoutes = require("./routes/leadRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

const clientUrl = process.env.CLIENT_URL || "http://localhost:3000";
const allowedOrigins = [
  clientUrl,
  clientUrl.endsWith("/") ? clientUrl.slice(0, -1) : `${clientUrl}/`
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, postman)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type"],
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/leads", leadRoutes);

app.get("/api/health", (req, res) => {
  res
    .status(200)
    .json({ success: true, message: "Server is running", timestamp: new Date() });
});

app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ success: false, message: "Internal server error" });
});

const start = async () => {
  try {
    await createLeadsTable();
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
    });
  } catch (err) {
    const errorDetails = err.message || err;
    console.error("Server startup failed:", errorDetails);
    process.exit(1);
  }
};

if (require.main === module) {
  start();
} else {
  // Ensure database tables exist in serverless environment
  createLeadsTable()
    .then(() => console.log("Database table verification completed"))
    .catch((err) => console.error("Database initialization failed in serverless mode:", err));
}

module.exports = app;
