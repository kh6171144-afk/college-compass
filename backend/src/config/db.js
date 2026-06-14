const { Pool } = require('pg');
let sqlite3 = null;
const path = require('path');
const fs = require('fs');
require('dotenv').config();

let dbType = 'postgres';
let pgPool = null;
let sqliteDb = null;

// Determine configuration
const usePostgres = process.env.PGHOST || process.env.DATABASE_URL;

if (usePostgres) {
  try {
    const config = process.env.DATABASE_URL
  ? {
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false
      }
    }
      : {
          user: process.env.PGUSER || 'postgres',
          host: process.env.PGHOST || 'localhost',
          database: process.env.PGDATABASE || 'college_compass',
          password: process.env.PGPASSWORD || 'postgres',
          port: parseInt(process.env.PGPORT || '5432'),
        };
    
    pgPool = new Pool(config);
    dbType = 'postgres';
    console.log('Database Config: Configured for PostgreSQL.');
  } catch (err) {
    console.error('Failed to configure PostgreSQL pool. Falling back to SQLite.', err);
    dbType = 'sqlite';
  }
} else {
  dbType = 'sqlite';
  console.log('Database Config: PostgreSQL environment variables not found. Falling back to SQLite.');
}

// If SQLite fallback is active, establish connection to local file
if (dbType === 'sqlite') {
  sqlite3 = require('sqlite3').verbose();
  const dbDir = path.resolve(__dirname, '../../data');
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }
  const dbPath = path.join(dbDir, 'college_compass.db');
  sqliteDb = new sqlite3.Database(dbPath, (err) => {
    if (err) {
      console.error('Failed to connect to SQLite database:', err);
    } else {
      console.log(`SQLite database connected successfully at: ${dbPath}`);
    }
  });
}

// Unified Query Helper
const query = (text, params = []) => {
  if (dbType === 'postgres') {
    return pgPool.query(text, params);
  } else {
    return new Promise((resolve, reject) => {
      // Convert standard PostgreSQL parameterized queries ($1, $2) to SQLite format (?, ?)
      let sqliteText = text.replace(/\$(\d+)/g, '?');
      
      // Strip PostgreSQL RETURNING clause to prevent syntax errors in older SQLite versions
      sqliteText = sqliteText.replace(/RETURNING\s+[\w\s,*()]+/gi, '').trim();
      
      const isInsert = sqliteText.trim().toUpperCase().startsWith('INSERT');
      const isUpdateOrDelete = sqliteText.trim().toUpperCase().startsWith('UPDATE') || sqliteText.trim().toUpperCase().startsWith('DELETE');

      if (isInsert) {
        sqliteDb.run(sqliteText, params, function (err) {
          if (err) {
            reject(err);
          } else {
            // Mock PG result returning insert ID if requested by returning clause
            resolve({ rows: [{ id: this.lastID }], rowCount: 1 });
          }
        });
      } else if (isUpdateOrDelete) {
        sqliteDb.run(sqliteText, params, function (err) {
          if (err) {
            reject(err);
          } else {
            resolve({ rows: [], rowCount: this.changes });
          }
        });
      } else {
        sqliteDb.all(sqliteText, params, (err, rows) => {
          if (err) {
            reject(err);
          } else {
            resolve({ rows, rowCount: rows.length });
          }
        });
      }
    });
  }
};

