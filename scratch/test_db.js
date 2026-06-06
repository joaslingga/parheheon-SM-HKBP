const Database = require('better-sqlite3');
const path = require('path');
const dbPath = path.resolve(__dirname, '../database.db');
const db = new Database(dbPath);
const user = db.prepare("SELECT * FROM users WHERE username = ?").get('admin');
console.log('User admin:', user);
const users = db.prepare("SELECT * FROM users").all();
console.log('All users:', users);
