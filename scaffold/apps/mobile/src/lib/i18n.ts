/**
 * i18n configuration for the mobile app.
 *
 * Uses expo-localization for device language detection instead of
 * browser-based detection. Shares translation files from @syndeocare/i18n.
 */
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import * as Localization from "expo-localization";
import { I18nManager } from "react-native";

// Import translations — these are shared across the monorepo
import en from "./locales/en.json";
import ar from "./locales/ar.json";

const RTL_LANGUAGES = ["ar"];

/**
 * Detect device language, falling back to 'en'.
 */
function getDeviceLanguage(): string {
  const locales = Localization.getLocales();
  const deviceLang = locales?.[0]?.languageCode ?? "en";

  // Only return supported languages
  if (["en", "ar"].includes(deviceLang)) {
    return deviceLang;
  }
  return "en";
}

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    ar: { translation: ar },
  },
  lng: getDeviceLanguage(),
  fallbackLng: "en",
  interpolation: {
    escapeValue: false, // React Native handles escaping
  },
  react: {
    useSuspense: false, // Avoid suspense in React Native
  },
});

/**
 * Update RTL layout when language changes.
 */
i18n.on("languageChanged", (lng: string) => {
  const isRTL = RTL_LANGUAGES.includes(lng);
  if (I18nManager.isRTL !== isRTL) {
    I18nManager.allowRTL(isRTL);
    I18nManager.forceRTL(isRTL);
    // Note: RTL changes require an app restart to take full effect
  }
});

export default i18n;
export { getDeviceLanguage, RTL_LANGUAGES };
