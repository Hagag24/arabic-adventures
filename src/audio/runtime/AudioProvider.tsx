"use client";

import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  useRef,
  useCallback,
} from "react";
import { audioOrchestrator, PlaybackResult } from "./audio-orchestrator";
import {
  selectGlobalAudioVisualState,
  GlobalAudioVisualState,
} from "./audio-visual-state";
import { audioPreferences } from "./audio-preferences";
import { usePathname } from "next/navigation";

interface AudioContextType {
  toggleMute: () => void;
  playKey: (key: string) => Promise<PlaybackResult>;
  playSFX: (key: string) => Promise<PlaybackResult>;
  playFeedbackSequence: (
    sfxKey: string,
    voiceKey: string | null,
  ) => Promise<void>;
  playSequence: (
    keys: string[],
    ownerId?: string | null,
    onStart?: () => void,
  ) => Promise<PlaybackResult>;
  stop: (reason?: string, ownerId?: string | null) => void;
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
  unlock: () => Promise<void>;
  setEntryIdentity: (id: string) => void;
  requestEntryNarration: (params: {
    ownerId: string;
    entryId: string;
    instructionKey: string | null;
    questionKey: string | null;
    onPlaybackStart?: () => void;
  }) => Promise<PlaybackResult>;
  playCelebrationSequence: (
    sfxKey: string,
    voiceKey: string,
    ownerId: string,
    onStart?: () => void,
  ) => Promise<PlaybackResult>;
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
    () => audioOrchestrator?.getActiveKey() ?? null,
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

  const welcomeAttempted = useRef(false);
  const pathname = usePathname();

  useEffect(() => {
    if (manifestLoaded && audioOrchestrator && !welcomeAttempted.current) {
      welcomeAttempted.current = true;
      const prefs = audioPreferences.getPreferences();
      if (prefs.enabled && pathname === "/") {
        audioOrchestrator
          .playKey("global.welcome.01")
          .then(() => {
            audioOrchestrator.setUnlocked(true);
          })
          .catch(() => {
            audioOrchestrator.setUnlocked(false);
          });
      }
    }
  }, [manifestLoaded, manifestError, pathname]);

  const isMutedRef = useRef(isMuted);
  useEffect(() => {
    isMutedRef.current = isMuted;
  }, [isMuted]);

  const toggleMute = useCallback(() => {
    if (audioOrchestrator) {
      const wasUnlocked = audioOrchestrator.isUnlocked();
      if (!wasUnlocked) {
        audioOrchestrator.setMute(false);
        audioOrchestrator.playKey("global.welcome.01");
      } else {
        const nextMute = !isMutedRef.current;
        audioOrchestrator.setMute(nextMute);
      }
    }
  }, []);

  const setVolume = useCallback((v: number) => {
    if (audioOrchestrator) {
      audioOrchestrator.setVolume(v);
    }
  }, []);

  const playKey = useCallback((
    key: string,
    ownerId?: string | null,
    overridePurpose?: "instruction" | "prompt" | "option" | "correct_feedback" | "retry_feedback" | "completion" | null,
    onStart?: () => void,
  ) => {
    if (audioOrchestrator) {
      return audioOrchestrator.playKey(key, ownerId, overridePurpose, onStart);
    }
    return Promise.resolve({ status: "failed" as const, error: new Error("Audio orchestrator not initialized") });
  }, []);

  const playSFX = useCallback((key: string, ownerId?: string | null, onStart?: () => void) => {
    if (audioOrchestrator) {
      return audioOrchestrator.playSFX(key, ownerId, onStart);
    }
    return Promise.resolve({ status: "failed" as const, error: new Error("Audio orchestrator not initialized") });
  }, []);

  const playFeedbackSequence = useCallback((sfxKey: string, voiceKey: string | null) => {
    if (audioOrchestrator) {
      return audioOrchestrator.playFeedbackSequence(sfxKey, voiceKey);
    }
    return Promise.resolve();
  }, []);

  const stop = useCallback((reason?: string, ownerId?: string | null) => {
    if (audioOrchestrator) {
      audioOrchestrator.stopAll(reason, ownerId);
    }
  }, []);

  const pauseVoice = useCallback(() => {
    if (audioOrchestrator) {
      audioOrchestrator.pauseVoice();
    }
  }, []);

  const resumeVoice = useCallback(() => {
    if (audioOrchestrator) {
      audioOrchestrator.resumeVoice();
    }
  }, []);

