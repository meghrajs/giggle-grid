import React, { useState, useCallback } from 'react';
import { useApp } from '@/contexts/AppContext';
import { playSound, playStarSound } from '@/lib/sound';
import { GameEndScreen } from '@/components/GameEndScreen';

const SORTING_CHALLENGES = [
  {
    instruction: 'Sort by SIZE (smallest to biggest)',
    items: ['🐜', '🐈', '🐘'],
    correct: ['🐜', '🐈', '🐘'],
  },
  {
    instruction: 'Sort by SIZE (smallest to biggest)',
    items: ['🌱', '🌳', '🌿'],
    correct: ['🌱', '🌿', '🌳'],
  },
  {
    instruction: 'Sort from COLD to HOT',
    items: ['🧊', '☀️', '💧'],
    correct: ['🧊', '💧', '☀️'],
  },
  {
    instruction: 'Sort from SLOW to FAST',
    items: ['🐢', '🐇', '🚗'],
    correct: ['🐢', '🐇', '🚗'],
  },
  {
    instruction: 'Sort by AGE (baby to adult)',
    items: ['👶', '👦', '👨'],
    correct: ['👶', '👦', '👨'],
  },
  {
    instruction: 'Sort from QUIET to LOUD',
    items: ['🐁', '🐶', '🦁'],
    correct: ['🐁', '🐶', '🦁'],
  },
  {
    instruction: 'Sort from LIGHT to HEAVY',
    items: ['🪶', '📚', '🪨'],
    correct: ['🪶', '📚', '🪨'],
  },
  {
    instruction: 'Sort meal time (morning to night)',
    items: ['🌅', '☀️', '🌙'],
    correct: ['🌅', '☀️', '🌙'],
  },
];

interface Round {
  instruction: string;
  items: string[];
  correct: string[];
}

function generateRound(usedIndices: number[]): { round: Round; index: number } {
  let index;
  do {
    index = Math.floor(Math.random() * SORTING_CHALLENGES.length);
  } while (usedIndices.includes(index) && usedIndices.length < SORTING_CHALLENGES.length);
  
  const challenge = SORTING_CHALLENGES[index];
  const shuffled = [...challenge.items].sort(() => Math.random() - 0.5);
  
  return { 
    round: {
      instruction: challenge.instruction,
      items: shuffled,
      correct: challenge.correct,
    },
    index 
  };
}

export default function SortingFun() {
  const { settings, updateGameProgress } = useApp();
  const [usedIndices, setUsedIndices] = useState<number[]>([]);
  const [round, setRound] = useState<Round>(() => generateRound([]).round);
  const [sortedItems, setSortedItems] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const [roundNum, setRoundNum] = useState(1);
  const [totalRounds] = useState(5);
  const [showResult, setShowResult] = useState(false);
  const [gameComplete, setGameComplete] = useState(false);
  const [earnedStars, setEarnedStars] = useState(0);

  const handleSelectItem = (item: string) => {
    if (showResult || sortedItems.includes(item)) return;
    
    if (settings.soundEnabled) playSound('click', true);
    setSortedItems(prev => [...prev, item]);
  };

  const handleUndo = () => {
    if (sortedItems.length > 0 && !showResult) {
      setSortedItems(prev => prev.slice(0, -1));
    }
  };

  const handleCheck = useCallback(() => {
    if (sortedItems.length !== round.items.length || showResult) return;

    setShowResult(true);
    
    const isCorrect = sortedItems.every((item, i) => item === round.correct[i]);
    
    if (isCorrect) {
      if (settings.soundEnabled) playSound('correct', true);
      setScore(s => s + 1);
    } else {
      if (settings.soundEnabled) playSound('wrong', true);
    }

    setTimeout(() => {
      setShowResult(false);
      setSortedItems([]);
      if (roundNum >= totalRounds) {
        const finalScore = score + (isCorrect ? 1 : 0);
        const stars = Math.ceil(finalScore / totalRounds * 3);
        setEarnedStars(stars);
        setGameComplete(true);
      } else {
        setRoundNum(r => r + 1);
        const { round: newRound, index } = generateRound(usedIndices);
        setUsedIndices([...usedIndices, index]);
        setRound(newRound);
      }
    }, 1500);
  }, [sortedItems, round, roundNum, totalRounds, score, settings, usedIndices, showResult]);

  const handlePlayAgain = () => {
    setUsedIndices([]);
    setRound(generateRound([]).round);
    setSortedItems([]);
    setScore(0);
    setRoundNum(1);
    setGameComplete(false);
    setEarnedStars(0);
  };

  if (gameComplete) {
    return <GameEndScreen stars={earnedStars} onPlayAgain={handlePlayAgain} gameId="sorting-fun" />;
  }

  const availableItems = round.items.filter(item => !sortedItems.includes(item));

  return (
    <div className="p-4 max-w-2xl mx-auto">
      {/* Progress */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-bold text-muted-foreground">
          Round {roundNum}/{totalRounds}
        </span>
        <span className="text-sm font-bold text-game-pink">
          Score: {score}
        </span>
      </div>

      {/* Instruction */}
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold">{round.instruction}</h2>
        <p className="text-muted-foreground mt-2">Tap items in order!</p>
      </div>

      {/* Sorted Area */}
      <div 
        className={`flex items-center justify-center gap-4 p-6 min-h-32 bg-gradient-to-r from-game-pink/20 to-game-purple/20 rounded-3xl mb-6 border-4 border-dashed ${
          sortedItems.length === round.items.length ? 'border-game-purple' : 'border-muted'
        } ${
          showResult && sortedItems.every((item, i) => item === round.correct[i])
            ? 'ring-4 ring-game-green animate-bounce-in'
            : showResult
            ? 'ring-4 ring-game-red animate-shake'
            : ''
        }`}
      >
        {sortedItems.length === 0 ? (
          <p className="text-muted-foreground">Tap items below to sort them here</p>
        ) : (
          <>
            {sortedItems.map((item, i) => (
              <React.Fragment key={i}>
                {i > 0 && <span className="text-2xl text-muted-foreground">→</span>}
                <span className="text-5xl animate-bounce-in">{item}</span>
              </React.Fragment>
            ))}
          </>
        )}
      </div>

      {/* Available Items */}
      <div className="flex items-center justify-center gap-4 mb-6">
        {availableItems.map((item, index) => (
          <button
            key={index}
            onClick={() => handleSelectItem(item)}
            className="p-4 text-5xl rounded-2xl bg-card hover:bg-muted shadow-kid transition-all transform hover:scale-110 active:scale-95"
          >
            {item}
          </button>
        ))}
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-4">
        <button
          onClick={handleUndo}
          disabled={sortedItems.length === 0 || showResult}
          className={`px-6 py-3 rounded-xl font-bold transition-all ${
            sortedItems.length > 0 && !showResult
              ? 'bg-muted hover:bg-muted/80'
              : 'bg-muted/50 text-muted-foreground cursor-not-allowed'
          }`}
        >
          ↩️ Undo
        </button>
        <button
          onClick={handleCheck}
          disabled={sortedItems.length !== round.items.length || showResult}
          className={`btn-big rounded-2xl px-8 py-4 text-xl font-bold transition-all ${
            sortedItems.length === round.items.length && !showResult
              ? 'bg-game-green text-white hover:bg-game-green/90'
              : 'bg-muted text-muted-foreground cursor-not-allowed'
          }`}
        >
          Check Order! ✓
        </button>
      </div>
    </div>
  );
}
