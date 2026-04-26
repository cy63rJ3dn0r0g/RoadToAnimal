import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Edit2, CheckCircle2, History, Save, ChevronUp, ChevronDown, PartyPopper } from 'lucide-react';

interface WeeklyPlan {
  [key: string]: string;
}

interface ExerciseLog {
  id: string;
  exercise: string;
  sets: string;
  weight: string;
  date: string;
}

interface WorkoutTrackerProps {
  onBack: () => void;
  key?: string;
}

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function WorkoutTracker({ onBack }: WorkoutTrackerProps) {
  const [activeTab, setActiveTab] = useState<'today' | 'edit'>('today');
  const [plans, setPlans] = useState<WeeklyPlan>({
    'Monday': 'Lat pulldown – 4x12\nVeslanje na mašini – 4x10\nJednoručno veslanje bučicom – 3x10\nFace pull – 3x15\nBiceps pregib šipkom – 3x10\nHammer pregib – 3x10',
    'Tuesday': 'Hip thrust – 4x10\nRumunsko mrtvo dizanje – 4x10\nLeg curl – 3x12\nGlute kickback – 3x15\nAbdukcija – 3x15',
    'Wednesday': 'Odmor',
    'Thursday': 'Shoulder press – 4x10\nLateral raise – 4x15\nRear delt – 3x12\nTriceps pushdown – 3x12\nOverhead triceps – 3x10',
    'Friday': 'Čučanj – 4x10\nLeg press – 4x10\nIskorak – 3x10\nHip thrust (lakše) – 3x12\nLeg extension – 3x12',
    'Saturday': 'Bench press – 3x10\nIncline bučice – 3x10\nPec deck – 3x12\nPlank – 3x60s\nPodizanje nogu – 3x12\nRussian twist – 3x15',
    'Sunday': 'Odmor'
  });
  const [logs, setLogs] = useState<Record<string, ExerciseLog[]>>({}); // Keyed by exercise name for history
  const [sessionLogs, setSessionLogs] = useState<Record<string, { sets: string, weight: string }>>({});
  const [completedSets, setCompletedSets] = useState<Record<string, boolean[]>>({});
  const [dayOrder, setDayOrder] = useState<string[]>(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']);
  const [showSuccess, setShowSuccess] = useState<string | null>(null);
  const [completedInSession, setCompletedInSession] = useState<Set<string>>(new Set());

  const todayIndex = new Date().getDay();
  const todayName = DAYS[todayIndex];

  useEffect(() => {
    const savedPlans = localStorage.getItem('weekly_plans');
    const savedLogs = localStorage.getItem('workout_history');
    const savedOrder = localStorage.getItem('day_order');
    if (savedPlans) setPlans(JSON.parse(savedPlans));
    if (savedLogs) setLogs(JSON.parse(savedLogs));
    if (savedOrder) setDayOrder(JSON.parse(savedOrder));
  }, []);

  const moveDay = (index: number, direction: 'up' | 'down') => {
    const newOrder = [...dayOrder];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newOrder.length) return;
    
    [newOrder[index], newOrder[targetIndex]] = [newOrder[targetIndex], newOrder[index]];
    setDayOrder(newOrder);
    localStorage.setItem('day_order', JSON.stringify(newOrder));
  };

  const parseTargetSets = (ex: string) => {
    // Look for patterns like 5x5, 4x6, 3x8
    const match = ex.match(/(\d+)\s*[xX]\s*(\d+)/);
    if (match) return parseInt(match[1]);
    
    // Look for "3 max" or "4 sets"
    const simpleMatch = ex.match(/(\d+)\s*(sets|max|rounds)/i);
    if (simpleMatch) return parseInt(simpleMatch[1]);
    
    return 3; // Default
  };

  const toggleSet = (ex: string, setIndex: number, totalSets: number) => {
    setCompletedSets(prev => {
      const current = prev[ex] || new Array(totalSets).fill(false);
      const updated = [...current];
      updated[setIndex] = !updated[setIndex];
      
      const completedCount = updated.filter(Boolean).length;
      setSessionLogs(logs => ({
        ...logs,
        [ex]: {
          ...(logs[ex] || { sets: '', weight: '' }),
          sets: completedCount.toString()
        }
      }));

      return { ...prev, [ex]: updated };
    });
  };

  const updatePlan = (day: string, routine: string) => {
    const newPlans = { ...plans, [day]: routine };
    setPlans(newPlans);
    localStorage.setItem('weekly_plans', JSON.stringify(newPlans));
  };

  const getExercisesFromPlan = (planStr: string) => {
    if (!planStr) return [];
    // Split by common separators: comma, newline, or semicolon
    // Often plans are "Exercise 1 3x10, Exercise 2 4x8"
    // Also remove the "PUSH (SNAGA):" part if it exists
    const cleaned = planStr.includes(':') ? planStr.split(':')[1] : planStr;
    return cleaned.split(/[,;\n]/).map(s => s.trim()).filter(s => s.length > 0);
  };

  const saveLog = (exercise: string) => {
    const sessionData = sessionLogs[exercise];
    if (!sessionData || !sessionData.sets || !sessionData.weight) return;

    const newLog: ExerciseLog = {
      id: Date.now().toString(),
      exercise,
      sets: sessionData.sets,
      weight: sessionData.weight,
      date: new Date().toLocaleDateString()
    };

    const updatedLogs = { ...logs };
    if (!updatedLogs[exercise]) updatedLogs[exercise] = [];
    updatedLogs[exercise] = [newLog, ...updatedLogs[exercise]];
    
    setLogs(updatedLogs);
    localStorage.setItem('workout_history', JSON.stringify(updatedLogs));
    
    // Track session progress
    const newCompleted = new Set(completedInSession);
    newCompleted.add(exercise);
    setCompletedInSession(newCompleted);

    // If all exercises are done, show the legend status
    if (newCompleted.size >= exercises.length && exercises.length > 0) {
      setShowSuccess("full_session");
    }
    
    // Clear state for this exercise
    setCompletedSets(prev => ({ ...prev, [exercise]: [] }));
    setSessionLogs(prev => ({ ...prev, [exercise]: { sets: '0', weight: '' } }));
  };

  const handleInputChange = (exercise: string, field: 'sets' | 'weight', value: string) => {
    setSessionLogs(prev => ({
      ...prev,
      [exercise]: {
        ...(prev[exercise] || { sets: '', weight: '' }),
        [field]: value
      }
    }));
  };

  const todayPlan = plans[todayName] || 'No plan set for today.';
  const exercises = getExercisesFromPlan(todayPlan);

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="w-full max-w-2xl mx-auto p-4 pb-20"
    >
      <div className="flex items-center justify-between mb-6">
        <button 
          onClick={onBack}
          className="p-2 hover:bg-white/10 rounded-full transition-colors text-limegreen"
        >
          <ArrowLeft size={28} />
        </button>
        <h2 className="text-3xl font-black text-white uppercase tracking-tighter italic">
          {activeTab === 'today' ? (
            <>
              <span className="text-cyber-purple">The</span> {todayName}
            </>
          ) : 'Weekly Setup'}
        </h2>
        <div className="w-10" />
      </div>

      <div className="flex bg-white/5 p-1 rounded-2xl mb-8 border border-white/5">
        <button 
          onClick={() => setActiveTab('today')}
          className={`flex-1 py-3 font-bold rounded-xl transition-all ${activeTab === 'today' ? 'bg-cyber-purple text-white shadow-[0_0_20px_rgba(157,0,255,0.3)]' : 'text-gray-500 hover:text-white'}`}
        >
          Session
        </button>
        <button 
          onClick={() => setActiveTab('edit')}
          className={`flex-1 py-3 font-bold rounded-xl transition-all ${activeTab === 'edit' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-white'}`}
        >
          Schedule
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'today' ? (
          <motion.div
            key="today-view"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex flex-col gap-6"
          >
            <div className="bg-limegreen/10 border border-limegreen/20 p-5 rounded-2xl flex justify-between items-center">
              <div>
                <h3 className="text-limegreen font-black uppercase italic text-sm mb-1 tracking-widest">{todayName} Session</h3>
                <p className="text-white font-bold text-lg leading-tight">{todayPlan}</p>
              </div>
              {exercises.length > 0 && (
                <div className="text-right">
                  <span className="text-[10px] font-black text-limegreen/50 uppercase block mb-1">Session Progress</span>
                  <span className="text-2xl font-black italic text-white leading-none">{completedInSession.size}/{exercises.length}</span>
                </div>
              )}
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-4"
            >
              <h4 className="text-[10px] font-black text-limegreen uppercase tracking-[0.4em] px-1 mb-8">Performance Tracker</h4>
              {exercises.length > 0 ? (
                exercises.map((ex, i) => {
                  const lastLog = logs[ex]?.[0];
                  const isExLogged = completedInSession.has(ex);
                  return (
                    <motion.div 
                      key={i} 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className={`glass p-6 rounded-[2rem] space-y-6 group hover:glass-lime hover:translate-x-2 transition-all duration-500 ${isExLogged ? 'opacity-40 grayscale pointer-events-none' : ''}`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <h5 className={`text-xl font-black italic uppercase tracking-tighter leading-none transition-all duration-500 ${
                            isExLogged 
                            ? 'text-white/20 line-through decoration-limegreen decoration-2' 
                            : 'text-white group-hover:text-limegreen'
                          }`}>{ex}</h5>
                          {lastLog && (
                            <div className="flex items-center gap-2 opacity-30 text-[10px] font-black uppercase tracking-widest mt-2">
                              Last: {lastLog.date}
                            </div>
                          )}
                        </div>
                        {lastLog && (
                          <div className="glass px-3 py-1 rounded-full border-limegreen/10">
                            <span className="text-limegreen text-[10px] font-black italic tracking-widest">{lastLog.weight}KG × {lastLog.sets}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col gap-6">
                        <div className="space-y-3">
                          <div className="flex justify-between items-end px-1">
                            <label className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em]">Sets Completed</label>
                            <span className="text-[10px] font-black text-limegreen italic">{sessionLogs[ex]?.sets || 0} / {parseTargetSets(ex)}</span>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {Array.from({ length: parseTargetSets(ex) }).map((_, idx) => {
                              const isDone = completedSets[ex]?.[idx];
                              return (
                                <button
                                  key={idx}
                                  onClick={() => toggleSet(ex, idx, parseTargetSets(ex))}
                                  className={`w-12 h-12 rounded-xl flex items-center justify-center font-black transition-all border-2 ${
                                    isDone 
                                      ? 'bg-cyber-purple text-white border-cyber-purple shadow-[0_0_15px_rgba(157,0,255,0.3)]' 
                                      : 'bg-white/5 text-white/20 border-white/5 hover:border-white/10'
                                  }`}
                                >
                                  {idx + 1}
                                </button>
                              );
                            })}
                            <button 
                              onClick={() => {
                                const currentTotal = parseTargetSets(ex);
                                setSessionLogs(prev => ({
                                  ...prev,
                                  [ex]: { ...(prev[ex] || { sets: '0', weight: '' }), sets: (parseInt(prev[ex]?.sets || '0') + 1).toString() }
                                }));
                                setCompletedSets(prev => ({
                                  ...prev,
                                  [ex]: [...(prev[ex] || new Array(currentTotal).fill(false)), true]
                                }));
                              }}
                              className="w-12 h-12 rounded-xl border-2 border-dashed border-white/10 flex items-center justify-center text-white/20 hover:border-limegreen/50 hover:text-limegreen transition-all"
                            >
                              +
                            </button>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em] ml-2">Load (KG)</label>
                          <input 
                            type="text" 
                            placeholder="0"
                            value={sessionLogs[ex]?.weight || ''}
                            onChange={(e) => handleInputChange(ex, 'weight', e.target.value)}
                            className="w-full bg-white/5 border border-white/5 rounded-2xl px-5 py-4 text-white font-black italic outline-none focus:border-limegreen/50 focus:bg-white/10 transition-all placeholder:text-white/5"
                          />
                        </div>
                      </div>
                      
                      <button 
                        onClick={() => saveLog(ex)}
                        className="w-full py-4 bg-white/5 group-hover:bg-limegreen group-hover:text-black rounded-2xl text-white/30 group-hover:text-black font-black text-[10px] uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
                      >
                        <Save size={14} className="group-hover:animate-bounce" />
                        Log Performance
                      </button>
                    </motion.div>
                  );
                })
              ) : (
                <div className="text-center py-20 bg-white/5 rounded-[3rem] border border-white/5">
                  <p className="text-white/20 font-black uppercase tracking-[0.2em] italic">Protocol Data Not Found</p>
                </div>
              )}
            </motion.div>

          </motion.div>
        ) : (
          <motion.div 
            key="edit-view"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex flex-col gap-4"
          >
            <h3 className="text-xl font-bold uppercase italic text-white/80 mb-2 px-1">Weekly Setup</h3>
            {dayOrder.map((day, index) => (
              <div key={day} className="bg-white/5 border border-white/5 p-5 rounded-2xl group hover:border-cyber-purple transition-all flex gap-4">
                <div className="flex flex-col gap-1 justify-center">
                  <button 
                    onClick={() => moveDay(index, 'up')}
                    className="p-1 hover:text-limegreen text-white/20 transition-colors"
                    disabled={index === 0}
                  >
                    <ChevronUp size={20} />
                  </button>
                  <button 
                    onClick={() => moveDay(index, 'down')}
                    className="p-1 hover:text-limegreen text-white/20 transition-colors"
                    disabled={index === dayOrder.length - 1}
                  >
                    <ChevronDown size={20} />
                  </button>
                </div>
                <div className="flex-1 flex flex-col gap-2">
                  <label className="text-[10px] font-black text-cyber-purple uppercase tracking-widest">{day}</label>
                  <textarea 
                    rows={2}
                    placeholder="Rest Day / Heavy Squats / Yoga..."
                    value={plans[day] || ''}
                    onChange={(e) => updatePlan(day, e.target.value)}
                    className="bg-transparent border-none text-white text-lg font-bold placeholder:text-gray-700 outline-none w-full resize-none"
                  />
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm pointer-events-auto"
          >
            <motion.div 
              initial={{ scale: 0.5, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.5, y: 50 }}
              className="glass-lime p-12 rounded-[4rem] border-limegreen shadow-[0_0_100px_rgba(191,255,0,0.3)] text-center space-y-6 max-w-sm w-full"
            >
              <div className="bg-limegreen text-black p-5 rounded-full w-24 h-24 mx-auto flex items-center justify-center shadow-2xl">
                <PartyPopper size={48} />
              </div>
              <div className="space-y-2">
                <h2 className="text-5xl font-black italic uppercase tracking-tighter leading-[0.9]">You are a fucking Legend!</h2>
                <div className="h-px bg-limegreen/20 w-1/2 mx-auto" />
                <p className="text-limegreen font-bold uppercase tracking-[0.4em] text-xs italic">I'm proud of you</p>
              </div>
              <button 
                onClick={() => setShowSuccess(null)}
                className="w-full py-4 bg-white text-black font-black uppercase text-xs tracking-widest rounded-3xl hover:bg-limegreen transition-colors pointer-events-auto"
              >
                Continue Mission
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
