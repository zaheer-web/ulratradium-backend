import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

import connectDB from "./config/db.js";
import contactRoutes from "./routes/contactRoutes.js";
import authRoutes from "./routes/authRoutes.js";

dotenv.config();

const app = express();

// ==========================================
// DATABASE
// ==========================================
connectDB();

// ==========================================
// MIDDLEWARE
// ==========================================
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

app.use(express.json());

app.use(cookieParser());

// ==========================================
// ROOT
// ==========================================
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Ultradium Trading API is running",
  });
});

// ==========================================
// CONTACT
// ==========================================
app.use("/api/contact", contactRoutes);

// ==========================================
// AUTH
// ==========================================
app.use("/api/auth", authRoutes);

// ==========================================
// SERVER
// ==========================================
const PORT = process.env.PORT || 5061;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});