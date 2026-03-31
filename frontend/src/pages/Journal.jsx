import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Save, Calendar, CheckCircle } from 'lucide-react';

export default function Journal() {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [morning, setMorning] = useState('');
  const [news, setNews] = useState('');
  const [mindset, setMindset] = useState('');
  const [reflection, setReflection] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    // Fetch journal for selected date
    const fetchJournal = async () => {
      try {
        const { data } = await axios.get('http://localhost:3001/api/journals');
        const entry = data.find(j => j.date === date);
        if (entry) {
          setMorning(entry.morning_notes || '');
          setNews(entry.news_events || '');
          setMindset(entry.mindset || '');
          setReflection(entry.reflection || '');
        } else {
          setMorning(''); setNews(''); setMindset(''); setReflection('');
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchJournal();
    setSaveSuccess(false);
  }, [date]);

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post('http://localhost:3001/api/journals', {
        date,
        morning_notes: morning,
        news_events: news,
        mindset,
        reflection
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto fade-in min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
          <Calendar className="w-6 h-6 text-primary" /> Daily Journal
        </h1>
        <input 
          type="date" 
          value={date} 
          onChange={(e) => setDate(e.target.value)}
          className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-slate-100 outline-none focus:border-primary"
        />
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="card space-y-4">
            <h2 className="font-semibold text-primary border-b border-slate-700/50 pb-2">Pre-Market Routine</h2>
            
            <div>
              <label className="label">Morning Market Notes (Bias/Levels)</label>
              <textarea 
                rows="4" 
                className="input resize-none"
                value={morning} 
                onChange={e => setMorning(e.target.value)}
                placeholder="Where is liquidity? HTF trend?"
              />
            </div>

            <div>
              <label className="label text-warning">News Events to Avoid</label>
              <textarea 
                rows="2" 
                className="input resize-none border-warning/30 focus:ring-warning/50"
                value={news} 
                onChange={e => setNews(e.target.value)}
                placeholder="e.g. CPI at 8:30am EST"
              />
            </div>

            <div>
              <label className="label">Mindset Check</label>
              <textarea 
                rows="2" 
                className="input resize-none"
                value={mindset} 
                onChange={e => setMindset(e.target.value)}
                placeholder="How are you feeling today?"
              />
            </div>
          </div>

          <div className="card">
            <h2 className="font-semibold text-purple-400 border-b border-slate-700/50 pb-2 mb-4">Post-Market Reflection</h2>
            <div className="h-full pb-10">
              <label className="label">End of Day Reflection</label>
              <textarea 
                rows="10" 
                className="input resize-none h-full"
                value={reflection} 
                onChange={e => setReflection(e.target.value)}
                placeholder="Did you follow the rules? Respect the 1:2 RR? Did you overtrade?"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end items-center gap-4">
          {saveSuccess && <span className="text-success text-sm flex items-center gap-1 font-medium"><CheckCircle className="w-4 h-4" /> Saved Successfully</span>}
          <button type="submit" disabled={loading} className="btn btn-primary flex items-center gap-2">
            <Save className="w-4 h-4" />
            {loading ? 'Saving...' : 'Save Journal Entry'}
          </button>
        </div>
      </form>
    </div>
  );
}
