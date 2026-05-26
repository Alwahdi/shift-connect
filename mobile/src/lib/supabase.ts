import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';

const CHUNK_SIZE = 2000;

const ExpoSecureStoreAdapter = {
  getItem: async (key: string) => {
    const numChunksStr = await SecureStore.getItemAsync(`${key}.numChunks`);
    if (!numChunksStr) return SecureStore.getItemAsync(key);
    const numChunks = parseInt(numChunksStr, 10);
    const chunks = await Promise.all(
      Array.from({ length: numChunks }, (_, i) => SecureStore.getItemAsync(`${key}.${i}`))
    );
    return chunks.join('');
  },
  setItem: async (key: string, value: string) => {
    if (value.length <= CHUNK_SIZE) {
      return SecureStore.setItemAsync(key, value);
    }
    const numChunks = Math.ceil(value.length / CHUNK_SIZE);
    await SecureStore.setItemAsync(`${key}.numChunks`, String(numChunks));
    await Promise.all(
      Array.from({ length: numChunks }, (_, i) =>
        SecureStore.setItemAsync(`${key}.${i}`, value.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE))
      )
    );
  },
  removeItem: async (key: string) => {
    const numChunksStr = await SecureStore.getItemAsync(`${key}.numChunks`);
    if (numChunksStr) {
      const numChunks = parseInt(numChunksStr, 10);
      await Promise.all([
        SecureStore.deleteItemAsync(`${key}.numChunks`),
        ...Array.from({ length: numChunks }, (_, i) => SecureStore.deleteItemAsync(`${key}.${i}`)),
      ]);
    } else {
      return SecureStore.deleteItemAsync(key);
    }
  },
};

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://your-project.supabase.co';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: ExpoSecureStoreAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
