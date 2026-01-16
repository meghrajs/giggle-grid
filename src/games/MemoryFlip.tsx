import React, { useState, useCallback, useEffect } from 'react';
import { useApp } from '@/contexts/AppContext';
import { playSound } from '@/lib/sound';
import { GameEndScreen } from '@/components/GameEndScreen';
import { useLocation } from 'react-router-dom';

const EMOJIS = ['🐶', '🐱', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸'];

interface Card {
  id: number;
  emoji: string;
  isFlipped: boolean;
  isMatched: boolean;
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function createCards(pairCount: number): Card[] {
  const selectedEmojis = EMOJIS.slice(0, pairCount);
  const cards: Card[] = [];
  
  selectedEmojis.forEach((emoji, index) => {
    cards.push({ id: index * 2, emoji, isFlipped: false, isMatched: false });
    cards.push({ id: index * 2 + 1, emoji, isFlipped: false, isMatched: false });
  });
  
  return shuffleArray(cards);
}

export default function MemoryFlip() {
  const { settings } = useApp();
  const location = useLocation();
  
  // Determine pair count based on mode
  const mode = (location.state as any)?.mode || 'all';
  const pairCount = mode === 'little' ? 6 : 10;
  
  const [cards, setCards] = useState<Card[]>(() => createCards(pairCount));
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [matchedPairs, setMatchedPairs] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [gameComplete, setGameComplete] = useState(false);

  // Check for match when two cards are flipped
  useEffect(() => {
    if (flippedCards.length === 2) {
      setIsProcessing(true);
      setMoves((m) => m + 1);
      
      const [first, second] = flippedCards;
      const firstCard = cards.find((c) => c.id === first);
      const secondCard = cards.find((c) => c.id === second);
      
      if (firstCard && secondCard && firstCard.emoji === secondCard.emoji) {
        // Match found
        playSound('success', settings.soundEnabled);
        setMatchedPairs((p) => p + 1);
        
        setTimeout(() => {
          setCards((prev) =>
            prev.map((card) =>
              card.id === first || card.id === second
                ? { ...card, isMatched: true }
                : card
            )
          );
          setFlippedCards([]);
          setIsProcessing(false);
        }, 500);
      } else {
        // No match
        playSound('error', settings.soundEnabled);
        
        setTimeout(() => {
          setCards((prev) =>
            prev.map((card) =>
              card.id === first || card.id === second
                ? { ...card, isFlipped: false }
                : card
            )
          );
          setFlippedCards([]);
          setIsProcessing(false);
        }, 1000);
      }
    }
  }, [flippedCards, cards, settings.soundEnabled]);

  // Check for game completion
  useEffect(() => {
    if (matchedPairs === pairCount) {
      setTimeout(() => {
        setGameComplete(true);
      }, 500);
    }
  }, [matchedPairs, pairCount]);

  const handleCardClick = useCallback((cardId: number) => {
    if (isProcessing) return;
    if (flippedCards.length >= 2) return;
    if (flippedCards.includes(cardId)) return;
    
    const card = cards.find((c) => c.id === cardId);
    if (!card || card.isMatched || card.isFlipped) return;

    playSound('click', settings.soundEnabled);
    
    setCards((prev) =>
      prev.map((c) =>
        c.id === cardId ? { ...c, isFlipped: true } : c
      )
    );
    setFlippedCards((prev) => [...prev, cardId]);
  }, [cards, flippedCards, isProcessing, settings.soundEnabled]);

  const resetGame = () => {
    setCards(createCards(pairCount));
    setFlippedCards([]);
    setMoves(0);
    setMatchedPairs(0);
    setIsProcessing(false);
    setGameComplete(false);
  };

  const calculateStars = () => {
    const perfectMoves = pairCount;
    const ratio = perfectMoves / moves;
    
    if (ratio >= 0.8) return 3;
    if (ratio >= 0.5) return 2;
    return 1;
  };

  if (gameComplete) {
    return (
      <GameEndScreen
        stars={calculateStars()}
        gameId="memory-flip"
        onPlayAgain={resetGame}
      />
    );
  }

  const gridCols = pairCount <= 6 ? 'grid-cols-3' : 'grid-cols-4';

  return (
    <div className="p-6 max-w-2xl mx-auto">
      {/* Stats */}
      <div className="flex items-center justify-between mb-6">
        <span className="text-lg font-bold text-muted-foreground">
          Moves: {moves}
        </span>
        <span className="text-lg font-bold">
          Pairs: {matchedPairs}/{pairCount}
        </span>
      </div>

      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold">Find the matching pairs!</h2>
      </div>

      {/* Card Grid */}
      <div className={`grid ${gridCols} gap-3 max-w-lg mx-auto`}>
        {cards.map((card) => (
          <button
            key={card.id}
            onClick={() => handleCardClick(card.id)}
            disabled={card.isFlipped || card.isMatched || isProcessing}
            className={`aspect-square rounded-2xl transition-all duration-300 focus-ring ${
              card.isFlipped || card.isMatched
                ? 'bg-card shadow-soft'
                : 'bg-secondary hover:scale-105'
            } ${card.isMatched ? 'opacity-50' : ''}`}
            style={{
              transform: card.isFlipped || card.isMatched ? 'rotateY(180deg)' : 'rotateY(0deg)',
              transformStyle: 'preserve-3d',
            }}
          >
            <span className={`text-4xl ${card.isFlipped || card.isMatched ? 'block' : 'hidden'}`}>
              {card.emoji}
            </span>
            <span className={`text-3xl ${card.isFlipped || card.isMatched ? 'hidden' : 'block'}`}>
              ❓
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
