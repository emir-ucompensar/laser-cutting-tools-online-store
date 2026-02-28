import { Preferences } from '@capacitor/preferences';

/**
 * Adaptador de almacenamiento para Supabase que usa @capacitor/preferences.
 * Persiste la sesión de forma nativa en Android y en localStorage en web.
 *
 * Supabase JS v2 acepta un objeto storage con métodos async, por lo que
 * este adaptador es totalmente compatible.
 */
export const capacitorStorageAdapter = {
  getItem(key: string): Promise<string | null> {
    return Preferences.get({ key }).then(({ value }) => value);
  },

  setItem(key: string, value: string): Promise<void> {
    return Preferences.set({ key, value }).then(() => undefined);
  },

  removeItem(key: string): Promise<void> {
    return Preferences.remove({ key }).then(() => undefined);
  },
};
