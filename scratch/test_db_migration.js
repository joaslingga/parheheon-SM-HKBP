const Database = require('better-sqlite3');
const path = require('path');
const db = new Database(path.resolve(__dirname, '../database.db'));

// Disable foreign key constraint check for mock insertion
db.pragma('foreign_keys = OFF');

try {
  // 1. Check SQL Schema
  const row = db.prepare("SELECT sql FROM sqlite_master WHERE type='table' AND name='voting_records'").get();
  console.log("--- SQL SCHEMA ---");
  console.log(row.sql);
  console.log("------------------");

  // 2. Perform insert test inside a transaction (rolled back at the end)
  db.transaction(() => {
    const user_id = 9999;
    const category_id = 9999;
    const now = new Date().toISOString();
    
    console.log("Inserting first vote for user 9999, category 9999...");
    db.prepare("INSERT INTO voting_records (user_id, candidate_id, category_id, created_at) VALUES (?, 1, ?, ?)")
      .run(user_id, category_id, now);
      
    console.log("Inserting second vote for user 9999, category 9999 (same category)...");
    db.prepare("INSERT INTO voting_records (user_id, candidate_id, category_id, created_at) VALUES (?, 2, ?, ?)")
      .run(user_id, category_id, now);
      
    console.log("RESULT: Multiple votes inserted successfully without UNIQUE constraint failure!");
    throw new Error("ROLLBACK_INTENDED"); // Roll back to keep the database clean
  })();
} catch (err) {
  if (err.message === "ROLLBACK_INTENDED") {
    console.log("Transaction successfully rolled back. Database remains clean.");
  } else {
    console.error("TEST FAILED:", err.message);
  }
}
