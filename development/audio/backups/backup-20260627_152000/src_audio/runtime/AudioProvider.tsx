"use client";

import React, { createContext, useState, useEffect, useContext } from "react";
import { audioOrchestrator } from "./audio-orchestrator";
import {
  selectGlobalAudioVisualState,
  GlobalAudioVisualState,
} from "./audio-visual-state";

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
  toggleState: GlobalAudioVisualState;
  manifestLoaded: boolean;
  manifestError: boolean;
  isNarrating: boolean;
  activeKey: string | null;
  dictationActive: boolean;
  setDictationActive: (active: boolean) => void;
  setActivityScope: (activityId: string) => void;
  isKeyPlayable: (key: string) => boolean;
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
  const [activeKey, setActiveKey] = useState<string | null>(
    () => audioOrchestrator?.getActiveKey() ?? null
  );
  const [dictationActive, setDictationActive] = useState(false);
  const [unlocked, setUnlocked] = useState(
    () => audioOrchestrator?.isUnlocked() ?? false,
  );

  useEffect(() => {
    if (!audioOrchestrator) return;

    const unsubscribe = audioOrchestrator.subscribe(() => {
      setIsMuted(audioOrchestrator.isMuted());
      setVolumeState(audioOrchestrator.getVolume());
      setManifestLoaded(audioOrchestrator.isManifestLoaded());
      setManifestError(audioOrchestrator.isManifestError());
      setIsNarrating(audioOrchestrator.isNarrating());
      setActiveKey(audioOrchestrator.getActiveKey());
      setUnlocked(audioOrchestrator.isUnlocked());
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

  // Derive global button visual state config from orchestrator facts
  const facts = {
    initialized: manifestLoaded || manifestError,
    hasApprovedAssets: audioOrchestrator
      ? audioOrchestrator.hasPlayableAssets()
      : false,
    enabled: !isMuted,
    unlocked: unlocked,
    playbackStatus: audioOrchestrator
      ? audioOrchestrator.getPlaybackStatus()
      : ("idle" as const),
    activePurpose: audioOrchestrator
      ? audioOrchestrator.getActivePurpose()
      : null,
    dictationActive: dictationActive,
  };

  const toggleState = selectGlobalAudioVisualState(facts);

  const isKeyPlayable = (key: string) => {
    return audioOrchestrator ? audioOrchestrator.hasKey(key) : false;
  };

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
        activeKey,
        dictationActive,
        setDictationActive,
        setActivityScope,
        isKeyPlayable,
      }}
    >
      {children}
    </AudioContext.Provider>
  );
}

export function useAudio() {
  const ctx = useContext(AudioContext);
  if (!ctx) {
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
      toggleState: "unavailable" as GlobalAudioVisualState,
      manifestLoaded: false,
      manifestError: true,
      isNarrating: false,
      activeKey: null as string | null,
      dictationActive: false,
      setDictationActive: () => {},
      setActivityScope: () => {},
      isKeyPlayable: () => false,
    };
  }
  return ctx;
}
