import { AudioPreferences } from "./audio-state";

const ENABLED_KEY = "ArabicAdventures.Audio.Enabled";
const AUTOREAD_KEY = "ArabicAdventures.Audio.AutoRead";
const VOLUME_KEY = "ArabicAdventures.Audio.Volume";

export const audioPreferences = {
  getPreferences(): AudioPreferences {
    if (typeof window === "undefined") {
      return { enabled: true, autoRead: true, volume: 0.7 };
    }
    try {
      const enabledStr = localStorage.getItem(ENABLED_KEY);
      const autoReadStr = localStorage.getItem(AUTOREAD_KEY);
      const volumeStr = localStorage.getItem(VOLUME_KEY);

      const enabled = enabledStr !== null ? enabledStr === "true" : true;
      const autoRead = autoReadStr !== null ? autoReadStr === "true" : true;
      const volume = volumeStr !== null ? parseFloat(volumeStr) : 0.7;

      return {
        enabled,
        autoRead,
        volume: isNaN(volume) ? 0.7 : Math.max(0, Math.min(1, volume)),
      };
    } catch (e) {
      console.warn("Failed to read audio preferences from localStorage:", e);
      return { enabled: true, autoRead: true, volume: 0.7 };
    }
  },

  setPreferences(prefs: Partial<AudioPreferences>) {
    if (typeof window === "undefined") return;
    try {
      if (prefs.enabled !== undefined) {
        localStorage.setItem(ENABLED_KEY, prefs.enabled ? "true" : "false");
      }
      if (prefs.autoRead !== undefined) {
        localStorage.setItem(AUTOREAD_KEY, prefs.autoRead ? "true" : "false");
      }
      if (prefs.volume !== undefined) {
        localStorage.setItem(VOLUME_KEY, prefs.volume.toString());
      }
    } catch (e) {
      console.warn("Failed to write audio preferences to localStorage:", e);
    }
  },
};
