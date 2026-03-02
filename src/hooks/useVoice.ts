'use client';

import { useCallback, useEffect, useRef } from 'react';

interface VoiceHint {
  pitch: number;
  rate: number;
  preferredVoiceNames: string[];
}

const DEFAULT_HINT: VoiceHint = {
  rate: 0.95,
  pitch: 1,
  preferredVoiceNames: ['Google US English', 'Samantha', 'Alex', 'Daniel'],
};

const CHARACTER_VOICE_HINTS: Record<string, VoiceHint> = {
  narrator: { rate: 0.9, pitch: 0.85, preferredVoiceNames: ['Daniel', 'Google UK English Male', 'Alex'] },
  sam: { rate: 0.96, pitch: 1.05, preferredVoiceNames: ['Samantha', 'Google US English', 'Karen'] },
  mike: { rate: 0.93, pitch: 0.9, preferredVoiceNames: ['Alex', 'Daniel', 'Google UK English Male'] },
  jessica: { rate: 1.02, pitch: 1.1, preferredVoiceNames: ['Samantha', 'Google US English', 'Moira'] },
  ashley: { rate: 1.04, pitch: 1.08, preferredVoiceNames: ['Samantha', 'Google US English', 'Karen'] },
  chris: { rate: 0.95, pitch: 0.94, preferredVoiceNames: ['Alex', 'Daniel', 'Google UK English Male'] },
  josh: { rate: 0.9, pitch: 0.87, preferredVoiceNames: ['Daniel', 'Alex', 'Google UK English Male'] },
  emily: { rate: 1.03, pitch: 1.02, preferredVoiceNames: ['Samantha', 'Google US English', 'Karen'] },
  matt: { rate: 0.97, pitch: 0.92, preferredVoiceNames: ['Alex', 'Daniel', 'Google UK English Male'] },
  stranger: { rate: 0.82, pitch: 0.76, preferredVoiceNames: ['Daniel', 'Google UK English Male', 'Alex'] },
  hunter: { rate: 0.82, pitch: 0.76, preferredVoiceNames: ['Daniel', 'Google UK English Male', 'Alex'] },
};

function chunkDialogue(text: string, maxChunkLength = 180): string[] {
  const compact = text.replace(/\s+/g, ' ').trim();
  if (compact.length <= maxChunkLength) return [compact];

  const sentenceChunks = compact.match(/[^.!?]+[.!?]?/g) ?? [compact];
  const chunks: string[] = [];
  let currentChunk = '';

  for (const sentence of sentenceChunks) {
    const next = `${currentChunk} ${sentence}`.trim();
    if (next.length <= maxChunkLength) {
      currentChunk = next;
      continue;
    }

    if (currentChunk) chunks.push(currentChunk);

    if (sentence.length <= maxChunkLength) {
      currentChunk = sentence.trim();
      continue;
    }

    const words = sentence.trim().split(' ');
    let wordChunk = '';
    for (const word of words) {
      const nextWordChunk = `${wordChunk} ${word}`.trim();
      if (nextWordChunk.length <= maxChunkLength) {
        wordChunk = nextWordChunk;
      } else {
        if (wordChunk) chunks.push(wordChunk);
        wordChunk = word;
      }
    }

    if (wordChunk) chunks.push(wordChunk);
    currentChunk = '';
  }

  if (currentChunk) chunks.push(currentChunk);
  return chunks;
}

