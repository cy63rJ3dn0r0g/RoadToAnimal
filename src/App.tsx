/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { AnimatePresence } from 'motion/react';
import Onboarding from './components/Onboarding';
import Dashboard from './components/Dashboard';

interface UserProfile {
  name: string;
  gender: 'Male' | 'Female';
  calorieGoal: number;
  height: number;
  weight: number;
  age: number;
  goal: 'Gain Weight' | 'Lose Weight' | 'Maintain';
}

export default function App() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('user_profile');
    if (storedUser) {
      setProfile(JSON.parse(storedUser));
    } else {
      // Compatibility for old "user" string if it exists
      const oldUser = localStorage.getItem('user');
      if (oldUser) {
        setProfile({ 
          name: oldUser, 
          gender: 'Male', 
          calorieGoal: 2000,
          height: 180,
          weight: 80,
          age: 25,
          goal: 'Maintain'
        });
      }
    }
    setIsReady(true);

    // Notification Scheduler
    const interval = setInterval(() => {
      const enabled = localStorage.getItem('water_notifications') === 'true';
      if (enabled && Notification.permission === 'granted') {
        new Notification("Hydration Protocol", {
          body: "Subject requires hydration. Log intake now.",
          icon: "/favicon.ico"
        });
      }
    }, 1000 * 60 * 60); // Hourly

    return () => clearInterval(interval);
  }, []);

  const handleOnboardingComplete = (newProfile: UserProfile) => {
    setProfile(newProfile);
  };

  const handleEdit = () => {
    setProfile(null);
    localStorage.removeItem('user_profile');
    localStorage.removeItem('user');
    localStorage.removeItem('weekly_plans');
  };

  if (!isReady) return null;

  return (
    <main className="min-h-screen bg-black overflow-hidden selection:bg-limegreen selection:text-black">
      <AnimatePresence mode="wait">
        {!profile ? (
          <Onboarding key="onboarding" onComplete={handleOnboardingComplete} />
        ) : (
          <Dashboard key="dashboard" profile={profile} onEdit={handleEdit} />
        )}
      </AnimatePresence>
    </main>
  );
}
