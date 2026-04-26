import React, { useState } from 'react';
import { motion } from 'motion/react';

interface UserProfile {
  name: string;
  gender: 'Male' | 'Female';
  calorieGoal: number;
  height: number;
  weight: number;
  age: number;
  goal: 'Gain Weight' | 'Lose Weight' | 'Maintain';
}

interface OnboardingProps {
  onComplete: (profile: UserProfile) => void;
  key?: string;
}

export default function Onboarding({ onComplete }: OnboardingProps) {
  const [name, setName] = useState('');
  const [gender, setGender] = useState<'Male' | 'Female'>('Male');
  const [age, setAge] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [goal, setGoal] = useState<'Gain Weight' | 'Lose Weight' | 'Maintain'>('Maintain');
  const [calories, setCalories] = useState('');

  const calculateCalories = (g: 'Male' | 'Female', a: number, h: number, w: number, gl: string) => {
    if (!a || !h || !w) return '';
    
    // Mifflin-St Jeor
    let bmr = (10 * w) + (6.25 * h) - (5 * a);
    bmr = g === 'Male' ? bmr + 5 : bmr - 161;
    
    // TDEE (Moderate activity 1.375)
    let tdee = Math.round(bmr * 1.375);
    
    if (gl === 'Lose Weight') tdee -= 500;
    if (gl === 'Gain Weight') tdee += 500;
    
    return tdee.toString();
  };

  const updateCalculatedCalories = (overrides?: Partial<{ g: 'Male' | 'Female', a: string, h: string, w: string, gl: 'Gain Weight' | 'Lose Weight' | 'Maintain' }>) => {
    const cg = overrides?.g || gender;
    const ca = parseInt(overrides?.a || age);
    const ch = parseInt(overrides?.h || height);
    const cw = parseInt(overrides?.w || weight);
    const cgl = overrides?.gl || goal;
    
    const calculated = calculateCalories(cg, ca, ch, cw, cgl);
    if (calculated) setCalories(calculated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && calories && age && height && weight) {
      const profile: UserProfile = {
        name: name.trim(),
        gender,
        age: parseInt(age),
        height: parseInt(height),
        weight: parseInt(weight),
        goal,
        calorieGoal: parseInt(calories)
      };
      
      localStorage.setItem('user_profile', JSON.stringify(profile));
      
      // Pre-populate male plan if selected
      if (gender === 'Male') {
        const malePlan = {
          Monday: "PUSH (SNAGA): Military press 5x5, Bench press 4x6, Incline DB press 3x8, Dipovi 3x max, Triceps pushdown 3x12, Core plank 3x60–90s",
          Tuesday: "HYROX INTERVALI: 1 km trčanje, 500 m row, 20 burpees, 20 wall balls, 800 m trčanje, 500 m row (3–4 kruga)",
          Wednesday: "PULL (SNAGA): Zgibovi 4x max, Veslanje šipkom 4x8, Lat pulldown 3x10, Face pull 3x15, Biceps curl 3x10–12, Hanging leg raises 3x12",
          Thursday: "ZONA 2 (BAZA): 45–60 min lagano trčanje / bicikl, mobilnost 10–15 min",
          Friday: "HYROX SIMULACIJA: 1 km trčanje, sled push, 1 km trčanje, sled pull, 1 km trčanje, farmer carry 100 m, 1 km trčanje, 50–80 wall balls",
          Saturday: "SNAGA + EKSPLOZIVNOST: Deadlift 5x3, Push press 4x6, Box jumps 4x8, Kettlebell swing 4x15, Sprint intervali 8–10 rundi, Core finisher",
          Sunday: "ODMOR: šetnja, istezanje, regeneracija"
        };
        localStorage.setItem('weekly_plans', JSON.stringify(malePlan));
      }
      
      onComplete(profile);
    }
  };

  return (
    <motion.section 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex flex-col items-center justify-center min-h-screen text-center p-4 gap-4"
    >
      <h1 className="text-6xl md:text-8xl font-black text-white uppercase tracking-tighter italic leading-none mb-2">
        Road To<br/>
        <span className="text-limegreen drop-shadow-[0_0_15px_rgba(191,255,0,0.4)]">Super Human</span>
      </h1>
      <p className="text-lg text-white/40 font-medium mb-10 tracking-widest uppercase">Elite Training Protocol</p>
      
      <form onSubmit={handleSubmit} className="flex flex-col items-center gap-8 w-full max-w-sm">
        <div className="w-full space-y-3">
          <label className="block text-[10px] font-black text-limegreen uppercase tracking-[0.3em] ml-1 text-left opacity-80">Codename / Identity</label>
          <input
            type="text"
            id="user"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. HUNTER_01"
            className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 text-white text-lg focus:border-limegreen/50 focus:bg-white/10 focus:outline-none transition-all placeholder:text-white/10 font-bold"
            required
          />
        </div>

        <div className="w-full space-y-3">
          <label className="block text-[10px] font-black text-limegreen uppercase tracking-[0.3em] ml-1 text-left opacity-80">Biological Marker</label>
          <div className="flex gap-4">
            {(['Male', 'Female'] as const).map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => {
                  setGender(g);
                  updateCalculatedCalories({ g });
                }}
                className={`flex-1 py-4 font-black rounded-2xl border transition-all text-sm uppercase tracking-widest ${
                  gender === g 
                    ? 'bg-limegreen text-black border-limegreen shadow-[0_0_20px_rgba(191,255,0,0.2)]' 
                    : 'bg-white/5 text-white/40 border-white/10 hover:border-white/30'
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 w-full">
          <div className="space-y-3">
            <label className="block text-[10px] font-black text-limegreen uppercase tracking-[0.3em] ml-1 text-left opacity-80">Age</label>
            <input
              type="number"
              value={age}
              onChange={(e) => {
                setAge(e.target.value);
                updateCalculatedCalories({ a: e.target.value });
              }}
              placeholder="25"
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-5 text-white text-lg focus:border-limegreen/50 focus:bg-white/10 focus:outline-none transition-all placeholder:text-white/10 font-bold"
              required
            />
          </div>
          <div className="space-y-3">
            <label className="block text-[10px] font-black text-limegreen uppercase tracking-[0.3em] ml-1 text-left opacity-80">Ht (cm)</label>
            <input
              type="number"
              value={height}
              onChange={(e) => {
                setHeight(e.target.value);
                updateCalculatedCalories({ h: e.target.value });
              }}
              placeholder="180"
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-5 text-white text-lg focus:border-limegreen/50 focus:bg-white/10 focus:outline-none transition-all placeholder:text-white/10 font-bold"
              required
            />
          </div>
          <div className="space-y-3">
            <label className="block text-[10px] font-black text-limegreen uppercase tracking-[0.3em] ml-1 text-left opacity-80">Wt (kg)</label>
            <input
              type="number"
              value={weight}
              onChange={(e) => {
                setWeight(e.target.value);
                updateCalculatedCalories({ w: e.target.value });
              }}
              placeholder="80"
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-5 text-white text-lg focus:border-limegreen/50 focus:bg-white/10 focus:outline-none transition-all placeholder:text-white/10 font-bold"
              required
            />
          </div>
        </div>

        <div className="w-full space-y-3">
          <label className="block text-[10px] font-black text-limegreen uppercase tracking-[0.3em] ml-1 text-left opacity-80">Mission Objective</label>
          <div className="flex flex-col gap-2">
            {(['Lose Weight', 'Maintain', 'Gain Weight'] as const).map((gl) => (
              <button
                key={gl}
                type="button"
                onClick={() => {
                  setGoal(gl);
                  updateCalculatedCalories({ gl });
                }}
                className={`py-3 font-black rounded-xl border transition-all text-[10px] uppercase tracking-widest ${
                  goal === gl 
                    ? 'bg-cyber-purple text-white border-cyber-purple' 
                    : 'bg-white/5 text-white/40 border-white/10 hover:border-white/30'
                }`}
              >
                {gl}
              </button>
            ))}
          </div>
        </div>

        <div className="w-full space-y-3">
          <label className="block text-[10px] font-black text-limegreen uppercase tracking-[0.3em] ml-1 text-left opacity-80">Calculated Energy Cap (kcal)</label>
          <input
            type="number"
            value={calories}
            onChange={(e) => setCalories(e.target.value)}
            placeholder="2500"
            className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 text-white text-lg hover:border-limegreen/30 focus:border-limegreen/50 focus:bg-white/10 focus:outline-none transition-all placeholder:text-white/10 font-bold"
            required
          />
        </div>

        <button
          type="submit"
          id="submitName"
          className="w-full bg-limegreen text-black font-black py-5 rounded-2xl cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-all mt-4 text-xl italic uppercase tracking-tighter shadow-[0_10px_30px_rgba(191,255,0,0.3)]"
        >
          Initialize Protocol
        </button>
      </form>
    </motion.section>

  );
}
