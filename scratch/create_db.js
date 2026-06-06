const sql = require('mssql');

const config = {
  user: 'sa',
  password: 'YourStrongPassword123',
  server: 'localhost',
  database: 'master', // Connect to master database first
  port: 1433,
  options: {
    encrypt: true,
    trustServerCertificate: true
  }
};

async function createDb() {
  console.log("Connecting to MS SQL Server at localhost:1433 as 'sa'...");
  let pool;
  try {
    pool = await sql.connect(config);
    console.log("Connected successfully. Checking if database 'parheheon_db' exists...");
    
    const result = await pool.request()
      .input('dbname', 'parheheon_db')
      .query("SELECT name FROM sys.databases WHERE name = @dbname");
      
    if (result.recordset.length > 0) {
      console.log("Database 'parheheon_db' already exists!");
    } else {
      console.log("Database 'parheheon_db' does not exist. Creating it now...");
      await pool.request().query("CREATE DATABASE [parheheon_db]");
      console.log("Database 'parheheon_db' created successfully!");
    }
  } catch (err) {
    console.error("\n[ERROR] Gagal membuat database:");
    console.error(err.message);
    console.error("\nTips Troubleshooting:");
    console.error("1. Pastikan SQL Server Service sudah berjalan (cek di services.msc).");
    console.error("2. Pastikan TCP/IP aktif di SQL Server Configuration Manager dan port 1433 terbuka.");
    console.error("3. Pastikan password 'sa' yang Anda masukkan ('YourStrongPassword123') sudah benar.");
  } finally {
    if (pool) {
      await pool.close();
    }
  }
}

createDb();
