import crypto from "crypto";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

import Admin from "../models/Admin.js";

// ==========================================
// CREATE JWT
// ==========================================
const createToken = (admin) => {
  return jwt.sign(
    {
      id: admin._id.toString(),
      email: admin.email,
      tokenVersion: admin.tokenVersion || 0,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d",
    }
  );
};

// ==========================================
// SET AUTH COOKIE
// ==========================================
const setAuthCookie = (res, token) => {
  res.cookie("admin_token", token, {
    httpOnly: true,

    secure:
      process.env.NODE_ENV === "production",

    sameSite: "lax",

    maxAge:
      7 * 24 * 60 * 60 * 1000,
  });
};

// ==========================================
// CLEAR AUTH COOKIE
// ==========================================
const clearAuthCookie = (res) => {
  res.clearCookie("admin_token", {
    httpOnly: true,

    secure:
      process.env.NODE_ENV === "production",

    sameSite: "lax",
  });
};

// ==========================================
// CREATE RANDOM TOKEN
// ==========================================
const createRandomToken = () => {
  return crypto
    .randomBytes(32)
    .toString("hex");
};

// ==========================================
// HASH RANDOM TOKEN
// ==========================================
const hashToken = (token) => {
  return crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");
};

// ==========================================
// ADMIN LOGIN
// POST /api/auth/login
// ==========================================
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // --------------------------------------
    // VALIDATION
    // --------------------------------------
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message:
          "Email and password are required.",
      });
    }

    const normalizedEmail = email
      .trim()
      .toLowerCase();

    // --------------------------------------
    // FIND ADMIN
    // --------------------------------------
    const admin = await Admin.findOne({
      email: normalizedEmail,
    });

    if (!admin) {
      return res.status(401).json({
        success: false,
        message:
          "Invalid email or password.",
      });
    }

    // --------------------------------------
    // ACTIVE CHECK
    // --------------------------------------
    if (!admin.isActive) {
      return res.status(403).json({
        success: false,
        message:
          "Admin account is disabled.",
      });
    }

    // --------------------------------------
    // PASSWORD CHECK
    // --------------------------------------
    if (!admin.passwordHash) {
      return res.status(500).json({
        success: false,
        message:
          "Admin password is not configured.",
      });
    }

    const passwordMatched =
      await bcrypt.compare(
        password,
        admin.passwordHash
      );

    if (!passwordMatched) {
      return res.status(401).json({
        success: false,
        message:
          "Invalid email or password.",
      });
    }

    // --------------------------------------
    // CREATE TOKEN
    // --------------------------------------
    const token = createToken(admin);

    // --------------------------------------
    // COOKIE
    // --------------------------------------
    setAuthCookie(res, token);

    // --------------------------------------
    // RESPONSE
    // --------------------------------------
    return res.json({
      success: true,
      message: "Login successful.",

      admin: {
        id: admin._id,
        email: admin.email,
        name: admin.name || "",
      },
    });
  } catch (error) {
    console.error(
      "Admin login error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Login failed. Please try again.",
    });
  }
};

// ==========================================
// GET CURRENT ADMIN
// GET /api/auth/me
// ==========================================
export const getCurrentAdmin = async (
  req,
  res
) => {
  try {
    const token =
      req.cookies.admin_token;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated.",
      });
    }

    // --------------------------------------
    // VERIFY JWT
    // --------------------------------------
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    // --------------------------------------
    // FIND ADMIN
    // --------------------------------------
    const admin =
      await Admin.findById(decoded.id).select(
        "-passwordHash -passwordResetTokenHash -emailChangeTokenHash -__v"
      );

    if (!admin || !admin.isActive) {
      clearAuthCookie(res);

      return res.status(401).json({
        success: false,
        message:
          "Admin not found.",
      });
    }

    // --------------------------------------
    // CHECK TOKEN VERSION
    // --------------------------------------
    if (
      typeof decoded.tokenVersion !==
        "undefined" &&
      decoded.tokenVersion !==
        (admin.tokenVersion || 0)
    ) {
      clearAuthCookie(res);

      return res.status(401).json({
        success: false,
        message:
          "Session expired. Please login again.",
      });
    }

    return res.json({
      success: true,
      admin,
    });
  } catch (error) {
    clearAuthCookie(res);

    return res.status(401).json({
      success: false,
      message:
        "Invalid or expired session.",
    });
  }
};

