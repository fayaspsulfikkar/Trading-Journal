import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Target, TrendingUp, TrendingDown, Activity, Award } from 'lucide-react';

export default function Progress() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await axios.get('http://localhost:3001/api/trades/analytics');
        // Format the chart dates
        const formattedChart = (data.chartData || []).map(d => ({
          ...d,
          formattedDate: new Date(d.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
        }));
        setStats({...data, chartData: formattedChart});
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <div className="text-center mt-20 fade-in">Loading analytics...</div>;
  if (!stats) return <div className="text-center mt-20 text-red-500">Failed to load data.</div>;

  return (
    <div className="space-y-6 fade-in min-h-screen">
      <h1 className="text-2xl font-bold text-slate-100">Performance Progress</h1>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card text-center">
          <Target className="w-6 h-6 mx-auto mb-2 text-primary" />
          <p className="label">Win Rate (All)</p>
          <p className="text-xl font-bold text-white">{stats.winRate.toFixed(1)}%</p>
        </div>
        <div className="card text-center">
          <Activity className="w-6 h-6 mx-auto mb-2 text-purple-500" />
          <p className="label">Profit Factor</p>
          <p className="text-xl font-bold text-white">{stats.profitFactor.toFixed(2)}</p>
        </div>
        <div className="card text-center border-success/30">
          <TrendingUp className="w-6 h-6 mx-auto mb-2 text-success" />
          <p className="label">Best Day</p>
          <p className="text-xl font-bold text-success">+${stats.bestDayPnL.toFixed(2)}</p>
        </div>
        <div className="card text-center border-danger/30">
          <TrendingDown className="w-6 h-6 mx-auto mb-2 text-danger" />
          <p className="label">Worst Day</p>
          <p className="text-xl font-bold text-danger">-${Math.abs(stats.worstDayPnL).toFixed(2)}</p>
        </div>
      </div>

      <div className="card h-96 relative pb-10">
        <div className="flex justify-between items-center mb-6">
          <h2 className="font-semibold text-slate-100 flex items-center gap-2"><Award className="w-5 h-5 text-primary"/> Running Balance</h2>
          <div className="text-sm font-bold text-primary">Target: $5,400</div>
        </div>
        <div className="absolute inset-0 top-16 right-4 left-4 bottom-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={stats.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
              <XAxis dataKey="formattedDate" stroke="#94a3b8" fontSize={12} tickMargin={10} />
              <YAxis stroke="#94a3b8" fontSize={12} domain={['dataMin - 100', 'dataMax + 100']} tickFormatter={val => "$" + val} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '8px', color: '#f8fafc' }}
                itemStyle={{ color: '#3b82f6', fontWeight: 'bold' }}
                formatter={(value) => ['$' + value.toFixed(2), 'Balance']}
                labelStyle={{ color: '#94a3b8', marginBottom: '4px' }}
              />
              <ReferenceLine y={5000} stroke="#64748b" strokeDasharray="3 3" opacity={0.5} label={{ position: 'top', value: 'Start', fill: '#64748b', fontSize: 12 }} />
              <ReferenceLine y={5400} stroke="#22c55e" strokeDasharray="3 3" opacity={0.5} label={{ position: 'top', value: 'Phase 1 Target', fill: '#22c55e', fontSize: 12 }} />
              <ReferenceLine y={4500} stroke="#ef4444" strokeDasharray="3 3" opacity={0.5} label={{ position: 'top', value: 'Max Loss Limit', fill: '#ef4444', fontSize: 12 }} />
              <Line 
                type="monotone" 
                dataKey="balance" 
                stroke="#3b82f6" 
                strokeWidth={3}
                dot={{ r: 4, fill: '#1e293b', strokeWidth: 2 }}
                activeDot={{ r: 6, fill: '#3b82f6', stroke: '#fff' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
