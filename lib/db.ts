import { createClient, type Client } from '@libsql/client';
import path from 'path';
import fs from 'fs';

const DB_PATH = process.env.DATABASE_PATH || './database.db';
const MIGRATIONS_DIR = path.join(process.cwd(), 'migrations');

let _db: Client | null = null;
let _ready: Promise<void> | null = null;

export function getDb(): Client {
  if (!_db) {
    const dbPath = path.resolve(process.cwd(), DB_PATH);
    _db = createClient({ url: `file:${dbPath}` });
    _ready = runMigrations(_db);
  }
  return _db;
}

export async function ensureReady(): Promise<void> {
  getDb();
  await _ready;
}

async function runMigrations(db: Client): Promise<void> {
  await db.execute(`
    CREATE TABLE IF NOT EXISTS _migrations (
      id       INTEGER PRIMARY KEY AUTOINCREMENT,
      filename TEXT NOT NULL UNIQUE,
      applied  TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);

  const result = await db.execute('SELECT filename FROM _migrations');
  const applied = new Set(result.rows.map((r) => r.filename as string));

  const files = fs
    .readdirSync(MIGRATIONS_DIR)
    .filter((f) => f.endsWith('.sql') && !applied.has(f))
    .sort();

  for (const file of files) {
    const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, file), 'utf-8');
    await db.executeMultiple(sql);
    await db.execute({ sql: 'INSERT INTO _migrations (filename) VALUES (?)', args: [file] });
    console.log(`[db] Applied migration: ${file}`);
  }
}
