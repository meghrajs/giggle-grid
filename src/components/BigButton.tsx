import React from 'react';
import { cn } from '@/lib/utils';
import { useApp } from '@/contexts/AppContext';
import { playSound } from '@/lib/sound';

interface BigButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'red' | 'green' | 'blue' | 'yellow' | 'purple' | 'orange' | 'outline';
  size?: 'default' | 'large' | 'small';
  children: React.ReactNode;
}

const variantClasses: Record<string, string> = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  red: 'btn-game-red',
  green: 'btn-game-green',
  blue: 'btn-game-blue',
  yellow: 'btn-game-yellow',
  purple: 'btn-game-purple',
  orange: 'btn-game-orange',
  outline: 'bg-transparent border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground',
};

const sizeClasses: Record<string, string> = {
  small: 'px-4 py-2 text-base rounded-xl',
  default: 'px-8 py-5 text-xl rounded-2xl',
  large: 'px-12 py-8 text-3xl rounded-3xl',
};

export function BigButton({
  variant = 'primary',
  size = 'default',
  className,
  onClick,
  children,
  ...props
}: BigButtonProps) {
  const { settings } = useApp();

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    playSound('click', settings.soundEnabled);
    onClick?.(e);
  };

  return (
    <button
      className={cn(
        'btn-big font-bold',
        variantClasses[variant],
        sizeClasses[size],
        'focus-ring',
        className
      )}
      onClick={handleClick}
      {...props}
    >
      {children}
    </button>
  );
}
