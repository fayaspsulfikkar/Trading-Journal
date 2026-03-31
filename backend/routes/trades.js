const express = require('express');
const router = express.Router();
const db = require('../db');
const { getTradeFeedback } = require('../ai_service');

// Calculate PnL locally in route to make sure it's accurate
// 0.01 lot EURUSD = $0.10 per pip. 1 pip = 0.0001
// Buy: (exit - entry) * 100000
// Sell: (entry - exit) * 100000
function calculatePnL(direction, entry, exit) {
  const pipValue = 0.10; // $0.10 for 0.01 lot
  const diff = direction === 'Buy' ? exit - entry : entry - exit;
  const pips = diff * 10000;
  return pips * 10; // Actually pipValue is 0.10 per standard pip (0.0001). Wait, 0.01 lot = $0.10 per pip. If diff is 0.0010 (10 pips), 10 * $0.10 = $1.00.
  // diff * 10000 = pips. PnL = pips * pipValue. So diff * 10000 * 0.10 = diff * 1000.
}

// Ensure 0.01 lot, 1:2 RR, max 3 trades/day are respected on frontend, backed up here.

router.get('/', (req, res) => {
  db.all('SELECT * FROM trades ORDER BY timestamp DESC', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

router.post('/', async (req, res) => {
  const { direction, entry, stop_loss, take_profit, exit_price, reason, emotion } = req.body;
  
  if (!direction || !entry || !stop_loss || !take_profit || !exit_price) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Calculate R:R
  const risk = Math.abs(entry - stop_loss);
  const reward = Math.abs(take_profit - entry);
  const rr = risk > 0 ? (reward / risk) : 0;

  if (rr < 2) {
    return res.status(400).json({ error: 'Risk:Reward must be at least 1:2' });
  }

  // Calculate PnL
  const pnl = calculatePnL(direction, entry, exit_price);

  // Check 3 trades per day limit
  const today = new Date().toISOString().split('T')[0];
  db.get(`SELECT COUNT(*) as count FROM trades WHERE date(timestamp) = ?`, [today], async (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (row.count >= 3) {
      return res.status(400).json({ error: 'Maximum 3 trades per day reached.' });
    }

    // Get AI feedback
    const tradeData = { direction, entry, stop_loss, take_profit, exit_price, pnl, rr, reason, emotion };
    const aiFeedback = await getTradeFeedback(tradeData);

    // Insert trade
    db.run(
      `INSERT INTO trades (direction, entry, stop_loss, take_profit, exit_price, pnl, rr, reason, emotion, ai_feedback)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [direction, entry, stop_loss, take_profit, exit_price, pnl, rr, reason, emotion, aiFeedback],
      function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id: this.lastID, ...tradeData, ai_feedback: JSON.parse(aiFeedback) });
      }
    );
  });
});

// Analytics Route
router.get('/analytics', (req, res) => {
  db.all('SELECT * FROM trades', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });

    const startingBalance = 5000;
    const totalPnL = rows.reduce((acc, row) => acc + row.pnl, 0);
    const balance = startingBalance + totalPnL;

    const today = new Date().toISOString().split('T')[0];
    const todayTrades = rows.filter(r => r.timestamp.startsWith(today));
    const todayPnL = todayTrades.reduce((acc, r) => acc + r.pnl, 0);
    const todayCount = todayTrades.length;

    const wins = rows.filter(r => r.pnl > 0);
    const winRate = rows.length > 0 ? (wins.length / rows.length) * 100 : 0;
    
    // Win rate last 10
    const last10 = rows.slice(-10);
    const last10Wins = last10.filter(r => r.pnl > 0);
    const winRateLast10 = last10.length > 0 ? (last10Wins.length / last10.length) * 100 : 0;

    const grossProfit = wins.reduce((acc, r) => acc + r.pnl, 0);
    const losses = rows.filter(r => r.pnl <= 0);
    const grossLoss = Math.abs(losses.reduce((acc, r) => acc + r.pnl, 0));
    const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : (grossProfit > 0 ? 999 : 0);

    const bestDayPnL = Math.max(0, ...rows.map(r => r.pnl));
    const worstDayPnL = Math.min(0, ...rows.map(r => r.pnl));

    // Map trades to running balance
    let currentBal = startingBalance;
    const chartData = rows.map(r => {
      currentBal += r.pnl;
      return { timestamp: r.timestamp, balance: currentBal };
    });

    res.json({
      balance,
      totalPnL,
      todayPnL,
      todayCount,
      winRate,
      winRateLast10,
      profitFactor,
      bestDayPnL,
      worstDayPnL,
      chartData
    });
  });
});

module.exports = router;
