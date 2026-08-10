import initSqlJs, { Database } from 'sql.js';
import fs from 'fs';
import path from 'path';

const DB_FILE = path.join(process.cwd(), 'hypebestie.sqlite');

let dbInstance: Database | null = null;

export async function getDb(): Promise<Database> {
  if (dbInstance) return dbInstance;

  const SQL = await initSqlJs();

  if (fs.existsSync(DB_FILE)) {
    try {
      const fileBuffer = fs.readFileSync(DB_FILE);
      dbInstance = new SQL.Database(fileBuffer);
    } catch (e) {
      console.warn('Could not load existing sqlite file, creating new database.', e);
      dbInstance = new SQL.Database();
    }
  } else {
    dbInstance = new SQL.Database();
  }

  // Create tables if not existing
  dbInstance.run(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS user_credits (
      user_id TEXT PRIMARY KEY,
      credits_remaining INTEGER NOT NULL
    );
  `);

  saveDb();
  return dbInstance;
}

export function saveDb() {
  if (!dbInstance) return;
  try {
    const data = dbInstance.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(DB_FILE, buffer);
  } catch (err) {
    console.error('Failed to persist database:', err);
  }
}

export async function getUserCredits(userId: string): Promise<number> {
  const db = await getDb();
  const initialCredits = Number(process.env.INITIAL_FREE_CREDITS) || 20;

  const stmt = db.prepare('SELECT credits_remaining FROM user_credits WHERE user_id = $userId');
  stmt.bind({ '$userId': userId });

  if (stmt.step()) {
    const row = stmt.getAsObject();
    stmt.free();
    return Number(row.credits_remaining);
  } else {
    stmt.free();
    // Initialize user and credits
    const now = new Date().toISOString();
    db.run('INSERT OR IGNORE INTO users (id, created_at) VALUES (?, ?)', [userId, now]);
    db.run('INSERT OR REPLACE INTO user_credits (user_id, credits_remaining) VALUES (?, ?)', [userId, initialCredits]);
    saveDb();
    return initialCredits;
  }
}

export async function decrementUserCredits(userId: string): Promise<number> {
  const current = await getUserCredits(userId);
  if (current <= 0) {
    return 0;
  }
  const newCredits = current - 1;
  const db = await getDb();
  db.run('UPDATE user_credits SET credits_remaining = ? WHERE user_id = ?', [newCredits, userId]);
  saveDb();
  return newCredits;
}
