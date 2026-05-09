import Database from 'better-sqlite3';

const db = new Database('aniday.db');

db.exec(`
  CREATE TABLE IF NOT EXISTS characters (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    work TEXT,
    avatar TEXT,
    month INTEGER,
    day INTEGER,
    bg TEXT,
    music TEXT,
    quotes TEXT
  );

  CREATE TABLE IF NOT EXISTS backgrounds (
    month INTEGER,
    day INTEGER,
    url TEXT,
    PRIMARY KEY (month, day)
  );
`);

console.log('Database initialized successfully with better-sqlite3.');
db.close();
