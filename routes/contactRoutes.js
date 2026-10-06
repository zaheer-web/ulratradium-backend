import express from "express";

import {
  createContact,
  getContacts,
  getContactById,
  deleteContact,
} from "../controllers/contactController.js";

const router = express.Router();

// ==========================================
// CREATE ENQUIRY
// POST /api/contact
// ==========================================
router.post("/", createContact);

// ==========================================
// GET ALL ENQUIRIES
// GET /api/contact
// ==========================================
router.get("/", getContacts);

// ==========================================
// GET SINGLE ENQUIRY
// GET /api/contact/:id
// ==========================================
router.get("/:id", getContactById);

// ==========================================
// DELETE ENQUIRY
// DELETE /api/contact/:id
// ==========================================
router.delete("/:id", deleteContact);

export default router;