import React from 'react';
import { useApp } from '../context/AppContext';

export const CircadianRhythmBanner: React.FC = () => {
  const { user } = useApp();
  const userName = user?.name?.split(' ')[0] || user?.login || 'Hazem';

  return (
    <div className="py-4 border-b border-white/[0.05] flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
          Good morning, {userName}
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Friday, Oct 9 · Focus sprint active, daily movement on track
        </p>
      </div>

      <div className="flex items-center gap-3 text-xs text-slate-400 font-medium">
        <span className="flex items-center gap-1.5 text-emerald-400">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Peak Flow Window
        </span>
        <span>·</span>
        <span>10:00 AM – 1:30 PM</span>
      </div>
    </div>
  );
};
