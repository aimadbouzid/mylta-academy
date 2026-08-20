import React, { createContext, useContext, useState, useEffect } from 'react'
import api from '../api/axios'

const SiteSettingsContext = createContext(null)

export function SiteSettingsProvider({ children }) {
  const [settings, setSettings] = useState(null)
  const [loadingSettings, setLoadingSettings] = useState(true)

  const fetchSettings = async () => {
    try {
      const { data } = await api.get('/config/site')
      if (data && data.settings) {
        setSettings(data.settings)
      }
    } catch (error) {
      console.error('Erreur chargement des paramètres du site:', error)
    } finally {
      setLoadingSettings(false)
    }
  }

  useEffect(() => {
    fetchSettings()
    
    const handleConfigUpdate = () => fetchSettings()
    window.addEventListener('configUpdated', handleConfigUpdate)
    return () => window.removeEventListener('configUpdated', handleConfigUpdate)
  }, [])

  return (
    <SiteSettingsContext.Provider value={{ settings, loadingSettings, refreshSettings: fetchSettings }}>
      {children}
    </SiteSettingsContext.Provider>
  )
}

export function useSiteSettings() {
  const context = useContext(SiteSettingsContext)
  if (context === undefined) {
    throw new Error('useSiteSettings doit être utilisé dans un SiteSettingsProvider')
  }
  return context
}
