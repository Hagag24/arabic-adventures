"use client";

import { useState, useEffect, useRef } from "react";

export interface UseSpeechDictationOptions {
  onTranscript: (text: string) => void;
  locale?: string;
}

interface ISpeechRecognitionEvent {
  results: {
    [index: number]: {
      [index: number]: {
        transcript: string;
      };
    };
    length: number;
  };
}

interface ISpeechRecognitionErrorEvent {
  error: string;
}

export function useSpeechDictation({
  onTranscript,
  locale = "ar-EG",
}: UseSpeechDictationOptions) {
  const [isListening, setIsListening] = useState(false);
  const [isSupported] = useState(() => {
    if (typeof window === "undefined") return false;
    const win = window as unknown as {
      SpeechRecognition?: unknown;
      webkitSpeechRecognition?: unknown;
    };
    return !!(win.SpeechRecognition || win.webkitSpeechRecognition);
  });
  const [error, setError] = useState<string | null>(null);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);
  const onTranscriptRef = useRef(onTranscript);

  useEffect(() => {
    onTranscriptRef.current = onTranscript;
  }, [onTranscript]);

  useEffect(() => {
    /* eslint-disable @typescript-eslint/no-explicit-any */
    const SpeechRecognitionClass =
      typeof window !== "undefined" &&
      ((window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition);
    /* eslint-enable @typescript-eslint/no-explicit-any */

    if (SpeechRecognitionClass) {
      const rec = new SpeechRecognitionClass();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = locale;

      rec.onstart = () => {
        setIsListening(true);
        setError(null);
      };

      rec.onresult = (event: ISpeechRecognitionEvent) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          onTranscriptRef.current(transcript);
        }
      };

      rec.onerror = (event: ISpeechRecognitionErrorEvent) => {
        console.error("Speech recognition error:", event.error);
        if (
          event.error === "not-allowed" ||
          event.error === "permission-denied"
        ) {
          setError("permission-denied");
        } else if (event.error === "no-speech") {
          setError("no-speech");
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
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // ignore
        }
      }
    };
  }, [locale]);

  const startListening = () => {
    if (!isSupported || !recognitionRef.current) {
      setError("unsupported");
      return;
    }
    try {
      recognitionRef.current.start();
    } catch (err) {
      console.error("Failed to start speech recognition:", err);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
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
