import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import AsyncStorage from "@react-native-async-storage/async-storage";
import en from "./locales/en.json";
import ar from "./locales/ar.json";

const LANGUAGE_KEY = "syndeocare-language";

i18n.use(initReactI18next).init({
  resources: { en: { translation: en }, ar: { translation: ar } },
  fallbackLng: "en",
  interpolation: { escapeValue: false },
  react: { useSuspense: false },
});

// Restore saved language
AsyncStorage.getItem(LANGUAGE_KEY).then((lang) => {
  if (lang) i18n.changeLanguage(lang);
});

i18n.on("languageChanged", (lng) => {
  AsyncStorage.setItem(LANGUAGE_KEY, lng);
});

export const getLanguageDirection = () => (i18n.language === "ar" ? "rtl" : "ltr");
export default i18n;
