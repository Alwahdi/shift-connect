import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'ai.syndeocare.app',
  appName: 'SyndeoCare',
  webDir: 'dist',
  server: {
    url: 'https://d9cdd12a-438c-4656-8d56-af72b6f76e2c.lovableproject.com?forceHideBadge=true',
    cleartext: true,
  },
  plugins: {
    SplashScreen: {
      launchAutoHide: true,
      launchShowDuration: 2000,
      backgroundColor: '#663C6D',
    },
    StatusBar: {
      style: 'dark',
      backgroundColor: '#663C6D',
    },
    Keyboard: {
      resize: 'body',
      resizeOnFullScreen: true,
    },
  },
};

export default config;
