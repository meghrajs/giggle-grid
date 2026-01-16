import React, { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { BigButton } from './BigButton';
import { Clock, Lock } from 'lucide-react';

export function SessionLockScreen() {
  const { isSessionExpired, unlockSession, settings } = useApp();
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  if (!isSessionExpired) return null;

  const handleUnlock = () => {
    if (pin === settings.parentPIN) {
      unlockSession();
      setPin('');
      setError(false);
    } else {
      setError(true);
      setPin('');
    }
  };

  const handleKeyPress = (digit: string) => {
    if (pin.length < 4) {
      const newPin = pin + digit;
      setPin(newPin);
      setError(false);
      
      if (newPin.length === 4) {
        setTimeout(() => {
          if (newPin === settings.parentPIN) {
            unlockSession();
            setPin('');
          } else {
            setError(true);
            setPin('');
          }
        }, 300);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-b from-game-blue/20 to-game-purple/20 backdrop-blur-md">
      <div className="text-center p-8 max-w-md mx-4">
        <div className="mb-8 animate-float">
          <Clock className="w-24 h-24 mx-auto text-secondary" />
        </div>

        <h1 className="text-4xl font-black mb-4">Time for a Break!</h1>
        <p className="text-xl text-muted-foreground mb-8">
          Great job playing! It's time to rest your eyes. 🌟
        </p>

        <div className="bg-card rounded-3xl p-6 shadow-lifted mb-6">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Lock className="w-5 h-5 text-muted-foreground" />
            <span className="text-muted-foreground font-medium">Parent PIN to unlock</span>
          </div>

          {/* PIN display */}
          <div className="flex justify-center gap-3 mb-6">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className={`w-12 h-12 rounded-xl border-2 flex items-center justify-center text-2xl font-bold transition-all ${
                  pin.length > i
                    ? 'border-primary bg-primary/10'
                    : 'border-muted'
                } ${error ? 'border-destructive animate-shake' : ''}`}
              >
                {pin.length > i ? '•' : ''}
              </div>
            ))}
          </div>

          {error && (
            <p className="text-destructive font-medium mb-4">
              Incorrect PIN. Try again!
            </p>
          )}

          {/* Number pad */}
          <div className="grid grid-cols-3 gap-3 max-w-xs mx-auto">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', '←'].map((digit, i) => (
              <button
                key={i}
                onClick={() => {
                  if (digit === '←') {
                    setPin(pin.slice(0, -1));
                  } else if (digit) {
                    handleKeyPress(digit);
                  }
                }}
                disabled={!digit}
                className={`h-14 rounded-xl font-bold text-xl transition-all focus-ring ${
                  digit
                    ? 'bg-muted hover:bg-muted/80 active:scale-95'
                    : 'invisible'
                }`}
              >
                {digit}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
