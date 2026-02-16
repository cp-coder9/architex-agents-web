import crypto from 'node:crypto';
import path from 'node:path';
import fs from 'node:fs';

const sqliteModule = require('node:sqlite') as {
    DatabaseSync: new (path: string) => {
        exec: (sql: string) => void;
        prepare: (sql: string) => {
            get: (...params: Array<string | number | null>) => unknown;
            all: (...params: Array<string | number | null>) => unknown[];
            run: (...params: Array<string | number | null>) => { changes: number };
        };
    };
};

const { DatabaseSync } = sqliteModule;

const defaultDatabaseUrl = 'file:./data/app.db';

function resolveDatabasePath() {
    const databaseUrl = process.env.DATABASE_URL || defaultDatabaseUrl;
    if (databaseUrl.startsWith('file:')) {
        return path.resolve(process.cwd(), databaseUrl.replace('file:', ''));
    }
    return path.resolve(process.cwd(), databaseUrl);
}

const databasePath = resolveDatabasePath();
fs.mkdirSync(path.dirname(databasePath), { recursive: true });

const db = new DatabaseSync(databasePath);

db.exec('PRAGMA foreign_keys = ON;');

db.exec(`
    CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        name TEXT,
        role TEXT NOT NULL,
        password TEXT NOT NULL,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL
    );
`);

db.exec(`
    CREATE TABLE IF NOT EXISTS projects (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        status TEXT NOT NULL,
        clientId TEXT NOT NULL,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL,
        FOREIGN KEY (clientId) REFERENCES users(id)
    );
`);

db.exec(`
    CREATE TABLE IF NOT EXISTS documents (
        id TEXT PRIMARY KEY,
        filename TEXT NOT NULL,
        type TEXT NOT NULL,
        url TEXT NOT NULL,
        projectId TEXT NOT NULL,
        createdAt TEXT NOT NULL,
        FOREIGN KEY (projectId) REFERENCES projects(id)
    );
`);

db.exec(`
    CREATE TABLE IF NOT EXISTS tasks (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        status TEXT NOT NULL,
        projectId TEXT,
        assignedToId TEXT,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL,
        FOREIGN KEY (projectId) REFERENCES projects(id),
        FOREIGN KEY (assignedToId) REFERENCES users(id)
    );
`);

db.exec('CREATE INDEX IF NOT EXISTS idx_projects_client ON projects(clientId);');

db.exec('CREATE INDEX IF NOT EXISTS idx_documents_project ON documents(projectId);');

db.exec('CREATE INDEX IF NOT EXISTS idx_tasks_project ON tasks(projectId);');

db.exec('CREATE INDEX IF NOT EXISTS idx_tasks_assigned ON tasks(assignedToId);');

export function generateId() {
    return crypto.randomUUID();
}

export function nowIso() {
    return new Date().toISOString();
}

export default db;
