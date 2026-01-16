// Simple sound system using Web Audio API
let audioContext: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioContext;
}

export type SoundType = 'success' | 'error' | 'click' | 'star' | 'complete' | 'animal' | 'correct' | 'wrong';

const SOUND_CONFIGS: Record<SoundType, { frequency: number; duration: number; type: OscillatorType }> = {
  success: { frequency: 880, duration: 0.15, type: 'sine' },
  error: { frequency: 200, duration: 0.3, type: 'square' },
  click: { frequency: 600, duration: 0.05, type: 'sine' },
  star: { frequency: 1200, duration: 0.2, type: 'sine' },
  complete: { frequency: 523.25, duration: 0.5, type: 'sine' }, // C5
  animal: { frequency: 300, duration: 0.4, type: 'sawtooth' },
  correct: { frequency: 880, duration: 0.15, type: 'sine' }, // Same as success
  wrong: { frequency: 200, duration: 0.3, type: 'square' }, // Same as error
};

export function playSound(type: SoundType, enabled: boolean = true): void {
  if (!enabled) return;
  
  try {
    const ctx = getAudioContext();
    const config = SOUND_CONFIGS[type];
    
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    oscillator.type = config.type;
    oscillator.frequency.setValueAtTime(config.frequency, ctx.currentTime);
    
    gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + config.duration);
    
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + config.duration);
  } catch (error) {
    console.log('Sound playback failed:', error);
  }
}

// Special sound for star collection - ascending arpeggio
export function playStarSound(starCount: number, enabled: boolean = true): void {
  if (!enabled) return;
  
  try {
    const ctx = getAudioContext();
    const baseFrequencies = [523.25, 659.25, 783.99]; // C5, E5, G5
    
    for (let i = 0; i < Math.min(starCount, 3); i++) {
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(baseFrequencies[i], ctx.currentTime + i * 0.15);
      
      gainNode.gain.setValueAtTime(0, ctx.currentTime + i * 0.15);
      gainNode.gain.linearRampToValueAtTime(0.3, ctx.currentTime + i * 0.15 + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + i * 0.15 + 0.4);
      
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      oscillator.start(ctx.currentTime + i * 0.15);
      oscillator.stop(ctx.currentTime + i * 0.15 + 0.4);
    }
  } catch (error) {
    console.log('Star sound playback failed:', error);
  }
}

// Animal sounds using different waveforms and frequencies
const ANIMAL_SOUNDS: Record<string, { frequencies: number[]; duration: number; type: OscillatorType }> = {
  cat: { frequencies: [400, 500, 400], duration: 0.3, type: 'sine' },
  dog: { frequencies: [200, 250, 200, 180], duration: 0.15, type: 'sawtooth' },
  cow: { frequencies: [150, 120, 100], duration: 0.5, type: 'sawtooth' },
  lion: { frequencies: [100, 80, 60], duration: 0.6, type: 'sawtooth' },
};

export function playAnimalSound(animal: string, enabled: boolean = true): void {
  if (!enabled) return;
  
  try {
    const ctx = getAudioContext();
    const config = ANIMAL_SOUNDS[animal] || ANIMAL_SOUNDS.dog;
    
    config.frequencies.forEach((freq, i) => {
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      oscillator.type = config.type;
      oscillator.frequency.setValueAtTime(freq, ctx.currentTime + i * config.duration);
      
      gainNode.gain.setValueAtTime(0.3, ctx.currentTime + i * config.duration);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + (i + 1) * config.duration);
      
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      oscillator.start(ctx.currentTime + i * config.duration);
      oscillator.stop(ctx.currentTime + (i + 1) * config.duration);
    });
  } catch (error) {
    console.log('Animal sound playback failed:', error);
  }
}
