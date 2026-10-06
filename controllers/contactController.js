import Contact from "../models/Contact.js";

// ==========================================
// CREATE CONTACT ENQUIRY
// ==========================================
export const createContact = async (req, res) => {
  try {
    const {
      name,
      company,
      phone,
      email,
      category,
      message,
    } = req.body;

    // Required fields validation
    if (
      !name ||
      !phone ||
      !email ||
      !category ||
      !message
    ) {
      return res.status(400).json({
        success: false,
        message: "Please fill all required fields.",
      });
    }

    // Create enquiry
    const contact = await Contact.create({
      name: name.trim(),
      company: company?.trim() || "",
      phone: phone.trim(),
      email: email.trim().toLowerCase(),
      category: category.trim(),
      message: message.trim(),
    });

    return res.status(201).json({
      success: true,
      message:
        "Your enquiry has been submitted successfully.",
      data: contact,
    });
  } catch (error) {
    console.error(
      "Create contact error:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message:
        "Something went wrong while submitting your enquiry.",
    });
  }
};

// ==========================================
// GET ALL CONTACT ENQUIRIES
// ==========================================
export const getContacts = async (req, res) => {
  try {
    const contacts = await Contact.find().sort({
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      count: contacts.length,
      data: contacts,
    });
  } catch (error) {
    console.error(
      "Get contacts error:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch enquiries.",
    });
  }
};

// ==========================================
// GET SINGLE CONTACT ENQUIRY
// ==========================================
export const getContactById = async (req, res) => {
  try {
    const contact = await Contact.findById(
      req.params.id
    );

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: "Enquiry not found.",
      });
    }

    return res.status(200).json({
      success: true,
      data: contact,
    });
  } catch (error) {
    console.error(
      "Get contact error:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch enquiry.",
    });
  }
};

// ==========================================
// DELETE CONTACT ENQUIRY
// ==========================================
export const deleteContact = async (req, res) => {
  try {
    const contact = await Contact.findByIdAndDelete(
      req.params.id
    );

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: "Enquiry not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Enquiry deleted successfully.",
    });
  } catch (error) {
    console.error(
      "Delete contact error:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message: "Failed to delete enquiry.",
    });
  }
};