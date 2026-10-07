import mongoose from "mongoose";

const adminSchema = new mongoose.Schema(
  {
    // ==========================================
    // ADMIN LOGIN EMAIL
    // ==========================================
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    // ==========================================
    // RECOVERY EMAIL
    // ==========================================
    recoveryEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },

    // ==========================================
    // PASSWORD
    // ==========================================
    passwordHash: {
      type: String,
      required: true,
    },

    // ==========================================
    // ADMIN NAME
    // ==========================================
    name: {
      type: String,
      default: "",
      trim: true,
    },

    // ==========================================
    // ACCOUNT STATUS
    // ==========================================
    isActive: {
      type: Boolean,
      default: true,
    },

    // ==========================================
    // PASSWORD RESET
    // ==========================================
    passwordResetTokenHash: {
      type: String,
      default: undefined,
    },

    passwordResetExpires: {
      type: Date,
      default: undefined,
    },

    // ==========================================
    // EMAIL CHANGE
    // ==========================================
    pendingEmail: {
      type: String,
      default: undefined,
      lowercase: true,
      trim: true,
    },

    emailChangeTokenHash: {
      type: String,
      default: undefined,
    },

    emailChangeExpires: {
      type: Date,
      default: undefined,
    },

    // ==========================================
    // SESSION VERSION
    // ==========================================
    tokenVersion: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const Admin = mongoose.model("Admin", adminSchema);

export default Admin;