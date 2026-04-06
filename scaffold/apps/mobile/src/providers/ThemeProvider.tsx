/**
 * ThemeProvider for the mobile app.
 *
 * Manages light/dark theme switching with system preference detection.
 * Persists user preference via AsyncStorage.
 */
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useColorScheme } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { colors } from "@/constants/theme";

export type ThemeMode = "light" | "dark" | "system";

interface ThemeContextValue {
  /** Resolved theme (always 'light' or 'dark') */
  theme: "light" | "dark";
  /** User's preference (can be 'system') */
  themeMode: ThemeMode;
  /** Toggle between light and dark */
  toggleTheme: () => void;
  /** Set specific theme mode */
  setThemeMode: (mode: ThemeMode) => void;
  /** Current theme colors */
  themeColors: typeof colors.light;
}

const THEME_KEY = "syndeocare_theme_mode";
const ThemeContext = createContext<ThemeContextValue | null>(null);

interface ThemeProviderProps {
  children: React.ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const systemScheme = useColorScheme();
  const [themeMode, setThemeModeState] = useState<ThemeMode>("system");
  const [isLoaded, setIsLoaded] = useState(false);

  // Load saved preference
  useEffect(() => {
    AsyncStorage.getItem(THEME_KEY).then((saved) => {
      if (saved === "light" || saved === "dark" || saved === "system") {
        setThemeModeState(saved);
      }
      setIsLoaded(true);
    });
  }, []);

  // Resolve theme
  const theme: "light" | "dark" = useMemo(() => {
    if (themeMode === "system") {
      return systemScheme === "dark" ? "dark" : "light";
    }
    return themeMode;
  }, [themeMode, systemScheme]);

  const themeColors = useMemo(() => colors[theme], [theme]);

  const setThemeMode = useCallback(async (mode: ThemeMode) => {
    setThemeModeState(mode);
    await AsyncStorage.setItem(THEME_KEY, mode);
  }, []);

  const toggleTheme = useCallback(() => {
    const next = theme === "light" ? "dark" : "light";
    setThemeMode(next);
  }, [theme, setThemeMode]);

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme,
      themeMode,
      toggleTheme,
      setThemeMode,
      themeColors,
    }),
    [theme, themeMode, toggleTheme, setThemeMode, themeColors],
  );

  // Don't render until preference is loaded to prevent flash
  if (!isLoaded) return null;

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used within a <ThemeProvider>");
  }
  return ctx;
}
