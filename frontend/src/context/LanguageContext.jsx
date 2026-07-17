import { createContext, useContext, useState, useEffect } from 'react'
import { translations } from '../i18n/translations'

const LanguageContext = createContext()

export function LanguageProvider({ children }) {
  const [currentLang, setCurrentLang] = useState(() => {
    return localStorage.getItem('mylta_lang') || 'fr'
  })

  useEffect(() => {
    // Sauvegarder la langue
    localStorage.setItem('mylta_lang', currentLang)
    
    // Mettre à jour l'attribut lang de html
    document.documentElement.lang = currentLang
    
    // Mettre à jour la direction (RTL pour l'arabe)
    document.documentElement.dir = currentLang === 'ar' ? 'rtl' : 'ltr'
    
    // Vous pouvez aussi définir un cookie si le backend en a besoin
    document.cookie = `NEXT_LOCALE=${currentLang}; path=/; max-age=31536000`
  }, [currentLang])

  const t = (key) => {
    const keys = key.split('.')
    let value = translations[currentLang]
    
    for (const k of keys) {
      if (value && value[k]) {
        value = value[k]
      } else {
        // Fallback en français si non trouvé
        let fallback = translations['fr']
        for (const fk of keys) {
          if (fallback && fallback[fk]) {
            fallback = fallback[fk]
          } else {
            return key // Renvoie la clé si même le fallback échoue
          }
        }
        return fallback
      }
    }
    return value
  }

  const changeLanguage = (lang) => {
    if (['fr', 'en', 'ar'].includes(lang)) {
      setCurrentLang(lang)
    }
  }

  return (
    <LanguageContext.Provider value={{ currentLang, changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export const useLanguage = () => useContext(LanguageContext)
