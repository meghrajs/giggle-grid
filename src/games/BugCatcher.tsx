import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useApp } from '@/contexts/AppContext';
import { playSound, playStarSound } from '@/lib/sound';
import { GameEndScreen } from '@/components/GameEndScreen';

interface Bug {
  id: number;
  emoji: string;
  x: number;
  y: number;
  dx: number;
  dy: number;
  isTarget: boolean;
}

const BUG_TYPES = ['🐝', '🦋', '🐞', '🐛', '🦗'];

export default function BugCatcher() {
  const { settings, updateGameProgress } = useApp();
  const [bugs, setBugs] = useState<Bug[]>([]);
  const [targetBug, setTargetBug] = useState('🐝');
  const [score, setScore] = useState(0);
  const [caught, setCaught] = useState(0);
  const [targetCount, setTargetCount] = useState(5);
  const [timeLeft, setTimeLeft] = useState(30);
  const [gameComplete, setGameComplete] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [earnedStars, setEarnedStars] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>();

  const initGame = useCallback(() => {
    const newTarget = BUG_TYPES[Math.floor(Math.random() * BUG_TYPES.length)];
    setTargetBug(newTarget);
    
    const newBugs: Bug[] = [];
    // Add target bugs
    for (let i = 0; i < targetCount; i++) {
      newBugs.push({
        id: i,
        emoji: newTarget,
        x: Math.random() * 80 + 10,
        y: Math.random() * 70 + 15,
        dx: (Math.random() - 0.5) * 2,
        dy: (Math.random() - 0.5) * 2,
        isTarget: true,
      });
    }
    // Add distractor bugs
    for (let i = targetCount; i < targetCount + 8; i++) {
      let distractor;
      do {
        distractor = BUG_TYPES[Math.floor(Math.random() * BUG_TYPES.length)];
      } while (distractor === newTarget);
      
      newBugs.push({
        id: i,
        emoji: distractor,
        x: Math.random() * 80 + 10,
        y: Math.random() * 70 + 15,
        dx: (Math.random() - 0.5) * 2,
        dy: (Math.random() - 0.5) * 2,
        isTarget: false,
      });
    }
    setBugs(newBugs);
    setCaught(0);
    setScore(0);
    setTimeLeft(30);
    setGameComplete(false);
    setGameStarted(true);
    setEarnedStars(0);
  }, [targetCount]);

  // Animate bugs
  useEffect(() => {
    if (!gameStarted || gameComplete) return;

    const animate = () => {
      setBugs(prevBugs => prevBugs.map(bug => {
        let newX = bug.x + bug.dx * 0.3;
        let newY = bug.y + bug.dy * 0.3;
        let newDx = bug.dx;
        let newDy = bug.dy;

        if (newX < 5 || newX > 90) newDx = -newDx;
        if (newY < 5 || newY > 85) newDy = -newDy;

        return {
          ...bug,
          x: Math.max(5, Math.min(90, newX)),
          y: Math.max(5, Math.min(85, newY)),
          dx: newDx,
          dy: newDy,
        };
      }));
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [gameStarted, gameComplete]);

  // Timer
  useEffect(() => {
    if (!gameStarted || gameComplete) return;

    const timer = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(timer);
          const stars = caught >= targetCount ? 3 : caught >= targetCount / 2 ? 2 : caught > 0 ? 1 : 0;
          setEarnedStars(stars);
          setGameComplete(true);
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameStarted, gameComplete, caught, targetCount]);

  // Check win condition
  useEffect(() => {
    if (caught >= targetCount && gameStarted && !gameComplete) {
      const stars = 3;
      setEarnedStars(stars);
      setGameComplete(true);
    }
  }, [caught, targetCount, gameStarted, gameComplete]);

  const handleCatchBug = (bug: Bug) => {
    if (bug.isTarget) {
      if (settings.soundEnabled) playSound('correct', true);
      setScore(s => s + 10);
      setCaught(c => c + 1);
      setBugs(prev => prev.filter(b => b.id !== bug.id));
    } else {
      if (settings.soundEnabled) playSound('wrong', true);
      setScore(s => Math.max(0, s - 5));
    }
  };

  const handlePlayAgain = () => {
    initGame();
  };

  if (gameComplete) {
    return <GameEndScreen stars={earnedStars} onPlayAgain={handlePlayAgain} gameId="bug-catcher" />;
  }

  if (!gameStarted) {
    return (
      <div className="p-4 max-w-2xl mx-auto text-center">
        <div className="text-8xl mb-6 animate-bounce">🦋</div>
        <h2 className="text-3xl font-bold mb-4">Bug Catcher</h2>
        <p className="text-lg text-muted-foreground mb-8">
          Catch all the target bugs before time runs out!<br/>
          Be careful not to tap the wrong ones!
        </p>
        <button
          onClick={initGame}
          className="btn-big bg-game-green text-white rounded-2xl px-8 py-4 text-xl font-bold hover:bg-game-green/90 transition-all"
        >
          Start Catching! 🎮
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{targetBug}</span>
          <span className="font-bold text-sm">Catch: {caught}/{targetCount}</span>
        </div>
        <div className={`font-bold text-lg ${timeLeft <= 10 ? 'text-game-red animate-pulse' : ''}`}>
          ⏱️ {timeLeft}s
        </div>
        <div className="font-bold text-game-orange">
          Score: {score}
        </div>
      </div>

      {/* Game Field */}
      <div 
        ref={containerRef}
        className="relative bg-gradient-to-b from-sky-200 to-green-200 dark:from-sky-900 dark:to-green-900 rounded-3xl h-80 overflow-hidden border-4 border-game-green/50"
      >
        {/* Grass */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-green-500 to-green-400 dark:from-green-800 dark:to-green-700" />
        
        {/* Flowers */}
        <div className="absolute bottom-8 left-10 text-2xl">🌸</div>
        <div className="absolute bottom-10 left-1/3 text-2xl">🌻</div>
        <div className="absolute bottom-6 right-1/4 text-2xl">🌺</div>
        <div className="absolute bottom-12 right-10 text-2xl">🌷</div>

        {/* Bugs */}
        {bugs.map(bug => (
          <button
            key={bug.id}
            onClick={() => handleCatchBug(bug)}
            className="absolute text-4xl transition-transform hover:scale-125 active:scale-90 cursor-pointer"
            style={{ 
              left: `${bug.x}%`, 
              top: `${bug.y}%`,
              transform: 'translate(-50%, -50%)'
            }}
          >
            {bug.emoji}
          </button>
        ))}
      </div>

      <p className="text-center mt-4 text-muted-foreground">
        Tap all the <span className="text-2xl">{targetBug}</span> bugs!
      </p>
    </div>
  );
}
