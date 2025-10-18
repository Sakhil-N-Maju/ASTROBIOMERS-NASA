/**
 * Text-to-Speech Hook
 * Provides voice narration using Web Speech API
 */

import { useState, useEffect, useCallback, useRef } from 'react';

export interface TTSOptions {
  rate?: number;      // 0.1 to 10 (default: 1)
  pitch?: number;     // 0 to 2 (default: 1)
  volume?: number;    // 0 to 1 (default: 1)
  voice?: SpeechSynthesisVoice;
  lang?: string;      // e.g., 'en-US'
}

export interface TTSState {
  speaking: boolean;
  paused: boolean;
  supported: boolean;
  voices: SpeechSynthesisVoice[];
  error?: string;
}

export interface TTSControls {
  speak: (text: string, options?: TTSOptions) => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  cancel: () => void;
  setRate: (rate: number) => void;
  setPitch: (pitch: number) => void;
  setVolume: (volume: number) => void;
  setVoice: (voice: SpeechSynthesisVoice) => void;
}

const DEFAULT_OPTIONS: TTSOptions = {
  rate: 1.0,
  pitch: 1.0,
  volume: 1.0,
  lang: 'en-US'
};

/**
 * Custom hook for Text-to-Speech
 */
export function useTextToSpeech(): [TTSState, TTSControls] {
  const [state, setState] = useState<TTSState>({
    speaking: false,
    paused: false,
    supported: 'speechSynthesis' in window,
    voices: []
  });

  const [options, setOptions] = useState<TTSOptions>(DEFAULT_OPTIONS);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Load available voices
  useEffect(() => {
    if (!state.supported) {
      setState(prev => ({
        ...prev,
        error: 'Text-to-Speech not supported in this browser'
      }));
      return;
    }

    const loadVoices = () => {
      const availableVoices = speechSynthesis.getVoices();
      
      if (availableVoices.length > 0) {
        setState(prev => ({
          ...prev,
          voices: availableVoices
        }));

        // Set default voice (prefer English)
        const englishVoice = availableVoices.find(
          voice => voice.lang.startsWith('en')
        );
        
        if (englishVoice && !options.voice) {
          setOptions(prev => ({
            ...prev,
            voice: englishVoice
          }));
        }
      }
    };

    // Load voices immediately
    loadVoices();

    // Some browsers load voices asynchronously
    if (speechSynthesis.onvoiceschanged !== undefined) {
      speechSynthesis.onvoiceschanged = loadVoices;
    }

    return () => {
      if (speechSynthesis.onvoiceschanged !== undefined) {
        speechSynthesis.onvoiceschanged = null;
      }
    };
  }, [state.supported]);

  // Speak text
  const speak = useCallback((text: string, customOptions?: TTSOptions) => {
    if (!state.supported) {
      console.error('[TTS] Speech synthesis not supported');
      return;
    }

    // Check if speech synthesis is allowed (requires user interaction)
    try {
      // Cancel any ongoing speech
      speechSynthesis.cancel();
    } catch (error) {
      console.warn('[TTS] Speech synthesis not allowed yet - waiting for user interaction');
      return;
    }

    // Create utterance
    const utterance = new SpeechSynthesisUtterance(text);
    utteranceRef.current = utterance;

    // Apply options
    const finalOptions = { ...options, ...customOptions };
    
    if (finalOptions.rate) utterance.rate = finalOptions.rate;
    if (finalOptions.pitch) utterance.pitch = finalOptions.pitch;
    if (finalOptions.volume) utterance.volume = finalOptions.volume;
    if (finalOptions.lang) utterance.lang = finalOptions.lang;
    if (finalOptions.voice) utterance.voice = finalOptions.voice;

    // Event handlers
    utterance.onstart = () => {
      console.log('[TTS] Speaking started');
      setState(prev => ({
        ...prev,
        speaking: true,
        paused: false,
        error: undefined
      }));
    };

    utterance.onend = () => {
      console.log('[TTS] Speaking ended');
      setState(prev => ({
        ...prev,
        speaking: false,
        paused: false
      }));
      utteranceRef.current = null;
    };

    utterance.onerror = (event) => {
      console.error('[TTS] Speech error:', event);
      setState(prev => ({
        ...prev,
        speaking: false,
        paused: false,
        error: event.error
      }));
      utteranceRef.current = null;
    };

    utterance.onpause = () => {
      console.log('[TTS] Speaking paused');
      setState(prev => ({
        ...prev,
        paused: true
      }));
    };

    utterance.onresume = () => {
      console.log('[TTS] Speaking resumed');
      setState(prev => ({
        ...prev,
        paused: false
      }));
    };

    // Start speaking
    try {
      speechSynthesis.speak(utterance);
    } catch (error) {
      console.error('[TTS] Failed to speak:', error);
      setState(prev => ({
        ...prev,
        error: 'Speech synthesis failed. Please interact with the page first.'
      }));
    }
  }, [state.supported, options]);

  // Pause speaking
  const pause = useCallback(() => {
    if (state.supported && state.speaking && !state.paused) {
      speechSynthesis.pause();
    }
  }, [state.supported, state.speaking, state.paused]);

  // Resume speaking
  const resume = useCallback(() => {
    if (state.supported && state.speaking && state.paused) {
      speechSynthesis.resume();
    }
  }, [state.supported, state.speaking, state.paused]);

  // Stop speaking
  const stop = useCallback(() => {
    if (state.supported) {
      speechSynthesis.cancel();
      setState(prev => ({
        ...prev,
        speaking: false,
        paused: false
      }));
      utteranceRef.current = null;
    }
  }, [state.supported]);

  // Cancel (alias for stop)
  const cancel = stop;

  // Set speech rate
  const setRate = useCallback((rate: number) => {
    setOptions(prev => ({
      ...prev,
      rate: Math.max(0.1, Math.min(10, rate))
    }));
  }, []);

  // Set pitch
  const setPitch = useCallback((pitch: number) => {
    setOptions(prev => ({
      ...prev,
      pitch: Math.max(0, Math.min(2, pitch))
    }));
  }, []);

  // Set volume
  const setVolume = useCallback((volume: number) => {
    setOptions(prev => ({
      ...prev,
      volume: Math.max(0, Math.min(1, volume))
    }));
  }, []);

  // Set voice
  const setVoice = useCallback((voice: SpeechSynthesisVoice) => {
    setOptions(prev => ({
      ...prev,
      voice
    }));
  }, []);

  const controls: TTSControls = {
    speak,
    pause,
    resume,
    stop,
    cancel,
    setRate,
    setPitch,
    setVolume,
    setVoice
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (state.supported) {
        speechSynthesis.cancel();
      }
    };
  }, [state.supported]);

  return [state, controls];
}

