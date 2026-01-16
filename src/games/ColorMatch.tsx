import React, { useState, useCallback } from 'react';
import { useApp } from '@/contexts/AppContext';
import { playSound } from '@/lib/sound';
import { GameEndScreen } from '@/components/GameEndScreen';

const COLORS = [
  { name: 'Red', hsl: 'hsl(var(--game-red))', class: 'bg-game-red' },
  { name: 'Orange', hsl: 'hsl(var(--game-orange))', class: 'bg-game-orange' },
  { name: 'Yellow', hsl: 'hsl(var(--game-yellow))', class: 'bg-game-yellow' },
  { name: 'Green', hsl: 'hsl(var(--game-green))', class: 'bg-game-green' },
  { name: 'Blue', hsl: 'hsl(var(--game-blue))', class: 'bg-game-blue' },
  { name: 'Purple', hsl: 'hsl(var(--game-purple))', class: 'bg-game-purple' },
];

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export default function ColorMatch() {
  const { settings } = useApp();
  const [round, setRound] = useState(1);
  const [targetColor, setTargetColor] = useState(() => COLORS[Math.floor(Math.random() * COLORS.length)]);
  const [shuffledColors, setShuffledColors] = useState(() => shuffleArray(COLORS));
  const [score, setScore] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [gameComplete, setGameComplete] = useState(false);

  const TOTAL_ROUNDS = 5;

  const handleColorClick = useCallback((color: typeof COLORS[0]) => {
    if (showResult) return;

    if (color.name === targetColor.name) {
      playSound('success', settings.soundEnabled);
      setScore((s) => s + 1);
      setFeedback('correct');
    } else {
      playSound('error', settings.soundEnabled);
      setMistakes((m) => m + 1);
      setFeedback('wrong');
    }

    setShowResult(true);

    setTimeout(() => {
      if (round >= TOTAL_ROUNDS) {
        setGameComplete(true);
      } else {
        // Next round
        setRound((r) => r + 1);
        const newTarget = COLORS[Math.floor(Math.random() * COLORS.length)];
        setTargetColor(newTarget);
        setShuffledColors(shuffleArray(COLORS));
        setShowResult(false);
        setFeedback(null);
      }
    }, 1000);
  }, [round, showResult, targetColor, settings.soundEnabled]);

  const resetGame = () => {
    setRound(1);
    setScore(0);
    setMistakes(0);
    setGameComplete(false);
    setShowResult(false);
    setFeedback(null);
    const newTarget = COLORS[Math.floor(Math.random() * COLORS.length)];
    setTargetColor(newTarget);
    setShuffledColors(shuffleArray(COLORS));
  };

  const calculateStars = () => {
    if (mistakes === 0) return 3;
    if (mistakes <= 2) return 2;
    if (score > 0) return 1;
    return 0;
  };

  if (gameComplete) {
    return (
      <GameEndScreen
        stars={calculateStars()}
        gameId="color-match"
        onPlayAgain={resetGame}
      />
    );
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      {/* Progress */}
      <div className="flex items-center justify-between mb-6">
        <span className="text-lg font-bold text-muted-foreground">
          Round {round}/{TOTAL_ROUNDS}
        </span>
        <span className="text-lg font-bold">
          ⭐ {score}
        </span>
      </div>

      {/* Target */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-black mb-6">Find this color!</h2>
        <div
          className={`w-32 h-32 mx-auto rounded-3xl shadow-lifted ${targetColor.class} ${feedback === 'correct' ? 'animate-pop' : ''}`}
        />
        <p className="text-4xl font-black mt-4">{targetColor.name}</p>
      </div>

      {/* Color Options */}
      <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto">
        {shuffledColors.map((color) => (
          <button
            key={color.name}
            onClick={() => handleColorClick(color)}
            disabled={showResult}
            className={`aspect-square rounded-2xl transition-all focus-ring ${color.class} ${
              showResult && color.name === targetColor.name ? 'ring-4 ring-foreground scale-110' : ''
            } ${showResult && color.name !== targetColor.name ? 'opacity-50' : 'hover:scale-105 active:scale-95'} ${
              feedback === 'wrong' && color.name !== targetColor.name && showResult ? 'animate-shake' : ''
            }`}
            aria-label={color.name}
          />
        ))}
      </div>

      {/* Feedback */}
      {feedback && (
        <div className={`text-center mt-8 text-4xl font-black animate-bounce-in ${
          feedback === 'correct' ? 'text-game-green' : 'text-game-red'
        }`}>
          {feedback === 'correct' ? '🎉 Correct!' : '😅 Try again!'}
        </div>
      )}
    </div>
  );
}
