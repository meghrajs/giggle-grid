import React from 'react';
import { cn } from '@/lib/utils';
import { useApp } from '@/contexts/AppContext';
import { playSound } from '@/lib/sound';

interface CardTileProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  color?: 'primary' | 'secondary' | 'red' | 'green' | 'blue' | 'yellow' | 'purple' | 'orange' | 'teal' | 'pink';
  selected?: boolean;
  completed?: boolean;
  children: React.ReactNode;
}

const colorClasses: Record<string, string> = {
  primary: 'bg-primary/10 border-primary hover:bg-primary/20',
  secondary: 'bg-secondary/10 border-secondary hover:bg-secondary/20',
  red: 'bg-game-red/10 border-game-red hover:bg-game-red/20',
  green: 'bg-game-green/10 border-game-green hover:bg-game-green/20',
  blue: 'bg-game-blue/10 border-game-blue hover:bg-game-blue/20',
  yellow: 'bg-game-yellow/10 border-game-yellow hover:bg-game-yellow/20',
  purple: 'bg-game-purple/10 border-game-purple hover:bg-game-purple/20',
  orange: 'bg-game-orange/10 border-game-orange hover:bg-game-orange/20',
  teal: 'bg-game-teal/10 border-game-teal hover:bg-game-teal/20',
  pink: 'bg-game-pink/10 border-game-pink hover:bg-game-pink/20',
};

export function CardTile({
  color = 'primary',
  selected = false,
  completed = false,
  className,
  onClick,
  children,
  ...props
}: CardTileProps) {
  const { settings } = useApp();

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    playSound('click', settings.soundEnabled);
    onClick?.(e);
  };

  return (
    <button
      className={cn(
        'game-card border-2 transition-all duration-200',
        colorClasses[color],
        selected && 'ring-4 ring-game-blue ring-offset-2 scale-105',
        completed && 'opacity-70',
        'focus-ring',
        className
      )}
      onClick={handleClick}
      {...props}
    >
      {children}
      {completed && (
        <div className="absolute top-2 right-2">
          <span className="text-2xl">✓</span>
        </div>
      )}
    </button>
  );
}
