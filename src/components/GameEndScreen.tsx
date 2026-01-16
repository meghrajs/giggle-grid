import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BigButton } from './BigButton';
import { StarRating } from './StarRating';
import { Confetti } from './Confetti';
import { useApp } from '@/contexts/AppContext';
import { playStarSound } from '@/lib/sound';
import { RotateCcw, ArrowRight, Home } from 'lucide-react';

interface GameEndScreenProps {
  stars: number;
  gameId: string;
  onPlayAgain: () => void;
}

export function GameEndScreen({ stars, gameId, onPlayAgain }: GameEndScreenProps) {
  const navigate = useNavigate();
  const { updateGameProgress, settings } = useApp();
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    updateGameProgress(gameId, stars);
    setShowConfetti(true);
    playStarSound(stars, settings.soundEnabled);
  }, [gameId, stars, updateGameProgress, settings.soundEnabled]);

  const messages = [
    "Great try! Keep practicing! 💪",
    "Good job! You're getting better! 👍",
    "Awesome work! You're a star! ⭐",
    "AMAZING! You're a superstar! 🌟",
  ];

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-background/95 backdrop-blur-sm">
      <Confetti active={showConfetti} />
      
      <div className="text-center p-8 max-w-md mx-4 animate-bounce-in">
        <div className="mb-6">
          <div className="text-8xl mb-4">
            {stars >= 3 ? '🏆' : stars >= 2 ? '🎉' : stars >= 1 ? '👏' : '💪'}
          </div>
          <h1 className="text-4xl font-black mb-2">
            {stars >= 3 ? 'PERFECT!' : stars >= 2 ? 'Great Job!' : 'Nice Try!'}
          </h1>
          <p className="text-xl text-muted-foreground">{messages[stars]}</p>
        </div>

        <div className="flex justify-center mb-8">
          <StarRating stars={stars} size="large" animated />
        </div>

        <div className="flex flex-col gap-4">
          <BigButton
            variant="primary"
            size="large"
            onClick={onPlayAgain}
            className="w-full"
          >
            <RotateCcw className="w-8 h-8" />
            Play Again
          </BigButton>

          <div className="flex gap-4">
            <BigButton
              variant="outline"
              onClick={() => navigate('/hub')}
              className="flex-1"
            >
              <ArrowRight className="w-6 h-6" />
              More Games
            </BigButton>

            <BigButton
              variant="outline"
              onClick={() => navigate('/')}
              className="flex-1"
            >
              <Home className="w-6 h-6" />
              Home
            </BigButton>
          </div>
        </div>
      </div>
    </div>
  );
}
