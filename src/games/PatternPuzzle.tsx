import React, { useState, useCallback } from 'react';
import { useApp } from '@/contexts/AppContext';
import { playSound, playStarSound } from '@/lib/sound';
import { GameEndScreen } from '@/components/GameEndScreen';

const PATTERNS = [
  { sequence: ['🔴', '🔵', '🔴', '🔵'], answer: '🔴', options: ['🔴', '🔵', '🟢', '🟡'] },
  { sequence: ['🌟', '🌙', '🌟', '🌙'], answer: '🌟', options: ['🌟', '🌙', '☀️', '⭐'] },
  { sequence: ['🍎', '🍎', '🍊', '🍎', '🍎'], answer: '🍊', options: ['🍎', '🍊', '🍋', '🍇'] },
  { sequence: ['⬆️', '➡️', '⬇️', '⬅️'], answer: '⬆️', options: ['⬆️', '➡️', '⬇️', '⬅️'] },
  { sequence: ['1️⃣', '2️⃣', '3️⃣', '4️⃣'], answer: '5️⃣', options: ['5️⃣', '6️⃣', '1️⃣', '3️⃣'] },
  { sequence: ['🐶', '🐱', '🐶', '🐱'], answer: '🐶', options: ['🐶', '🐱', '🐭', '🐹'] },
  { sequence: ['❤️', '💛', '💚', '💙'], answer: '💜', options: ['💜', '❤️', '🖤', '💛'] },
  { sequence: ['🌸', '🌸', '🌺', '🌸', '🌸'], answer: '🌺', options: ['🌸', '🌺', '🌻', '🌷'] },
];

interface Round {
  sequence: string[];
  answer: string;
  options: string[];
}

function generateRound(usedIndices: number[]): { round: Round; index: number } {
  let index;
  do {
    index = Math.floor(Math.random() * PATTERNS.length);
  } while (usedIndices.includes(index) && usedIndices.length < PATTERNS.length);
  
  return { round: PATTERNS[index], index };
}

export default function PatternPuzzle() {
  const { settings, updateGameProgress } = useApp();
  const [usedIndices, setUsedIndices] = useState<number[]>([]);
  const [currentRound, setCurrentRound] = useState<Round>(() => generateRound([]).round);
  const [score, setScore] = useState(0);
  const [roundNum, setRoundNum] = useState(1);
  const [totalRounds] = useState(5);
  const [showResult, setShowResult] = useState<'correct' | 'wrong' | null>(null);
  const [gameComplete, setGameComplete] = useState(false);
  const [earnedStars, setEarnedStars] = useState(0);

  const handleAnswer = useCallback((answer: string) => {
    if (showResult) return;

    const correct = answer === currentRound.answer;
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
        const { round, index } = generateRound(usedIndices);
        setUsedIndices([...usedIndices, index]);
        setCurrentRound(round);
      }
    }, 1200);
  }, [currentRound, roundNum, totalRounds, score, settings, usedIndices, showResult]);

  const handlePlayAgain = () => {
    setUsedIndices([]);
    setCurrentRound(generateRound([]).round);
    setScore(0);
    setRoundNum(1);
    setGameComplete(false);
    setEarnedStars(0);
  };

  if (gameComplete) {
    return <GameEndScreen stars={earnedStars} onPlayAgain={handlePlayAgain} gameId="pattern-puzzle" />;
  }

  return (
    <div className="p-4 max-w-2xl mx-auto">
      {/* Progress */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-bold text-muted-foreground">
          Round {roundNum}/{totalRounds}
        </span>
        <span className="text-sm font-bold text-game-purple">
          Score: {score}
        </span>
      </div>

      {/* Question */}
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold mb-2">What comes next?</h2>
        <p className="text-muted-foreground">Complete the pattern!</p>
      </div>

      {/* Pattern Display */}
      <div 
        className={`flex items-center justify-center gap-3 p-6 bg-gradient-to-r from-game-purple/20 to-game-pink/20 rounded-3xl mb-8 ${
          showResult === 'correct' ? 'animate-bounce-in ring-4 ring-game-green' :
          showResult === 'wrong' ? 'animate-shake ring-4 ring-game-red' : ''
        }`}
      >
        {currentRound.sequence.map((item, i) => (
          <span key={i} className="text-5xl">{item}</span>
        ))}
        <div className="w-16 h-16 rounded-xl border-4 border-dashed border-game-purple flex items-center justify-center">
          {showResult && (
            <span className="text-5xl animate-bounce-in">{currentRound.answer}</span>
          )}
          {!showResult && <span className="text-3xl text-muted-foreground">?</span>}
        </div>
      </div>

      {/* Answer Options */}
      <div className="grid grid-cols-4 gap-4">
        {currentRound.options.map((option, index) => (
          <button
            key={index}
            onClick={() => handleAnswer(option)}
            disabled={showResult !== null}
            className={`p-4 text-5xl rounded-2xl transition-all transform hover:scale-110 active:scale-95 ${
              showResult && option === currentRound.answer
                ? 'bg-game-green ring-4 ring-game-green/50'
                : 'bg-card hover:bg-muted shadow-kid'
            }`}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}
