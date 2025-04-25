"use client"
import { useLanguage } from "@/contexts/language-context"
import { translateDynamicContent } from "@/utils/translate-helpers"

export default function ExampleComponent() {
  const { language, t } = useLanguage()

  const animalTypes = {
    es: "Perro",
    en: "Dog",
    fr: "Chien",
  }

  const translatedAnimalType = translateDynamicContent(animalTypes, language)

  return (
    <div>
      <h1>{t("MENU_ADOPTIONS")}</h1>
      <p>{t("FOOTER_TITLE")}</p>

      {/* Usando traducciones del namespace de contacto */}
      <h2>{t("CONTACT_TITLE", "contact")}</h2>
      <p>{t("CONTACT_CTA_TEXT", "contact")}</p>

      {/* Dynamic content example */}
      <p>Animal type: {translatedAnimalType}</p>
    </div>
  )
}