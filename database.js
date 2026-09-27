// database.js
// Uses Node.js's built-in SQLite module (no extra install, no C++ compiler needed)

const { DatabaseSync } = require("node:sqlite");
const path = require("path");

const db = new DatabaseSync(path.join(__dirname, "skycast.db"));

// Create the users table if it doesn't exist yet.
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    email TEXT PRIMARY KEY,
    password_hash TEXT NOT NULL,
    last_city TEXT DEFAULT 'Mumbai',
    theme TEXT DEFAULT 'light',
    created_at TEXT NOT NULL
  )
`);

function findUserByEmail(email) {
  return db.prepare("SELECT * FROM users WHERE email = ?").get(email);
}

function createUser(email, passwordHash) {
  db.prepare(`
    INSERT INTO users (email, password_hash, last_city, theme, created_at)
    VALUES (?, ?, 'Mumbai', 'light', ?)
  `).run(email, passwordHash, new Date().toISOString());
  return findUserByEmail(email);
}

function updatePrefs(email, { lastCity, theme }) {
  const user = findUserByEmail(email);
  if (!user) return null;

  db.prepare(`
    UPDATE users
    SET last_city = ?, theme = ?
    WHERE email = ?
  `).run(
    lastCity !== undefined ? lastCity : user.last_city,
    theme !== undefined ? theme : user.theme,
    email
  );

  return findUserByEmail(email);
}

module.exports = { findUserByEmail, createUser, updatePrefs };