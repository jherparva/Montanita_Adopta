import type { Language } from "@/contexts/language-context"

export function translateDynamicContent(content: Record<Language, string>, language: Language): string {
  return content[language] || content.es 
}
