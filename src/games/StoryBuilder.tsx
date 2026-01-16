import React, { useState, useCallback } from 'react';
import { useApp } from '@/contexts/AppContext';
import { playSound, playStarSound } from '@/lib/sound';
import { GameEndScreen } from '@/components/GameEndScreen';

const STORIES = [
  {
    title: 'The Hungry Cat',
    scenes: [
      { emoji: '🐱', text: 'A cat was hungry' },
      { emoji: '🥫', text: 'It found some food' },
      { emoji: '😋', text: 'The cat ate happily' },
      { emoji: '😴', text: 'Then it took a nap' },
    ]
  },
  {
    title: 'Planting a Flower',
    scenes: [
      { emoji: '🌱', text: 'Plant a tiny seed' },
      { emoji: '💧', text: 'Water it every day' },
      { emoji: '☀️', text: 'Give it sunshine' },
      { emoji: '🌸', text: 'Watch it bloom!' },
    ]
  },
  {
    title: 'Making a Sandwich',
    scenes: [
      { emoji: '🍞', text: 'Get two slices of bread' },
      { emoji: '🧈', text: 'Spread some butter' },
      { emoji: '🧀', text: 'Add cheese and toppings' },
      { emoji: '🥪', text: 'Enjoy your sandwich!' },
    ]
  },
  {
    title: 'Going to Bed',
    scenes: [
      { emoji: '🌙', text: 'Night time comes' },
      { emoji: '🛁', text: 'Take a bath' },
      { emoji: '📖', text: 'Read a bedtime story' },
      { emoji: '😴', text: 'Fall asleep peacefully' },
    ]
  },
  {
    title: 'Building a Snowman',
    scenes: [
      { emoji: '❄️', text: 'It starts to snow' },
      { emoji: '⛄', text: 'Roll up some snowballs' },
      { emoji: '🥕', text: 'Add a carrot nose' },
      { emoji: '🎩', text: 'Put on a hat!' },
    ]
  },
];

interface Round {
  story: typeof STORIES[0];
  shuffledScenes: typeof STORIES[0]['scenes'];
}

function generateRound(usedIndices: number[]): { round: Round; index: number } {
  let index;
  do {
    index = Math.floor(Math.random() * STORIES.length);
  } while (usedIndices.includes(index) && usedIndices.length < STORIES.length);
  
  const story = STORIES[index];
  const shuffled = [...story.scenes].sort(() => Math.random() - 0.5);
  
  return { 
    round: { story, shuffledScenes: shuffled },
    index 
  };
}

