import React, { useState, useCallback } from 'react';
import { useApp } from '@/contexts/AppContext';
import { playSound, playStarSound } from '@/lib/sound';
import { GameEndScreen } from '@/components/GameEndScreen';

const WEATHER_DATA = [
  { weather: '☀️', name: 'Sunny', items: ['🕶️', '👒', '🧴'], wrong: ['☂️', '🧤', '🧣'] },
  { weather: '🌧️', name: 'Rainy', items: ['☂️', '🥾', '🌂'], wrong: ['🕶️', '👙', '🩴'] },
  { weather: '❄️', name: 'Snowy', items: ['🧤', '🧣', '🧥'], wrong: ['👙', '🩳', '🕶️'] },
  { weather: '🌬️', name: 'Windy', items: ['🧥', '🧢', '🪁'], wrong: ['👙', '🩴', '🧴'] },
  { weather: '🌈', name: 'Rainbow', items: ['📷', '🎨', '🖼️'], wrong: ['☂️', '🧤', '❄️'] },
];

interface Round {
  weather: string;
  name: string;
  correctItems: string[];
  allItems: string[];
}

function generateRound(): Round {
  const data = WEATHER_DATA[Math.floor(Math.random() * WEATHER_DATA.length)];
  const allItems = [...data.items, ...data.wrong.slice(0, 3)].sort(() => Math.random() - 0.5);
  return {
    weather: data.weather,
    name: data.name,
    correctItems: data.items,
    allItems,
  };
}

export default function WeatherMatch() {
  const { settings, updateGameProgress } = useApp();
  const [round, setRound] = useState<Round>(() => generateRound());
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const [roundNum, setRoundNum] = useState(1);
  const [totalRounds] = useState(5);
  const [showResult, setShowResult] = useState(false);
  const [gameComplete, setGameComplete] = useState(false);
  const [earnedStars, setEarnedStars] = useState(0);

  const handleSelectItem = (item: string) => {
    if (showResult) return;
    
    setSelectedItems(prev => {
      if (prev.includes(item)) {
        return prev.filter(i => i !== item);
      }
      if (prev.length < 3) {
        return [...prev, item];
      }
      return prev;
    });
  };

  const handleSubmit = useCallback(() => {
    if (selectedItems.length !== 3 || showResult) return;

    setShowResult(true);
    
    const correctCount = selectedItems.filter(item => round.correctItems.includes(item)).length;
    const isCorrect = correctCount === 3;
    
    if (isCorrect) {
      if (settings.soundEnabled) playSound('correct', true);
      setScore(s => s + 1);
    } else {
      if (settings.soundEnabled) playSound('wrong', true);
    }

    setTimeout(() => {
      setShowResult(false);
      setSelectedItems([]);
      if (roundNum >= totalRounds) {
        const finalScore = score + (isCorrect ? 1 : 0);
        const stars = Math.ceil(finalScore / totalRounds * 3);
        setEarnedStars(stars);
        setGameComplete(true);
      } else {
        setRoundNum(r => r + 1);
        setRound(generateRound());
      }
    }, 1500);
  }, [selectedItems, round, roundNum, totalRounds, score, settings, showResult]);

  const handlePlayAgain = () => {
    setRound(generateRound());
    setSelectedItems([]);
    setScore(0);
    setRoundNum(1);
    setGameComplete(false);
    setEarnedStars(0);
  };

  if (gameComplete) {
    return <GameEndScreen stars={earnedStars} onPlayAgain={handlePlayAgain} gameId="weather-match" />;
  }

  return (
    <div className="p-4 max-w-2xl mx-auto">
      {/* Progress */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-bold text-muted-foreground">
          Round {roundNum}/{totalRounds}
        </span>
        <span className="text-sm font-bold text-game-blue">
          Score: {score}
        </span>
      </div>

      {/* Weather Display */}
      <div className="text-center mb-6">
        <div className="text-8xl mb-4 animate-float">{round.weather}</div>
        <h2 className="text-2xl font-bold">It's {round.name} today!</h2>
        <p className="text-muted-foreground mt-2">Pick 3 things you need for this weather</p>
      </div>

      {/* Items Grid */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {round.allItems.map((item, index) => {
          const isSelected = selectedItems.includes(item);
          const isCorrect = round.correctItems.includes(item);
          
          return (
            <button
              key={index}
              onClick={() => handleSelectItem(item)}
              disabled={showResult}
              className={`p-6 text-5xl rounded-2xl transition-all transform hover:scale-105 active:scale-95 ${
                showResult && isSelected && isCorrect
                  ? 'bg-game-green ring-4 ring-game-green/50'
                  : showResult && isSelected && !isCorrect
                  ? 'bg-game-red ring-4 ring-game-red/50'
                  : showResult && !isSelected && isCorrect
                  ? 'bg-game-yellow/50 ring-2 ring-game-yellow'
                  : isSelected
                  ? 'bg-game-blue ring-4 ring-game-blue/50 scale-105'
                  : 'bg-card hover:bg-muted shadow-kid'
              }`}
            >
              {item}
            </button>
          );
        })}
      </div>

      {/* Submit Button */}
      <div className="text-center">
        <button
          onClick={handleSubmit}
          disabled={selectedItems.length !== 3 || showResult}
          className={`btn-big rounded-2xl px-8 py-4 text-xl font-bold transition-all ${
            selectedItems.length === 3 && !showResult
              ? 'bg-game-green text-white hover:bg-game-green/90'
              : 'bg-muted text-muted-foreground cursor-not-allowed'
          }`}
        >
          {selectedItems.length < 3 ? `Select ${3 - selectedItems.length} more` : 'Check Answer! ✓'}
        </button>
      </div>
    </div>
  );
}
