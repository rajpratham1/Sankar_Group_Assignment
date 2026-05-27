const express = require("express");
const router = express.Router();

const {
  getAllLeads,
  getLeadById,
  createLead,
  updateLeadStatus,
  deleteLead,
  getDashboardStats,
} = require("../controllers/leadController");

const {
  validateCreateLead,
  validateUpdateStatus,
  validateId,
} = require("../middleware/validation");

// Dashboard stats
router.get("/stats", getDashboardStats);

// Lead CRUD
router.get("/", getAllLeads);
router.get("/:id", validateId, getLeadById);
router.post("/", validateCreateLead, createLead);
router.patch("/:id/status", validateUpdateStatus, updateLeadStatus);
router.delete("/:id", validateId, deleteLead);

module.exports = router;
