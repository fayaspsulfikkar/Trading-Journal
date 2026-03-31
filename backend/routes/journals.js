const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/', (req, res) => {
  db.all('SELECT * FROM daily_journals ORDER BY date DESC', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

router.post('/', (req, res) => {
  const { date, morning_notes, news_events, mindset, reflection } = req.body;
  
  if (!date) return res.status(400).json({ error: 'Date is required' });

  db.run(
    `INSERT INTO daily_journals (date, morning_notes, news_events, mindset, reflection) 
     VALUES (?, ?, ?, ?, ?)
     ON CONFLICT(date) DO UPDATE SET 
     morning_notes=excluded.morning_notes,
     news_events=excluded.news_events,
     mindset=excluded.mindset,
     reflection=excluded.reflection`,
    [date, morning_notes, news_events, mindset, reflection],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true });
    }
  );
});

module.exports = router;
