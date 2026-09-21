"use client"

import * as React from "react"

import {
  translations,
  type Language,
  type TranslationKey,
} from "@/lib/i18n"

type LanguageContextValue = {
  language: Language
  direction: "rtl" | "ltr"
  setLanguage: (lang: Language) => void
  toggleLanguage: () => void
  t: (key: TranslationKey) => string
}

const LanguageContext = React.createContext<LanguageContextValue | null>(null)

const STORAGE_KEY = "causaseal-language"
const LANGUAGE_EVENT = "causaseal-language-change"

function readStoredLanguage(): Language {
  if (typeof window === "undefined") return "ar"
  const raw = localStorage.getItem(STORAGE_KEY)
  return raw === "en" ? "en" : "ar"
}

function applyDocumentLanguage(language: Language) {
  if (typeof document === "undefined") return
  document.documentElement.lang = language
  document.documentElement.dir = language === "ar" ? "rtl" : "ltr"
}

function subscribeLanguage(onStoreChange: () => void) {
  const handler = () => onStoreChange()
  window.addEventListener("storage", handler)
  window.addEventListener(LANGUAGE_EVENT, handler)
  return () => {
    window.removeEventListener("storage", handler)
    window.removeEventListener(LANGUAGE_EVENT, handler)
  }
}

function getClientLanguage() {
  return readStoredLanguage()
}

function getServerLanguage(): Language {
  return "ar"
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const language = React.useSyncExternalStore(
    subscribeLanguage,
    getClientLanguage,
    getServerLanguage
  )

  React.useLayoutEffect(() => {
    applyDocumentLanguage(language)
  }, [language])

  const setLanguage = React.useCallback((lang: Language) => {
    localStorage.setItem(STORAGE_KEY, lang)
    applyDocumentLanguage(lang)
    window.dispatchEvent(new Event(LANGUAGE_EVENT))
  }, [])

  const toggleLanguage = React.useCallback(() => {
    setLanguage(language === "ar" ? "en" : "ar")
  }, [language, setLanguage])

  const t = React.useCallback(
    (key: TranslationKey) => translations[language][key] ?? key,
    [language]
  )

  const value = React.useMemo<LanguageContextValue>(
    () => ({
      language,
      direction: language === "ar" ? "rtl" : "ltr",
      setLanguage,
      toggleLanguage,
      t,
    }),
    [language, setLanguage, toggleLanguage, t]
  )

  return (
    <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
  )
}

export function useLanguage() {
  const ctx = React.useContext(LanguageContext)
  if (!ctx) {
    throw new Error("useLanguage must be used within LanguageProvider")
  }
  return ctx
}