export function useVoice() {
  const voicesRef = useRef<SpeechSynthesisVoice[]>([]);
  const utteranceQueueRef = useRef<SpeechSynthesisUtterance[]>([]);
  const flushQueueRef = useRef<() => void>(() => undefined);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioUrlCacheRef = useRef<Map<string, string>>(new Map());
  const cancelTokenRef = useRef(0);
  const speakerVariantRef = useRef<Record<string, number>>({});

  const refreshVoices = useCallback((): void => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    voicesRef.current = window.speechSynthesis.getVoices();
  }, []);

  const pickVoice = useCallback((speakerId: string): SpeechSynthesisVoice | null => {
    const voiceHint = CHARACTER_VOICE_HINTS[speakerId] ?? DEFAULT_HINT;
    const voices = voicesRef.current;
    if (!voices.length) return null;

    const priorities = voiceHint.preferredVoiceNames.map((name) => name.toLowerCase());
    const exact = voices.find((voice) => priorities.includes(voice.name.toLowerCase()));
    if (exact) return exact;

    const fuzzy = voices.find((voice) => priorities.some((name) => voice.name.toLowerCase().includes(name)));
    if (fuzzy) return fuzzy;

    return voices.find((voice) => voice.lang.toLowerCase().startsWith('en')) ?? voices[0] ?? null;
  }, []);

  const stopAudio = useCallback((): void => {
    if (!audioRef.current) return;
    audioRef.current.pause();
    audioRef.current.src = '';
    audioRef.current = null;
  }, []);

  const flushSpeechSynthesisQueue = useCallback((): void => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    const synth = window.speechSynthesis;
    if (synth.speaking || synth.pending) return;

    const next = utteranceQueueRef.current.shift();
    if (!next) return;

    next.onend = () => flushQueueRef.current();
    next.onerror = () => flushQueueRef.current();

    synth.speak(next);
  }, []);

  const cancel = useCallback((): void => {
    cancelTokenRef.current += 1;
    utteranceQueueRef.current = [];
    stopAudio();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }, [stopAudio]);

  const playViaSpeechSynthesis = useCallback((text: string, speakerId: string): void => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    const voiceHint = CHARACTER_VOICE_HINTS[speakerId] ?? DEFAULT_HINT;
    const voice = pickVoice(speakerId);
    const chunks = chunkDialogue(text);

    utteranceQueueRef.current = chunks.map((chunk) => {
      const utterance = new SpeechSynthesisUtterance(chunk);
      utterance.rate = voiceHint.rate;
      utterance.pitch = voiceHint.pitch;
      utterance.volume = 0.9;
      utterance.lang = voice?.lang ?? 'en-US';
      if (voice) utterance.voice = voice;
      return utterance;
    });

    if (window.speechSynthesis.paused) window.speechSynthesis.resume();
    flushSpeechSynthesisQueue();
  }, [flushSpeechSynthesisQueue, pickVoice]);

  const playViaElevenLabs = useCallback(async (text: string, speakerId: string, token: number, variant: number): Promise<boolean> => {
    const cacheKey = `${speakerId}:${text}`;

    try {
      let audioUrl = audioUrlCacheRef.current.get(cacheKey);
      if (!audioUrl) {
        const response = await fetch('/api/voice', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text, speaker: speakerId, variant }),
        });

        if (!response.ok) return false;
        const audioBlob = await response.blob();
        audioUrl = URL.createObjectURL(audioBlob);
        audioUrlCacheRef.current.set(cacheKey, audioUrl);
      }

      if (token !== cancelTokenRef.current) return false;

      const audio = new Audio(audioUrl);
      audio.preload = 'auto';
      audioRef.current = audio;
      await audio.play();
      return true;
    } catch {
      return false;
    }
  }, []);

  const speak = useCallback(async (text: string, speakerId: string): Promise<void> => {
    if (typeof window === 'undefined') return;
    const trimmed = text.trim();
    if (!trimmed) return;

    refreshVoices();
    cancel();
    const token = cancelTokenRef.current;
    const nextVariant = (speakerVariantRef.current[speakerId] || 0) + 1;
    speakerVariantRef.current[speakerId] = nextVariant;

    const playedCloudVoice = await playViaElevenLabs(trimmed, speakerId, token, nextVariant);
    if (!playedCloudVoice && token === cancelTokenRef.current) {
      playViaSpeechSynthesis(trimmed, speakerId);
    }
  }, [cancel, playViaElevenLabs, playViaSpeechSynthesis, refreshVoices]);

  useEffect(() => {
    flushQueueRef.current = flushSpeechSynthesisQueue;
  }, [flushSpeechSynthesisQueue]);

  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    const cache = audioUrlCacheRef.current;

    refreshVoices();
    window.speechSynthesis.onvoiceschanged = refreshVoices;

    const unlockSpeech = () => {
      window.speechSynthesis.resume();
    };

    const onVisibility = () => {
      if (document.hidden) cancel();
    };

    window.addEventListener('pointerdown', unlockSpeech, { passive: true });
    window.addEventListener('keydown', unlockSpeech);
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      cancel();
      for (const audioUrl of cache.values()) {
        URL.revokeObjectURL(audioUrl);
      }
      cache.clear();
      window.speechSynthesis.onvoiceschanged = null;
      window.removeEventListener('pointerdown', unlockSpeech);
      window.removeEventListener('keydown', unlockSpeech);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [cancel, refreshVoices]);

  return { speak, cancel };
}
