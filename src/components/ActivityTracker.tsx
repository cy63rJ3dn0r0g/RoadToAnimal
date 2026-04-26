import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Zap, Flame, Footprints, TrendingUp, RefreshCcw } from 'lucide-react';

interface ActivityTrackerProps {
  onBack: () => void;
  key?: string;
}

export default function ActivityTracker({ onBack }: ActivityTrackerProps) {
  const [steps, setSteps] = useState(0);
  const [goal] = useState(10000);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('activity_steps');
    const today = new Date().toLocaleDateString();
    const lastDate = localStorage.getItem('activity_last_date');

    if (lastDate === today) {
      if (saved) setSteps(parseInt(saved));
    } else {
      localStorage.setItem('activity_last_date', today);
      localStorage.setItem('activity_steps', '0');
    }

    const handleMessage = async (event: MessageEvent) => {
      if (event.data?.type === 'OAUTH_AUTH_SUCCESS' && event.data.provider === 'strava') {
        const { access_token } = event.data.data;
        fetchStravaActivities(access_token);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const fetchStravaActivities = async (token: string) => {
    setIsSyncing(true);
    try {
      const response = await fetch('/api/proxy/strava/activities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ access_token: token })
      });
      const data = await response.json();
      
      // Calculate total steps today from strava (approx from distance or if they have steps)
      // Strava doesn't always have steps, but we can sync the calories or distance
      // For this demo, let's say we adjust steps based on distance
      if (Array.isArray(data) && data.length > 0) {
        const todayStr = new Date().toISOString().split('T')[0];
        const todayActivities = data.filter((a: any) => a.start_date.startsWith(todayStr));
        const totalDistance = todayActivities.reduce((acc: number, cur: any) => acc + cur.distance, 0);
        
        if (totalDistance > 0) {
          const newSteps = Math.round(totalDistance / 0.8); // 0.8m per step
          setSteps(prev => Math.max(prev, newSteps));
        }
      }
    } catch (error) {
      console.error('Failed to sync strava:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSync = async () => {
    try {
      const response = await fetch('/api/auth/strava/url');
      const { url } = await response.json();
      window.open(url, 'strava_auth', 'width=600,height=700');
    } catch (error) {
      console.error('Failed to get auth url:', error);
    }
  };

  useEffect(() => {
    localStorage.setItem('activity_steps', steps.toString());
  }, [steps]);

  const calories = (steps * 0.04).toFixed(1);
  const distance = (steps * 0.0008).toFixed(2);
  const progress = Math.min((steps / goal) * 100, 100);

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
          <span className="text-cyber-purple">Activity</span> Hub
        </h2>
        <div className="w-10 flex items-center justify-center">
          <button 
            onClick={handleSync}
            disabled={isSyncing}
            className={`p-2 rounded-xl transition-all ${isSyncing ? 'animate-spin text-limegreen' : 'text-white/20 hover:text-limegreen'}`}
            title="Sync with Strava"
          >
            <RefreshCcw size={20} />
          </button>
        </div>
      </div>

      <div className="glass p-10 rounded-[3rem] relative overflow-hidden flex flex-col items-center gap-8">
        <div className="absolute top-0 right-0 p-8 opacity-5 text-limegreen">
          <TrendingUp size={120} />
        </div>

        <div className="relative w-64 h-64 flex items-center justify-center">
          <svg className="w-full h-full -rotate-90">
            <circle
              cx="128"
              cy="128"
              r="110"
              className="stroke-white/5"
              strokeWidth="12"
              fill="transparent"
            />
            <motion.circle
              cx="128"
              cy="128"
              r="110"
              className="stroke-limegreen"
              strokeWidth="12"
              fill="transparent"
              strokeDasharray="691"
              initial={{ strokeDashoffset: 691 }}
              animate={{ strokeDashoffset: 691 - (691 * progress) / 100 }}
              transition={{ duration: 2, ease: "circOut" }}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-5xl font-black italic tracking-tighter font-mono">{steps}</span>
            <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] font-sans">Steps / {goal}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 w-full">
          <div className="glass bg-white/5 p-6 rounded-3xl flex flex-col items-center gap-2">
            <Flame size={20} className="text-orange-500" />
            <span className="text-2xl font-black italic tracking-tighter">{calories}</span>
            <span className="text-[9px] font-black text-white/30 uppercase tracking-widest">Kcal Burned</span>
          </div>
          <div className="glass bg-white/5 p-6 rounded-3xl flex flex-col items-center gap-2">
            <Zap size={20} className="text-blue-400" />
            <span className="text-2xl font-black italic tracking-tighter">{distance}</span>
            <span className="text-[9px] font-black text-white/30 uppercase tracking-widest">KM Covered</span>
          </div>
        </div>

        <div className="flex gap-4 w-full">
          {[100, 500, 1000].map(val => (
            <button
              key={val}
              onClick={() => setSteps(prev => prev + val)}
              className="flex-1 py-4 glass border-white/10 rounded-2xl flex flex-col items-center gap-1 hover:glass-lime transition-all active:scale-95"
            >
              <Footprints size={16} className="text-white/40" />
              <span className="text-[10px] font-black">+{val}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="glass p-8 rounded-[2.5rem] bg-gradient-to-br from-white/5 to-transparent">
        <h4 className="text-[10px] font-black text-white/30 uppercase tracking-[0.4em] mb-4">Kinetic Insights</h4>
        <p className="text-white/50 text-sm leading-relaxed">Neural synchrony detected at current movement velocity. Keep pushing beyond biological limitations.</p>
      </div>
    </motion.div>
  );
}
