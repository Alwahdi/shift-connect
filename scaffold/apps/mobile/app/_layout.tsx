/**
 * Root layout — entry point for the entire app.
 *
 * Responsibilities:
 * 1. Load custom fonts (Cairo for Arabic support)
 * 2. Initialize i18n
 * 3. Set up the provider tree (Auth, Theme, QueryClient)
 * 4. Manage splash screen until resources are ready
 * 5. Render the root Stack navigator
 */
import { useCallback, useEffect, useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import * as Font from "expo-font";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/providers/AuthProvider";
import { ThemeProvider, useTheme } from "@/providers/ThemeProvider";
import { getSupabaseClient } from "@/lib/supabase";
import "@/lib/i18n";

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const supabase = getSupabaseClient();

function RootNavigator() {
  const { theme, themeColors } = useTheme();

  return (
    <>
      <StatusBar style={theme === "dark" ? "light" : "dark"} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: themeColors.background },
          animation: "slide_from_right",
        }}
      >
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(app)" />
        <Stack.Screen name="+not-found" />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  const [appReady, setAppReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        // Attempt to load custom fonts — gracefully fall back to system fonts
        // when font files are not yet bundled (e.g. first development setup).
        await Font.loadAsync({
          Cairo: require("../assets/fonts/Cairo-Regular.ttf"),
          "Cairo-Medium": require("../assets/fonts/Cairo-Medium.ttf"),
          "Cairo-SemiBold": require("../assets/fonts/Cairo-SemiBold.ttf"),
          "Cairo-Bold": require("../assets/fonts/Cairo-Bold.ttf"),
        });
      } catch {
        // Font files not yet available — proceed with system fonts
      } finally {
        setAppReady(true);
      }
    }
    prepare();
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (appReady) {
      await SplashScreen.hideAsync();
    }
  }, [appReady]);

  if (!appReady) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }} onLayout={onLayoutRootView}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <AuthProvider supabase={supabase}>
            <ThemeProvider>
              <RootNavigator />
            </ThemeProvider>
          </AuthProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
