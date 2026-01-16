import React, { useEffect, useState } from 'react';

interface ConfettiPiece {
  id: number;
  x: number;
  color: string;
  delay: number;
  size: number;
}

const COLORS = [
  'hsl(var(--game-red))',
  'hsl(var(--game-orange))',
  'hsl(var(--game-yellow))',
  'hsl(var(--game-green))',
  'hsl(var(--game-blue))',
  'hsl(var(--game-purple))',
  'hsl(var(--game-pink))',
];

export function Confetti({ active }: { active: boolean }) {
  const [pieces, setPieces] = useState<ConfettiPiece[]>([]);

  useEffect(() => {
    if (active) {
      const newPieces: ConfettiPiece[] = Array.from({ length: 50 }).map((_, i) => ({
        id: i,
        x: Math.random() * 100,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        delay: Math.random() * 0.5,
        size: 8 + Math.random() * 8,
      }));
      setPieces(newPieces);

      // Clear after animation
      const timer = setTimeout(() => {
        setPieces([]);
      }, 3500);

      return () => clearTimeout(timer);
    }
  }, [active]);

  if (!active && pieces.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {pieces.map((piece) => (
        <div
          key={piece.id}
          className="confetti absolute rounded-sm"
          style={{
            left: `${piece.x}%`,
            top: '-20px',
            width: piece.size,
            height: piece.size,
            backgroundColor: piece.color,
            animationDelay: `${piece.delay}s`,
          }}
        />
      ))}
    </div>
  );
}
