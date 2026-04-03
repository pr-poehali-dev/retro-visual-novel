import { useRef, useCallback } from 'react';

// Web Audio API sound engine - no external files needed
let audioCtx: AudioContext | null = null;

function getCtx(): AudioContext {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
  }
  return audioCtx;
}

function playTone(
  freq: number,
  duration: number,
  type: OscillatorType = 'square',
  volume = 0.15,
  detune = 0,
  delay = 0
) {
  const ctx = getCtx();
  const t = ctx.currentTime + delay;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t);
  osc.detune.setValueAtTime(detune, t);
  gain.gain.setValueAtTime(0, t);
  gain.gain.linearRampToValueAtTime(volume, t + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.001, t + duration);
  osc.start(t);
  osc.stop(t + duration);
}

function playNoise(duration: number, volume = 0.05, freq = 800) {
  const ctx = getCtx();
  const bufferSize = ctx.sampleRate * duration;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.value = freq;
  filter.Q.value = 0.5;
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(volume, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
  source.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);
  source.start();
  source.stop(ctx.currentTime + duration);
}

export const Sounds = {
  menuMove: () => {
    playTone(220, 0.08, 'square', 0.08);
  },

  menuSelect: () => {
    playTone(330, 0.06, 'square', 0.12);
    playTone(440, 0.12, 'square', 0.1, 0, 0.05);
    playTone(660, 0.18, 'square', 0.08, 0, 0.1);
  },

  typeClick: () => {
    playTone(1200 + Math.random() * 400, 0.03, 'square', 0.04);
  },

  dialogOpen: () => {
    playTone(196, 0.1, 'sawtooth', 0.1);
    playTone(262, 0.15, 'sawtooth', 0.08, 0, 0.06);
    playTone(330, 0.2, 'sawtooth', 0.06, 0, 0.12);
  },

  choiceSelect: () => {
    playTone(440, 0.05, 'square', 0.1);
    playTone(554, 0.1, 'square', 0.08, 0, 0.04);
  },

  karmaUp: () => {
    playTone(523, 0.1, 'sine', 0.12);
    playTone(659, 0.1, 'sine', 0.1, 0, 0.08);
    playTone(784, 0.2, 'sine', 0.08, 0, 0.16);
  },

  karmaDown: () => {
    playTone(330, 0.15, 'sawtooth', 0.12);
    playTone(247, 0.2, 'sawtooth', 0.1, 0, 0.1);
    playTone(185, 0.3, 'sawtooth', 0.08, 0, 0.2);
  },

  gunshot: () => {
    playNoise(0.08, 0.3, 2000);
    playNoise(0.25, 0.15, 300);
    playTone(80, 0.3, 'sine', 0.2);
  },

  explosion: () => {
    playNoise(0.5, 0.4, 150);
    playTone(60, 0.6, 'sine', 0.25);
    playNoise(0.3, 0.2, 400, );
  },

  paperSign: () => {
    playNoise(0.15, 0.08, 3000);
    playTone(880, 0.05, 'square', 0.05, 0, 0.12);
  },

  saveGame: () => {
    [523, 659, 784, 1047].forEach((f, i) => {
      playTone(f, 0.15, 'sine', 0.1, 0, i * 0.08);
    });
  },

  loadGame: () => {
    [1047, 784, 659, 523].forEach((f, i) => {
      playTone(f, 0.15, 'sine', 0.08, 0, i * 0.07);
    });
  },

  inventoryOpen: () => {
    playTone(262, 0.08, 'square', 0.08);
    playTone(330, 0.12, 'square', 0.06, 0, 0.07);
  },

  itemPickup: () => {
    playTone(660, 0.06, 'sine', 0.1);
    playTone(880, 0.12, 'sine', 0.08, 0, 0.05);
  },

  hover: () => {
    playTone(880, 0.04, 'sine', 0.04);
  },

  ambientRain: () => {
    // Continuous rain effect simulation - one burst
    playNoise(1.5, 0.06, 2000);
    playNoise(1.5, 0.04, 500);
  },

  chapterEnd: () => {
    [262, 330, 392, 523, 659].forEach((f, i) => {
      playTone(f, 0.4, 'sawtooth', 0.07, 0, i * 0.12);
    });
  },
};

export function useSound() {
  const enabled = useRef(true);

  const play = useCallback((sound: keyof typeof Sounds) => {
    if (!enabled.current) return;
    try {
      Sounds[sound]();
    } catch {
      // audio not supported silently
    }
  }, []);

  const toggle = useCallback(() => {
    enabled.current = !enabled.current;
    return enabled.current;
  }, []);

  return { play, enabled };
}
