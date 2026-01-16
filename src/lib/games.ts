export type GameMode = 'little' | 'big' | 'all';

export interface GameConfig {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: 'red' | 'orange' | 'yellow' | 'green' | 'blue' | 'purple' | 'pink' | 'teal';
  mode: GameMode;
  difficulty: 'easy' | 'medium' | 'hard';
}

export const GAMES: GameConfig[] = [
  { id: 'color-match', title: 'Color Match', description: 'Find the matching color!', icon: '🎨', color: 'red', mode: 'little', difficulty: 'easy' },
  { id: 'shape-tap', title: 'Shape Tap', description: 'Tap the right shape!', icon: '🔷', color: 'blue', mode: 'little', difficulty: 'easy' },
  { id: 'animal-sounds', title: 'Animal Sounds', description: 'Match the animal sound!', icon: '🐾', color: 'green', mode: 'little', difficulty: 'easy' },
  { id: 'counting-critters', title: 'Counting Critters', description: 'Count the bugs!', icon: '🐛', color: 'orange', mode: 'little', difficulty: 'easy' },
  { id: 'shadow-match', title: 'Shadow Match', description: 'Find the shadow!', icon: '👤', color: 'purple', mode: 'little', difficulty: 'easy' },
  { id: 'memory-flip', title: 'Memory Flip', description: 'Find matching pairs!', icon: '🃏', color: 'purple', mode: 'all', difficulty: 'medium' },
  { id: 'pattern-puzzle', title: 'Pattern Puzzle', description: 'Complete the pattern!', icon: '🧩', color: 'pink', mode: 'all', difficulty: 'medium' },
  { id: 'sorting-fun', title: 'Sorting Fun', description: 'Put things in order!', icon: '📊', color: 'teal', mode: 'all', difficulty: 'medium' },
  { id: 'weather-match', title: 'Weather Match', description: 'Dress for the weather!', icon: '🌤️', color: 'blue', mode: 'all', difficulty: 'medium' },
  { id: 'animal-habitat', title: 'Animal Habitat', description: 'Where do animals live?', icon: '🌲', color: 'green', mode: 'all', difficulty: 'medium' },
  { id: 'story-builder', title: 'Story Builder', description: 'Put the story in order!', icon: '📖', color: 'purple', mode: 'big', difficulty: 'medium' },
  { id: 'bug-catcher', title: 'Bug Catcher', description: 'Catch the right bugs!', icon: '🦋', color: 'green', mode: 'all', difficulty: 'medium' },
  { id: 'number-line', title: 'Number Line', description: 'Find the missing number!', icon: '🔢', color: 'teal', mode: 'big', difficulty: 'medium' },
  { id: 'math-bubbles', title: 'Math Bubbles', description: 'Pop the right answer!', icon: '🫧', color: 'orange', mode: 'big', difficulty: 'medium' },
  { id: 'spelling-builder', title: 'Spelling Builder', description: 'Build the word!', icon: '📝', color: 'teal', mode: 'big', difficulty: 'hard' },
];

export function getGameById(id: string): GameConfig | undefined {
  return GAMES.find((game) => game.id === id);
}

export function getGamesByMode(mode: GameMode): GameConfig[] {
  if (mode === 'all') return GAMES;
  return GAMES.filter((game) => game.mode === mode || game.mode === 'all');
}
