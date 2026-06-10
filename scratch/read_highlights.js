const Database = require('better-sqlite3');
const path = require('path');

async function test() {
  console.log("=== SQLite Highlights ===");
  try {
    const dbPath = path.resolve(__dirname, '../database.db');
    const db = new Database(dbPath);
    const highlights = db.prepare("SELECT * FROM highlights").all();
    console.log(highlights);
  } catch (err) {
    console.error("SQLite error:", err.message);
  }

  console.log("\n=== MS SQL Highlights ===");
  try {
    const sql = require('mssql');
    const config = {
      user: process.env.DB_USER || 'sa',
      password: process.env.DB_PASSWORD || 'YourStrongPassword123',
      server: process.env.DB_SERVER || 'localhost',
      database: process.env.DB_NAME || 'parheheon_db',
      port: parseInt(process.env.DB_PORT || '1433', 10),
      options: {
        encrypt: true,
        trustServerCertificate: true,
      }
    };
    const pool = await sql.connect(config);
    const result = await pool.request().query("SELECT * FROM highlights");
    console.log(result.recordset);
    await pool.close();
  } catch (err) {
    console.error("MS SQL error:", err.message);
  }
}

test();