/**
 * Utility function to split long text into chunks
 */
export function splitTextIntoChunks(
  text: string,
  maxLength: number = 200
): string[] {
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
  const chunks: string[] = [];
  let currentChunk = '';

  for (const sentence of sentences) {
    if ((currentChunk + sentence).length <= maxLength) {
      currentChunk += sentence;
    } else {
      if (currentChunk) {
        chunks.push(currentChunk.trim());
      }
      currentChunk = sentence;
    }
  }

  if (currentChunk) {
    chunks.push(currentChunk.trim());
  }

  return chunks;
}

/**
 * Speak text with automatic chunking for long content
 */
export async function speakLongText(
  text: string,
  options?: TTSOptions
): Promise<void> {
  if (!('speechSynthesis' in window)) {
    throw new Error('Speech synthesis not supported');
  }

  const chunks = splitTextIntoChunks(text, 200);

  for (const chunk of chunks) {
    await new Promise<void>((resolve, reject) => {
      const utterance = new SpeechSynthesisUtterance(chunk);
      
      if (options?.rate) utterance.rate = options.rate;
      if (options?.pitch) utterance.pitch = options.pitch;
      if (options?.volume) utterance.volume = options.volume;
      if (options?.voice) utterance.voice = options.voice;
      if (options?.lang) utterance.lang = options.lang;

      utterance.onend = () => resolve();
      utterance.onerror = (event) => reject(event.error);

      speechSynthesis.speak(utterance);
    });
  }
}
