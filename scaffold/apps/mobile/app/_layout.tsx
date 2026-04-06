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
import { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import { useFonts } from "expo-font";
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
        <Stack.Screen name="(admin)" />
        <Stack.Screen name="+not-found" />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  // Font files should be placed in assets/fonts/ during project setup.
  // When fonts are not yet available, the app will gracefully fall back to system fonts.
  let fontsLoaded = true;
  let fontError: Error | null = null;
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    [fontsLoaded, fontError] = useFonts({
      Cairo: require("../assets/fonts/Cairo-Regular.ttf"),
      "Cairo-Medium": require("../assets/fonts/Cairo-Medium.ttf"),
      "Cairo-SemiBold": require("../assets/fonts/Cairo-SemiBold.ttf"),
      "Cairo-Bold": require("../assets/fonts/Cairo-Bold.ttf"),
    });
  } catch {
    // Font files not yet available — proceed with system fonts
    fontsLoaded = true;
    fontError = null;
  }

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
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
