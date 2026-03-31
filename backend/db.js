const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'trading_journal.db');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database', err.message);
  } else {
    console.log('Connected to the SQLite database.');
    
    // Create Trades table
    db.run(`CREATE TABLE IF NOT EXISTS trades (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      direction TEXT CHECK(direction IN ('Buy', 'Sell')) NOT NULL,
      entry REAL NOT NULL,
      stop_loss REAL NOT NULL,
      take_profit REAL NOT NULL,
      exit_price REAL NOT NULL,
      pnl REAL NOT NULL,
      rr REAL NOT NULL,
      reason TEXT,
      emotion TEXT,
      ai_feedback TEXT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Create Daily Journals table
    db.run(`CREATE TABLE IF NOT EXISTS daily_journals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT UNIQUE NOT NULL,
      morning_notes TEXT,
      news_events TEXT,
      mindset TEXT,
      reflection TEXT
    )`);
  }
});

module.exports = db;
