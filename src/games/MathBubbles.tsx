import React, { useState, useCallback } from 'react';
import { useApp } from '@/contexts/AppContext';
import { playSound } from '@/lib/sound';
import { GameEndScreen } from '@/components/GameEndScreen';

type Operation = 'add' | 'subtract';

interface Problem {
  a: number;
  b: number;
  operation: Operation;
  answer: number;
}

function generateProblem(maxNum: number, operation: Operation): Problem {
  let a = Math.floor(Math.random() * maxNum) + 1;
  let b = Math.floor(Math.random() * maxNum) + 1;
  
  // For subtraction, ensure a >= b to avoid negative answers
  if (operation === 'subtract' && a < b) {
    [a, b] = [b, a];
  }
  
  const answer = operation === 'add' ? a + b : a - b;
  
  return { a, b, operation, answer };
}

function generateOptions(correctAnswer: number): number[] {
  const options = new Set<number>([correctAnswer]);
  
  while (options.size < 4) {
    // Generate wrong answers close to correct answer
    const offset = Math.floor(Math.random() * 5) + 1;
    const wrongAnswer = correctAnswer + (Math.random() > 0.5 ? offset : -offset);
    if (wrongAnswer >= 0) {
      options.add(wrongAnswer);
    }
  }
  
  return shuffleArray([...options]);
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

const BUBBLE_COLORS = ['bg-game-red', 'bg-game-blue', 'bg-game-green', 'bg-game-purple'];

export default function MathBubbles() {
  const { settings } = useApp();
  const [level, setLevel] = useState<1 | 2>(1); // Level 1: 0-10, Level 2: 0-20
  const [operation, setOperation] = useState<Operation>('add');
  const [round, setRound] = useState(1);
  const [problem, setProblem] = useState<Problem>(() => generateProblem(level === 1 ? 10 : 20, operation));
  const [options, setOptions] = useState<number[]>(() => generateOptions(problem.answer));
  const [score, setScore] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [gameComplete, setGameComplete] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);

  const TOTAL_ROUNDS = 8;
  const maxNum = level === 1 ? 10 : 20;

  const handleAnswerClick = useCallback((answer: number) => {
    if (showResult) return;

    setSelectedAnswer(answer);

    if (answer === problem.answer) {
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
        // Alternate between add and subtract
        const nextOp = round % 2 === 0 ? 'add' : 'subtract';
        setOperation(nextOp);
        const newProblem = generateProblem(maxNum, nextOp);
        setProblem(newProblem);
        setOptions(generateOptions(newProblem.answer));
        setShowResult(false);
        setFeedback(null);
        setSelectedAnswer(null);
      }
    }, 1200);
  }, [round, showResult, problem, maxNum, settings.soundEnabled]);

  const startGame = (selectedLevel: 1 | 2) => {
    setLevel(selectedLevel);
    const max = selectedLevel === 1 ? 10 : 20;
    const newProblem = generateProblem(max, 'add');
    setProblem(newProblem);
    setOptions(generateOptions(newProblem.answer));
    setGameStarted(true);
  };

  const resetGame = () => {
    setRound(1);
    setScore(0);
    setMistakes(0);
    setGameComplete(false);
    setShowResult(false);
    setFeedback(null);
    setSelectedAnswer(null);
    setOperation('add');
    setGameStarted(false);
  };

  const calculateStars = () => {
    const percentage = score / TOTAL_ROUNDS;
    if (percentage >= 0.9 && mistakes <= 1) return 3;
    if (percentage >= 0.7) return 2;
    if (score > 0) return 1;
    return 0;
  };

  if (gameComplete) {
    return (
      <GameEndScreen
        stars={calculateStars()}
        gameId="math-bubbles"
        onPlayAgain={resetGame}
      />
    );
  }

  if (!gameStarted) {
    return (
      <div className="p-6 max-w-md mx-auto text-center">
        <h2 className="text-3xl font-black mb-8">Choose Difficulty</h2>
        <div className="space-y-4">
          <button
            onClick={() => startGame(1)}
            className="w-full p-6 rounded-2xl bg-game-green text-secondary-foreground font-bold text-xl shadow-lifted transition-all hover:scale-105 focus-ring"
          >
            🟢 Easy (0-10)
          </button>
          <button
            onClick={() => startGame(2)}
            className="w-full p-6 rounded-2xl bg-game-orange text-secondary-foreground font-bold text-xl shadow-lifted transition-all hover:scale-105 focus-ring"
          >
            🟠 Hard (0-20)
          </button>
        </div>
      </div>
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

      {/* Problem */}
      <div className="text-center mb-10">
        <h2 className="text-2xl font-bold mb-4">Solve the problem!</h2>
        <div className="bg-card rounded-3xl p-8 shadow-lifted inline-block">
          <span className="text-6xl font-black">
            {problem.a} {problem.operation === 'add' ? '+' : '−'} {problem.b} = ?
          </span>
        </div>
      </div>

      {/* Answer Bubbles */}
      <div className="grid grid-cols-2 gap-6 max-w-sm mx-auto">
        {options.map((option, index) => (
          <button
            key={index}
            onClick={() => handleAnswerClick(option)}
            disabled={showResult}
            className={`aspect-square rounded-full ${BUBBLE_COLORS[index]} text-secondary-foreground text-4xl font-black shadow-lifted transition-all focus-ring ${
              selectedAnswer === option && feedback === 'correct' ? 'ring-4 ring-foreground scale-110' : ''
            } ${selectedAnswer === option && feedback === 'wrong' ? 'animate-shake opacity-50' : ''
            } ${showResult && option === problem.answer && selectedAnswer !== option ? 'ring-4 ring-game-green' : ''
            } ${!showResult ? 'hover:scale-105 active:scale-95 animate-float' : ''}`}
            style={{ animationDelay: `${index * 0.5}s` }}
          >
            {option}
          </button>
        ))}
      </div>

      {/* Feedback */}
      {feedback && (
        <div className={`text-center mt-8 text-4xl font-black animate-bounce-in ${
          feedback === 'correct' ? 'text-game-green' : 'text-game-red'
        }`}>
          {feedback === 'correct' 
            ? '🎉 Correct!' 
            : `😅 The answer is ${problem.answer}`}
        </div>
      )}
    </div>
  );
}
