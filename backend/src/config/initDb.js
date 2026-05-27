const pool = require("./database");

const createLeadsTable = async () => {
  const baseQuery = `
    CREATE TABLE IF NOT EXISTS leads (
      id          SERIAL PRIMARY KEY,
      name        VARCHAR(100) NOT NULL,
      phone       VARCHAR(20)  NOT NULL UNIQUE,
      source      VARCHAR(20)  NOT NULL CHECK (source IN ('Call', 'WhatsApp', 'Field')),
      status      VARCHAR(20)  NOT NULL DEFAULT 'New'
                  CHECK (status IN ('New', 'Interested', 'Not Interested', 'Converted')),
      notes       TEXT,
      created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `;

  const triggerQuery = pool.isInMemoryDb
    ? ""
    : `
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;

      DROP TRIGGER IF EXISTS set_updated_at ON leads;

      CREATE TRIGGER set_updated_at
      BEFORE UPDATE ON leads
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
    `;

  try {
    await pool.query(`${baseQuery}\n${triggerQuery}`);
    console.log("Database tables initialized successfully");
  } catch (err) {
    const errorDetails = err.message || err;
    console.error("Database initialization failed:", errorDetails);
    throw err;
  }
};

module.exports = { createLeadsTable };
