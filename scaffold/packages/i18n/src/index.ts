/**
 * @syndeocare/i18n — Internationalization Setup
 *
 * Initialises i18next with English and Arabic (RTL).
 * Uses browser language detection with localStorage fallback.
 */
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import en from "./locales/en.json";
import ar from "./locales/ar.json";

const RTL_LANGUAGES = ["ar"];

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      ar: { translation: ar },
    },
    fallbackLng: "en",
    supportedLngs: ["en", "ar"],
    interpolation: {
      escapeValue: false, // React handles XSS
    },
    detection: {
      order: ["localStorage", "navigator"],
      caches: ["localStorage"],
      lookupLocalStorage: "syndeocare-language",
    },
  });

// Apply RTL direction on language change
i18n.on("languageChanged", (lng) => {
  const dir = RTL_LANGUAGES.includes(lng) ? "rtl" : "ltr";
  document.documentElement.dir = dir;
  document.documentElement.lang = lng;
});

// Set initial direction
const initialDir = RTL_LANGUAGES.includes(i18n.language) ? "rtl" : "ltr";
document.documentElement.dir = initialDir;
document.documentElement.lang = i18n.language;

export default i18n;
export { RTL_LANGUAGES };
