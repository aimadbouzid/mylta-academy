// ============================================================
// I18N — Système d'internationalisation léger pour Mylta Academy
// Supporte: Français (fr), Anglais (en), Arabe (ar)
// ============================================================

const fs = require('fs')
const path = require('path')

const localesDir = path.join(__dirname, 'locales')
const localesCache = {}

// Charger tous les fichiers de locale au démarrage
function loadLocales() {
  const localeFiles = ['fr', 'en', 'ar']

  for (const lang of localeFiles) {
    try {
      const filePath = path.join(localesDir, `${lang}.json`)
      if (fs.existsSync(filePath)) {
        localesCache[lang] = JSON.parse(fs.readFileSync(filePath, 'utf8'))
      }
    } catch (err) {
      console.warn(`⚠️  [i18n] Impossible de charger ${lang}.json:`, err.message)
    }
  }

  console.log(`🌍 [i18n] Locales chargées: ${Object.keys(localesCache).join(', ')}`)
}

/**
 * Traduit une clé dans la langue demandée.
 * Supporte les clés imbriquées avec des points: "auth.login_success"
 * Supporte les variables: t('auth.welcome', 'fr', { name: 'Ahmed' })
 *
 * @param {string} key - Clé de traduction (ex: "auth.email_required")
 * @param {string} lang - Code de langue (fr, en, ar)
 * @param {Object} vars - Variables à remplacer dans le message
 * @returns {string} Message traduit ou clé si non trouvé
 */
function t(key, lang = 'fr', vars = {}) {
  const locale = localesCache[lang] || localesCache['fr'] || {}

  // Naviguer dans les clés imbriquées
  const keys = key.split('.')
  let value = locale
  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = value[k]
    } else {
      // Fallback sur le français
      value = null
      break
    }
  }

  // Si pas trouvé dans la langue demandée, essayer le français
  if (value === null && lang !== 'fr') {
    return t(key, 'fr', vars)
  }

  // Si toujours pas trouvé, retourner la clé
  if (value === null || typeof value !== 'string') {
    return key
  }

  // Remplacer les variables {{var}}
  let result = value
  for (const [varName, varValue] of Object.entries(vars)) {
    result = result.replace(new RegExp(`\\{\\{${varName}\\}\\}`, 'g'), varValue)
  }

  return result
}

// Charger les locales au premier import
loadLocales()

module.exports = { t, loadLocales }
