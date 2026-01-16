import React, { useRef } from 'react';
import { Outlet } from 'react-router-dom';
import { TimerBar } from './TimerBar';
import { SessionLockScreen } from './SessionLockScreen';
import { useFocusNavigation } from '@/lib/focus';
import { useApp } from '@/contexts/AppContext';

export function Layout() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { settings } = useApp();
  
  useFocusNavigation(containerRef, settings.tvMode);

  return (
    <div ref={containerRef} className="min-h-screen bg-background">
      <TimerBar />
      <SessionLockScreen />
      <main className="pt-4">
        <Outlet />
      </main>
    </div>
  );
}
