import { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'SyndeoCare',
  slug: 'syndeocare',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'automatic',
  newArchEnabled: true,
  scheme: 'syndeocare',
  splash: {
    backgroundColor: '#663C6D',
    resizeMode: 'contain',
  },
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.syndeocare.app',
    infoPlist: {
      NSLocationWhenInUseUsageDescription: 'SyndeoCare needs your location to find shifts near you.',
      NSCameraUsageDescription: 'SyndeoCare needs camera access to take photos for your profile and documents.',
      NSPhotoLibraryUsageDescription: 'SyndeoCare needs photo library access to upload profile pictures and documents.',
    },
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#663C6D',
    },
    package: 'com.syndeocare.app',
    permissions: [
      'ACCESS_FINE_LOCATION',
      'ACCESS_COARSE_LOCATION',
      'CAMERA',
      'READ_EXTERNAL_STORAGE',
    ],
  },
  web: {
    bundler: 'metro',
    favicon: './assets/favicon.png',
  },
  plugins: [
    'expo-router',
    'expo-font',
    'expo-secure-store',
    [
      'expo-location',
      {
        locationWhenInUsePermission: 'Allow SyndeoCare to use your location to find nearby shifts.',
      },
    ],
    [
      'expo-image-picker',
      {
        photosPermission: 'Allow SyndeoCare to access your photos for profile and document uploads.',
        cameraPermission: 'Allow SyndeoCare to use your camera for taking photos.',
      },
    ],
  ],
  extra: {
    supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL ?? 'https://zxmywtcwzgmtdzuyjhec.supabase.co',
    supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp4bXl3dGN3emdtdGR6dXlqaGVjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc0NzcyNzcsImV4cCI6MjA4MzA1MzI3N30.BbtERlQyB842_u5ctc6AjLZUfxUS5yMRMXckFfvZriE',
    eas: {
      projectId: 'syndeocare-mobile',
    },
  },
});
