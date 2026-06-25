"use client";

import React, { createContext, useState, useEffect, useContext } from "react";
import { audioOrchestrator } from "./audio-orchestrator";
import { GlobalAudioToggleState } from "./audio-state";

interface AudioContextType {
  toggleMute: () => void;
  playKey: (key: string) => Promise<void>;
  playSFX: (key: string) => Promise<void>;
  playFeedbackSequence: (
    sfxKey: string,
    voiceKey: string | null,
  ) => Promise<void>;
  stop: () => void;
  pauseVoice: () => void;
  resumeVoice: () => void;
  isMuted: boolean;
  volume: number;
  setVolume: (v: number) => void;
  toggleState: GlobalAudioToggleState;
  manifestLoaded: boolean;
  manifestError: boolean;
  isNarrating: boolean;
  dictationActive: boolean;
  setDictationActive: (active: boolean) => void;
  setActivityScope: (activityId: string) => void;
}

const AudioContext = createContext<AudioContextType | null>(null);

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const [isMuted, setIsMuted] = useState(
    () => audioOrchestrator?.isMuted() ?? true,
  );
  const [volume, setVolumeState] = useState(
    () => audioOrchestrator?.getVolume() ?? 0.7,
  );
  const [manifestLoaded, setManifestLoaded] = useState(
    () => audioOrchestrator?.isManifestLoaded() ?? false,
  );
  const [manifestError, setManifestError] = useState(
    () => audioOrchestrator?.isManifestError() ?? false,
  );
  const [isNarrating, setIsNarrating] = useState(false);
  const [dictationActive, setDictationActive] = useState(false);

  useEffect(() => {
    if (!audioOrchestrator) return;

    const unsubscribe = audioOrchestrator.subscribe(() => {
      setIsMuted(audioOrchestrator.isMuted());
      setVolumeState(audioOrchestrator.getVolume());
      setManifestLoaded(audioOrchestrator.isManifestLoaded());
      setManifestError(audioOrchestrator.isManifestError());
      setIsNarrating(audioOrchestrator.isNarrating());
    });

    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!audioOrchestrator) return;
    if (dictationActive) {
      audioOrchestrator.blockPlayback();
    } else {
      audioOrchestrator.unblockPlayback();
    }
  }, [dictationActive]);

  const toggleMute = () => {
    if (audioOrchestrator) {
      audioOrchestrator.setMute(!isMuted);
    }
  };

  const setVolume = (v: number) => {
    if (audioOrchestrator) {
      audioOrchestrator.setVolume(v);
    }
  };

  const playKey = (key: string) => {
    if (audioOrchestrator) {
      return audioOrchestrator.playKey(key);
    }
    return Promise.resolve();
  };

  const playSFX = (key: string) => {
    if (audioOrchestrator) {
      return audioOrchestrator.playSFX(key);
    }
    return Promise.resolve();
  };

  const playFeedbackSequence = (sfxKey: string, voiceKey: string | null) => {
    if (audioOrchestrator) {
      return audioOrchestrator.playFeedbackSequence(sfxKey, voiceKey);
    }
    return Promise.resolve();
  };

  const stop = () => {
    if (audioOrchestrator) {
      audioOrchestrator.stopAll();
    }
  };

  const pauseVoice = () => {
    if (audioOrchestrator) {
      audioOrchestrator.pauseVoice();
    }
  };

  const resumeVoice = () => {
    if (audioOrchestrator) {
      audioOrchestrator.resumeVoice();
    }
  };

  const setActivityScope = (activityId: string) => {
    if (audioOrchestrator) {
      audioOrchestrator.setActivityScope(activityId);
    }
  };

  // Determine global button display state
  let toggleState: GlobalAudioToggleState = "loading";

  if (!manifestLoaded && !manifestError) {
    toggleState = "loading";
  } else if (manifestError) {
    toggleState = "unavailable";
  } else if (dictationActive) {
    toggleState = "temporarily_blocked";
  } else {
    // Check if manifest is empty (no keys or no assets)
    // In Gates 1 & 2, before audio files are generated, the manifest contains no approved assets
    // The instructions say: "The global button must not display 'الصوت يعمل' when there is no approved runtime manifest or no playable approved assets."
    // In this case, display "الصوت غير متاح حاليًا".
    // Let's implement this logic:
    const hasPlayableAssets = audioOrchestrator
      ? audioOrchestrator.hasPlayableAssets()
      : false;

    if (!hasPlayableAssets) {
      toggleState = "unavailable";
    } else {
      // Browser unlock required state detection (can play after first user interaction)
      // Usually default to unlock_required if we haven't played anything and browser audio context is suspended,
      // but let's check a simple state: if muted, return muted, else enabled.
      // Wait, let's keep it simple:
      if (isMuted) {
        toggleState = "muted";
      } else {
        toggleState = "enabled";
      }
    }
  }

  return (
    <AudioContext.Provider
      value={{
        toggleMute,
        playKey,
        playSFX,
        playFeedbackSequence,
        stop,
        pauseVoice,
        resumeVoice,
        isMuted,
        volume,
        setVolume,
        toggleState,
        manifestLoaded,
        manifestError,
        isNarrating,
        dictationActive,
        setDictationActive,
        setActivityScope,
      }}
    >
      {children}
    </AudioContext.Provider>
  );
}

export function useAudio() {
  const ctx = useContext(AudioContext);
  if (!ctx) {
    // Return mock values if consumed outside provider to avoid crashes in tests/SSR
    return {
      toggleMute: () => {},
      playKey: () => Promise.resolve(),
      playSFX: () => Promise.resolve(),
      playFeedbackSequence: () => Promise.resolve(),
      stop: () => {},
      pauseVoice: () => {},
      resumeVoice: () => {},
      isMuted: true,
      volume: 0.7,
      setVolume: () => {},
      toggleState: "unavailable" as GlobalAudioToggleState,
      manifestLoaded: false,
      manifestError: true,
      isNarrating: false,
      dictationActive: false,
      setDictationActive: () => {},
      setActivityScope: () => {},
    };
  }
  return ctx;
}
