import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from '../config.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

let db: Database.Database;

export function getDb(): Database.Database {
    if (!db) {
        // Allow tests to pass DB_PATH=:memory: via env before importing this module
        const dbPath = process.env.DB_PATH || config.dbPath;
        const isMemory = dbPath === ':memory:';

        if (!isMemory) {
            const dataDir = path.dirname(dbPath);
            if (!fs.existsSync(dataDir)) {
                fs.mkdirSync(dataDir, { recursive: true });
            }
        }

        db = new Database(dbPath);
        db.pragma('journal_mode = WAL');
        db.pragma('foreign_keys = ON');

        const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf-8');
        db.exec(schema);

        runMigrations(db);

        if (!isMemory) {
            console.log('✅ Database initialized at', dbPath);
        }
    }

    return db;
}

function runMigrations(db: Database.Database) {
    // Migration: add role column to users if not exists
    const cols = db.pragma('table_info(users)') as { name: string }[];
    if (!cols.some(c => c.name === 'role')) {
        db.exec(`ALTER TABLE users ADD COLUMN role TEXT NOT NULL DEFAULT 'user'`);
        console.log('🔄 Migration: added role column to users');
    }

    // Migration: password_resets table
    db.exec(`
        CREATE TABLE IF NOT EXISTS password_resets (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            code TEXT NOT NULL,
            expires_at TEXT NOT NULL,
            used INTEGER NOT NULL DEFAULT 0,
            attempts INTEGER NOT NULL DEFAULT 0,
            created_at TEXT DEFAULT (datetime('now'))
        )
    `);

    // Migration: add attempts column if missing
    const resetCols = db.pragma('table_info(password_resets)') as { name: string }[];
    if (resetCols.length > 0 && !resetCols.some(c => c.name === 'attempts')) {
        db.exec(`ALTER TABLE password_resets ADD COLUMN attempts INTEGER NOT NULL DEFAULT 0`);
        console.log('🔄 Migration: added attempts column to password_resets');
    }

    // Migration: add notes column to orders
    const orderCols = db.pragma('table_info(orders)') as { name: string }[];
    if (!orderCols.some(c => c.name === 'notes')) {
        db.exec(`ALTER TABLE orders ADD COLUMN notes TEXT NOT NULL DEFAULT ''`);
        console.log('🔄 Migration: added notes column to orders');
    }

    // Migration: add avatar column to users
    if (!cols.some(c => c.name === 'avatar')) {
        db.exec(`ALTER TABLE users ADD COLUMN avatar TEXT NOT NULL DEFAULT ''`);
        console.log('🔄 Migration: added avatar column to users');
    }

    if (!cols.some(c => c.name === 'is_superadmin')) {
        db.exec(`ALTER TABLE users ADD COLUMN is_superadmin INTEGER NOT NULL DEFAULT 0`);
        console.log('🔄 Migration: added is_superadmin column to users');
    }

    // Migration: favorites table
    db.exec(`
        CREATE TABLE IF NOT EXISTS user_favorites (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            menu_item_id INTEGER NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
            created_at TEXT DEFAULT (datetime('now')),
            UNIQUE(user_id, menu_item_id)
        )
    `);

    // Migration: Promo codes table and discount_sent column for orders
    if (!orderCols.some(c => c.name === 'discount_sent')) {
        db.exec(`ALTER TABLE orders ADD COLUMN discount_sent INTEGER NOT NULL DEFAULT 0`);
        console.log('🔄 Migration: added discount_sent column to orders');
    }

    db.exec(`
        CREATE TABLE IF NOT EXISTS promo_codes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            code TEXT UNIQUE NOT NULL,
            discount_percentage INTEGER NOT NULL,
            user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            is_used INTEGER NOT NULL DEFAULT 0,
            created_at TEXT DEFAULT (datetime('now'))
        )
    `);
}

export function closeDb() {
    if (db) {
        db.close();
        console.log('🔒 Database closed');
        // Reset singleton so next getDb() call re-initialises
        (db as any) = undefined;
    }
}
