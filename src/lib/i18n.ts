import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import enTranslation from "./locales/en/translation.json";
import esTranslation from "./locales/es/translation.json";
import itTranslation from "./locales/it/translation.json";

i18n.use(initReactI18next).init({
  resources: {
    en: {
      translation: enTranslation,
    },
    es: {
      translation: esTranslation,
    },
    it: {
      translation: itTranslation,
    },
  },
  lng: "it", // Set Italian as default
  fallbackLng: "it",
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