export default function StoryBuilder() {
  const { settings, updateGameProgress } = useApp();
  const [usedIndices, setUsedIndices] = useState<number[]>([]);
  const [round, setRound] = useState<Round>(() => generateRound([]).round);
  const [orderedScenes, setOrderedScenes] = useState<typeof STORIES[0]['scenes']>([]);
  const [score, setScore] = useState(0);
  const [roundNum, setRoundNum] = useState(1);
  const [totalRounds] = useState(4);
  const [showResult, setShowResult] = useState(false);
  const [gameComplete, setGameComplete] = useState(false);
  const [earnedStars, setEarnedStars] = useState(0);

  const handleSelectScene = (scene: typeof STORIES[0]['scenes'][0]) => {
    if (showResult || orderedScenes.includes(scene)) return;
    
    if (settings.soundEnabled) playSound('click', true);
    setOrderedScenes(prev => [...prev, scene]);
  };

  const handleUndo = () => {
    if (orderedScenes.length > 0 && !showResult) {
      setOrderedScenes(prev => prev.slice(0, -1));
    }
  };

  const handleCheck = useCallback(() => {
    if (orderedScenes.length !== 4 || showResult) return;

    setShowResult(true);
    
    const isCorrect = orderedScenes.every((scene, i) => scene === round.story.scenes[i]);
    
    if (isCorrect) {
      if (settings.soundEnabled) playSound('correct', true);
      setScore(s => s + 1);
    } else {
      if (settings.soundEnabled) playSound('wrong', true);
    }

    setTimeout(() => {
      setShowResult(false);
      setOrderedScenes([]);
      if (roundNum >= totalRounds) {
        const finalScore = score + (isCorrect ? 1 : 0);
        const stars = Math.ceil(finalScore / totalRounds * 3);
        setEarnedStars(stars);
        setGameComplete(true);
      } else {
        setRoundNum(r => r + 1);
        const { round: newRound, index } = generateRound(usedIndices);
        setUsedIndices([...usedIndices, index]);
        setRound(newRound);
      }
    }, 2000);
  }, [orderedScenes, round, roundNum, totalRounds, score, settings, usedIndices, showResult]);

  const handlePlayAgain = () => {
    setUsedIndices([]);
    setRound(generateRound([]).round);
    setOrderedScenes([]);
    setScore(0);
    setRoundNum(1);
    setGameComplete(false);
    setEarnedStars(0);
  };

  if (gameComplete) {
    return <GameEndScreen stars={earnedStars} onPlayAgain={handlePlayAgain} gameId="story-builder" />;
  }

  const availableScenes = round.shuffledScenes.filter(scene => !orderedScenes.includes(scene));

  return (
    <div className="p-4 max-w-2xl mx-auto">
      {/* Progress */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-bold text-muted-foreground">
          Story {roundNum}/{totalRounds}
        </span>
        <span className="text-sm font-bold text-game-purple">
          Score: {score}
        </span>
      </div>

      {/* Title */}
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold">📖 {round.story.title}</h2>
        <p className="text-muted-foreground mt-2">Put the story in the right order!</p>
      </div>

      {/* Story Timeline */}
      <div 
        className={`grid grid-cols-4 gap-2 p-4 bg-gradient-to-r from-game-purple/10 to-game-pink/10 rounded-3xl mb-6 min-h-32 ${
          showResult && orderedScenes.every((scene, i) => scene === round.story.scenes[i])
            ? 'ring-4 ring-game-green animate-bounce-in'
            : showResult
            ? 'ring-4 ring-game-red animate-shake'
            : ''
        }`}
      >
        {[0, 1, 2, 3].map((i) => (
          <div 
            key={i}
            className={`flex flex-col items-center justify-center p-3 rounded-xl min-h-24 ${
              orderedScenes[i] 
                ? 'bg-card shadow-kid'
                : 'border-2 border-dashed border-muted'
            }`}
          >
            {orderedScenes[i] ? (
              <>
                <span className="text-4xl mb-1">{orderedScenes[i].emoji}</span>
                <span className="text-xs text-center text-muted-foreground line-clamp-2">
                  {orderedScenes[i].text}
                </span>
              </>
            ) : (
              <span className="text-2xl text-muted-foreground">{i + 1}</span>
            )}
          </div>
        ))}
      </div>

      {/* Show correct order when wrong */}
      {showResult && !orderedScenes.every((scene, i) => scene === round.story.scenes[i]) && (
        <div className="mb-6 p-4 bg-game-yellow/20 rounded-xl">
          <p className="text-sm font-bold text-center mb-2">Correct order:</p>
          <div className="flex items-center justify-center gap-2">
            {round.story.scenes.map((scene, i) => (
              <span key={i} className="text-3xl">{scene.emoji}</span>
            ))}
          </div>
        </div>
      )}

      {/* Available Scenes */}
      {!showResult && (
        <div className="grid grid-cols-4 gap-2 mb-6">
          {availableScenes.map((scene, index) => (
            <button
              key={index}
              onClick={() => handleSelectScene(scene)}
              className="flex flex-col items-center p-3 rounded-xl bg-card hover:bg-muted shadow-kid transition-all transform hover:scale-105 active:scale-95"
            >
              <span className="text-4xl mb-1">{scene.emoji}</span>
              <span className="text-xs text-center text-muted-foreground line-clamp-2">
                {scene.text}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Controls */}
      {!showResult && (
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={handleUndo}
            disabled={orderedScenes.length === 0}
            className={`px-6 py-3 rounded-xl font-bold transition-all ${
              orderedScenes.length > 0
                ? 'bg-muted hover:bg-muted/80'
                : 'bg-muted/50 text-muted-foreground cursor-not-allowed'
            }`}
          >
            ↩️ Undo
          </button>
          <button
            onClick={handleCheck}
            disabled={orderedScenes.length !== 4}
            className={`btn-big rounded-2xl px-8 py-4 text-xl font-bold transition-all ${
              orderedScenes.length === 4
                ? 'bg-game-green text-white hover:bg-game-green/90'
                : 'bg-muted text-muted-foreground cursor-not-allowed'
            }`}
          >
            Check Story! 📖
          </button>
        </div>
      )}
    </div>
  );
}
