/**
 * Secure Store adapter for Supabase Auth in React Native.
 *
 * Uses expo-secure-store to persist JWT tokens securely on device,
 * replacing the browser's localStorage default.
 */
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const PREFIX = "syndeocare_";

/**
 * Custom storage adapter for Supabase client auth configuration.
 * Implements the required { getItem, setItem, removeItem } interface.
 */
export const secureStoreAdapter = {
  async getItem(key: string): Promise<string | null> {
    try {
      if (Platform.OS === "web") {
        return localStorage.getItem(PREFIX + key);
      }
      return await SecureStore.getItemAsync(PREFIX + key);
    } catch {
      return null;
    }
  },

  async setItem(key: string, value: string): Promise<void> {
    try {
      if (Platform.OS === "web") {
        localStorage.setItem(PREFIX + key, value);
        return;
      }
      await SecureStore.setItemAsync(PREFIX + key, value);
    } catch {
      // SecureStore can fail silently on some devices
      console.warn("[SecureStore] Failed to set item:", key);
    }
  },

  async removeItem(key: string): Promise<void> {
    try {
      if (Platform.OS === "web") {
        localStorage.removeItem(PREFIX + key);
        return;
      }
      await SecureStore.deleteItemAsync(PREFIX + key);
    } catch {
      console.warn("[SecureStore] Failed to remove item:", key);
    }
  },
};
