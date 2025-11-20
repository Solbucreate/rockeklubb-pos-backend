const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const db = require("./database.js");

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// ====================== LOGIN ======================
app.post("/api/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await db.get(
      "SELECT * FROM users WHERE username = ? AND password = ?",
      [username, password]
    );

    if (!user) {
      return res.status(401).json({ success: false, error: "Invalid credentials" });
    }

    return res.json({ success: true });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ success: false, error: "Server error" });
  }
});

// ====================== PRODUCTS ======================
app.get("/api/products", async (req, res) => {
  try {
    const rows = await db.all("SELECT * FROM products");
    res.json(rows);
  } catch (err) {
    console.error("Products error:", err);
    res.status(500).json({ error: "Database error" });
  }
});

app.post("/api/products", async (req, res) => {
  try {
    const { name, category, price, stock } = req.body;

    const result = await db.run(
      "INSERT INTO products (name, category, price, stock) VALUES (?, ?, ?, ?)",
      [name, category, price, stock ?? null]
    );

    res.json({ id: result.lastID });
  } catch (err) {
    console.error("Product insert error:", err);
    res.status(500).json({ error: "Insert failed" });
  }
});

// ====================== SALES ======================
app.post("/api/sales", async (req, res) => {
  try {
    const { items, payment_method } = req.body;

    for (const item of items) {
      await db.run(
        "INSERT INTO sale_items (product_id, name, unit_price, qty, payment_method) VALUES (?, ?, ?, ?, ?)",
        [item.product_id, item.name, item.unit_price, item.qty, payment_method]
      );
    }

    res.json({ success: true });
  } catch (err) {
    console.error("Sales error:", err);
    res.status(500).json({ error: "Failed to save sale" });
  }
});

// ====================== STATS ======================
app.get("/api/stats", async (req, res) => {
  try {
    const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

    const rows = await db.all(
      "SELECT unit_price, qty FROM sale_items WHERE DATE(timestamp) = DATE('now','localtime')"
    );

    const total = rows.reduce((sum, r) => sum + r.unit_price * r.qty, 0);

    res.json({
      date: today,
      count_sales: rows.length,
      total,
    });
  } catch (err) {
    console.error("Stats error:", err);
    res.status(500).json({ error: "Stats failed" });
  }
});

// ====================== ROOT ======================
app.get("/", (req, res) => {
  res.send("Rockeklubben POS backend is running.");
});

// ====================== START SERVER ======================
app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});
