import React, { useState, useCallback } from 'react';
import { useApp } from '@/contexts/AppContext';
import { playSound } from '@/lib/sound';
import { GameEndScreen } from '@/components/GameEndScreen';
import { Delete, Lightbulb } from 'lucide-react';

const WORDS = [
  { word: 'DOG', emoji: '🐶', hint: 'A pet that barks' },
  { word: 'CAT', emoji: '🐱', hint: 'A pet that meows' },
  { word: 'SUN', emoji: '☀️', hint: 'It shines in the sky' },
  { word: 'FISH', emoji: '🐟', hint: 'It lives in water' },
  { word: 'BIRD', emoji: '🐦', hint: 'It can fly' },
  { word: 'STAR', emoji: '⭐', hint: 'It twinkles at night' },
  { word: 'TREE', emoji: '🌳', hint: 'It has leaves' },
  { word: 'CAKE', emoji: '🎂', hint: 'A birthday treat' },
  { word: 'FROG', emoji: '🐸', hint: 'It says ribbit' },
  { word: 'BEAR', emoji: '🐻', hint: 'A big furry animal' },
];

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function generateLetters(word: string): string[] {
  // Add the word letters plus some random extras
  const letters = word.split('');
  const extras = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    .split('')
    .filter(l => !word.includes(l))
    .slice(0, 4);
  return shuffleArray([...letters, ...shuffleArray(extras).slice(0, 2)]);
}

export default function SpellingBuilder() {
  const { settings } = useApp();
  const [round, setRound] = useState(1);
  const [currentWord, setCurrentWord] = useState(() => WORDS[0]);
  const [availableLetters, setAvailableLetters] = useState<string[]>(() => generateLetters(WORDS[0].word));
  const [builtWord, setBuiltWord] = useState<string[]>([]);
  const [usedIndexes, setUsedIndexes] = useState<number[]>([]);
  const [score, setScore] = useState(0);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [gameComplete, setGameComplete] = useState(false);

  const TOTAL_ROUNDS = 5;

  const handleLetterClick = useCallback((letter: string, index: number) => {
    if (usedIndexes.includes(index)) return;
    if (feedback) return;

    playSound('click', settings.soundEnabled);
    
    const newBuiltWord = [...builtWord, letter];
    setBuiltWord(newBuiltWord);
    setUsedIndexes([...usedIndexes, index]);

    // Check if word is complete
    if (newBuiltWord.length === currentWord.word.length) {
      const builtString = newBuiltWord.join('');
      
      if (builtString === currentWord.word) {
        playSound('success', settings.soundEnabled);
        setScore((s) => s + 1);
        setFeedback('correct');
        
        setTimeout(() => {
          if (round >= TOTAL_ROUNDS) {
            setGameComplete(true);
          } else {
            nextRound();
          }
        }, 1500);
      } else {
        playSound('error', settings.soundEnabled);
        setFeedback('wrong');
        
        setTimeout(() => {
          // Reset for another try
          setBuiltWord([]);
          setUsedIndexes([]);
          setFeedback(null);
        }, 1000);
      }
    }
  }, [builtWord, usedIndexes, currentWord, round, feedback, settings.soundEnabled]);

  const handleBackspace = () => {
    if (builtWord.length > 0 && !feedback) {
      playSound('click', settings.soundEnabled);
      setBuiltWord(builtWord.slice(0, -1));
      setUsedIndexes(usedIndexes.slice(0, -1));
    }
  };

  const handleHint = () => {
    setShowHint(true);
    setHintsUsed((h) => h + 1);
    playSound('click', settings.soundEnabled);
  };

  const nextRound = () => {
    setRound((r) => r + 1);
    const nextWord = WORDS[round % WORDS.length];
    setCurrentWord(nextWord);
    setAvailableLetters(generateLetters(nextWord.word));
    setBuiltWord([]);
    setUsedIndexes([]);
    setFeedback(null);
    setShowHint(false);
  };

  const resetGame = () => {
    setRound(1);
    setScore(0);
    setHintsUsed(0);
    setGameComplete(false);
    setFeedback(null);
    setShowHint(false);
    const firstWord = WORDS[Math.floor(Math.random() * WORDS.length)];
    setCurrentWord(firstWord);
    setAvailableLetters(generateLetters(firstWord.word));
    setBuiltWord([]);
    setUsedIndexes([]);
  };

  const calculateStars = () => {
    const perfectScore = TOTAL_ROUNDS;
    if (score === perfectScore && hintsUsed === 0) return 3;
    if (score >= perfectScore * 0.8) return 2;
    if (score > 0) return 1;
    return 0;
  };

  if (gameComplete) {
    return (
      <GameEndScreen
        stars={calculateStars()}
        gameId="spelling-builder"
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

      {/* Word to spell */}
      <div className="text-center mb-8">
        <div className="text-8xl mb-4">{currentWord.emoji}</div>
        <h2 className="text-3xl font-black mb-2">Spell: {currentWord.word}</h2>
        
        {/* Hint button */}
        {!showHint ? (
          <button
            onClick={handleHint}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <Lightbulb className="w-4 h-4" />
            Need a hint?
          </button>
        ) : (
          <p className="text-muted-foreground italic">💡 {currentWord.hint}</p>
        )}
      </div>

      {/* Built word display */}
      <div className="flex justify-center gap-2 mb-8 min-h-[80px]">
        {Array.from({ length: currentWord.word.length }).map((_, i) => (
          <div
            key={i}
            className={`w-16 h-16 rounded-xl border-4 flex items-center justify-center text-3xl font-black transition-all ${
              builtWord[i]
                ? feedback === 'correct'
                  ? 'border-game-green bg-game-green/20'
                  : feedback === 'wrong'
                  ? 'border-game-red bg-game-red/20 animate-shake'
                  : 'border-primary bg-primary/10'
                : 'border-muted'
            }`}
          >
            {builtWord[i] || ''}
          </div>
        ))}
      </div>

      {/* Control buttons */}
      <div className="flex justify-center mb-6">
        <button
          onClick={handleBackspace}
          disabled={builtWord.length === 0 || !!feedback}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-muted hover:bg-muted/80 font-bold transition-all focus-ring disabled:opacity-50"
        >
          <Delete className="w-5 h-5" />
          Backspace
        </button>
      </div>

      {/* Letter tiles */}
      <div className="flex flex-wrap justify-center gap-3 max-w-md mx-auto">
        {availableLetters.map((letter, index) => (
          <button
            key={index}
            onClick={() => handleLetterClick(letter, index)}
            disabled={usedIndexes.includes(index) || !!feedback}
            className={`w-14 h-14 rounded-2xl text-2xl font-black shadow-soft transition-all focus-ring ${
              usedIndexes.includes(index)
                ? 'bg-muted/50 text-muted-foreground scale-90'
                : 'bg-secondary text-secondary-foreground hover:scale-110 active:scale-95'
            }`}
          >
            {letter}
          </button>
        ))}
      </div>

      {/* Feedback */}
      {feedback && (
        <div className={`text-center mt-8 text-4xl font-black animate-bounce-in ${
          feedback === 'correct' ? 'text-game-green' : 'text-game-red'
        }`}>
          {feedback === 'correct' ? '🎉 Excellent!' : '😅 Try again!'}
        </div>
      )}
    </div>
  );
}
