import React from 'react';
import { useApp } from '@/contexts/AppContext';

export function TimerBar() {
  const { remainingTime, settings } = useApp();

  if (!settings.sessionLength || remainingTime === null) return null;

  const totalMs = settings.sessionLength * 60 * 1000;
  const percentage = (remainingTime / totalMs) * 100;

  const minutes = Math.floor(remainingTime / 60000);
  const seconds = Math.floor((remainingTime % 60000) / 1000);

  return (
    <div className="timer-bar">
      <div
        className="timer-bar-fill"
        style={{ width: `${Math.max(0, percentage)}%` }}
      />
      <div className="absolute right-4 top-3 text-sm font-bold text-foreground/60">
        {minutes}:{seconds.toString().padStart(2, '0')}
      </div>
    </div>
  );
}
