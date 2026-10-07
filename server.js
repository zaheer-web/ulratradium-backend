import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import connectDB from "./config/db.js";
import contactRoutes from "./routes/contactRoutes.js";

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
// SERVER
// ==========================================
const PORT = process.env.PORT || 5061;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});