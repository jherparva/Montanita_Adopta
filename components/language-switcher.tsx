"use client"
import { useLanguage } from "@/contexts/language-context"

interface LanguageSwitcherProps {
  className?: string
}

export default function LanguageSwitcher({ className = "" }: LanguageSwitcherProps) {
  const { language, setLanguage } = useLanguage()

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <button
        onClick={() => setLanguage("es")}
        className={`px-2 py-1 rounded ${language === "es" ? "bg-primary text-white" : "bg-gray-200"}`}
      >
        ES
      </button>
      <button
        onClick={() => setLanguage("en")}
        className={`px-2 py-1 rounded ${language === "en" ? "bg-primary text-white" : "bg-gray-200"}`}
      >
        EN
      </button>
      <button
        onClick={() => setLanguage("fr")}
        className={`px-2 py-1 rounded ${language === "fr" ? "bg-primary text-white" : "bg-gray-200"}`}
      >
        FR
      </button>
    </div>
  )
}
