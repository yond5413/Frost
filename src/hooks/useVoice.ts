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

export function useElevenLabs() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  
  const speak = useCallback(async (text: string) => {
    const apiKey = process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY;
    const voiceId = process.env.NEXT_PUBLIC_ELEVENLABS_VOICE_ID || '21m00Tcm4TlvDq8ikWAM';
    
    if (!apiKey) {
      console.warn('ElevenLabs API key not configured');
      return;
    }
    
    setIsSpeaking(true);
    
    try {
      const response = await fetch(
        `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'xi-api-key': apiKey,
          },
          body: JSON.stringify({
            text,
            voice_settings: {
              stability: 0.5,
              similarity_boost: 0.8,
            },
          }),
        }
      );
      
      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        
        const audio = new Audio(url);
        audio.onended = () => {
          setIsSpeaking(false);
          URL.revokeObjectURL(url);
        };
        audio.play();
      }
    } catch (error) {
      console.error('ElevenLabs TTS error:', error);
      setIsSpeaking(false);
    }
  }, []);
  
  const stop = useCallback(() => {
    setIsSpeaking(false);
  }, []);
  
  return { isSpeaking, speak, stop };
}
