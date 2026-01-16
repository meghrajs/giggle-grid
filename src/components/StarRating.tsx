import React from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StarRatingProps {
  stars: number;
  maxStars?: number;
  size?: 'small' | 'default' | 'large';
  animated?: boolean;
}

const sizeClasses = {
  small: 'w-6 h-6',
  default: 'w-10 h-10',
  large: 'w-14 h-14',
};

export function StarRating({ stars, maxStars = 3, size = 'default', animated = false }: StarRatingProps) {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: maxStars }).map((_, i) => (
        <Star
          key={i}
          className={cn(
            sizeClasses[size],
            'transition-all duration-300',
            i < stars
              ? 'text-game-yellow fill-game-yellow drop-shadow-[0_0_8px_hsl(var(--game-yellow))]'
              : 'text-muted-foreground/30',
            animated && i < stars && 'animate-bounce-in',
          )}
          style={animated && i < stars ? { animationDelay: `${i * 150}ms` } : undefined}
        />
      ))}
    </div>
  );
}
