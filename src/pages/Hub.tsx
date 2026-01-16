import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { CardTile } from '@/components/CardTile';
import { GAMES, getGamesByMode, type GameMode, type GameConfig } from '@/lib/games';
import { getGameProgress } from '@/lib/storage';
import { ArrowLeft, Star, Filter } from 'lucide-react';

export default function Hub() {
  const navigate = useNavigate();
  const location = useLocation();
  const { progress } = useApp();
  
  const initialMode = (location.state as any)?.mode || 'all';
  const [filter, setFilter] = useState<GameMode>(initialMode);

  const filteredGames = getGamesByMode(filter);

  const getModeLabel = (mode: GameMode) => {
    switch (mode) {
      case 'little': return '👶 Little';
      case 'big': return '🧒 Big';
      case 'all': return '🎮 All';
    }
  };

  const getDifficultyBadge = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return '🟢 Easy';
      case 'medium': return '🟡 Medium';
      case 'hard': return '🔴 Hard';
    }
  };

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
        <h1 className="text-3xl font-black">🎮 Game Hub</h1>
        <div className="flex items-center gap-2">
          <Star className="w-6 h-6 text-game-yellow fill-game-yellow" />
          <span className="text-2xl font-bold">{progress.totalStars}</span>
        </div>
      </header>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-8 overflow-x-auto pb-2 no-scrollbar">
        <Filter className="w-5 h-5 text-muted-foreground flex-shrink-0" />
        {(['all', 'little', 'big'] as GameMode[]).map((mode) => (
          <button
            key={mode}
            onClick={() => setFilter(mode)}
            className={`px-4 py-2 rounded-full font-bold whitespace-nowrap transition-all focus-ring ${
              filter === mode
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted hover:bg-muted/80'
            }`}
          >
            {getModeLabel(mode)}
          </button>
        ))}
      </div>

      {/* Game Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {filteredGames.map((game, index) => {
          const gameProgress = getGameProgress(game.id);
          const isCompleted = gameProgress && gameProgress.completedCount > 0;

          return (
            <CardTile
              key={game.id}
              color={game.color}
              completed={isCompleted}
              onClick={() => navigate(`/game/${game.id}`)}
              className="p-6"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="text-center">
                <div className="text-6xl mb-4">{game.icon}</div>
                <h3 className="text-xl font-bold mb-1">{game.title}</h3>
                <p className="text-muted-foreground text-sm mb-3">
                  {game.description}
                </p>
                <div className="flex items-center justify-center gap-2 flex-wrap">
                  <span className="px-2 py-1 bg-muted rounded-full text-xs font-medium">
                    {getModeLabel(game.mode)}
                  </span>
                  <span className="px-2 py-1 bg-muted rounded-full text-xs font-medium">
                    {getDifficultyBadge(game.difficulty)}
                  </span>
                </div>
                {gameProgress && gameProgress.bestScore > 0 && (
                  <div className="mt-3 flex items-center justify-center gap-1">
                    <span className="text-xs text-muted-foreground">Best:</span>
                    {Array.from({ length: gameProgress.bestScore }).map((_, i) => (
                      <Star
                        key={i}
                        className="w-4 h-4 text-game-yellow fill-game-yellow"
                      />
                    ))}
                  </div>
                )}
              </div>
            </CardTile>
          );
        })}
      </div>
    </div>
  );
}
