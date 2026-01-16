import React, { useState, useCallback } from 'react';
import { useApp } from '@/contexts/AppContext';
import { playSound, playStarSound } from '@/lib/sound';
import { GameEndScreen } from '@/components/GameEndScreen';

const HABITATS = [
  { 
    name: 'Ocean',
    emoji: '🌊',
    color: 'from-blue-400 to-blue-600',
    animals: ['🐟', '🐙', '🦈', '🐬', '🦀', '🐳']
  },
  { 
    name: 'Forest',
    emoji: '🌲',
    color: 'from-green-500 to-green-700',
    animals: ['🦊', '🐿️', '🦉', '🐻', '🦌', '🐺']
  },
  { 
    name: 'Farm',
    emoji: '🏠',
    color: 'from-yellow-400 to-orange-500',
    animals: ['🐄', '🐔', '🐷', '🐴', '🐑', '🐐']
  },
  { 
    name: 'Safari',
    emoji: '🦁',
    color: 'from-amber-400 to-amber-600',
    animals: ['🦁', '🦓', '🐘', '🦒', '🦏', '🐆']
  },
];

interface Round {
  animal: string;
  correctHabitat: typeof HABITATS[0];
  allHabitats: typeof HABITATS;
}

function generateRound(): Round {
  const habitatIndex = Math.floor(Math.random() * HABITATS.length);
  const habitat = HABITATS[habitatIndex];
  const animal = habitat.animals[Math.floor(Math.random() * habitat.animals.length)];
  
  return {
    animal,
    correctHabitat: habitat,
    allHabitats: HABITATS,
  };
}

export default function AnimalHabitat() {
  const { settings, updateGameProgress } = useApp();
  const [round, setRound] = useState<Round>(() => generateRound());
  const [score, setScore] = useState(0);
  const [roundNum, setRoundNum] = useState(1);
  const [totalRounds] = useState(6);
  const [showResult, setShowResult] = useState<string | null>(null);
  const [gameComplete, setGameComplete] = useState(false);
  const [earnedStars, setEarnedStars] = useState(0);

  const handleSelectHabitat = useCallback((habitat: typeof HABITATS[0]) => {
    if (showResult) return;

    const correct = habitat.name === round.correctHabitat.name;
    setShowResult(habitat.name);
    
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
    return <GameEndScreen stars={earnedStars} onPlayAgain={handlePlayAgain} gameId="animal-habitat" />;
  }

  return (
    <div className="p-4 max-w-2xl mx-auto">
      {/* Progress */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-bold text-muted-foreground">
          Round {roundNum}/{totalRounds}
        </span>
        <span className="text-sm font-bold text-game-green">
          Score: {score}
        </span>
      </div>

      {/* Animal Display */}
      <div className="text-center mb-8">
        <div className="text-9xl mb-4 animate-bounce">{round.animal}</div>
        <h2 className="text-2xl font-bold">Where does this animal live?</h2>
      </div>

      {/* Habitat Options */}
      <div className="grid grid-cols-2 gap-4">
        {round.allHabitats.map((habitat) => {
          const isSelected = showResult === habitat.name;
          const isCorrect = habitat.name === round.correctHabitat.name;
          
          return (
            <button
              key={habitat.name}
              onClick={() => handleSelectHabitat(habitat)}
              disabled={showResult !== null}
              className={`relative p-6 rounded-3xl transition-all transform hover:scale-105 active:scale-95 overflow-hidden ${
                showResult && isCorrect
                  ? 'ring-4 ring-game-green animate-bounce-in'
                  : showResult && isSelected && !isCorrect
                  ? 'ring-4 ring-game-red animate-shake opacity-50'
                  : ''
              }`}
            >
              {/* Background Gradient */}
              <div className={`absolute inset-0 bg-gradient-to-br ${habitat.color} opacity-80`} />
              
              {/* Content */}
              <div className="relative z-10 flex flex-col items-center text-white">
                <span className="text-5xl mb-2">{habitat.emoji}</span>
                <span className="text-xl font-bold">{habitat.name}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
