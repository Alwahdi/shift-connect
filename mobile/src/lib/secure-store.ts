import * as SecureStore from "expo-secure-store";

const ExpoSecureStoreAdapter = {
  getItem: async (key: string): Promise<string | null> => {
    try { return await SecureStore.getItemAsync(key); } catch { return null; }
  },
  setItem: async (key: string, value: string): Promise<void> => {
    try { await SecureStore.setItemAsync(key, value); } catch {}
  },
  removeItem: async (key: string): Promise<void> => {
    try { await SecureStore.deleteItemAsync(key); } catch {}
  },
};

export default ExpoSecureStoreAdapter;
