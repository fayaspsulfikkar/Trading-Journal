import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { AlertTriangle, CheckCircle, Info } from 'lucide-react';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await axios.get('http://localhost:3001/api/trades/analytics');
        setStats(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <div className="text-center mt-20 fade-in">Loading dashboard...</div>;
  if (!stats) return <div className="text-center mt-20 text-red-500">Failed to load data. Ensure backend is running.</div>;

  const currentBalance = stats.balance;
  const todayPnl = stats.todayPnL;
  const dailyLossTarget = 250;
  const currentDailyLoss = todayPnl < 0 ? Math.abs(todayPnl) : 0;
  const dailyLossPercent = Math.min((currentDailyLoss / dailyLossTarget) * 100, 100);

  const phase1Target = 5400;
  const phase1Current = Math.max(0, currentBalance - 5000);
  const phase1Percent = Math.min((phase1Current / 400) * 100, 100);

  let statusBadge = { text: 'SAFE', color: 'bg-success/20 text-success border-success/30', icon: CheckCircle };
  if (currentDailyLoss >= 200) {
    statusBadge = { text: 'DANGER', color: 'bg-danger/20 text-danger border-danger/30', icon: AlertTriangle };
  } else if (currentDailyLoss >= 100 || stats.todayCount >= 2) {
    statusBadge = { text: 'CAUTION', color: 'bg-warning/20 text-warning border-warning/30', icon: Info };
  }

  return (
    <div className="space-y-6 fade-in">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Trading Dashboard</h1>
          <p className="text-slate-400 text-sm">EurUsd Demo - The 5%ers Phase 1</p>
        </div>
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${statusBadge.color}`}>
          <statusBadge.icon className="w-4 h-4" />
          <span className="text-sm font-semibold tracking-wide">{statusBadge.text}</span>
        </div>
      </header>

      {/* Main Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Balance */}
        <div className="card text-center sm:text-left">
          <p className="label">Current Balance</p>
          <p className="text-4xl font-bold tracking-tight text-white mt-2">
            ${currentBalance.toFixed(2)}
          </p>
          <p className="text-sm text-slate-400 mt-1">Starting: $5,000.00</p>
        </div>

        {/* Today P&L */}
        <div className="card text-center sm:text-left">
          <p className="label">Today's P&L</p>
          <p className={`text-4xl font-bold tracking-tight mt-2 ${todayPnl >= 0 ? 'text-success' : 'text-danger'}`}>
            {todayPnl >= 0 ? '+' : ''}${todayPnl.toFixed(2)}
          </p>
          <p className="text-sm text-slate-400 mt-1">
            Trades Today: <span className={stats.todayCount >= 3 ? 'text-danger font-bold' : 'text-white'}>{stats.todayCount} / 3</span>
          </p>
        </div>

        {/* Win Rate */}
        <div className="card text-center sm:text-left sm:col-span-2 lg:col-span-1">
          <p className="label">All-Time Win Rate</p>
          <div className="flex items-end justify-center sm:justify-start gap-2 mt-2">
            <p className="text-4xl font-bold tracking-tight text-white">{stats.winRate.toFixed(1)}%</p>
          </div>
          <p className="text-sm text-slate-400 mt-1">Profit Factor: {stats.profitFactor.toFixed(2)}</p>
        </div>
      </div>

      {/* Progress Bars */}
      <div className="card space-y-6">
        <div>
          <div className="flex justify-between items-end mb-2">
            <p className="label !mb-0">Daily Loss Limit</p>
            <p className="text-sm font-medium text-slate-300">${currentDailyLoss.toFixed(2)} / $250.00</p>
          </div>
          <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-500 rounded-full ${dailyLossPercent > 80 ? 'bg-danger' : dailyLossPercent > 50 ? 'bg-warning' : 'bg-primary'}`}
              style={{ width: `${dailyLossPercent}%` }}
            />
          </div>
        </div>

        <div>
          <div className="flex justify-between items-end mb-2">
            <p className="label !mb-0">Phase 1 Target</p>
            <p className="text-sm font-medium text-slate-300">${phase1Current.toFixed(2)} / $400.00</p>
          </div>
          <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-success transition-all duration-500 rounded-full"
              style={{ width: `${phase1Percent}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
