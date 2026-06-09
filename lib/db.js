import sql from 'mssql';
import { AsyncLocalStorage } from 'async_hooks';

const config = {
  user: process.env.DB_USER || 'sa',
  password: process.env.DB_PASSWORD || 'YourStrongPassword123',
  server: process.env.DB_SERVER || 'localhost',
  database: process.env.DB_NAME || 'parheheon_db',
  port: parseInt(process.env.DB_PORT || '1433', 10),
  options: {
    encrypt: true,
    trustServerCertificate: true, // change to true for local dev / self-signed certs
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  }
};

const transactionStorage = new AsyncLocalStorage();

// Connection singleton promise
let poolPromise = null;
let isInitialized = false;

async function getPool() {
  if (!poolPromise) {
    poolPromise = (async () => {
      // Ensure DB exists first
      await ensureDatabaseExists();
      // Connect to the actual database
      const pool = await sql.connect(config);
      // Initialize schema if not done
      if (!isInitialized) {
        await initializeSchema(pool);
        isInitialized = true;
      }
      return pool;
    })();
  }
  return poolPromise;
}

async function ensureDatabaseExists() {
  const masterConfig = {
    user: config.user,
    password: config.password,
    server: config.server,
    port: config.port,
    database: 'master',
    options: {
      encrypt: config.options.encrypt,
      trustServerCertificate: config.options.trustServerCertificate
    }
  };
  
  let masterPool;
  try {
    masterPool = await sql.connect(masterConfig);
    const dbName = config.database;
    const result = await masterPool.request()
      .input('dbname', dbName)
      .query(`SELECT name FROM sys.databases WHERE name = @dbname`);
      
    if (result.recordset.length === 0) {
      console.log(`Database '${dbName}' does not exist. Creating it...`);
      await masterPool.request().query(`CREATE DATABASE [${dbName}]`);
      console.log(`Database '${dbName}' created successfully.`);
    }
  } catch (err) {
    console.error("Error ensuring database exists:", err);
  } finally {
    if (masterPool) {
      await masterPool.close();
    }
  }
}

