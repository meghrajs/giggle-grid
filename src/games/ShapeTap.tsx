import React, { useState, useCallback } from 'react';
import { useApp } from '@/contexts/AppContext';
import { playSound } from '@/lib/sound';
import { GameEndScreen } from '@/components/GameEndScreen';

type ShapeType = 'circle' | 'square' | 'triangle' | 'star';

const SHAPES: { type: ShapeType; icon: string }[] = [
  { type: 'circle', icon: '⭕' },
  { type: 'square', icon: '🟦' },
  { type: 'triangle', icon: '🔺' },
  { type: 'star', icon: '⭐' },
];

function ShapeIcon({ type, size = 'large' }: { type: ShapeType; size?: 'large' | 'small' }) {
  const sizeClass = size === 'large' ? 'w-24 h-24' : 'w-16 h-16';
  
  switch (type) {
    case 'circle':
      return <div className={`${sizeClass} rounded-full bg-game-red`} />;
    case 'square':
      return <div className={`${sizeClass} rounded-lg bg-game-blue`} />;
    case 'triangle':
      return (
        <div className={`${sizeClass} relative`}>
          <div className="absolute inset-0 bg-game-green" style={{
            clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)'
          }} />
        </div>
      );
    case 'star':
      return (
        <div className={`${sizeClass} relative`}>
          <div className="absolute inset-0 bg-game-yellow" style={{
            clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)'
          }} />
        </div>
      );
  }
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function generateOptions(target: ShapeType): ShapeType[] {
  // Create array with 2 of target and some distractors
  const options: ShapeType[] = [target, target];
  const distractors = SHAPES.filter(s => s.type !== target).map(s => s.type);
  while (options.length < 8) {
    options.push(distractors[Math.floor(Math.random() * distractors.length)]);
  }
  return shuffleArray(options);
}

export default function ShapeTap() {
  const { settings } = useApp();
  const [round, setRound] = useState(1);
  const [targetShape, setTargetShape] = useState<ShapeType>(() => 
    SHAPES[Math.floor(Math.random() * SHAPES.length)].type
  );
  const [options, setOptions] = useState<ShapeType[]>(() => generateOptions(targetShape));
  const [tappedIndex, setTappedIndex] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [gameComplete, setGameComplete] = useState(false);

  const TOTAL_ROUNDS = 5;

  const handleShapeTap = useCallback((shape: ShapeType, index: number) => {
    if (showResult) return;

    setTappedIndex(index);

    if (shape === targetShape) {
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
        setRound((r) => r + 1);
        const newTarget = SHAPES[Math.floor(Math.random() * SHAPES.length)].type;
        setTargetShape(newTarget);
        setOptions(generateOptions(newTarget));
        setShowResult(false);
        setFeedback(null);
        setTappedIndex(null);
      }
    }, 1000);
  }, [round, showResult, targetShape, settings.soundEnabled]);

  const resetGame = () => {
    setRound(1);
    setScore(0);
    setMistakes(0);
    setGameComplete(false);
    setShowResult(false);
    setFeedback(null);
    setTappedIndex(null);
    const newTarget = SHAPES[Math.floor(Math.random() * SHAPES.length)].type;
    setTargetShape(newTarget);
    setOptions(generateOptions(newTarget));
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
        gameId="shape-tap"
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
        <h2 className="text-3xl font-black mb-6">Tap the {targetShape}!</h2>
        <div className="flex justify-center">
          <ShapeIcon type={targetShape} size="large" />
        </div>
      </div>

      {/* Shape Grid */}
      <div className="grid grid-cols-4 gap-3 max-w-lg mx-auto">
        {options.map((shape, index) => (
          <button
            key={index}
            onClick={() => handleShapeTap(shape, index)}
            disabled={showResult}
            className={`aspect-square p-2 rounded-2xl bg-card shadow-soft flex items-center justify-center transition-all focus-ring ${
              tappedIndex === index && feedback === 'correct' ? 'ring-4 ring-game-green scale-110 bg-game-green/20' : ''
            } ${tappedIndex === index && feedback === 'wrong' ? 'ring-4 ring-game-red animate-shake' : ''
            } ${!showResult ? 'hover:scale-105 active:scale-95' : ''}`}
          >
            <ShapeIcon type={shape} size="small" />
          </button>
        ))}
      </div>

      {/* Feedback */}
      {feedback && (
        <div className={`text-center mt-8 text-4xl font-black animate-bounce-in ${
          feedback === 'correct' ? 'text-game-green' : 'text-game-red'
        }`}>
          {feedback === 'correct' ? '🎉 Great job!' : '😅 Oops!'}
        </div>
      )}
    </div>
  );
}
