import React, { useState, useEffect, useCallback } from 'react';
import { useApp } from '@/contexts/AppContext';
import { playSound, playStarSound } from '@/lib/sound';
import { GameEndScreen } from '@/components/GameEndScreen';

const CRITTERS = ['🐝', '🦋', '🐞', '🐛', '🐌', '🦗', '🐜', '🐢'];

interface Round {
  critter: string;
  count: number;
  options: number[];
}

function generateRound(difficulty: number): Round {
  const critter = CRITTERS[Math.floor(Math.random() * CRITTERS.length)];
  const maxCount = difficulty === 1 ? 5 : difficulty === 2 ? 10 : 15;
  const count = Math.floor(Math.random() * maxCount) + 1;
  
  // Generate wrong answers
  const options = [count];
  while (options.length < 4) {
    const wrong = Math.max(1, count + Math.floor(Math.random() * 5) - 2);
    if (!options.includes(wrong) && wrong !== count) {
      options.push(wrong);
    }
  }
  
  return { critter, count, options: options.sort(() => Math.random() - 0.5) };
}

export default function CountingCritters() {
  const { settings, updateGameProgress } = useApp();
  const [difficulty, setDifficulty] = useState(1);
  const [round, setRound] = useState<Round>(() => generateRound(1));
  const [score, setScore] = useState(0);
  const [roundNum, setRoundNum] = useState(1);
  const [totalRounds] = useState(5);
  const [showResult, setShowResult] = useState<'correct' | 'wrong' | null>(null);
  const [gameComplete, setGameComplete] = useState(false);
  const [earnedStars, setEarnedStars] = useState(0);
  const [critterPositions, setCritterPositions] = useState<{x: number, y: number}[]>([]);

  useEffect(() => {
    // Generate random positions for critters
    const positions = Array.from({ length: round.count }, () => ({
      x: Math.random() * 80 + 10,
      y: Math.random() * 70 + 15
    }));
    setCritterPositions(positions);
  }, [round]);

  const handleAnswer = useCallback((answer: number) => {
    if (showResult) return;

    const correct = answer === round.count;
    setShowResult(correct ? 'correct' : 'wrong');
    
    if (correct) {
      if (settings.soundEnabled) {
        playSound('correct', true);
      }
      setScore(s => s + 1);
    } else {
      if (settings.soundEnabled) {
        playSound('wrong', true);
      }
    }

    setTimeout(() => {
      setShowResult(null);
      if (roundNum >= totalRounds) {
        const stars = Math.ceil((score + (correct ? 1 : 0)) / totalRounds * 3);
        setEarnedStars(stars);
        setGameComplete(true);
      } else {
        setRoundNum(r => r + 1);
        setDifficulty(d => Math.min(3, d + 0.3));
        setRound(generateRound(Math.floor(difficulty + 0.3)));
      }
    }, 1000);
  }, [round, roundNum, totalRounds, score, settings, difficulty, showResult]);

  const handlePlayAgain = () => {
    setDifficulty(1);
    setRound(generateRound(1));
    setScore(0);
    setRoundNum(1);
    setGameComplete(false);
    setEarnedStars(0);
  };

  if (gameComplete) {
    return <GameEndScreen stars={earnedStars} onPlayAgain={handlePlayAgain} gameId="counting-critters" />;
  }

  return (
    <div className="p-4 max-w-2xl mx-auto">
      {/* Progress */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-bold text-muted-foreground">
          Round {roundNum}/{totalRounds}
        </span>
        <span className="text-sm font-bold text-game-orange">
          Score: {score}
        </span>
      </div>

      {/* Question */}
      <div className="text-center mb-4">
        <h2 className="text-2xl font-bold">How many {round.critter} do you see?</h2>
      </div>

      {/* Critter Field */}
      <div 
        className={`relative bg-gradient-to-b from-game-green/20 to-game-green/40 rounded-3xl h-64 mb-6 overflow-hidden border-4 border-game-green/50 ${
          showResult === 'correct' ? 'animate-bounce-in ring-4 ring-game-green' :
          showResult === 'wrong' ? 'animate-shake ring-4 ring-game-red' : ''
        }`}
      >
        {critterPositions.map((pos, i) => (
          <span
            key={i}
            className="absolute text-4xl animate-float"
            style={{ 
              left: `${pos.x}%`, 
              top: `${pos.y}%`,
              animationDelay: `${i * 0.1}s`
            }}
          >
            {round.critter}
          </span>
        ))}
      </div>

      {/* Answer Options */}
      <div className="grid grid-cols-4 gap-3">
        {round.options.map((option, index) => (
          <button
            key={index}
            onClick={() => handleAnswer(option)}
            disabled={showResult !== null}
            className={`p-4 text-3xl font-bold rounded-2xl transition-all transform hover:scale-105 active:scale-95 ${
              showResult && option === round.count
                ? 'bg-game-green text-white'
                : showResult && option !== round.count
                ? 'bg-muted text-muted-foreground'
                : 'bg-game-blue text-white hover:bg-game-blue/80'
            }`}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}
