import React, { useState, useCallback, useEffect } from 'react';
import { useApp } from '@/contexts/AppContext';
import { playSound, playAnimalSound } from '@/lib/sound';
import { GameEndScreen } from '@/components/GameEndScreen';
import { Volume2 } from 'lucide-react';

const ANIMALS = [
  { name: 'cat', emoji: '🐱', sound: 'Meow!', displayName: 'Cat' },
  { name: 'dog', emoji: '🐕', sound: 'Woof!', displayName: 'Dog' },
  { name: 'cow', emoji: '🐄', sound: 'Moo!', displayName: 'Cow' },
  { name: 'lion', emoji: '🦁', sound: 'Roar!', displayName: 'Lion' },
];

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export default function AnimalSounds() {
  const { settings } = useApp();
  const [round, setRound] = useState(1);
  const [targetAnimal, setTargetAnimal] = useState(() => ANIMALS[Math.floor(Math.random() * ANIMALS.length)]);
  const [shuffledAnimals, setShuffledAnimals] = useState(() => shuffleArray(ANIMALS));
  const [score, setScore] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [gameComplete, setGameComplete] = useState(false);
  const [showSoundHint, setShowSoundHint] = useState(true);

  const TOTAL_ROUNDS = 5;

  // Play sound on mount and when target changes
  useEffect(() => {
    if (!showResult && settings.soundEnabled) {
      setTimeout(() => {
        playAnimalSound(targetAnimal.name, settings.soundEnabled);
      }, 500);
    }
  }, [targetAnimal, showResult, settings.soundEnabled]);

  const handlePlaySound = () => {
    playAnimalSound(targetAnimal.name, settings.soundEnabled);
    setShowSoundHint(false);
  };

  const handleAnimalClick = useCallback((animal: typeof ANIMALS[0]) => {
    if (showResult) return;

    if (animal.name === targetAnimal.name) {
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
        const newTarget = ANIMALS[Math.floor(Math.random() * ANIMALS.length)];
        setTargetAnimal(newTarget);
        setShuffledAnimals(shuffleArray(ANIMALS));
        setShowResult(false);
        setFeedback(null);
        setShowSoundHint(true);
      }
    }, 1500);
  }, [round, showResult, targetAnimal, settings.soundEnabled]);

  const resetGame = () => {
    setRound(1);
    setScore(0);
    setMistakes(0);
    setGameComplete(false);
    setShowResult(false);
    setFeedback(null);
    setShowSoundHint(true);
    const newTarget = ANIMALS[Math.floor(Math.random() * ANIMALS.length)];
    setTargetAnimal(newTarget);
    setShuffledAnimals(shuffleArray(ANIMALS));
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
        gameId="animal-sounds"
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

      {/* Sound Prompt */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-black mb-6">Which animal makes this sound?</h2>
        
        {/* Sound button */}
        <button
          onClick={handlePlaySound}
          className={`relative p-8 rounded-3xl bg-secondary text-secondary-foreground shadow-lifted transition-all focus-ring hover:scale-105 active:scale-95 ${
            showSoundHint ? 'animate-pulse-glow' : ''
          }`}
        >
          <Volume2 className="w-16 h-16" />
          {showSoundHint && (
            <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-bold">
              Tap me!
            </span>
          )}
        </button>
        
        {/* Sound text hint */}
        <p className="text-4xl font-black mt-6 text-secondary">
          "{targetAnimal.sound}"
        </p>
      </div>

      {/* Animal Options */}
      <div className="grid grid-cols-2 gap-4 max-w-lg mx-auto">
        {shuffledAnimals.map((animal) => (
          <button
            key={animal.name}
            onClick={() => handleAnimalClick(animal)}
            disabled={showResult}
            className={`p-6 rounded-2xl bg-card shadow-soft transition-all focus-ring ${
              showResult && animal.name === targetAnimal.name ? 'ring-4 ring-game-green scale-105 bg-game-green/20' : ''
            } ${showResult && animal.name !== targetAnimal.name ? 'opacity-50' : ''
            } ${!showResult ? 'hover:scale-105 active:scale-95' : ''}`}
          >
            <div className="text-7xl mb-2">{animal.emoji}</div>
            <p className="text-xl font-bold">{animal.displayName}</p>
          </button>
        ))}
      </div>

      {/* Feedback */}
      {feedback && (
        <div className={`text-center mt-8 text-4xl font-black animate-bounce-in ${
          feedback === 'correct' ? 'text-game-green' : 'text-game-red'
        }`}>
          {feedback === 'correct' ? `🎉 Yes! ${targetAnimal.sound}` : `😅 That's not it!`}
        </div>
      )}
    </div>
  );
}
