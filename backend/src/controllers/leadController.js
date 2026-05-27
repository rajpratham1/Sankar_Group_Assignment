const pool = require("../config/database");

const getAllLeads = async (req, res) => {
  try {
    const { search, status, source, sort = "created_at", order = "DESC" } = req.query;

    const allowedSortFields = ["name", "created_at", "updated_at", "status", "source"];
    const allowedOrders = ["ASC", "DESC"];
    const sortField = allowedSortFields.includes(sort) ? sort : "created_at";
    const sortOrder = allowedOrders.includes(order.toUpperCase()) ? order.toUpperCase() : "DESC";

    const conditions = [];
    const values = [];
    let paramIndex = 1;

    if (search) {
      conditions.push(`(LOWER(name) LIKE $${paramIndex} OR phone LIKE $${paramIndex + 1})`);
      values.push(`%${search.toLowerCase()}%`, `%${search}%`);
      paramIndex += 2;
    }

    if (status) {
      conditions.push(`status = $${paramIndex}`);
      values.push(status);
      paramIndex += 1;
    }

    if (source) {
      conditions.push(`source = $${paramIndex}`);
      values.push(source);
      paramIndex += 1;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
    const query = `
      SELECT id, name, phone, source, status, notes, created_at, updated_at
      FROM leads
      ${whereClause}
      ORDER BY ${sortField} ${sortOrder}
    `;

    const result = await pool.query(query, values);

    res.status(200).json({
      success: true,
      count: result.rows.length,
      data: result.rows,
    });
  } catch (err) {
    console.error("getAllLeads error:", err.message);
    res.status(500).json({ success: false, message: "Server error while fetching leads" });
  }
};

const getLeadById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query("SELECT * FROM leads WHERE id = $1", [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Lead not found" });
    }

    res.status(200).json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error("getLeadById error:", err.message);
    res.status(500).json({ success: false, message: "Server error while fetching lead" });
  }
};

const createLead = async (req, res) => {
  try {
    const { name, phone, source, notes } = req.body;

    const existing = await pool.query("SELECT id FROM leads WHERE phone = $1", [phone]);
    if (existing.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: "A lead with this phone number already exists",
      });
    }

    const result = await pool.query(
      `INSERT INTO leads (name, phone, source, notes)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [name.trim(), phone.trim(), source, notes?.trim() || null]
    );

    res.status(201).json({
      success: true,
      message: "Lead created successfully",
      data: result.rows[0],
    });
  } catch (err) {
    console.error("createLead error:", err.message);
    if (err.code === "23505") {
      return res.status(409).json({
        success: false,
        message: "A lead with this phone number already exists",
      });
    }

    res.status(500).json({ success: false, message: "Server error while creating lead" });
  }
};

const updateLeadStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    const lead = await pool.query("SELECT id FROM leads WHERE id = $1", [id]);
    if (lead.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Lead not found" });
    }

    const fields = ["status = $1", "updated_at = NOW()"];
    const values = [status];
    let paramIndex = 2;

    if (notes !== undefined) {
      fields.push(`notes = $${paramIndex}`);
      values.push(notes?.trim() || null);
      paramIndex += 1;
    }

    values.push(id);

    const result = await pool.query(
      `UPDATE leads SET ${fields.join(", ")} WHERE id = $${paramIndex} RETURNING *`,
      values
    );

    res.status(200).json({
      success: true,
      message: "Lead status updated successfully",
      data: result.rows[0],
    });
  } catch (err) {
    console.error("updateLeadStatus error:", err.message);
    res.status(500).json({ success: false, message: "Server error while updating lead" });
  }
};

const deleteLead = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query("DELETE FROM leads WHERE id = $1 RETURNING id, name", [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Lead not found" });
    }

    res.status(200).json({
      success: true,
      message: `Lead "${result.rows[0].name}" deleted successfully`,
    });
  } catch (err) {
    console.error("deleteLead error:", err.message);
    res.status(500).json({ success: false, message: "Server error while deleting lead" });
  }
};

const getDashboardStats = async (req, res) => {
  try {
    const statsQuery = `
      SELECT
        COUNT(*) AS total,
        COALESCE(SUM(CASE WHEN status = 'New' THEN 1 ELSE 0 END), 0) AS new_leads,
        COALESCE(SUM(CASE WHEN status = 'Interested' THEN 1 ELSE 0 END), 0) AS interested,
        COALESCE(SUM(CASE WHEN status = 'Not Interested' THEN 1 ELSE 0 END), 0) AS not_interested,
        COALESCE(SUM(CASE WHEN status = 'Converted' THEN 1 ELSE 0 END), 0) AS converted,
        COALESCE(SUM(CASE WHEN source = 'Call' THEN 1 ELSE 0 END), 0) AS from_call,
        COALESCE(SUM(CASE WHEN source = 'WhatsApp' THEN 1 ELSE 0 END), 0) AS from_whatsapp,
        COALESCE(SUM(CASE WHEN source = 'Field' THEN 1 ELSE 0 END), 0) AS from_field
      FROM leads
    `;

    const recentQuery = `
      SELECT id, name, phone, source, status, created_at
      FROM leads
      ORDER BY created_at DESC
      LIMIT 5
    `;

    const [stats, recent] = await Promise.all([
      pool.query(statsQuery),
      pool.query(recentQuery),
    ]);

    res.status(200).json({
      success: true,
      data: {
        stats: stats.rows[0],
        recentLeads: recent.rows,
      },
    });
  } catch (err) {
    console.error("getDashboardStats error:", err.message);
    res.status(500).json({ success: false, message: "Server error while fetching stats" });
  }
};

module.exports = {
  getAllLeads,
  getLeadById,
  createLead,
  updateLeadStatus,
  deleteLead,
  getDashboardStats,
};
