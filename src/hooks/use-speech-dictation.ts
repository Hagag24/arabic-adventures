"use client";

import { useState, useEffect, useRef } from "react";

export interface UseSpeechDictationOptions {
  onTranscript: (text: string) => void;
  locale?: string;
}

export function useSpeechDictation({
  onTranscript,
  locale = "ar-EG",
}: UseSpeechDictationOptions) {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Browser feature detection
    const SpeechRecognition =
      typeof window !== "undefined" &&
      ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);

    if (SpeechRecognition) {
      setIsSupported(true);
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = locale;

      rec.onstart = () => {
        setIsListening(true);
        setError(null);
      };

      rec.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          onTranscript(transcript);
        }
      };

      rec.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error);
        if (event.error === "not-allowed") {
          setError("permission-denied");
        } else {
          setError(event.error);
        }
        setIsListening(false);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = rec;
    }

    return () => {
      // Cleanup on unmount
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {
          // ignore
        }
      }
    };
  }, [locale, onTranscript]);

  const startListening = () => {
    if (!isSupported || !recognitionRef.current) {
      setError("unsupported");
      return;
    }
    try {
      recognitionRef.current.start();
    } catch (e) {
      console.error("Failed to start speech recognition:", e);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        // ignore
      }
    }
  };

  return {
    isListening,
    isSupported,
    error,
    startListening,
    stopListening,
  };
}