// ==========================================
// LOGOUT
// POST /api/auth/logout
// ==========================================
export const logout = (req, res) => {
  clearAuthCookie(res);

  return res.json({
    success: true,
    message:
      "Logged out successfully.",
  });
};

// ==========================================
// FORGOT LOGIN EMAIL
// POST /api/auth/forgot-email
// ==========================================
export const forgotEmail = async (
  req,
  res
) => {
  try {
    const { email } = req.body;

    // --------------------------------------
    // GENERIC RESPONSE
    // Prevent account enumeration
    // --------------------------------------
    const genericResponse = {
      success: true,
      message:
        "If the recovery email is registered, login email recovery instructions have been sent.",
    };

    if (!email) {
      return res.json(
        genericResponse
      );
    }

    const normalizedRecoveryEmail =
      email.trim().toLowerCase();

    // --------------------------------------
    // FIND ADMIN
    // --------------------------------------
    const admin =
      await Admin.findOne({
        recoveryEmail:
          normalizedRecoveryEmail,

        isActive: true,
      });

    if (!admin) {
      return res.json(
        genericResponse
      );
    }

    // --------------------------------------
    // SEND RECOVERY EMAIL
    // --------------------------------------
    const {
      sendLoginEmailRecovery,
    } = await import(
      "../utils/email.js"
    );

    await sendLoginEmailRecovery({
      to: admin.recoveryEmail,
      loginEmail: admin.email,
    });

    return res.json(
      genericResponse
    );
  } catch (error) {
    console.error(
      "Forgot email error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to process email recovery request.",
    });
  }
};

// ==========================================
// FORGOT PASSWORD
// POST /api/auth/forgot-password
// ==========================================
export const forgotPassword = async (
  req,
  res
) => {
  try {
    const { email } = req.body;

    // --------------------------------------
    // GENERIC RESPONSE
    // --------------------------------------
    const genericResponse = {
      success: true,
      message:
        "If an account exists with this email, a password reset link has been sent.",
    };

    if (!email) {
      return res.json(
        genericResponse
      );
    }

    const normalizedEmail =
      email.trim().toLowerCase();

    const admin =
      await Admin.findOne({
        email: normalizedEmail,
      });

    if (!admin || !admin.isActive) {
      return res.json(
        genericResponse
      );
    }

    // --------------------------------------
    // CREATE RESET TOKEN
    // --------------------------------------
    const rawToken =
      createRandomToken();

    const hashedToken =
      hashToken(rawToken);

    admin.passwordResetTokenHash =
      hashedToken;

    admin.passwordResetExpires =
      new Date(
        Date.now() +
          15 * 60 * 1000
      );

    await admin.save();

    // --------------------------------------
    // RESET URL
    // --------------------------------------
    const resetUrl =
      `${process.env.CLIENT_ORIGIN}/admin/reset-password?token=${rawToken}`;

    // --------------------------------------
    // SEND EMAIL
    // --------------------------------------
    const {
      sendPasswordResetEmail,
    } = await import(
      "../utils/email.js"
    );

    await sendPasswordResetEmail({
      to: admin.email,
      resetUrl,
    });

    return res.json(
      genericResponse
    );
  } catch (error) {
    console.error(
      "Forgot password error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to process password reset request.",
    });
  }
};

