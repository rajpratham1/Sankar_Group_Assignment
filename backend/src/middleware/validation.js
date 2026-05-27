const { body, param, validationResult } = require("express-validator");

// ─── HANDLE VALIDATION ERRORS ─────────────────────────────────────────────────
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errors.array().map((e) => ({ field: e.path, message: e.msg })),
    });
  }
  next();
};

// ─── CREATE LEAD VALIDATION ───────────────────────────────────────────────────
const validateCreateLead = [
  body("name")
    .trim()
    .notEmpty().withMessage("Name is required")
    .isLength({ min: 2, max: 100 }).withMessage("Name must be between 2 and 100 characters")
    .matches(/^[a-zA-Z\s'-]+$/).withMessage("Name can only contain letters, spaces, hyphens, and apostrophes"),

  body("phone")
    .trim()
    .notEmpty().withMessage("Phone number is required")
    .matches(/^[+]?[\d\s\-().]{7,20}$/).withMessage("Please enter a valid phone number"),

  body("source")
    .notEmpty().withMessage("Source is required")
    .isIn(["Call", "WhatsApp", "Field"]).withMessage("Source must be Call, WhatsApp, or Field"),

  body("notes")
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 500 }).withMessage("Notes cannot exceed 500 characters"),

  handleValidationErrors,
];

// ─── UPDATE STATUS VALIDATION ─────────────────────────────────────────────────
const validateUpdateStatus = [
  param("id")
    .isInt({ min: 1 }).withMessage("Invalid lead ID"),

  body("status")
    .notEmpty().withMessage("Status is required")
    .isIn(["New", "Interested", "Not Interested", "Converted"])
    .withMessage("Status must be New, Interested, Not Interested, or Converted"),

  body("notes")
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 500 }).withMessage("Notes cannot exceed 500 characters"),

  handleValidationErrors,
];

// ─── ID PARAM VALIDATION ──────────────────────────────────────────────────────
const validateId = [
  param("id").isInt({ min: 1 }).withMessage("Invalid lead ID"),
  handleValidationErrors,
];

module.exports = { validateCreateLead, validateUpdateStatus, validateId };
