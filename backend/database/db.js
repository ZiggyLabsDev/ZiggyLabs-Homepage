const Database = require("better-sqlite3");
const path = require("path");

const db = new Database(path.join(__dirname, "database.db"));

db.exec(`
CREATE TABLE IF NOT EXISTS clients (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,

    plan TEXT NOT NULL,
    maintenance TEXT,

    websiteGoal TEXT,
    timeline TEXT,

    projectDetails TEXT,
    notes TEXT,

    total REAL,

    status TEXT DEFAULT 'new',

    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS bug_reports (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    email TEXT,
    pageUrl TEXT,
    summary TEXT NOT NULL,
    details TEXT NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
);
`);

function ensureColumn(name, definition) {
    const columns = db.prepare("PRAGMA table_info(clients)").all();
    const hasColumn = columns.some((column) => column.name === name);
    if (!hasColumn) {
        db.exec(`ALTER TABLE clients ADD COLUMN ${name} ${definition}`);
    }
}

ensureColumn("planId", "TEXT");
ensureColumn("planPrice", "REAL");
ensureColumn("addons", "TEXT DEFAULT '[]'");
ensureColumn("maintenanceId", "TEXT");
ensureColumn("maintenancePrice", "REAL DEFAULT 0");
ensureColumn("paymentStatus", "TEXT DEFAULT 'waiting'");
ensureColumn("submittedAt", "TEXT");

module.exports = db;