  const setActivityScope = useCallback((activityId: string) => {
    if (audioOrchestrator) {
      audioOrchestrator.setActivityScope(activityId);
    }
  }, []);

  const playSequence = useCallback((
    keys: string[],
    ownerId?: string | null,
    onStart?: () => void,
  ) => {
    if (audioOrchestrator) {
      return audioOrchestrator.playSequence(keys, ownerId, onStart);
    }
    return Promise.resolve({ status: "completed" as const });
  }, []);

  const isKeyPlayable = useCallback((key: string) => {
    return audioOrchestrator ? audioOrchestrator.hasKey(key) : false;
  }, []);

  const unlock = useCallback(() => {
    if (audioOrchestrator) {
      return audioOrchestrator.unlock();
    }
    return Promise.resolve();
  }, []);

  const setEntryIdentity = useCallback((id: string) => {
    if (audioOrchestrator) {
      audioOrchestrator.setEntryIdentity(id);
    }
  }, []);

  const requestEntryNarration = useCallback((params: {
    ownerId: string;
    entryId: string;
    instructionKey: string | null;
    questionKey: string | null;
    onPlaybackStart?: () => void;
  }) => {
    if (audioOrchestrator) {
      return audioOrchestrator.requestEntryNarration(params);
    }
    return Promise.resolve({ status: "failed" as const, error: new Error("Audio orchestrator not initialized") });
  }, []);

  const playCelebrationSequence = useCallback((
    sfxKey: string,
    voiceKey: string,
    ownerId: string,
    onStart?: () => void,
  ) => {
    if (audioOrchestrator) {
      return audioOrchestrator.playCelebrationSequence(sfxKey, voiceKey, ownerId, onStart);
    }
    return Promise.resolve({ status: "failed" as const, error: new Error("Audio orchestrator not initialized") });
  }, []);

  // Focused development assertion of callback stability
  const lastRefs = useRef<{
    stop?: unknown;
    playKey?: unknown;
    playSequence?: unknown;
  }>({});

  useEffect(() => {
    if (lastRefs.current.stop) {
      if (lastRefs.current.stop !== stop) {
        console.warn("[AUDIO_DEV_ASSERT] FAIL: stop callback reference changed!");
      }
      if (lastRefs.current.playKey !== playKey) {
        console.warn("[AUDIO_DEV_ASSERT] FAIL: playKey callback reference changed!");
      }
      if (lastRefs.current.playSequence !== playSequence) {
        console.warn("[AUDIO_DEV_ASSERT] FAIL: playSequence callback reference changed!");
      }
    }
    lastRefs.current.stop = stop;
    lastRefs.current.playKey = playKey;
    lastRefs.current.playSequence = playSequence;
  }, [stop, playKey, playSequence]);

  // Derive global button visual state config from orchestrator facts
  const facts = {
    initialized: manifestLoaded || manifestError,
    hasApprovedAssets: audioOrchestrator
      ? audioOrchestrator.hasKey("global.welcome.01")
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

  const contextValue = React.useMemo(() => ({
    toggleMute,
    playKey,
    playSFX,
    playFeedbackSequence,
    playSequence,
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
    unlock,
    setEntryIdentity,
    requestEntryNarration,
    playCelebrationSequence,
  }), [
    toggleMute,
    playKey,
    playSFX,
    playFeedbackSequence,
    playSequence,
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
    setActivityScope,
    isKeyPlayable,
    unlock,
    setEntryIdentity,
    requestEntryNarration,
    playCelebrationSequence,
  ]);

  return (
    <AudioContext.Provider value={contextValue}>
      {children}
    </AudioContext.Provider>
  );
}

export function useAudio(): AudioContextType {
  const ctx = useContext(AudioContext);
  if (!ctx) {
    return {
      toggleMute: () => {},
      playKey: () => Promise.resolve({ status: "failed" as const, error: new Error("AudioContext not found") }),
      playSFX: () => Promise.resolve({ status: "failed" as const, error: new Error("AudioContext not found") }),
      playFeedbackSequence: () => Promise.resolve(),
      playSequence: () => Promise.resolve({ status: "completed" as const }),
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
      unlock: () => Promise.resolve(),
      setEntryIdentity: () => {},
      requestEntryNarration: () => Promise.resolve({ status: "failed" as const, error: new Error("AudioContext not found") }),
      playCelebrationSequence: () => Promise.resolve({ status: "failed" as const, error: new Error("AudioContext not found") }),
    };
  }
  return ctx;
}
