import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "./i18n";
import { Capacitor } from "@capacitor/core";

// Initialize theme before render to prevent flash
const initializeTheme = () => {
  const stored = localStorage.getItem("syndeocare-theme");
  const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  
  let theme: "light" | "dark";
  if (stored === "light" || stored === "dark") {
    theme = stored;
  } else {
    theme = systemPrefersDark ? "dark" : "light";
  }
  
  document.documentElement.classList.add(theme);
};

// Initialize native plugins when running on a device
const initializeCapacitor = async () => {
  if (Capacitor.isNativePlatform()) {
    try {
      const { StatusBar } = await import("@capacitor/status-bar");
      const { SplashScreen } = await import("@capacitor/splash-screen");
      const { Keyboard } = await import("@capacitor/keyboard");
      const { App: CapApp } = await import("@capacitor/app");

      // Configure status bar
      await StatusBar.setBackgroundColor({ color: '#663C6D' });

      // Hide splash screen once app is ready
      await SplashScreen.hide();

      // Handle keyboard events for better form UX
      Keyboard.addListener('keyboardWillShow', () => {
        document.body.classList.add('keyboard-visible');
      });
      Keyboard.addListener('keyboardWillHide', () => {
        document.body.classList.remove('keyboard-visible');
      });

      // Handle deep links
      CapApp.addListener('appUrlOpen', (event) => {
        const url = new URL(event.url);
        const path = url.pathname;
        if (path) {
          window.location.pathname = path;
        }
      });

      // Handle back button on Android
      CapApp.addListener('backButton', ({ canGoBack }) => {
        if (canGoBack) {
          window.history.back();
        } else {
          CapApp.exitApp();
        }
      });
    } catch (e) {
      console.warn('[SyndeoCare] Capacitor plugin init skipped:', e);
    }
  }
};

initializeTheme();
initializeCapacitor();

createRoot(document.getElementById("root")!).render(<App />);