// ==========================================
// RESET PASSWORD
// POST /api/auth/reset-password
// ==========================================
export const resetPassword = async (
  req,
  res
) => {
  try {
    const {
      token,
      password,
    } = req.body;

    if (!token || !password) {
      return res.status(400).json({
        success: false,
        message:
          "Reset token and password are required.",
      });
    }

    // --------------------------------------
    // PASSWORD LENGTH
    // --------------------------------------
    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message:
          "Password must be at least 8 characters.",
      });
    }

    // --------------------------------------
    // HASH TOKEN
    // --------------------------------------
    const hashedToken =
      hashToken(token);

    // --------------------------------------
    // FIND ADMIN
    // --------------------------------------
    const admin =
      await Admin.findOne({
        passwordResetTokenHash:
          hashedToken,

        passwordResetExpires: {
          $gt: new Date(),
        },
      });

    if (!admin) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid or expired password reset link.",
      });
    }

    // --------------------------------------
    // HASH NEW PASSWORD
    // --------------------------------------
    const passwordHash =
      await bcrypt.hash(
        password,
        12
      );

    admin.passwordHash =
      passwordHash;

    // --------------------------------------
    // REMOVE RESET TOKEN
    // --------------------------------------
    admin.passwordResetTokenHash =
      undefined;

    admin.passwordResetExpires =
      undefined;

    // --------------------------------------
    // INVALIDATE OLD SESSIONS
    // --------------------------------------
    admin.tokenVersion =
      (admin.tokenVersion || 0) + 1;

    await admin.save();

    clearAuthCookie(res);

    return res.json({
      success: true,
      message:
        "Password reset successfully. Please login with your new password.",
    });
  } catch (error) {
    console.error(
      "Reset password error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to reset password.",
    });
  }
};

// ==========================================
// CHANGE PASSWORD
// POST /api/auth/change-password
// ==========================================
export const changePassword = async (
  req,
  res
) => {
  try {
    const token =
      req.cookies.admin_token;

    if (!token) {
      return res.status(401).json({
        success: false,
        message:
          "Not authenticated.",
      });
    }

    // --------------------------------------
    // VERIFY SESSION
    // --------------------------------------
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    const {
      currentPassword,
      newPassword,
    } = req.body;

    if (
      !currentPassword ||
      !newPassword
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Current password and new password are required.",
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message:
          "New password must be at least 8 characters.",
      });
    }

    // --------------------------------------
    // FIND ADMIN
    // --------------------------------------
    const admin =
      await Admin.findById(
        decoded.id
      );

    if (!admin || !admin.isActive) {
      return res.status(401).json({
        success: false,
        message:
          "Admin account not found.",
      });
    }

    // --------------------------------------
    // CHECK CURRENT PASSWORD
    // --------------------------------------
    const passwordMatched =
      await bcrypt.compare(
        currentPassword,
        admin.passwordHash
      );

    if (!passwordMatched) {
      return res.status(400).json({
        success: false,
        message:
          "Current password is incorrect.",
      });
    }

    // --------------------------------------
    // SAVE NEW PASSWORD
    // --------------------------------------
    admin.passwordHash =
      await bcrypt.hash(
        newPassword,
        12
      );

    // --------------------------------------
    // INVALIDATE SESSIONS
    // --------------------------------------
    admin.tokenVersion =
      (admin.tokenVersion || 0) + 1;

    await admin.save();

    clearAuthCookie(res);

    return res.json({
      success: true,
      message:
        "Password changed successfully. Please login again.",
    });
  } catch (error) {
    console.error(
      "Change password error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to change password.",
    });
  }
};

