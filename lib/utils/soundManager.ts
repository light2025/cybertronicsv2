import { useSettingsStore } from '@/lib/store/settingsStore';

export const sounds = {
  startup: '/xp/sounds/startup.wav',
  error: '/xp/sounds/error.wav',
  shutdown: '/xp/sounds/shutdown.wav',
  navigation: '/xp/sounds/navigation.wav',
} as const;

export type SoundKey = keyof typeof sounds;

let currentAudio: HTMLAudioElement | null = null;

export function playSound(key: SoundKey): Promise<void> {
  const enabled = useSettingsStore.getState().soundEnabled;
  if (!enabled) return Promise.resolve();

  if (currentAudio) {
    currentAudio.pause();
    currentAudio = null;
  }

  return new Promise((resolve) => {
    const audio = new Audio(sounds[key]);
    currentAudio = audio;
    audio.onended = () => {
      currentAudio = null;
      resolve();
    };
    audio.onerror = () => {
      currentAudio = null;
      resolve();
    };
    audio.play().catch(() => resolve());
  });
}

export function stopSound(): void {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio = null;
  }
}
