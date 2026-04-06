import { ExpoConfig, ConfigContext } from "expo/config";

/**
 * Dynamic Expo configuration.
 *
 * Uses APP_VARIANT env var to switch between development, preview, and
 * production builds with separate bundle identifiers and display names.
 */
const IS_DEV = process.env.APP_VARIANT === "development";
const IS_PREVIEW = process.env.APP_VARIANT === "preview";

const getBundleId = () => {
  if (IS_DEV) return "ai.syndeocare.app.dev";
  if (IS_PREVIEW) return "ai.syndeocare.app.preview";
  return "ai.syndeocare.app";
};

const getAppName = () => {
  if (IS_DEV) return "SyndeoCare (Dev)";
  if (IS_PREVIEW) return "SyndeoCare (Preview)";
  return "SyndeoCare";
};

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: getAppName(),
  slug: "syndeocare",
  version: "1.0.0",
  sdkVersion: "54.0.0",
  orientation: "portrait",
  userInterfaceStyle: "automatic",
  scheme: "syndeocare",
  newArchEnabled: true,

  icon: "./assets/icon.png",
  splash: {
    image: "./assets/splash-icon.png",
    resizeMode: "contain",
    backgroundColor: "#663C6D",
  },

  ios: {
    bundleIdentifier: getBundleId(),
    supportsTablet: true,
    infoPlist: {
      NSLocationWhenInUseUsageDescription:
        "SyndeoCare needs your location to find nearby shifts and clinics.",
      NSLocationAlwaysAndWhenInUseUsageDescription:
        "SyndeoCare uses background location for shift check-in/check-out.",
      NSCameraUsageDescription:
        "SyndeoCare needs camera access to upload documents and profile photos.",
      NSPhotoLibraryUsageDescription:
        "SyndeoCare needs photo library access to upload documents and profile photos.",
      NSFaceIDUsageDescription:
        "SyndeoCare uses Face ID for secure authentication.",
      CFBundleAllowMixedLocalizations: true,
    },
    config: {
      usesNonExemptEncryption: false,
    },
  },

  android: {
    package: getBundleId(),
    adaptiveIcon: {
      foregroundImage: "./assets/adaptive-icon.png",
      backgroundColor: "#663C6D",
    },
    permissions: [
      "ACCESS_FINE_LOCATION",
      "ACCESS_COARSE_LOCATION",
      "CAMERA",
      "READ_EXTERNAL_STORAGE",
      "WRITE_EXTERNAL_STORAGE",
      "RECEIVE_BOOT_COMPLETED",
      "VIBRATE",
      "USE_BIOMETRIC",
      "USE_FINGERPRINT",
    ],
  },

  web: {
    bundler: "metro",
    output: "single",
    favicon: "./assets/favicon.png",
  },

  locales: {
    en: "./src/constants/locales/en.json",
    ar: "./src/constants/locales/ar.json",
  },

  plugins: [
    "expo-router",
    "expo-localization",
    "expo-secure-store",
    "expo-font",
    [
      "expo-location",
      {
        locationAlwaysAndWhenInUsePermission:
          "Allow SyndeoCare to use your location for shift matching.",
        locationAlwaysPermission:
          "Allow SyndeoCare to use your location in the background for shift check-in.",
        locationWhenInUsePermission:
          "Allow SyndeoCare to use your location for finding nearby shifts.",
      },
    ],
    [
      "expo-image-picker",
      {
        photosPermission:
          "Allow SyndeoCare to access your photos for document and profile uploads.",
        cameraPermission:
          "Allow SyndeoCare to use your camera for document and profile photos.",
      },
    ],
    [
      "expo-notifications",
      {
        icon: "./assets/notification-icon.png",
        color: "#663C6D",
      },
    ],
    [
      "expo-local-authentication",
      {
        faceIDPermission:
          "Allow SyndeoCare to use Face ID for secure authentication.",
      },
    ],
    "expo-document-picker",
  ],

  experiments: {
    typedRoutes: true,
  },

  extra: {
    router: {
      origin: false,
    },
    eas: {
      projectId: process.env.EAS_PROJECT_ID ?? "your-eas-project-id",
    },
    supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
    supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
    supabaseProjectId: process.env.EXPO_PUBLIC_SUPABASE_PROJECT_ID,
    appUrl: process.env.EXPO_PUBLIC_APP_URL ?? "https://app.syndeocare.ai",
    sentryDsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
    posthogKey: process.env.EXPO_PUBLIC_POSTHOG_KEY,
  },

  updates: {
    url: "https://u.expo.dev/your-eas-project-id",
    fallbackToCacheTimeout: 0,
  },

  runtimeVersion: {
    policy: "appVersion",
  },

  owner: "syndeocare",
});
