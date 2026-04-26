import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Droplets, Plus, Bell, BellOff, Volume2 } from 'lucide-react';

interface WaterTrackerProps {
  onBack: () => void;
  key?: string;
}

const VOLUMES = [200, 350, 500, 1000];

export default function WaterTracker({ onBack }: WaterTrackerProps) {
  const [intake, setIntake] = useState(0);
  const [goal, setGoal] = useState(2500); // 2.5L default
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('water_intake');
    const today = new Date().toLocaleDateString();
    const lastDate = localStorage.getItem('water_last_date');

    if (lastDate === today) {
      if (saved) setIntake(parseInt(saved));
    } else {
      localStorage.setItem('water_last_date', today);
      localStorage.setItem('water_intake', '0');
    }

    const savedNotify = localStorage.getItem('water_notifications');
    if (savedNotify === 'true') setNotificationsEnabled(true);
  }, []);

  useEffect(() => {
    localStorage.setItem('water_intake', intake.toString());
  }, [intake]);

  const addWater = (amount: number) => {
    setIntake(prev => prev + amount);
    // Play subtle sound if desired
  };

  const requestNotifications = async () => {
    if (!("Notification" in window)) {
      alert("This browser does not support desktop notification");
      return;
    }

    if (Notification.permission === "granted") {
      setNotificationsEnabled(true);
      localStorage.setItem('water_notifications', 'true');
    } else if (Notification.permission !== "denied") {
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        setNotificationsEnabled(true);
        localStorage.setItem('water_notifications', 'true');
      }
    }
  };

  const progress = Math.min((intake / goal) * 100, 100);

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
          <span className="text-cyber-purple">Water</span> Lab
        </h2>
        <button 
          onClick={notificationsEnabled ? () => setNotificationsEnabled(false) : requestNotifications}
          className={`p-4 glass rounded-2xl transition-all ${notificationsEnabled ? 'text-limegreen' : 'text-white/20'}`}
        >
          {notificationsEnabled ? <Bell size={24} /> : <BellOff size={24} />}
        </button>
      </div>

      <div className="relative h-80 glass rounded-[3rem] overflow-hidden flex flex-col items-center justify-center gap-2">
        {/* Abstract Fluid Background */}
        <motion.div 
          className="absolute bottom-0 left-0 w-full bg-cyber-purple/20"
          initial={{ height: 0 }}
          animate={{ height: `${progress}%` }}
          transition={{ duration: 1, ease: "circOut" }}
        >
          <div className="absolute top-0 left-0 w-full h-8 bg-gradient-to-t from-transparent to-cyber-purple/30 animate-pulse" />
        </motion.div>

        <Droplets size={64} className="text-cyber-purple drop-shadow-[0_0_20px_rgba(157,0,255,0.4)] mb-2 z-10" />
        <div className="text-center z-10">
          <div className="flex items-baseline justify-center gap-2">
            <span className="text-6xl font-black italic tracking-tighter">{intake}</span>
            <span className="text-white/40 font-bold uppercase italic text-sm">ml</span>
          </div>
          <p className="text-cyber-purple font-black text-[10px] uppercase tracking-[0.3em] mt-2 opacity-60">Goal: {goal}ml</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {VOLUMES.map(vol => (
          <button
            key={vol}
            onClick={() => addWater(vol)}
            className="glass p-6 rounded-[2rem] flex flex-col items-center justify-center gap-3 hover:glass-lime hover:translate-y-[-4px] active:translate-y-0 transition-all group"
          >
            <div className="bg-white/5 p-3 rounded-full group-hover:bg-cyber-purple/20 transition-colors">
              <Plus size={20} className="text-cyber-purple" />
            </div>
            <span className="text-xl font-black italic tracking-tighter">{vol}ml</span>
          </button>
        ))}
      </div>

      <div className="glass p-8 rounded-[2.5rem] space-y-4">
        <h4 className="text-[10px] font-black text-white/30 uppercase tracking-[0.4em] px-1">Hydration Logs</h4>
        <div className="flex items-center gap-4 text-white/50 italic text-sm">
          <Volume2 size={16} />
          <p>Every drop counts towards cellular optimization.</p>
        </div>
        <button 
          onClick={() => setIntake(0)}
          className="text-[10px] font-black text-white/10 uppercase tracking-widest hover:text-white/40 transition-colors"
        >
          Reset Session
        </button>
      </div>

      <div className="text-center opacity-20">
        <p className="text-[9px] font-black uppercase tracking-[0.5em]">System active // Monitoring Hydration Status</p>
      </div>
    </motion.div>
  );
}