// Initialize SQLite Schema if needed
const initDbSchema = async () => {
  if (dbType === 'sqlite') {
    const ddl = `
      CREATE TABLE IF NOT EXISTS colleges (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        campus_name TEXT,
        state TEXT NOT NULL,
        city TEXT NOT NULL,
        type TEXT NOT NULL,
        nirf_rank INTEGER,
        naac_grade TEXT,
        website TEXT,
        application_link TEXT,
        average_package REAL,
        highest_package REAL,
        tuition_fee REAL,
        hostel_fee REAL,
        verification_status TEXT DEFAULT 'Unverified',
        verification_source TEXT,
        last_verified_at TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS courses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        college_id INTEGER REFERENCES colleges(id) ON DELETE CASCADE,
        course_name TEXT NOT NULL,
        duration INTEGER DEFAULT 4
      );

      CREATE TABLE IF NOT EXISTS cutoffs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        college_id INTEGER REFERENCES colleges(id) ON DELETE CASCADE,
        course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
        exam TEXT NOT NULL,
        category TEXT NOT NULL,
        year INTEGER NOT NULL,
        opening_rank INTEGER NOT NULL,
        closing_rank INTEGER NOT NULL,
        quota TEXT,
        round INTEGER,
        verification_status TEXT DEFAULT 'Unverified',
        source_url TEXT,
        last_verified_at TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS college_fees (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        college_id INTEGER REFERENCES colleges(id) ON DELETE CASCADE,
        course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
        tuition_fee_per_year REAL,
        hostel_fee_per_year REAL,
        mess_fee_per_year REAL,
        one_time_charges REAL,
        caution_deposit REAL,
        exam_fees REAL,
        other_charges REAL,
        estimated_total_4years REAL,
        academic_year INTEGER,
        source_url TEXT,
        last_verified_at TIMESTAMP,
        verification_status TEXT DEFAULT 'Unverified'
      );

      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        password_hash TEXT,
        google_id TEXT UNIQUE,
        role TEXT DEFAULT 'student',
        failed_login_attempts INTEGER DEFAULT 0,
        locked_until TIMESTAMP,
        education_level TEXT,
        preferred_branch TEXT,
        preferred_state TEXT,
        preferred_exam TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS ratings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        college_id INTEGER REFERENCES colleges(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        rating_hostels REAL NOT NULL,
        rating_campus REAL NOT NULL,
        rating_infra REAL NOT NULL,
        rating_overall REAL NOT NULL,
        review_text TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(college_id, user_id)
      );

      CREATE TABLE IF NOT EXISTS otps (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT NOT NULL,
        otp TEXT NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        used INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
    
    // SQLite runs statements consecutively, we split by semicolon
    const statements = ddl.split(';').map(s => s.trim()).filter(Boolean);
    for (const statement of statements) {
      await new Promise((resolve, reject) => {
        sqliteDb.run(statement, (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
    }

    // Helper to dynamically add column to existing table if they are missing
    const addColumnToTable = async (tableName, colName, colType) => {
      try {
        await new Promise((resolve) => {
          sqliteDb.run(`ALTER TABLE ${tableName} ADD COLUMN ${colName} ${colType}`, () => {
            resolve(); // Resolve anyway (ignore duplicate column error)
          });
        });
      } catch (e) {
        // Ignore
      }
    };

    // Migrations for users table
    await addColumnToTable('users', 'role', "TEXT DEFAULT 'student'");
    await addColumnToTable('users', 'failed_login_attempts', 'INTEGER DEFAULT 0');
    await addColumnToTable('users', 'locked_until', 'TIMESTAMP');
    await addColumnToTable('users', 'education_level', 'TEXT');
    await addColumnToTable('users', 'preferred_branch', 'TEXT');
    await addColumnToTable('users', 'preferred_state', 'TEXT');
    await addColumnToTable('users', 'preferred_exam', 'TEXT');

    // Migrations for colleges table
    await addColumnToTable('colleges', 'verification_status', "TEXT DEFAULT 'Unverified'");
    await addColumnToTable('colleges', 'verification_source', 'TEXT');
    await addColumnToTable('colleges', 'last_verified_at', 'TIMESTAMP');
    await addColumnToTable('colleges', 'campus_name', 'TEXT');

    // Migrations for cutoffs table
    await addColumnToTable('cutoffs', 'quota', 'TEXT');
    await addColumnToTable('cutoffs', 'round', 'INTEGER');
    await addColumnToTable('cutoffs', 'verification_status', "TEXT DEFAULT 'Unverified'");
    await addColumnToTable('cutoffs', 'source_url', 'TEXT');
    await addColumnToTable('cutoffs', 'last_verified_at', 'TIMESTAMP');

    console.log('SQLite schemas verified/created.');
  }
};

module.exports = {
  query,
  dbType,
  initDbSchema,
  isSqlite: dbType === 'sqlite'
};
