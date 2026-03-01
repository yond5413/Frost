// Dynamic music state machine using Web Audio API

export type MusicState = 'exploration' | 'tension' | 'terror';
export type StingerType = 'discovery' | 'death' | 'scare';

const MUSIC_PATHS: Record<MusicState, string> = {
  exploration: '/audio/music-exploration.mp3',
  tension:     '/audio/music-tension.mp3',
  terror:      '/audio/music-terror.mp3',
};

const STINGER_PATHS: Record<StingerType, string> = {
  discovery: '/audio/stinger-discovery.mp3',
  death:     '/audio/stinger-death.mp3',
  scare:     '/audio/stinger-scare.mp3',
};

class MusicManager {
  private ctx: AudioContext | null = null;
  private currentState: MusicState = 'exploration';
  private buffers: Partial<Record<MusicState, AudioBuffer>> = {};
  private stingerBuffers: Partial<Record<StingerType, AudioBuffer>> = {};
  private currentSource: AudioBufferSourceNode | null = null;
  private currentGain: GainNode | null = null;
  private nextSource: AudioBufferSourceNode | null = null;
  private nextGain: GainNode | null = null;
  private initialized = false;

  private getCtx(): AudioContext {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    }
    return this.ctx;
  }

  async init(): Promise<void> {
    if (this.initialized || typeof window === 'undefined') return;
    this.initialized = true;

    // Preload all music buffers
    await Promise.allSettled(
      Object.entries(MUSIC_PATHS).map(async ([state, path]) => {
        try {
          const buf = await this.loadBuffer(path);
          if (buf) this.buffers[state as MusicState] = buf;
        } catch {
          // Missing audio file — graceful skip
        }
      })
    );

    // Preload stingers
    await Promise.allSettled(
      Object.entries(STINGER_PATHS).map(async ([type, path]) => {
        try {
          const buf = await this.loadBuffer(path);
          if (buf) this.stingerBuffers[type as StingerType] = buf;
        } catch {
          // Missing audio file — graceful skip
        }
      })
    );
  }

  private async loadBuffer(path: string): Promise<AudioBuffer | null> {
    const ctx = this.getCtx();
    try {
      const res = await fetch(path);
      if (!res.ok) return null;
      const arrayBuffer = await res.arrayBuffer();
      return await ctx.decodeAudioData(arrayBuffer);
    } catch {
      return null;
    }
  }

  async crossfadeTo(state: MusicState, durationMs = 2000): Promise<void> {
    if (state === this.currentState && this.currentSource) return;
    if (typeof window === 'undefined') return;

    await this.init();

    const ctx = this.getCtx();
    const buffer = this.buffers[state];
    if (!buffer) return; // No audio file loaded, skip silently

    const durationSec = durationMs / 1000;
    const now = ctx.currentTime;

    // Set up new source + gain
    const newGain = ctx.createGain();
    newGain.gain.setValueAtTime(0, now);
    newGain.gain.linearRampToValueAtTime(1, now + durationSec);
    newGain.connect(ctx.destination);

    const newSource = ctx.createBufferSource();
    newSource.buffer = buffer;
    newSource.loop = true;
    newSource.connect(newGain);
    newSource.start(0);

    // Fade out old source
    if (this.currentGain && this.currentSource) {
      const oldGain = this.currentGain;
      const oldSource = this.currentSource;
      oldGain.gain.setValueAtTime(oldGain.gain.value, now);
      oldGain.gain.linearRampToValueAtTime(0, now + durationSec);
      setTimeout(() => {
        try { oldSource.stop(); } catch { /* already stopped */ }
        oldGain.disconnect();
      }, durationMs + 100);
    }

    this.currentSource = newSource;
    this.currentGain = newGain;
    this.currentState = state;
  }

  async playStinger(type: StingerType): Promise<void> {
    if (typeof window === 'undefined') return;
    await this.init();

    const ctx = this.getCtx();
    const buffer = this.stingerBuffers[type];
    if (!buffer) return;

    const stingerGain = ctx.createGain();
    stingerGain.gain.setValueAtTime(1, ctx.currentTime);
    stingerGain.connect(ctx.destination);

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(stingerGain);
    source.start(0);
    source.onended = () => stingerGain.disconnect();
  }

  stop(): void {
    if (this.currentSource) {
      try { this.currentSource.stop(); } catch { /* already stopped */ }
      this.currentSource = null;
    }
    if (this.currentGain) {
      this.currentGain.disconnect();
      this.currentGain = null;
    }
  }

  getCurrentState(): MusicState {
    return this.currentState;
  }
}

// Singleton
export const musicManager = new MusicManager();

// React hook for fear-reactive music
import { useEffect, useRef } from 'react';

export function useMusicSync(fearLevel: number, jumpScareActive: boolean) {
  const prevStateRef = useRef<MusicState>('exploration');

  useEffect(() => {
    const targetState: MusicState =
      fearLevel >= 61 ? 'terror' :
      fearLevel >= 31 ? 'tension' :
      'exploration';

    if (targetState !== prevStateRef.current) {
      prevStateRef.current = targetState;
      musicManager.crossfadeTo(targetState, 2000);
    }
  }, [fearLevel]);

  useEffect(() => {
    if (jumpScareActive) {
      musicManager.playStinger('scare');
    }
  }, [jumpScareActive]);
}
