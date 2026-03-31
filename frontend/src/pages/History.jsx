import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ChevronDown, ChevronUp, BrainCircuit } from 'lucide-react';

export default function History() {
  const [trades, setTrades] = useState([]);
  const [filter, setFilter] = useState('All'); // All, Win, Loss
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    const fetchTrades = async () => {
      try {
        const { data } = await axios.get('http://localhost:3001/api/trades');
        setTrades(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchTrades();
  }, []);

  const filteredTrades = trades.filter(t => {
    if (filter === 'Win') return t.pnl > 0;
    if (filter === 'Loss') return t.pnl <= 0;
    return true;
  });

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="max-w-4xl mx-auto fade-in min-h-screen">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold text-slate-100">Trade History</h1>
        
        <div className="flex bg-slate-900 rounded-lg p-1 border border-slate-700">
          {['All', 'Win', 'Loss'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-all ${
                filter === f 
                  ? 'bg-slate-700 text-white shadow' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {filteredTrades.length === 0 ? (
          <div className="text-center py-10 text-slate-400">No trades found.</div>
        ) : (
          filteredTrades.map(trade => {
            const isWin = trade.pnl > 0;
            const isExpanded = expandedId === trade.id;
            const feedback = trade.ai_feedback ? JSON.parse(trade.ai_feedback) : null;
            
            return (
              <div key={trade.id} className="card p-0 overflow-hidden transition-all duration-300">
                {/* Header Row */}
                <div 
                  className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-800/50 transition-colors"
                  onClick={() => toggleExpand(trade.id)}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${
                      isWin ? 'bg-success/20 text-success' : 'bg-danger/20 text-danger'
                    }`}>
                      {trade.direction === 'Buy' ? 'B' : 'S'}
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-200">EURUSD</h3>
                      <p className="text-xs text-slate-400">{new Date(trade.timestamp).toLocaleString()}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className={`font-mono font-bold ${isWin ? 'text-success' : 'text-danger'}`}>
                        {isWin ? '+' : ''}${trade.pnl.toFixed(2)}
                      </p>
                      <p className="text-xs text-slate-400">1:{trade.rr.toFixed(1)} RR</p>
                    </div>
                    {isExpanded ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="p-4 border-t border-slate-700/50 bg-slate-900/50">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6 text-sm">
                      <div><span className="text-slate-500">Entry:</span> <span className="font-mono text-slate-300">{trade.entry}</span></div>
                      <div><span className="text-slate-500">Exit:</span> <span className="font-mono text-slate-300">{trade.exit_price}</span></div>
                      <div><span className="text-slate-500">SL:</span> <span className="font-mono text-slate-300">{trade.stop_loss}</span></div>
                      <div><span className="text-slate-500">TP:</span> <span className="font-mono text-slate-300">{trade.take_profit}</span></div>
                    </div>

                    <div className="mb-4">
                      <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Reason & Emotion</h4>
                      <p className="text-sm text-slate-300">{trade.reason}</p>
                      <span className="inline-block px-2 py-1 mt-2 text-xs font-medium bg-slate-800 text-slate-300 rounded-md">
                        Emotion: {trade.emotion}
                      </span>
                    </div>

                    {feedback && (
                      <div className="mt-4 p-4 border border-primary/20 bg-primary/5 rounded-lg">
                        <div className="flex items-center gap-2 mb-3">
                          <BrainCircuit className="w-4 h-4 text-primary" />
                          <h4 className="font-semibold text-primary">AI Coach Feedback - Grade {feedback.letter_grade}</h4>
                        </div>
                        <ul className="space-y-2 text-sm text-slate-300 list-disc pl-4">
                          <li><strong>Logic:</strong> {feedback.entry_logic_rating}</li>
                          <li><strong>R:R:</strong> {feedback.risk_reward_assessment}</li>
                          <li><strong>Emotion:</strong> {feedback.emotional_state_flag}</li>
                          <li className="text-success"><strong>Well Done:</strong> {feedback.one_thing_done_well}</li>
                          <li className="text-warning"><strong>Improve:</strong> {feedback.one_thing_to_improve}</li>
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
