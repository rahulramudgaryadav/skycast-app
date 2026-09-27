// server.js
// A real backend: Express handles requests, bcrypt hashes passwords,
// and database.js talks to the SQLite database file (skycast.db).
// This file lives in the SAME folder as your index.html.
 
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const path = require("path");
const { findUserByEmail, createUser, updatePrefs } = require("./database");
 
const app = express();
const PORT = process.env.PORT || 3000;
 
app.use(cors());
app.use(express.json());
 
// Serve index.html (and any other files) from this same folder.
app.use(express.static(__dirname));
 
function sanitizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}
 
// ---------- POST /api/signup ----------
app.post("/api/signup", async (req, res) => {
  try {
    const email = sanitizeEmail(req.body.email);
    const password = req.body.password;
 
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required." });
    }
    if (password.length < 4) {
      return res.status(400).json({ error: "Password should be at least 4 characters." });
    }
    if (findUserByEmail(email)) {
      return res.status(409).json({ error: "An account with this email already exists." });
    }
 
    const passwordHash = await bcrypt.hash(password, 10);
    const user = createUser(email, passwordHash);
 
    res.json({ email: user.email, lastCity: user.last_city, theme: user.theme });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong. Please try again." });
  }
});
 
// ---------- POST /api/login ----------
app.post("/api/login", async (req, res) => {
  try {
    const email = sanitizeEmail(req.body.email);
    const password = req.body.password;
 
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required." });
    }
 
    const user = findUserByEmail(email);
    if (!user) {
      return res.status(404).json({ error: "No account found with this email." });
    }
 
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return res.status(401).json({ error: "Incorrect password." });
    }
 
    res.json({ email: user.email, lastCity: user.last_city, theme: user.theme });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong. Please try again." });
  }
});
 
// ---------- POST /api/prefs ----------
app.post("/api/prefs", (req, res) => {
  try {
    const email = sanitizeEmail(req.body.email);
    const { lastCity, theme } = req.body;
 
    if (!email) {
      return res.status(400).json({ error: "Missing email." });
    }
 
    const user = updatePrefs(email, { lastCity, theme });
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }
 
    res.json({ email: user.email, lastCity: user.last_city, theme: user.theme });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong. Please try again." });
  }
});
 
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});