async function initializeSchema(pool) {
  const request = pool.request();
  
  // 1. users
  await request.query(`
    IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'users')
    BEGIN
      CREATE TABLE users (
        id INT IDENTITY(1,1) PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL,
        name NVARCHAR(255) NOT NULL
      );
    END
  `);
  
  // 2. settings
  await request.query(`
    IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'settings')
    BEGIN
      CREATE TABLE settings (
        [key] VARCHAR(255) PRIMARY KEY,
        [value] NVARCHAR(MAX) NOT NULL
      );
    END
  `);
  
  // 3. reservations
  await request.query(`
    IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'reservations')
    BEGIN
      CREATE TABLE reservations (
        id INT IDENTITY(1,1) PRIMARY KEY,
        user_id INT NOT NULL,
        event_name NVARCHAR(255) NOT NULL,
        ticket_qty INT NOT NULL,
        status VARCHAR(50) NOT NULL DEFAULT 'pending',
        payment_image_url NVARCHAR(MAX),
        created_at NVARCHAR(100) NOT NULL,
        FOREIGN KEY(user_id) REFERENCES users(id)
      );
    END
  `);

  // 4. voting_categories
  await request.query(`
    IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'voting_categories')
    BEGIN
      CREATE TABLE voting_categories (
        id INT IDENTITY(1,1) PRIMARY KEY,
        name NVARCHAR(255) UNIQUE NOT NULL,
        description NVARCHAR(MAX),
        order_index INT DEFAULT 0,
        created_at NVARCHAR(100) NOT NULL
      );
    END
  `);

  // 5. voting_candidates
  await request.query(`
    IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'voting_candidates')
    BEGIN
      CREATE TABLE voting_candidates (
        id INT IDENTITY(1,1) PRIMARY KEY,
        category_id INT NOT NULL,
        name NVARCHAR(255) NOT NULL,
        image_url NVARCHAR(MAX),
        description NVARCHAR(MAX),
        votes_count INT NOT NULL DEFAULT 0,
        created_at NVARCHAR(100) NOT NULL,
        FOREIGN KEY(category_id) REFERENCES voting_categories(id) ON DELETE CASCADE
      );
    END
  `);



  // 9. highlights
  await request.query(`
    IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'highlights')
    BEGIN
      CREATE TABLE highlights (
        id INT IDENTITY(1,1) PRIMARY KEY,
        title NVARCHAR(255) NOT NULL,
        description NVARCHAR(MAX) NOT NULL,
        image_url NVARCHAR(MAX) NOT NULL,
        created_at NVARCHAR(100) NOT NULL
      );
    END
  `);

  // 10. seat_bookings
  await request.query(`
    IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'seat_bookings')
    BEGIN
      CREATE TABLE seat_bookings (
        id INT IDENTITY(1,1) PRIMARY KEY,
        reservation_id INT NOT NULL,
        seat_id VARCHAR(50) NOT NULL UNIQUE,
        category VARCHAR(50) NOT NULL,
        price FLOAT NOT NULL,
        FOREIGN KEY(reservation_id) REFERENCES reservations(id) ON DELETE CASCADE
      );
    END
  `);



  // 12. qris_settings
  await request.query(`
    IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'qris_settings')
    BEGIN
      CREATE TABLE qris_settings (
        id INT IDENTITY(1,1) PRIMARY KEY,
        qris_image_url NVARCHAR(MAX) NOT NULL,
        merchant_name NVARCHAR(255),
        account_name NVARCHAR(255),
        created_at NVARCHAR(100) NOT NULL
      );
    END
  `);

  // Seed default settings
  await request.query(`
    IF NOT EXISTS (SELECT 1 FROM settings WHERE [key] = 'header_image_url')
    BEGIN
      INSERT INTO settings ([key], [value]) VALUES ('header_image_url', 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=1200&auto=format&fit=crop');
    END
  `);

  // Seed default users
  await request.query(`
    IF NOT EXISTS (SELECT 1 FROM users WHERE username = 'superadmin')
    BEGIN
      INSERT INTO users (username, password, role, name) VALUES ('superadmin', 'super123', 'superadmin', 'Super Admin');
    END
    IF NOT EXISTS (SELECT 1 FROM users WHERE username = 'admin')
    BEGIN
      INSERT INTO users (username, password, role, name) VALUES ('admin', 'admin123', 'admin', 'Admin Utama');
    END
    IF NOT EXISTS (SELECT 1 FROM users WHERE username = 'user')
    BEGIN
      INSERT INTO users (username, password, role, name) VALUES ('user', 'user123', 'user', 'Siswa Sekolah Minggu');
    END
  `);



  // Seed default highlights
  const countHighlights = await request.query(`SELECT COUNT(*) as count FROM highlights`);
  if (countHighlights.recordset[0].count === 0) {
    const now = new Date().toISOString();
    await request.query(`
      INSERT INTO highlights (title, description, image_url, created_at) VALUES (
        'Festival Paduan Suara Anak',
        'Lomba paduan suara anak sekolah minggu HKBP Ciputat menyambut perayaan Paskah.',
        'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?q=80&w=600&auto=format&fit=crop',
        '${now}'
      );
      INSERT INTO highlights (title, description, image_url, created_at) VALUES (
        'Retreat Sekolah Minggu 2026',
        'Acara kebersamaan dan pembinaan iman anak sekolah minggu di Wisma Puncak.',
        'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=600&auto=format&fit=crop',
        '${now}'
      );
    `);
  }

  // Seed voting categories
  const countCategories = await request.query(`SELECT COUNT(*) as count FROM voting_categories`);
  if (countCategories.recordset[0].count === 0) {
    const now = new Date().toISOString();
    await request.query(`
      INSERT INTO voting_categories (name, description, order_index, created_at) VALUES ('Penginjil Cilik', 'Kategori penampilan Penginjil Cilik', 1, '${now}');
      INSERT INTO voting_categories (name, description, order_index, created_at) VALUES ('CCA & CCBE', 'Kategori penampilan CCA & CCBE', 2, '${now}');
      INSERT INTO voting_categories (name, description, order_index, created_at) VALUES ('Vocal Solo', 'Kategori nyanyian solo', 3, '${now}');
      INSERT INTO voting_categories (name, description, order_index, created_at) VALUES ('Vocal Group', 'Kategori nyanyian grup', 4, '${now}');
      INSERT INTO voting_categories (name, description, order_index, created_at) VALUES ('Fashion Show', 'Kategori pertunjukan fashion', 5, '${now}');
      INSERT INTO voting_categories (name, description, order_index, created_at) VALUES ('Tor-Tor', 'Kategori tarian tradisional Tor-Tor', 6, '${now}');
    `);
  }

  // Seed voting candidates
  const countVotingCandidates = await request.query(`SELECT COUNT(*) as count FROM voting_candidates`);
  if (countVotingCandidates.recordset[0].count === 0) {
    const now = new Date().toISOString();
    await request.query(`
      INSERT INTO voting_candidates (category_id, name, image_url, description, votes_count, created_at) VALUES (1, 'Peserta 1A', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400&auto=format&fit=crop', 'Peserta Penginjil Cilik Grup A', 0, '${now}');
      INSERT INTO voting_candidates (category_id, name, image_url, description, votes_count, created_at) VALUES (1, 'Peserta 1B', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=400&auto=format&fit=crop', 'Peserta Penginjil Cilik Grup B', 0, '${now}');
      INSERT INTO voting_candidates (category_id, name, image_url, description, votes_count, created_at) VALUES (1, 'Peserta 1C', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=400&auto=format&fit=crop', 'Peserta Penginjil Cilik Grup C', 0, '${now}');
      
      INSERT INTO voting_candidates (category_id, name, image_url, description, votes_count, created_at) VALUES (2, 'Peserta 2A', 'https://images.unsplash.com/photo-1517849845537-1d51a20414de?q=80&w=400&auto=format&fit=crop', 'Peserta CCA & CCBE Grup A', 0, '${now}');
      INSERT INTO voting_candidates (category_id, name, image_url, description, votes_count, created_at) VALUES (2, 'Peserta 2B', 'https://images.unsplash.com/photo-1539571696357-5a69c006ae30?q=80&w=400&auto=format&fit=crop', 'Peserta CCA & CCBE Grup B', 0, '${now}');
      INSERT INTO voting_candidates (category_id, name, image_url, description, votes_count, created_at) VALUES (2, 'Peserta 2C', 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?q=80&w=400&auto=format&fit=crop', 'Peserta CCA & CCBE Grup C', 0, '${now}');
      
      INSERT INTO voting_candidates (category_id, name, image_url, description, votes_count, created_at) VALUES (3, 'Penyanyi 3A', 'https://images.unsplash.com/photo-1506157786151-b8491531f063?q=80&w=400&auto=format&fit=crop', 'Penyanyi Solo 1', 0, '${now}');
      INSERT INTO voting_candidates (category_id, name, image_url, description, votes_count, created_at) VALUES (3, 'Penyanyi 3B', 'https://images.unsplash.com/photo-1517457373614-b7152f800fd1?q=80&w=400&auto=format&fit=crop', 'Penyanyi Solo 2', 0, '${now}');
      INSERT INTO voting_candidates (category_id, name, image_url, description, votes_count, created_at) VALUES (3, 'Penyanyi 3C', 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?q=80&w=400&auto=format&fit=crop', 'Penyanyi Solo 3', 0, '${now}');
      
      INSERT INTO voting_candidates (category_id, name, image_url, description, votes_count, created_at) VALUES (4, 'Grup Vokal 4A', 'https://images.unsplash.com/photo-1484807352052-23338812c998?q=80&w=400&auto=format&fit=crop', 'Grup Vokal 1', 0, '${now}');
      INSERT INTO voting_candidates (category_id, name, image_url, description, votes_count, created_at) VALUES (4, 'Grup Vokal 4B', 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=400&auto=format&fit=crop', 'Grup Vokal 2', 0, '${now}');
      INSERT INTO voting_candidates (category_id, name, image_url, description, votes_count, created_at) VALUES (4, 'Grup Vokal 4C', 'https://images.unsplash.com/photo-1508700115892-05ba35866d1c?q=80&w=400&auto=format&fit=crop', 'Grup Vokal 3', 0, '${now}');
      
      INSERT INTO voting_candidates (category_id, name, image_url, description, votes_count, created_at) VALUES (5, 'Model 5A', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=400&auto=format&fit=crop', 'Model Fashion Show 1', 0, '${now}');
      INSERT INTO voting_candidates (category_id, name, image_url, description, votes_count, created_at) VALUES (5, 'Model 5B', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400&auto=format&fit=crop', 'Model Fashion Show 2', 0, '${now}');
      INSERT INTO voting_candidates (category_id, name, image_url, description, votes_count, created_at) VALUES (5, 'Model 5C', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=400&auto=format&fit=crop', 'Model Fashion Show 3', 0, '${now}');
      
      INSERT INTO voting_candidates (category_id, name, image_url, description, votes_count, created_at) VALUES (6, 'Penari 6A', 'https://images.unsplash.com/photo-1539571696357-5a69c006ae30?q=80&w=400&auto=format&fit=crop', 'Penari Tor-Tor Grup 1', 0, '${now}');
      INSERT INTO voting_candidates (category_id, name, image_url, description, votes_count, created_at) VALUES (6, 'Penari 6B', 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?q=80&w=400&auto=format&fit=crop', 'Penari Tor-Tor Grup 2', 0, '${now}');
      INSERT INTO voting_candidates (category_id, name, image_url, description, votes_count, created_at) VALUES (6, 'Penari 6C', 'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?q=80&w=400&auto=format&fit=crop', 'Penari Tor-Tor Grup 3', 0, '${now}');
    `);
  }

  // Seed QRIS settings
  const countQRIS = await request.query(`SELECT COUNT(*) as count FROM qris_settings`);
  if (countQRIS.recordset[0].count === 0) {
    const now = new Date().toISOString();
    await request.query(`
      INSERT INTO qris_settings (qris_image_url, merchant_name, account_name, created_at) VALUES (
        'https://images.unsplash.com/photo-1610700596007-11502861dcfa?q=80&w=400&auto=format&fit=crop',
        'Parheheon HKBP Ciputat',
        'Sekolah Minggu HKBP Ciputat',
        '${now}'
      );
    `);
  }

  // Seed Stats settings
  await request.query(`
    IF NOT EXISTS (SELECT 1 FROM settings WHERE [key] = 'stats_image_url')
    BEGIN
      INSERT INTO settings ([key], [value]) VALUES ('stats_image_url', 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=1200&auto=format&fit=crop');
    END
  `);
}

