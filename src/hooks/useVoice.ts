import { useState, useCallback, useRef, useEffect } from 'react';

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
  isFinal: boolean;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}

interface SpeechRecognitionConstructor {
  prototype: SpeechRecognition;
  new(): SpeechRecognition;
}

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  }
}

interface VoiceState {
  isListening: boolean;
  transcript: string;
  isSpeaking: boolean;
  error: string | null;
}

export function useVoiceInput() {
  const [state, setState] = useState<VoiceState>({
    isListening: false,
    transcript: '',
    isSpeaking: false,
    error: null,
  });
  
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognitionCtor = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognitionCtor) {
        recognitionRef.current = new SpeechRecognitionCtor();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
        
        recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
          let transcript = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            transcript += event.results[i][0].transcript;
          }
          setState(s => ({ ...s, transcript }));
        };
        
        recognitionRef.current.onerror = (event: SpeechRecognitionErrorEvent) => {
          setState(s => ({ ...s, error: event.error, isListening: false }));
        };
        
        recognitionRef.current.onend = () => {
          setState(s => ({ ...s, isListening: false }));
        };
      }
    }
    
    return () => {
      recognitionRef.current?.stop();
    };
  }, []);
  
  const startListening = useCallback(() => {
    if (recognitionRef.current && !state.isListening) {
      try {
        recognitionRef.current.start();
        setState(s => ({ ...s, isListening: true, error: null }));
      } catch (e) {
        console.error('Failed to start recognition:', e);
      }
    }
  }, [state.isListening]);
  
  const stopListening = useCallback(() => {
    if (recognitionRef.current && state.isListening) {
      recognitionRef.current.stop();
    }
  }, [state.isListening]);
  
  const clearTranscript = useCallback(() => {
    setState(s => ({ ...s, transcript: '' }));
  }, []);
  
  return { ...state, startListening, stopListening, clearTranscript };
}

// Character voice ID map — replace with real ElevenLabs voice IDs when available
export const CHARACTER_VOICE_IDS: Record<string, string> = {
  // Default ElevenLabs voices as placeholders
  // Replace these with character-specific voices from your ElevenLabs project
  narrator: process.env.NEXT_PUBLIC_ELEVENLABS_NARRATOR_VOICE_ID || 'pNInz6obpgDQGcFmaJgB', // Adam
  sam:      process.env.NEXT_PUBLIC_ELEVENLABS_SAM_VOICE_ID      || 'EXAVITQu4vr4xnSDxMaL', // Bella
  mike:     process.env.NEXT_PUBLIC_ELEVENLABS_MIKE_VOICE_ID     || 'VR6AewLTigWG4xSOukaG', // Arnold
  jessica:  process.env.NEXT_PUBLIC_ELEVENLABS_JESSICA_VOICE_ID  || 'MF3mGyEYCl7XYWbV9V6O', // Elli
  ashley:   process.env.NEXT_PUBLIC_ELEVENLABS_ASHLEY_VOICE_ID   || 'AZnzlk1XvdvUeBnXmlld', // Domi
  chris:    process.env.NEXT_PUBLIC_ELEVENLABS_CHRIS_VOICE_ID    || 'yoZ06aMxZJJ28mfd3POQ', // Sam
  josh:     process.env.NEXT_PUBLIC_ELEVENLABS_JOSH_VOICE_ID     || 'TxGEqnHWrfWFTfGW9XjX', // Josh
  emily:    process.env.NEXT_PUBLIC_ELEVENLABS_EMILY_VOICE_ID    || 'ThT5KcBeYPX3keUQqHPh', // Dorothy
  matt:     process.env.NEXT_PUBLIC_ELEVENLABS_MATT_VOICE_ID     || 'GBv7mTt0atIp3Br8iCZE', // Thomas
  hannah:   process.env.NEXT_PUBLIC_ELEVENLABS_HANNAH_VOICE_ID   || 'oWAxZDx7w5VEj9dCyTzz', // Grace
  beth:     process.env.NEXT_PUBLIC_ELEVENLABS_BETH_VOICE_ID     || 'jBpfuIE2acCO8z3wKNLl', // Gigi
};

export function useElevenLabs() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const speak = useCallback(async (text: string, voiceId?: string, fearLevel = 0) => {
    const apiKey = process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY;
    const resolvedId = voiceId || CHARACTER_VOICE_IDS.narrator;

    if (!apiKey) {
      // Browser TTS fallback
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        const utt = new SpeechSynthesisUtterance(text);
        utt.rate = fearLevel > 60 ? 1.2 : 1.0;
        utt.pitch = fearLevel > 60 ? 1.1 : 1.0;
        window.speechSynthesis.speak(utt);
      }
      return;
    }

    setIsSpeaking(true);

    // Emotion param: higher fear = lower stability (more erratic/scared)
    const stability = fearLevel > 60 ? 0.3 : fearLevel > 30 ? 0.45 : 0.65;

    try {
      const response = await fetch(
        `https://api.elevenlabs.io/v1/text-to-speech/${resolvedId}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'xi-api-key': apiKey,
          },
          body: JSON.stringify({
            text,
            voice_settings: {
              stability,
              similarity_boost: 0.85,
            },
          }),
        }
      );

      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);

        // Stop any currently playing audio
        if (audioRef.current) {
          audioRef.current.pause();
          URL.revokeObjectURL(audioRef.current.src);
        }

        const audio = new Audio(url);
        audioRef.current = audio;
        audio.onended = () => {
          setIsSpeaking(false);
          URL.revokeObjectURL(url);
          audioRef.current = null;
        };
        audio.play();
      } else {
        setIsSpeaking(false);
      }
    } catch (error) {
      console.error('ElevenLabs TTS error:', error);
      setIsSpeaking(false);
    }
  }, []);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  }, []);

  return { isSpeaking, speak, stop };
}
