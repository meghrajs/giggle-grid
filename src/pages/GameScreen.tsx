import React, { lazy, Suspense } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getGameById } from '@/lib/games';
import { ArrowLeft } from 'lucide-react';

// Lazy load game components
const ColorMatch = lazy(() => import('@/games/ColorMatch'));
const ShapeTap = lazy(() => import('@/games/ShapeTap'));
const AnimalSounds = lazy(() => import('@/games/AnimalSounds'));
const MemoryFlip = lazy(() => import('@/games/MemoryFlip'));
const MathBubbles = lazy(() => import('@/games/MathBubbles'));
const SpellingBuilder = lazy(() => import('@/games/SpellingBuilder'));
const CountingCritters = lazy(() => import('@/games/CountingCritters'));
const PatternPuzzle = lazy(() => import('@/games/PatternPuzzle'));
const BugCatcher = lazy(() => import('@/games/BugCatcher'));
const WeatherMatch = lazy(() => import('@/games/WeatherMatch'));
const NumberLine = lazy(() => import('@/games/NumberLine'));
const SortingFun = lazy(() => import('@/games/SortingFun'));
const AnimalHabitat = lazy(() => import('@/games/AnimalHabitat'));
const StoryBuilder = lazy(() => import('@/games/StoryBuilder'));
const ShadowMatch = lazy(() => import('@/games/ShadowMatch'));

const gameComponents: Record<string, React.LazyExoticComponent<React.ComponentType>> = {
  'color-match': ColorMatch,
  'shape-tap': ShapeTap,
  'animal-sounds': AnimalSounds,
  'memory-flip': MemoryFlip,
  'math-bubbles': MathBubbles,
  'spelling-builder': SpellingBuilder,
  'counting-critters': CountingCritters,
  'pattern-puzzle': PatternPuzzle,
  'bug-catcher': BugCatcher,
  'weather-match': WeatherMatch,
  'number-line': NumberLine,
  'sorting-fun': SortingFun,
  'animal-habitat': AnimalHabitat,
  'story-builder': StoryBuilder,
  'shadow-match': ShadowMatch,
};

function GameLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="text-6xl mb-4 animate-bounce">🎮</div>
        <p className="text-xl font-bold text-muted-foreground">Loading game...</p>
      </div>
    </div>
  );
}

export default function GameScreen() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const game = id ? getGameById(id) : undefined;

  if (!game || !id) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">😕</div>
          <h1 className="text-2xl font-bold mb-4">Game Not Found</h1>
          <button
            onClick={() => navigate('/hub')}
            className="btn-big btn-primary rounded-2xl"
          >
            Back to Games
          </button>
        </div>
      </div>
    );
  }

  const GameComponent = gameComponents[id];

  if (!GameComponent) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🚧</div>
          <h1 className="text-2xl font-bold mb-4">Coming Soon!</h1>
          <button
            onClick={() => navigate('/hub')}
            className="btn-big btn-primary rounded-2xl"
          >
            Back to Games
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Game Header */}
      <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-sm p-4 flex items-center justify-between">
        <button
          onClick={() => navigate('/hub')}
          className="flex items-center gap-2 p-3 rounded-xl bg-muted hover:bg-muted/80 transition-all focus-ring"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-bold text-sm">Exit</span>
        </button>
        <div className="flex items-center gap-3">
          <span className="text-4xl">{game.icon}</span>
          <h1 className="text-xl font-bold">{game.title}</h1>
        </div>
        <div className="w-20" /> {/* Spacer for alignment */}
      </header>

      {/* Game Content */}
      <Suspense fallback={<GameLoading />}>
        <GameComponent />
      </Suspense>
    </div>
  );
}