// Helper to convert SQLite '?' parameters to MSSQL '@p0', '@p1' etc.
function translateQuery(sqlString) {
  let paramIndex = 0;
  let translated = sqlString.replace(/\?/g, () => `@p${paramIndex++}`);
  
  // Escape settings [key] and [value] since they are reserved keywords in MSSQL
  translated = translated.replace(/\bsettings\s+WHERE\s+key\s*=/gi, "settings WHERE [key] =");
  translated = translated.replace(/\bsettings\s+WHERE\s+\[key\]\s*=/gi, "settings WHERE [key] =");
  
  return translated;
}

const db = {
  prepare(sqlString) {
    return {
      async get(...params) {
        const pool = await getPool();
        const activeTransaction = transactionStorage.getStore();
        const request = activeTransaction ? new sql.Request(activeTransaction) : pool.request();
        
        const translated = translateQuery(sqlString);
        
        params.forEach((val, idx) => {
          request.input(`p${idx}`, val === undefined ? null : val);
        });
        
        const result = await request.query(translated);
        return result.recordset ? result.recordset[0] : null;
      },
      
      async all(...params) {
        const pool = await getPool();
        const activeTransaction = transactionStorage.getStore();
        const request = activeTransaction ? new sql.Request(activeTransaction) : pool.request();
        
        const translated = translateQuery(sqlString);
        
        params.forEach((val, idx) => {
          request.input(`p${idx}`, val === undefined ? null : val);
        });
        
        const result = await request.query(translated);
        return result.recordset || [];
      },
      
      async run(...params) {
        const pool = await getPool();
        const activeTransaction = transactionStorage.getStore();
        const request = activeTransaction ? new sql.Request(activeTransaction) : pool.request();
        
        let translated = translateQuery(sqlString);
        
        const isInsert = translated.trim().toUpperCase().startsWith('INSERT');
        if (isInsert && !translated.toUpperCase().includes('SCOPE_IDENTITY')) {
          translated += '; SELECT SCOPE_IDENTITY() AS lastInsertRowid;';
        }
        
        params.forEach((val, idx) => {
          request.input(`p${idx}`, val === undefined ? null : val);
        });
        
        const result = await request.query(translated);
        
        let lastInsertRowid = null;
        if (isInsert && result.recordset && result.recordset.length > 0) {
          lastInsertRowid = result.recordset[0].lastInsertRowid;
        }
        
        return {
          lastInsertRowid,
          changes: result.rowsAffected ? result.rowsAffected[0] : 0
        };
      }
    };
  },
  
  transaction(fn) {
    return async (...args) => {
      const pool = await getPool();
      const transaction = new sql.Transaction(pool);
      await transaction.begin();
      try {
        const result = await transactionStorage.run(transaction, async () => {
          return await fn(...args);
        });
        await transaction.commit();
        return result;
      } catch (err) {
        await transaction.rollback();
        throw err;
      }
    };
  },
  
  async exec(sqlString) {
    const pool = await getPool();
    const activeTransaction = transactionStorage.getStore();
    const request = activeTransaction ? new sql.Request(activeTransaction) : pool.request();
    return await request.query(sqlString);
  }
};

export default db;
