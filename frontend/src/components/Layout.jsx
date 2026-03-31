import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Home, PlusCircle, History, BarChart2, BookOpen, AlertTriangle } from 'lucide-react';
import Dashboard from '../pages/Dashboard';
import LogTrade from '../pages/LogTrade';
import TradeHistory from '../pages/History';
import Progress from '../pages/Progress';
import Journal from '../pages/Journal';
import axios from 'axios';

const NavLink = ({ to, icon: Icon, label }) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  return (
    <Link
      to={to}
      className={`flex flex-col items-center justify-center w-full py-3 text-xs sm:text-sm transition-colors ${
        isActive ? 'text-primary font-semibold' : 'text-slate-400 hover:text-slate-200'
      }`}
    >
      <Icon className={`w-6 h-6 mb-1 ${isActive ? 'stroke-[2.5px]' : ''}`} />
      <span>{label}</span>
      {isActive && <div className="absolute top-0 w-12 h-1 bg-primary rounded-b-md hidden sm:block"></div>}
    </Link>
  );
};

export default function Layout() {
  const [stats, setStats] = useState(null);

  // Fetch stats periodically for the global warnings
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await axios.get('http://localhost:3001/api/trades/analytics');
        setStats(data);
      } catch (err) {
        console.error("Failed to fetch stats", err);
      }
    };
    fetchStats();
    const interval = setInterval(fetchStats, 5000);
    return () => clearInterval(interval);
  }, []);

  const dailyLoss = stats ? Math.abs(Math.min(0, stats.todayPnL)) : 0;
  const showYellowWarning = dailyLoss >= 200 && dailyLoss < 250;
  const showRedStop = dailyLoss >= 250;
  const challengeFailed = stats && stats.balance <= 4500;
  const strategyWarning = stats && stats.winRateLast10 < 40 && stats.chartData?.length >= 10;

  return (
    <div className="flex flex-col min-h-screen pb-20 sm:pb-0 sm:flex-row">
      {/* Mobile Top Warnings */}
      <div className="fixed top-0 left-0 right-0 z-50 flex flex-col pointer-events-none">
        {challengeFailed && (
          <div className="bg-red-600/90 backdrop-blur text-white text-center py-2 px-4 shadow-lg font-bold animate-pulse pointer-events-auto">
            CHALLENGE FAILED: Account balance hit $4,500 limit.
          </div>
        )}
        {!challengeFailed && showRedStop && (
          <div className="bg-red-500/90 backdrop-blur text-white text-center py-2 px-4 shadow-lg font-bold pointer-events-auto">
            STOP TRADING: Daily Loss limit ($250) reached!
          </div>
        )}
        {!challengeFailed && !showRedStop && showYellowWarning && (
          <div className="bg-yellow-500/90 backdrop-blur text-slate-900 text-center py-1.5 px-4 shadow-lg font-medium border-b border-yellow-600 pointer-events-auto">
            WARNING: Approaching daily loss limit (${dailyLoss.toFixed(2)} / $250)
          </div>
        )}
        {strategyWarning && (
          <div className="bg-orange-500/90 backdrop-blur text-white text-center py-1.5 px-4 shadow-lg font-medium pointer-events-auto">
            STRATEGY WARNING: Win rate dropped below 40% over last 10 trades.
          </div>
        )}
      </div>

      {/* Sidebar for Desktop / Bottom Nav for Mobile */}
      <nav className="fixed bottom-0 left-0 right-0 bg-darkCard border-t border-slate-800 z-40 sm:relative sm:w-24 sm:border-t-0 sm:border-r sm:flex sm:flex-col sm:pt-6 pb-safe">
        <div className="flex sm:flex-col sm:h-full sm:space-y-6 justify-around sm:justify-start px-2 sm:px-0">
          <NavLink to="/" icon={Home} label="Home" />
          <NavLink to="/log" icon={PlusCircle} label="Log" />
          <NavLink to="/history" icon={History} label="History" />
          <NavLink to="/progress" icon={BarChart2} label="Stats" />
          <NavLink to="/journal" icon={BookOpen} label="Journal" />
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-5xl mx-auto p-4 sm:p-8 pt-16 sm:pt-8 min-h-screen">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/log" element={<LogTrade />} />
          <Route path="/history" element={<TradeHistory />} />
          <Route path="/progress" element={<Progress />} />
          <Route path="/journal" element={<Journal />} />
        </Routes>
      </main>
    </div>
  );
}
