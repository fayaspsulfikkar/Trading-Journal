import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { AlertCircle, BrainCircuit, Check, X } from 'lucide-react';

export default function LogTrade() {
  const [direction, setDirection] = useState('Buy');
  const [entry, setEntry] = useState('');
  const [sl, setSl] = useState('');
  const [tp, setTp] = useState('');
  const [exit, setExit] = useState('');
  const [reason, setReason] = useState('');
  const [emotion, setEmotion] = useState('Calm');
  
  const [rr, setRr] = useState(0);
  const [pnl, setPnl] = useState(0);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    // Auto calculate RR and estimated PnL
    const e = parseFloat(entry);
    const s = parseFloat(sl);
    const t = parseFloat(tp);
    const ex = parseFloat(exit);
    
    if (!isNaN(e) && !isNaN(s) && !isNaN(t)) {
      const risk = Math.abs(e - s);
      const reward = Math.abs(t - e);
      setRr(risk > 0 ? reward / risk : 0);
    } else {
      setRr(0);
    }

    if (!isNaN(e) && !isNaN(ex)) {
      const diff = direction === 'Buy' ? ex - e : e - ex;
      // standard 1 pip = 0.0001, pip value for 0.01 lot is $0.10
      setPnl(diff * 100000); 
    } else {
      setPnl(0);
    }
  }, [direction, entry, sl, tp, exit]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rr < 2) {
      setError('Minimum Risk:Reward of 1:2 is required.');
      return;
    }
    
    setLoading(true);
    setError(null);
    setFeedback(null);
    
    try {
      const { data } = await axios.post('http://localhost:3001/api/trades', {
        direction,
        entry: parseFloat(entry),
        stop_loss: parseFloat(sl),
        take_profit: parseFloat(tp),
        exit_price: parseFloat(exit),
        reason,
        emotion
      });
      setFeedback(data.ai_feedback);
      
      // Clear form
      setEntry(''); setSl(''); setTp(''); setExit(''); setReason(''); setEmotion('Calm');
    } catch (err) {
      setError(err.response?.data?.error || 'Error logging trade');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto fade-in h-auto min-h-screen">
      <h1 className="text-2xl font-bold mb-6 text-slate-100">Log a Trade</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 card">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-danger/20 border border-danger/30 text-danger px-4 py-3 rounded-lg flex items-center gap-2">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <p className="text-sm">{error}</p>
              </div>
            )}
            
            {/* Direction Toggle */}
            <div>
              <p className="label">Direction</p>
              <div className="flex bg-slate-900 rounded-lg p-1 border border-slate-700">
                <button
                  type="button"
                  onClick={() => setDirection('Buy')}
                  className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all ${direction === 'Buy' ? 'bg-success text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
                >
                  Buy
                </button>
                <button
                  type="button"
                  onClick={() => setDirection('Sell')}
                  className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all ${direction === 'Sell' ? 'bg-danger text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
                >
                  Sell
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Entry Price</label>
                <input type="number" step="0.00001" required className="input" value={entry} onChange={e => setEntry(e.target.value)} />
              </div>
              <div>
                <label className="label">Exit Price</label>
                <input type="number" step="0.00001" required className="input" value={exit} onChange={e => setExit(e.target.value)} />
              </div>
              <div>
                <label className="label">Stop Loss</label>
                <input type="number" step="0.00001" required className="input" value={sl} onChange={e => setSl(e.target.value)} />
              </div>
              <div>
                <label className="label">Take Profit</label>
                <input type="number" step="0.00001" required className="input" value={tp} onChange={e => setTp(e.target.value)} />
              </div>
            </div>

            <div>
              <label className="label">Entry Reason</label>
              <textarea rows="3" required className="input resize-none" placeholder="Why did you take this trade?" value={reason} onChange={e => setReason(e.target.value)}></textarea>
            </div>

            <div>
              <label className="label">Emotional State</label>
              <select className="input" value={emotion} onChange={e => setEmotion(e.target.value)}>
                <option value="Calm">Calm 🌊</option>
                <option value="Anxious">Anxious 😬</option>
                <option value="Excited">Excited 🤩</option>
                <option value="Revenge">Revenge 😡</option>
              </select>
            </div>

            <button type="submit" disabled={loading} className="btn btn-primary w-full py-3 flex justify-center items-center gap-2">
              {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Submit Trade & Get AI Feedback'}
            </button>
          </form>
        </div>

        {/* Sidebar: Calculation & Feedback */}
        <div className="space-y-6">
          <div className="card bg-slate-900 border-none shadow-inner">
            <h3 className="font-semibold text-slate-200 mb-4">Trade Auto-Calcs</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                <span className="text-sm text-slate-400">Risk:Reward</span>
                <span className={`font-mono text-lg font-bold ${rr >= 2 ? 'text-success' : rr > 0 ? 'text-danger' : 'text-slate-300'}`}>
                  1 : {rr.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-400">Est. P&L</span>
                <span className={`font-mono text-lg font-bold ${pnl >= 0 ? 'text-success' : 'text-danger'}`}>
                  {pnl >= 0 ? '+' : ''}${pnl.toFixed(2)}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-2 italic text-center">Calculated at 0.01 lot size</p>
            </div>
          </div>

          {feedback && (
            <div className="card bg-gradient-to-br from-primary/10 to-transparent border-primary/20 relative animate-in slide-in-from-right-4">
              <div className="absolute -top-3 -right-3 bg-primary text-white p-2 rounded-full shadow-lg">
                <BrainCircuit className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-primary mb-3">AI Coach Feedback</h3>
              
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-2">
                  <span className="font-bold text-2xl text-slate-100 flex-shrink-0 w-8">{feedback.letter_grade}</span>
                  <div className="flex-1 space-y-2 text-slate-300">
                    <p><strong>Logic:</strong> {feedback.entry_logic_rating}</p>
                    <p><strong>R:R:</strong> {feedback.risk_reward_assessment}</p>
                    <p><strong>Emotion:</strong> {feedback.emotional_state_flag}</p>
                    <div className="mt-3 p-3 bg-slate-800/50 rounded-lg">
                      <p className="flex items-center gap-2 text-success mb-1"><Check className="w-4 h-4"/> <span>{feedback.one_thing_done_well}</span></p>
                      <p className="flex items-center gap-2 text-warning"><X className="w-4 h-4"/> <span>{feedback.one_thing_to_improve}</span></p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
