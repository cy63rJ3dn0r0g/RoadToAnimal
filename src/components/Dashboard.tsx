import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Dumbbell, Utensils, Edit3, Droplets, Moon, Zap } from 'lucide-react';
import WorkoutTracker from './WorkoutTracker';
import WaterTracker from './WaterTracker';
import SleepTracker from './SleepTracker';
import ActivityTracker from './ActivityTracker';

interface UserProfile {
  name: string;
  gender: 'Male' | 'Female';
  calorieGoal: number;
  height: number;
  weight: number;
  age: number;
  goal: 'Gain Weight' | 'Lose Weight' | 'Maintain';
}

interface DashboardProps {
  profile: UserProfile;
  onEdit: () => void;
  key?: string;
}

export default function Dashboard({ profile, onEdit }: DashboardProps) {
  const [activeTab, setActiveTab] = useState<'main' | 'workout' | 'diet' | 'water' | 'sleep' | 'activity'>('main');

  return (
    <div className="min-h-screen p-6 md:p-12 max-w-6xl mx-auto w-full">
      <AnimatePresence mode="wait">
        {activeTab === 'main' ? (
          <motion.div 
            key="main"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex flex-col gap-12"
          >
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-white text-6xl md:text-8xl font-black drop-shadow-[0_0_20px_rgba(157,0,255,0.3)] tracking-tighter italic uppercase leading-[0.9]">
                  Protocol<br/>
                  <span className="text-limegreen drop-shadow-[0_0_20px_rgba(191,255,0,0.3)]">Active</span>
                </h1>
                <p className="text-white/30 font-bold uppercase tracking-[0.4em] mt-4 ml-1 italic text-sm">Subject: {profile.name} // Sector: Core</p>
              </div>
              <div className="flex gap-4">
                <div className="glass px-6 py-4 rounded-2xl hidden md:flex flex-col justify-center">
                  <span className="text-[9px] font-black text-cyber-purple uppercase tracking-widest opacity-50">Status</span>
                  <span className="text-sm font-black italic text-white uppercase">{profile.goal}</span>
                </div>
                <button 
                  onClick={onEdit}
                  className="p-4 glass rounded-2xl hover:bg-white/10 transition-all text-white/50 hover:text-cyber-purple group"
                >
                  <Edit3 size={24} className="group-hover:scale-110 transition-transform" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-1 glass p-8 rounded-[2.5rem] flex flex-col gap-6 relative overflow-hidden bg-gradient-to-br from-cyber-purple/5 to-transparent">
                <div className="space-y-4">
                  <div className="flex justify-between items-center border-b border-white/5 pb-4">
                    <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Bio Marker</span>
                    <span className="text-sm font-black text-white italic uppercase">{profile.gender}</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-white/5 pb-4">
                    <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Age Chrono</span>
                    <span className="text-sm font-black text-white italic uppercase">{profile.age} YRS</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-white/5 pb-4">
                    <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Stature</span>
                    <span className="text-sm font-black text-white italic uppercase">{profile.height} CM</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Mass Index</span>
                    <span className="text-sm font-black text-white italic uppercase">{profile.weight} KG</span>
                  </div>
                </div>
              </div>

              <div className="md:col-span-1 glass p-8 rounded-[2.5rem] flex flex-col gap-6 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-5 text-cyber-purple">
                  <Utensils size={120} />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-black text-cyber-purple uppercase tracking-[0.3em] opacity-60">Energy Quota</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-black italic tracking-tighter">{profile.calorieGoal}</span>
                    <span className="text-white/40 font-bold text-sm uppercase italic">kcal</span>
                  </div>
                </div>
                <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 1.5, ease: "circOut" }}
                    className="h-full bg-gradient-to-r from-cyber-purple to-limegreen shadow-[0_0_10px_#9d00ff]"
                  />
                </div>
              </div>

              <div className="md:col-span-1 glass p-8 rounded-[2.5rem] flex flex-col gap-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-5 text-limegreen">
                  <Dumbbell size={120} />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-black text-limegreen uppercase tracking-[0.3em] opacity-60">Session Status</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-black italic tracking-tighter uppercase">Ready</span>
                  </div>
                </div>
                <p className="text-white/40 text-xs font-medium leading-relaxed">Optimal recovery detected. Physical stress limits at 100% capacity.</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              <button 
                onClick={() => setActiveTab('workout')}
                className="group relative h-48 lg:h-64 glass-lime rounded-[3rem] overflow-hidden flex flex-col items-center justify-center gap-4 hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                <div className="bg-limegreen text-black p-4 rounded-full group-hover:scale-110 group-hover:rotate-12 transition-all duration-500 shadow-[0_0_30px_rgba(191,255,0,0.4)]">
                  <Dumbbell size={32} />
                </div>
                <div className="text-center">
                  <span className="block text-xl lg:text-2xl font-black italic uppercase tracking-tighter">Forge</span>
                  <span className="text-[10px] font-black text-limegreen uppercase tracking-[0.2em] opacity-50">Log Session</span>
                </div>
              </button>

              <button 
                onClick={() => setActiveTab('water')}
                className="group relative h-48 lg:h-64 glass rounded-[3rem] overflow-hidden flex flex-col items-center justify-center gap-4 hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                <div className="bg-cyber-purple text-white p-4 rounded-full group-hover:scale-110 group-hover:-rotate-12 transition-all duration-500 shadow-[0_0_30px_rgba(157,0,255,0.4)]">
                  <Droplets size={32} />
                </div>
                <div className="text-center">
                  <span className="block text-xl lg:text-2xl font-black italic uppercase tracking-tighter">Fluid</span>
                  <span className="text-[10px] font-black text-cyber-purple uppercase tracking-[0.2em] opacity-50">Hydration</span>
                </div>
              </button>

              <button 
                onClick={() => setActiveTab('sleep')}
                className="group relative h-48 lg:h-64 glass rounded-[3rem] overflow-hidden flex flex-col items-center justify-center gap-4 hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                <div className="bg-white/10 text-white p-4 rounded-full group-hover:scale-110 transition-all duration-500">
                  <Moon size={32} />
                </div>
                <div className="text-center">
                  <span className="block text-xl lg:text-2xl font-black italic uppercase tracking-tighter">Recovery</span>
                  <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Sleep Lab</span>
                </div>
              </button>

              <button 
                onClick={() => setActiveTab('activity')}
                className="group relative h-48 lg:h-64 glass rounded-[3rem] overflow-hidden flex flex-col items-center justify-center gap-4 hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                <div className="bg-white/10 text-white p-4 rounded-full group-hover:scale-110 transition-all duration-500">
                  <Zap size={32} />
                </div>
                <div className="text-center">
                  <span className="block text-xl lg:text-2xl font-black italic uppercase tracking-tighter">Kinetics</span>
                  <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Activity</span>
                </div>
              </button>
            </div>
          </motion.div>

        ) : activeTab === 'workout' ? (
          <WorkoutTracker key="workout-tracker" onBack={() => setActiveTab('main')} />
        ) : activeTab === 'water' ? (
          <WaterTracker key="water-tracker" onBack={() => setActiveTab('main')} />
        ) : activeTab === 'sleep' ? (
          <SleepTracker key="sleep-tracker" onBack={() => setActiveTab('main')} />
        ) : activeTab === 'activity' ? (
          <ActivityTracker key="activity-tracker" onBack={() => setActiveTab('main')} />
        ) : null}
      </AnimatePresence>
    </div>
  );
}
