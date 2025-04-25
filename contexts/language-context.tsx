"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

export type Language = "es" | "en" | "fr"
export type TranslationNamespace = "general" | "contact" | "home" | "adopcion" | "historias" | "donaciones" | "voluntario" | "form_adopcion" | "modales" 

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string, namespace?: TranslationNamespace) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

interface LanguageProviderProps {
  children: ReactNode
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  const [language, setLanguage] = useState<Language>("es")
  const [translations, setTranslations] = useState<Record<TranslationNamespace, Record<string, string>>>({
    general: {},
    contact: {},
    home: {},
    adopcion: {},
    historias: {},
    donaciones: {},
    voluntario: {},
    form_adopcion: {},
    modales: {} 
  })

  useEffect(() => {
    const savedLanguage = localStorage.getItem("language") as Language
    if (savedLanguage) {
      setLanguage(savedLanguage)
    } else {
      const urlParams = new URLSearchParams(window.location.search)
      const langParam = urlParams.get("lang") as Language
      if (langParam && ["es", "en", "fr"].includes(langParam)) {
        setLanguage(langParam)
        localStorage.setItem("language", langParam)
      }
    }
  }, [])

  useEffect(() => {
    const loadTranslations = async () => {
      try {

        const generalTranslationsModule = await import("@/translations/general.json")
        const generalTranslations = generalTranslationsModule.default[language] || {}
        
        const contactTranslationsModule = await import("@/translations/contact.json")
        const contactTranslations = contactTranslationsModule.default[language] || {}

        const homeTranslationsModule = await import("@/translations/home.json")
        const homeTranslations = homeTranslationsModule.default[language] || {}

        const adopcionTranslationsModule = await import("@/translations/adopcion.json")
        const adopcionTranslations = adopcionTranslationsModule.default[language] || {}

        const historiasTranslationsModule = await import("@/translations/historias.json")
        const historiasTranslations = historiasTranslationsModule.default[language] || {}

        const donacionesTranslationsModule = await import("@/translations/donaciones.json")
        const donacionesTranslations = donacionesTranslationsModule.default[language] || {}


        const voluntarioTranslationsModule = await import("@/translations/voluntario.json")
        const voluntarioTranslations = voluntarioTranslationsModule.default[language] || {}

        const formAdopcionTranslationsModule = await import("@/translations/form_adopcion.json")
        const formAdopcionTranslations = formAdopcionTranslationsModule.default[language] || {}
        
        const modalesTranslationsModule = await import("@/translations/modales.json")
        const modalesTranslations = modalesTranslationsModule.default[language] || {}

        setTranslations({
          general: generalTranslations,
          contact: contactTranslations,
          home: homeTranslations,
          adopcion: adopcionTranslations,
          historias: historiasTranslations,
          donaciones: donacionesTranslations,
          voluntario: voluntarioTranslations,
          form_adopcion: formAdopcionTranslations,
          modales: modalesTranslations
        })
      } catch (error) {
        console.error(`Failed to load translations for ${language}:`, error)

        try {
          const generalFallbackModule = await import("@/translations/general.json")
          const contactFallbackModule = await import("@/translations/contact.json")
          const homeFallbackModule = await import("@/translations/home.json")
          const adopcionFallbackModule = await import("@/translations/adopcion.json")
          const historiasFallbackModule = await import("@/translations/historias.json")
          const donacionesFallbackModule = await import("@/translations/donaciones.json")
          const voluntarioFallbackModule = await import("@/translations/voluntario.json")
          const formAdopcionFallbackModule = await import("@/translations/form_adopcion.json")
          const modalesFallbackModule = await import("@/translations/modales.json")
          
          setTranslations({
            general: generalFallbackModule.default.es || {},
            contact: contactFallbackModule.default.es || {},
            home: homeFallbackModule.default.es || {},
            adopcion: adopcionFallbackModule.default.es || {},
            historias: historiasFallbackModule.default.es || {},
            donaciones: donacionesFallbackModule.default.es || {},
            voluntario: voluntarioFallbackModule.default.es || {},
            form_adopcion: formAdopcionFallbackModule.default.es || {},
            modales: modalesFallbackModule.default.es || {}
          })
        } catch (fallbackError) {
          console.error("Failed to load fallback translations:", fallbackError)
        }
      }
    }

    loadTranslations()

    if (typeof window !== "undefined") {
      localStorage.setItem("language", language)

      const url = new URL(window.location.href)
      url.searchParams.set("lang", language)
      window.history.replaceState({}, "", url.toString())
    }
  }, [language])

  const t = (key: string, namespace: TranslationNamespace = "general"): string => {
    return translations[namespace][key] || key
  }

  return <LanguageContext.Provider value={{ language, setLanguage, t }}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }
  return context
}