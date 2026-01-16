import React, { useState, useCallback } from 'react';
import { useApp } from '@/contexts/AppContext';
import { playSound, playStarSound } from '@/lib/sound';
import { GameEndScreen } from '@/components/GameEndScreen';

const SHADOW_ITEMS = [
  { emoji: '🚗', name: 'Car' },
  { emoji: '🏠', name: 'House' },
  { emoji: '🌳', name: 'Tree' },
  { emoji: '⭐', name: 'Star' },
  { emoji: '🎈', name: 'Balloon' },
  { emoji: '🦋', name: 'Butterfly' },
  { emoji: '🐟', name: 'Fish' },
  { emoji: '🍎', name: 'Apple' },
  { emoji: '☂️', name: 'Umbrella' },
  { emoji: '🎸', name: 'Guitar' },
  { emoji: '✈️', name: 'Airplane' },
  { emoji: '🚀', name: 'Rocket' },
];

interface Round {
  target: typeof SHADOW_ITEMS[0];
  options: typeof SHADOW_ITEMS;
}

function generateRound(): Round {
  const shuffled = [...SHADOW_ITEMS].sort(() => Math.random() - 0.5);
  const options = shuffled.slice(0, 4);
  const target = options[Math.floor(Math.random() * options.length)];
  
  return { target, options: options.sort(() => Math.random() - 0.5) };
}

export default function ShadowMatch() {
  const { settings, updateGameProgress } = useApp();
  const [round, setRound] = useState<Round>(() => generateRound());
  const [score, setScore] = useState(0);
  const [roundNum, setRoundNum] = useState(1);
  const [totalRounds] = useState(6);
  const [showResult, setShowResult] = useState<string | null>(null);
  const [gameComplete, setGameComplete] = useState(false);
  const [earnedStars, setEarnedStars] = useState(0);

  const handleSelect = useCallback((item: typeof SHADOW_ITEMS[0]) => {
    if (showResult) return;

    const correct = item.emoji === round.target.emoji;
    setShowResult(item.emoji);
    
    if (correct) {
      if (settings.soundEnabled) playSound('correct', true);
      setScore(s => s + 1);
    } else {
      if (settings.soundEnabled) playSound('wrong', true);
    }

    setTimeout(() => {
      setShowResult(null);
      if (roundNum >= totalRounds) {
        const finalScore = score + (correct ? 1 : 0);
        const stars = Math.ceil(finalScore / totalRounds * 3);
        setEarnedStars(stars);
        setGameComplete(true);
      } else {
        setRoundNum(r => r + 1);
        setRound(generateRound());
      }
    }, 1200);
  }, [round, roundNum, totalRounds, score, settings, showResult]);

  const handlePlayAgain = () => {
    setRound(generateRound());
    setScore(0);
    setRoundNum(1);
    setGameComplete(false);
    setEarnedStars(0);
  };

  if (gameComplete) {
    return <GameEndScreen stars={earnedStars} onPlayAgain={handlePlayAgain} gameId="shadow-match" />;
  }

  return (
    <div className="p-4 max-w-2xl mx-auto">
      {/* Progress */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-bold text-muted-foreground">
          Round {roundNum}/{totalRounds}
        </span>
        <span className="text-sm font-bold text-gray-700 dark:text-gray-300">
          Score: {score}
        </span>
      </div>

      {/* Question */}
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold mb-2">Find the Shadow!</h2>
        <p className="text-muted-foreground">Which shape matches this shadow?</p>
      </div>

      {/* Shadow Display */}
      <div 
        className={`flex items-center justify-center p-8 bg-gradient-to-b from-gray-200 to-gray-400 dark:from-gray-700 dark:to-gray-900 rounded-3xl mb-8 ${
          showResult === round.target.emoji ? 'animate-bounce-in ring-4 ring-game-green' :
          showResult && showResult !== round.target.emoji ? 'animate-shake ring-4 ring-game-red' : ''
        }`}
      >
        <span 
          className="text-9xl transition-all duration-500"
          style={{ 
            filter: showResult ? 'none' : 'brightness(0) drop-shadow(2px 4px 6px rgba(0,0,0,0.5))',
          }}
        >
          {round.target.emoji}
        </span>
      </div>

      {/* Options */}
      <div className="grid grid-cols-4 gap-4">
        {round.options.map((item, index) => {
          const isSelected = showResult === item.emoji;
          const isCorrect = item.emoji === round.target.emoji;
          
          return (
            <button
              key={index}
              onClick={() => handleSelect(item)}
              disabled={showResult !== null}
              className={`p-4 text-5xl rounded-2xl transition-all transform hover:scale-110 active:scale-95 ${
                showResult && isCorrect
                  ? 'bg-game-green ring-4 ring-game-green/50'
                  : showResult && isSelected && !isCorrect
                  ? 'bg-game-red ring-4 ring-game-red/50 opacity-50'
                  : 'bg-card hover:bg-muted shadow-kid'
              }`}
            >
              {item.emoji}
            </button>
          );
        })}
      </div>
    </div>
  );
}
