const { Pool } = require("pg");
const { newDb } = require("pg-mem");
require("dotenv").config();

const useInMemoryDb = process.env.USE_IN_MEMORY_DB === "true";

let pool;

if (useInMemoryDb) {
  const db = newDb();
  const adapter = db.adapters.createPg();
  pool = new adapter.Pool();
  console.log("Using in-memory PostgreSQL-compatible database");
} else if (process.env.DATABASE_URL) {
  const connectionString = process.env.DATABASE_URL;
  const isLocalhost = connectionString.includes("localhost") || connectionString.includes("127.0.0.1");
  pool = new Pool({
    connectionString,
    ssl: isLocalhost ? false : { rejectUnauthorized: false },
  });
  console.log("Using database connection string (DATABASE_URL)");
} else {
  pool = new Pool({
    host: process.env.DB_HOST || "localhost",
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || "lead_management",
    user: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD || "password",
  });
}

if (typeof pool.on === "function") {
  pool.on("connect", () => {
    const label = useInMemoryDb ? "in-memory database" : "PostgreSQL database";
    console.log(`Connected to ${label}`);
  });

  pool.on("error", (err) => {
    console.error("Unexpected database error:", err);
    process.exit(-1);
  });
}

pool.isInMemoryDb = useInMemoryDb;

module.exports = pool;
