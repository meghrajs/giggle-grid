import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { BigButton } from '@/components/BigButton';
import { CardTile } from '@/components/CardTile';
import { StarRating } from '@/components/StarRating';
import { Monitor, Settings, Play } from 'lucide-react';

export default function Home() {
  const navigate = useNavigate();
  const { progress, settings, toggleTVMode, startSession } = useApp();
  const [selectedMode, setSelectedMode] = useState<'little' | 'big' | null>(null);

  const handlePlay = () => {
    if (selectedMode) {
      if (settings.sessionLength) {
        startSession(settings.sessionLength);
      }
      navigate('/hub', { state: { mode: selectedMode } });
    }
  };

  const completedGames = Object.values(progress.games).filter(g => g.completedCount > 0).length;

  return (
    <div className="min-h-screen p-6 flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <span className="text-4xl">🌈</span>
          <h1 className="text-3xl font-black">BrightBoard Kids</h1>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={toggleTVMode}
            className={`p-3 rounded-xl transition-all focus-ring ${
              settings.tvMode ? 'bg-secondary text-secondary-foreground' : 'bg-muted hover:bg-muted/80'
            }`}
            aria-label="Toggle TV Mode"
          >
            <Monitor className="w-6 h-6" />
          </button>
          <button
            onClick={() => navigate('/parents')}
            className="p-3 rounded-xl bg-muted hover:bg-muted/80 transition-all focus-ring"
            aria-label="Parent Settings"
          >
            <Settings className="w-6 h-6" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center max-w-2xl mx-auto w-full">
        {/* Progress Summary */}
        <div className="bg-card rounded-3xl p-6 shadow-soft mb-8 w-full">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="text-5xl">⭐</div>
              <div>
                <p className="text-muted-foreground font-medium">Total Stars</p>
                <p className="text-4xl font-black">{progress.totalStars}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-5xl">🎮</div>
              <div>
                <p className="text-muted-foreground font-medium">Games Played</p>
                <p className="text-4xl font-black">{completedGames}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Mode Selection */}
        <h2 className="text-2xl font-bold mb-6 text-center">Choose Your Mode</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full mb-8">
          <CardTile
            color="orange"
            selected={selectedMode === 'little'}
            onClick={() => setSelectedMode('little')}
            className="p-8"
          >
            <div className="text-center">
              <div className="text-6xl mb-4">👶</div>
              <h3 className="text-2xl font-bold mb-2">Little Kids</h3>
              <p className="text-muted-foreground">Ages 3-5</p>
              <p className="text-sm text-muted-foreground mt-2">
                Colors, shapes & sounds!
              </p>
            </div>
          </CardTile>

          <CardTile
            color="blue"
            selected={selectedMode === 'big'}
            onClick={() => setSelectedMode('big')}
            className="p-8"
          >
            <div className="text-center">
              <div className="text-6xl mb-4">🧒</div>
              <h3 className="text-2xl font-bold mb-2">Big Kids</h3>
              <p className="text-muted-foreground">Ages 6-10</p>
              <p className="text-sm text-muted-foreground mt-2">
                Math, spelling & memory!
              </p>
            </div>
          </CardTile>
        </div>

        {/* Play Button */}
        <BigButton
          variant="primary"
          size="large"
          onClick={handlePlay}
          disabled={!selectedMode}
          className={`w-full max-w-sm ${!selectedMode ? 'opacity-50 cursor-not-allowed' : 'animate-pulse-glow'}`}
        >
          <Play className="w-8 h-8" />
          Let's Play!
        </BigButton>
      </div>

      {/* Footer */}
      <footer className="text-center mt-8 text-muted-foreground">
        <p className="text-sm">Made with ❤️ for curious minds</p>
      </footer>
    </div>
  );
}