// ==========================================
// CHANGE EMAIL
// POST /api/auth/change-email
// ==========================================
export const changeEmail = async (
  req,
  res
) => {
  try {
    const token =
      req.cookies.admin_token;

    if (!token) {
      return res.status(401).json({
        success: false,
        message:
          "Not authenticated.",
      });
    }

    // --------------------------------------
    // VERIFY SESSION
    // --------------------------------------
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    const {
      currentPassword,
      newEmail,
    } = req.body;

    if (
      !currentPassword ||
      !newEmail
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Current password and new email are required.",
      });
    }

    const normalizedEmail =
      newEmail.trim().toLowerCase();

    // --------------------------------------
    // FIND ADMIN
    // --------------------------------------
    const admin =
      await Admin.findById(
        decoded.id
      );

    if (!admin || !admin.isActive) {
      return res.status(401).json({
        success: false,
        message:
          "Admin account not found.",
      });
    }

    // --------------------------------------
    // CHECK CURRENT PASSWORD
    // --------------------------------------
    const passwordMatched =
      await bcrypt.compare(
        currentPassword,
        admin.passwordHash
      );

    if (!passwordMatched) {
      return res.status(400).json({
        success: false,
        message:
          "Current password is incorrect.",
      });
    }

    // --------------------------------------
    // SAME EMAIL CHECK
    // --------------------------------------
    if (
      normalizedEmail ===
      admin.email
    ) {
      return res.status(400).json({
        success: false,
        message:
          "New email must be different from your current email.",
      });
    }

    // --------------------------------------
    // CHECK EXISTING EMAIL
    // --------------------------------------
    const existingAdmin =
      await Admin.findOne({
        email: normalizedEmail,

        _id: {
          $ne: admin._id,
        },
      });

    if (existingAdmin) {
      return res.status(400).json({
        success: false,
        message:
          "This email address is already in use.",
      });
    }

    // --------------------------------------
    // CREATE VERIFICATION TOKEN
    // --------------------------------------
    const rawToken =
      createRandomToken();

    const hashedToken =
      hashToken(rawToken);

    admin.pendingEmail =
      normalizedEmail;

    admin.emailChangeTokenHash =
      hashedToken;

    admin.emailChangeExpires =
      new Date(
        Date.now() +
          30 * 60 * 1000
      );

    await admin.save();

    // --------------------------------------
    // VERIFICATION URL
    // --------------------------------------
    const verifyUrl =
      `${process.env.CLIENT_ORIGIN}/admin/verify-email?token=${rawToken}`;

    // --------------------------------------
    // SEND VERIFICATION EMAIL
    // --------------------------------------
    const {
      sendEmailChangeVerification,
    } = await import(
      "../utils/email.js"
    );

    await sendEmailChangeVerification({
      to: normalizedEmail,
      verifyUrl,
    });

    return res.json({
      success: true,
      message:
        "Verification email sent to your new email address.",
    });
  } catch (error) {
    console.error(
      "Change email error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to change email.",
    });
  }
};

// ==========================================
// VERIFY EMAIL CHANGE
// POST /api/auth/verify-email-change
// ==========================================
export const verifyEmailChange = async (
  req,
  res
) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message:
          "Verification token is required.",
      });
    }

    // --------------------------------------
    // HASH TOKEN
    // --------------------------------------
    const hashedToken =
      hashToken(token);

    // --------------------------------------
    // FIND ADMIN
    // --------------------------------------
    const admin =
      await Admin.findOne({
        emailChangeTokenHash:
          hashedToken,

        emailChangeExpires: {
          $gt: new Date(),
        },
      });

    if (!admin) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid or expired email verification link.",
      });
    }

    if (!admin.pendingEmail) {
      return res.status(400).json({
        success: false,
        message:
          "No pending email change found.",
      });
    }

    // --------------------------------------
    // CHECK EMAIL AGAIN
    // --------------------------------------
    const existingAdmin =
      await Admin.findOne({
        email: admin.pendingEmail,

        _id: {
          $ne: admin._id,
        },
      });

    if (existingAdmin) {
      return res.status(400).json({
        success: false,
        message:
          "This email address is already in use.",
      });
    }

    // --------------------------------------
    // UPDATE EMAIL
    // --------------------------------------
    admin.email =
      admin.pendingEmail;

    admin.pendingEmail =
      undefined;

    admin.emailChangeTokenHash =
      undefined;

    admin.emailChangeExpires =
      undefined;

    // --------------------------------------
    // INVALIDATE OLD SESSION
    // --------------------------------------
    admin.tokenVersion =
      (admin.tokenVersion || 0) + 1;

    await admin.save();

    clearAuthCookie(res);

    return res.json({
      success: true,
      message:
        "Email address changed successfully. Please login again with your new email.",
    });
  } catch (error) {
    console.error(
      "Verify email change error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to verify email change.",
    });
  }
};