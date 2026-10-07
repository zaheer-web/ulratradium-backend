import express from "express";

import {
  login,
  getCurrentAdmin,
  logout,
  forgotEmail,
  forgotPassword,
  resetPassword,
  changePassword,
  changeEmail,
  verifyEmailChange,
} from "../controllers/authController.js";

const router = express.Router();

// ==========================================
// ADMIN LOGIN
// POST /api/auth/login
// ==========================================
router.post("/login", login);

// ==========================================
// CURRENT ADMIN
// GET /api/auth/me
// ==========================================
router.get("/me", getCurrentAdmin);

// ==========================================
// ADMIN LOGOUT
// POST /api/auth/logout
// ==========================================
router.post("/logout", logout);

// ==========================================
// FORGOT LOGIN EMAIL
// POST /api/auth/forgot-email
// ==========================================
router.post("/forgot-email", forgotEmail);

// ==========================================
// FORGOT PASSWORD
// POST /api/auth/forgot-password
// ==========================================
router.post("/forgot-password", forgotPassword);

// ==========================================
// RESET PASSWORD
// POST /api/auth/reset-password
// ==========================================
router.post("/reset-password", resetPassword);

// ==========================================
// CHANGE PASSWORD
// POST /api/auth/change-password
// ==========================================
router.post("/change-password", changePassword);

// ==========================================
// CHANGE EMAIL
// POST /api/auth/change-email
// ==========================================
router.post("/change-email", changeEmail);

// ==========================================
// VERIFY EMAIL CHANGE
// POST /api/auth/verify-email-change
// ==========================================
router.post("/verify-email-change", verifyEmailChange);

export default router;