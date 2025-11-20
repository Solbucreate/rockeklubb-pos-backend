const sqlite = require("sqlite");
const sqlite3 = require("sqlite3");

let db;

async function init() {
  db = await sqlite.open({
    filename: "database.sqlite",
    driver: sqlite3.Database
  });

  // Opprett tabeller
  await db.exec(`
    CREATE TABLE IF NOT EXISTS products(
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      price REAL,
      stock INTEGER
    )
  `);

  await db.exec(`
    CREATE TABLE IF NOT EXISTS users(
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE,
      password TEXT
    )
  `);

  // ⭐ Opprett admin-bruker hvis mangler
  const admin = await db.get(
    `SELECT * FROM users WHERE username = ?`,
    ["admin"]
  );

  if (!admin) {
    await db.run(
      `INSERT INTO users (username, password) VALUES (?, ?)`,
      ["admin", "1234"]
    );
    console.log("Admin-bruker opprettet: admin / 1234");
  }
}

init();

module.exports = {
  run: (...a) => db.run(...a),
  get: (...a) => db.get(...a),
  all: (...a) => db.all(...a)
};
