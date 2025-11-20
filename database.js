const sqlite = require("sqlite");
const sqlite3 = require("sqlite3");

let db;

async function init(){
  db = await sqlite.open({filename:"database.sqlite", driver: sqlite3.Database});
  await db.exec(`CREATE TABLE IF NOT EXISTS products(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    price REAL,
    stock INTEGER
  )`);
  await db.exec(`CREATE TABLE IF NOT EXISTS users(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT,
    password TEXT
  )`);
}
init();

module.exports = {
  run:(...a)=>db.run(...a),
  get:(...a)=>db.get(...a),
  all:(...a)=>db.all(...a)
};

// Opprett admin-bruker hvis den ikke finnes
db.get(`SELECT * FROM users WHERE username = ?`, ["admin"], (err, row) => {
  if (!row) {
    db.run(
      `INSERT INTO users (username, password) VALUES (?, ?)`,
      ["admin", "1234"],
      (err) => {
        if (err) console.log("Kunne ikke opprette admin:", err);
        else console.log("Admin-bruker opprettet: admin / 1234");
      }
    );
  }
});

