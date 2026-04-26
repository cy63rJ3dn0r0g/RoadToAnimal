import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Moon, Sun, Star, Zap, History, RefreshCcw } from 'lucide-react';

interface SleepTrackerProps {
  onBack: () => void;
  key?: string;
}

export default function SleepTracker({ onBack }: SleepTrackerProps) {
  const [hours, setHours] = useState(8);
  const [quality, setQuality] = useState<'Low' | 'Mid' | 'High'>('Mid');
  const [lastSleep, setLastSleep] = useState<{ hours: number, quality: string } | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('sleep_last_session');
    if (saved) setLastSleep(JSON.parse(saved));

    const handleMessage = async (event: MessageEvent) => {
      if (event.data?.type === 'OAUTH_AUTH_SUCCESS' && event.data.provider === 'google') {
        const { access_token } = event.data.data;
        fetchGoogleSleep(access_token);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const fetchGoogleSleep = async (token: string) => {
    setIsSyncing(true);
    try {
      const response = await fetch('/api/proxy/google/sleep', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ access_token: token })
      });
      const data = await response.json();
      
      // Get most recent sleep session
      if (data.session && data.session.length > 0) {
        const lastSession = data.session[data.session.length - 1];
        const durationMs = parseInt(lastSession.endTimeMillis) - parseInt(lastSession.startTimeMillis);
        const durationHrs = parseFloat((durationMs / (1000 * 60 * 60)).toFixed(1));
        
        const session = { hours: durationHrs, quality: 'High', date: new Date().toLocaleDateString() };
        setLastSleep(session);
        setHours(durationHrs);
        localStorage.setItem('sleep_last_session', JSON.stringify(session));
      }
    } catch (error) {
      console.error('Failed to sync google sleep:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSync = async () => {
    try {
      const response = await fetch('/api/auth/google/url');
      const { url } = await response.json();
      window.open(url, 'google_auth', 'width=600,height=700');
    } catch (error) {
      console.error('Failed to get auth url:', error);
    }
  };

  const logSleep = () => {
    const session = { hours, quality, date: new Date().toLocaleDateString() };
    setLastSleep(session);
    localStorage.setItem('sleep_last_session', JSON.stringify(session));
    // Could add to a history array here
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex flex-col gap-8 w-full"
    >
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="p-4 glass rounded-2xl hover:bg-white/10 transition-all text-white/50 hover:text-cyber-purple">
          <ArrowLeft size={28} />
        </button>
        <h2 className="text-3xl font-black text-white uppercase tracking-tighter italic">
          <span className="text-cyber-purple">Sleep</span> Lab
        </h2>
        <div className="w-10 flex items-center justify-center">
          <button 
            onClick={handleSync}
            disabled={isSyncing}
            className={`p-2 rounded-xl transition-all ${isSyncing ? 'animate-spin text-limegreen' : 'text-white/20 hover:text-limegreen'}`}
            title="Sync with Samsung Health"
          >
            <RefreshCcw size={20} />
          </button>
        </div>
      </div>

      <div className="glass p-10 rounded-[3rem] relative overflow-hidden flex flex-col items-center gap-6">
        <div className="absolute top-0 right-0 p-8 opacity-5 text-cyber-purple">
          <Moon size={120} />
        </div>
        
        <div className="text-center space-y-2">
          <span className="text-[10px] font-black text-cyber-purple uppercase tracking-[0.4em] opacity-60">Recovery Time</span>
          <div className="flex items-baseline justify-center gap-2">
            <span className="text-7xl font-black italic tracking-tighter">{hours}</span>
            <span className="text-white/40 font-bold uppercase italic text-sm">HRS</span>
          </div>
        </div>

        <input 
          type="range" 
          min="4" 
          max="12" 
          step="0.5"
          value={hours}
          onChange={(e) => setHours(parseFloat(e.target.value))}
          className="w-full h-2 bg-white/5 rounded-full appearance-none cursor-pointer accent-cyber-purple transition-all"
        />

        <div className="flex gap-4 w-full">
          {(['Low', 'Mid', 'High'] as const).map(q => (
            <button
              key={q}
              onClick={() => setQuality(q)}
              className={`flex-1 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest border transition-all ${
                quality === q 
                  ? 'bg-cyber-purple text-white border-cyber-purple shadow-[0_0_20px_rgba(157,0,255,0.3)]' 
                  : 'bg-white/5 text-white/30 border-white/5 hover:border-white/20'
              }`}
            >
              {q} Quality
            </button>
          ))}
        </div>

        <button 
          onClick={logSleep}
          className="w-full py-5 bg-limegreen text-black font-black uppercase text-xs tracking-widest rounded-[2rem] hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_10px_30px_rgba(191,255,0,0.2)] mt-4"
        >
          Initialize Sync
        </button>
      </div>

      {lastSleep && (
        <div className="glass-lime p-8 rounded-[2.5rem] flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-limegreen/20 p-3 rounded-full text-limegreen">
              <Sun size={20} />
            </div>
            <div>
              <p className="text-[10px] font-black text-limegreen uppercase tracking-widest opacity-60">Last Session</p>
              <p className="text-white font-bold text-lg">{lastSleep.hours} HRS • {lastSleep.quality} Quality</p>
            </div>
          </div>
          <Star className="text-limegreen animate-pulse" size={24} />
        </div>
      )}

      <div className="glass p-8 rounded-[2.5rem] space-y-4">
        <h4 className="text-[10px] font-black text-white/30 uppercase tracking-[0.4em] px-1 flex items-center gap-4">
          <History size={14} /> Historical Data
        </h4>
        <p className="text-white/20 italic text-xs leading-relaxed">Neural pathways optimized through consistent circadian alignment. Your body is a machine — fuel its rest.</p>
      </div>
    </motion.div>
  );
}
