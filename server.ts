import "dotenv/config";
import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";

const db = new Database("expenses.db");

// Initialize database
db.exec(`
  CREATE TABLE IF NOT EXISTS expenses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT DEFAULT (date('now')),
    item TEXT,
    amount REAL,
    category TEXT,
    purpose TEXT
  );
  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT
  );
  INSERT OR IGNORE INTO settings (key, value) VALUES ('total_money', '0');
`);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "10mb" }));

  // API Routes
  app.get("/api/expenses", (req, res) => {
    const month = (req.query.month as string) || new Date().toISOString().slice(0, 7);
    const expenses = db
      .prepare("SELECT * FROM expenses WHERE date LIKE ? ORDER BY date DESC")
      .all(`${month}%`);
    res.json(expenses);
  });

  app.post("/api/expenses", (req, res) => {
    const { item, amount, category, purpose, date } = req.body;
    const info = db
      .prepare("INSERT INTO expenses (item, amount, category, purpose, date) VALUES (?, ?, ?, ?, ?)")
      .run(item, amount, category, purpose, date || new Date().toISOString().slice(0, 10));
    res.json({ id: info.lastInsertRowid });
  });

  app.put("/api/expenses/:id", (req, res) => {
    const { item, amount, category, purpose, date } = req.body;
    const id = req.params.id;
    const existing = db.prepare("SELECT date FROM expenses WHERE id = ?").get(id) as { date: string } | undefined;
    const newDate = date && String(date).trim() ? String(date).trim().slice(0, 10) : existing?.date ?? new Date().toISOString().slice(0, 10);
    db.prepare(
      "UPDATE expenses SET item = ?, amount = ?, category = ?, purpose = ?, date = ? WHERE id = ?"
    ).run(item, amount, category, purpose ?? "", newDate, id);
    res.json({ success: true });
  });

  app.delete("/api/expenses/:id", (req, res) => {
    db.prepare("DELETE FROM expenses WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  app.get("/api/budget", (req, res) => {
    const row = db.prepare("SELECT value FROM settings WHERE key = 'total_money'").get() as {
      value: string;
    } | undefined;
    res.json({ total_money: parseFloat(row?.value || "0") });
  });

  app.post("/api/budget", (req, res) => {
    const { total_money } = req.body;
    db.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES ('total_money', ?)").run(
      total_money.toString()
    );
    res.json({ success: true });
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(process.cwd(), "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(process.cwd(), "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
