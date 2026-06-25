export type GlobalAudioToggleState =
  | "enabled"
  | "muted"
  | "unlock_required"
  | "loading"
  | "temporarily_blocked"
  | "unavailable";

export interface AudioPreferences {
  enabled: boolean;
  autoRead: boolean;
  volume: number;
}
