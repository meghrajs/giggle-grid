import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { BigButton } from '@/components/BigButton';
import { ArrowLeft, Volume2, VolumeX, Monitor, Clock, Trash2, Lock } from 'lucide-react';

export default function Parents() {
  const navigate = useNavigate();
  const { settings, updateSettings, toggleSound, toggleTVMode, resetProgress } = useApp();
  const [showPinEntry, setShowPinEntry] = useState(true);
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [newPin, setNewPin] = useState('');
  const [showPinChange, setShowPinChange] = useState(false);

  const handlePinSubmit = () => {
    if (pin === settings.parentPIN) {
      setShowPinEntry(false);
      setPin('');
      setPinError(false);
    } else {
      setPinError(true);
      setPin('');
    }
  };

  const handleKeyPress = (digit: string) => {
    if (pin.length < 4) {
      const newPinValue = pin + digit;
      setPin(newPinValue);
      setPinError(false);
      
      if (newPinValue.length === 4) {
        setTimeout(() => {
          if (newPinValue === settings.parentPIN) {
            setShowPinEntry(false);
            setPin('');
          } else {
            setPinError(true);
            setPin('');
          }
        }, 300);
      }
    }
  };

  const handleSaveNewPin = () => {
    if (newPin.length === 4) {
      updateSettings({ parentPIN: newPin });
      setNewPin('');
      setShowPinChange(false);
    }
  };

  if (showPinEntry) {
    return (
      <div className="min-h-screen p-6 flex flex-col items-center justify-center">
        <div className="bg-card rounded-3xl p-8 shadow-lifted max-w-md w-full text-center">
          <Lock className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h1 className="text-2xl font-bold mb-2">Parent Panel</h1>
          <p className="text-muted-foreground mb-6">Enter PIN to access settings</p>

          {/* PIN display */}
          <div className="flex justify-center gap-3 mb-6">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className={`w-12 h-12 rounded-xl border-2 flex items-center justify-center text-2xl font-bold transition-all ${
                  pin.length > i
                    ? 'border-primary bg-primary/10'
                    : 'border-muted'
                } ${pinError ? 'border-destructive animate-shake' : ''}`}
              >
                {pin.length > i ? '•' : ''}
              </div>
            ))}
          </div>

          {pinError && (
            <p className="text-destructive font-medium mb-4">
              Incorrect PIN. Try again!
            </p>
          )}

          {/* Number pad */}
          <div className="grid grid-cols-3 gap-3 max-w-xs mx-auto mb-6">
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

          <button
            onClick={() => navigate('/')}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      {/* Header */}
      <header className="flex items-center justify-between mb-8">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 p-3 rounded-xl bg-muted hover:bg-muted/80 transition-all focus-ring"
        >
          <ArrowLeft className="w-6 h-6" />
          <span className="font-bold">Back</span>
        </button>
        <h1 className="text-3xl font-black">👨‍👩‍👧 Parent Panel</h1>
        <div className="w-20" />
      </header>

      <div className="max-w-xl mx-auto space-y-6">
        {/* Sound Toggle */}
        <div className="bg-card rounded-2xl p-6 shadow-soft">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {settings.soundEnabled ? (
                <Volume2 className="w-8 h-8 text-secondary" />
              ) : (
                <VolumeX className="w-8 h-8 text-muted-foreground" />
              )}
              <div>
                <h3 className="font-bold text-lg">Sound Effects</h3>
                <p className="text-muted-foreground text-sm">
                  {settings.soundEnabled ? 'Sound is on' : 'Sound is off'}
                </p>
              </div>
            </div>
            <button
              onClick={toggleSound}
              className={`relative w-14 h-8 rounded-full transition-colors focus-ring ${
                settings.soundEnabled ? 'bg-secondary' : 'bg-muted'
              }`}
            >
              <div
                className={`absolute top-1 w-6 h-6 rounded-full bg-card shadow transition-transform ${
                  settings.soundEnabled ? 'translate-x-7' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>

        {/* TV Mode Toggle */}
        <div className="bg-card rounded-2xl p-6 shadow-soft">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Monitor className={`w-8 h-8 ${settings.tvMode ? 'text-secondary' : 'text-muted-foreground'}`} />
              <div>
                <h3 className="font-bold text-lg">TV Mode</h3>
                <p className="text-muted-foreground text-sm">
                  Bigger UI for TV screens
                </p>
              </div>
            </div>
            <button
              onClick={toggleTVMode}
              className={`relative w-14 h-8 rounded-full transition-colors focus-ring ${
                settings.tvMode ? 'bg-secondary' : 'bg-muted'
              }`}
            >
              <div
                className={`absolute top-1 w-6 h-6 rounded-full bg-card shadow transition-transform ${
                  settings.tvMode ? 'translate-x-7' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Session Length */}
        <div className="bg-card rounded-2xl p-6 shadow-soft">
          <div className="flex items-center gap-4 mb-4">
            <Clock className="w-8 h-8 text-secondary" />
            <div>
              <h3 className="font-bold text-lg">Session Timer</h3>
              <p className="text-muted-foreground text-sm">
                Limit play time per session
              </p>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-3">
            {[null, 10, 20, 30].map((length) => (
              <button
                key={length ?? 'off'}
                onClick={() => updateSettings({ sessionLength: length as 10 | 20 | 30 | null })}
                className={`py-3 px-4 rounded-xl font-bold transition-all focus-ring ${
                  settings.sessionLength === length
                    ? 'bg-secondary text-secondary-foreground'
                    : 'bg-muted hover:bg-muted/80'
                }`}
              >
                {length ? `${length}m` : 'Off'}
              </button>
            ))}
          </div>
        </div>

        {/* Change PIN */}
        <div className="bg-card rounded-2xl p-6 shadow-soft">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Lock className="w-8 h-8 text-muted-foreground" />
              <div>
                <h3 className="font-bold text-lg">Change PIN</h3>
                <p className="text-muted-foreground text-sm">
                  Current PIN: {settings.parentPIN}
                </p>
              </div>
            </div>
            <BigButton
              variant="outline"
              size="small"
              onClick={() => setShowPinChange(!showPinChange)}
            >
              Change
            </BigButton>
          </div>
          
          {showPinChange && (
            <div className="mt-4 pt-4 border-t border-border">
              <p className="text-sm text-muted-foreground mb-3">Enter new 4-digit PIN:</p>
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  maxLength={4}
                  pattern="[0-9]*"
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
                  className="flex-1 p-3 rounded-xl border-2 border-muted text-center text-2xl font-bold tracking-widest focus:border-primary focus:outline-none"
                  placeholder="••••"
                />
                <BigButton
                  variant="secondary"
                  size="small"
                  onClick={handleSaveNewPin}
                  disabled={newPin.length !== 4}
                >
                  Save
                </BigButton>
              </div>
            </div>
          )}
        </div>

        {/* Reset Progress */}
        <div className="bg-card rounded-2xl p-6 shadow-soft border-2 border-destructive/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Trash2 className="w-8 h-8 text-destructive" />
              <div>
                <h3 className="font-bold text-lg">Reset Progress</h3>
                <p className="text-muted-foreground text-sm">
                  Clear all stars and game data
                </p>
              </div>
            </div>
            {!showResetConfirm ? (
              <BigButton
                variant="red"
                size="small"
                onClick={() => setShowResetConfirm(true)}
              >
                Reset
              </BigButton>
            ) : (
              <div className="flex gap-2">
                <BigButton
                  variant="outline"
                  size="small"
                  onClick={() => setShowResetConfirm(false)}
                >
                  Cancel
                </BigButton>
                <BigButton
                  variant="red"
                  size="small"
                  onClick={() => {
                    resetProgress();
                    setShowResetConfirm(false);
                  }}
                >
                  Confirm
                </BigButton>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
