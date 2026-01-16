import React, { useState, useCallback } from 'react';
import { useApp } from '@/contexts/AppContext';
import { playSound, playStarSound } from '@/lib/sound';
import { GameEndScreen } from '@/components/GameEndScreen';

interface Round {
  numbers: (number | null)[];
  missingIndex: number;
  answer: number;
  options: number[];
}

function generateRound(difficulty: number): Round {
  const start = Math.floor(Math.random() * (difficulty === 1 ? 5 : 10));
  const step = difficulty === 1 ? 1 : Math.random() > 0.5 ? 1 : 2;
  const length = difficulty === 1 ? 5 : 6;
  
  const numbers: number[] = [];
  for (let i = 0; i < length; i++) {
    numbers.push(start + i * step);
  }
  
  const missingIndex = Math.floor(Math.random() * (length - 2)) + 1;
  const answer = numbers[missingIndex];
  
  const options = [answer];
  while (options.length < 4) {
    const wrong = answer + Math.floor(Math.random() * 5) - 2;
    if (!options.includes(wrong) && wrong >= 0 && wrong !== answer) {
      options.push(wrong);
    }
  }
  
  const displayNumbers = numbers.map((n, i) => i === missingIndex ? null : n);
  
  return {
    numbers: displayNumbers,
    missingIndex,
    answer,
    options: options.sort(() => Math.random() - 0.5),
  };
}

export default function NumberLine() {
  const { settings, updateGameProgress } = useApp();
  const [difficulty, setDifficulty] = useState(1);
  const [round, setRound] = useState<Round>(() => generateRound(1));
  const [score, setScore] = useState(0);
  const [roundNum, setRoundNum] = useState(1);
  const [totalRounds] = useState(6);
  const [showResult, setShowResult] = useState<'correct' | 'wrong' | null>(null);
  const [gameComplete, setGameComplete] = useState(false);
  const [earnedStars, setEarnedStars] = useState(0);

  const handleAnswer = useCallback((answer: number) => {
    if (showResult) return;

    const correct = answer === round.answer;
    setShowResult(correct ? 'correct' : 'wrong');
    
    if (correct) {
      if (settings.soundEnabled) playSound('correct', true);
      setScore(s => s + 1);
    } else {
      if (settings.soundEnabled) playSound('wrong', true);
    }

    setTimeout(() => {
      setShowResult(null);
      if (roundNum >= totalRounds) {
        const stars = Math.ceil((score + (correct ? 1 : 0)) / totalRounds * 3);
        setEarnedStars(stars);
        setGameComplete(true);
      } else {
        setRoundNum(r => r + 1);
        const newDifficulty = roundNum >= 3 ? 2 : 1;
        setDifficulty(newDifficulty);
        setRound(generateRound(newDifficulty));
      }
    }, 1200);
  }, [round, roundNum, totalRounds, score, settings, showResult]);

  const handlePlayAgain = () => {
    setDifficulty(1);
    setRound(generateRound(1));
    setScore(0);
    setRoundNum(1);
    setGameComplete(false);
    setEarnedStars(0);
  };

  if (gameComplete) {
    return <GameEndScreen stars={earnedStars} onPlayAgain={handlePlayAgain} gameId="number-line" />;
  }

  return (
    <div className="p-4 max-w-2xl mx-auto">
      {/* Progress */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-bold text-muted-foreground">
          Round {roundNum}/{totalRounds}
        </span>
        <span className="text-sm font-bold text-game-teal">
          Score: {score}
        </span>
      </div>

      {/* Question */}
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold mb-2">Find the Missing Number!</h2>
        <p className="text-muted-foreground">What number goes in the empty spot?</p>
      </div>

      {/* Number Line */}
      <div 
        className={`relative bg-gradient-to-r from-game-teal/20 to-game-blue/20 rounded-3xl p-6 mb-8 ${
          showResult === 'correct' ? 'animate-bounce-in ring-4 ring-game-green' :
          showResult === 'wrong' ? 'animate-shake ring-4 ring-game-red' : ''
        }`}
      >
        {/* Line */}
        <div className="absolute top-1/2 left-8 right-8 h-2 bg-game-teal/50 rounded-full -translate-y-1/2" />
        
        {/* Numbers */}
        <div className="flex items-center justify-between relative z-10">
          {round.numbers.map((num, i) => (
            <div key={i} className="flex flex-col items-center">
              <div 
                className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl font-bold ${
                  num === null
                    ? 'bg-game-yellow border-4 border-dashed border-game-orange'
                    : 'bg-game-teal text-white'
                }`}
              >
                {num === null ? (
                  showResult ? (
                    <span className="animate-bounce-in">{round.answer}</span>
                  ) : '?'
                ) : num}
              </div>
              {/* Tick mark */}
              <div className="w-1 h-3 bg-game-teal/50 mt-1" />
            </div>
          ))}
        </div>
      </div>

      {/* Answer Options */}
      <div className="grid grid-cols-4 gap-4">
        {round.options.map((option, index) => (
          <button
            key={index}
            onClick={() => handleAnswer(option)}
            disabled={showResult !== null}
            className={`p-4 text-3xl font-bold rounded-2xl transition-all transform hover:scale-105 active:scale-95 ${
              showResult && option === round.answer
                ? 'bg-game-green text-white ring-4 ring-game-green/50'
                : showResult && option !== round.answer
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
