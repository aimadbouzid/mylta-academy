// SettingsPage.jsx — Page Paramètres utilisateur (Profil, Mot de passe, Confidentialité)

import { useState } from 'react'
import { User, Lock, Shield, Bell, KeyRound, Check, AlertCircle } from 'lucide-react'
import Navbar from '../components/Navbar'
import SEOHead from '../components/SEOHead'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../context/LanguageContext'
import { useToast } from '../hooks/useToast.jsx'
import api from '../api/axios'

export default function SettingsPage() {
  const { t } = useLanguage()
  const { user, login } = useAuth()
  const { success, error: toastError } = useToast()

  const [activeTab, setActiveTab] = useState('profile') // 'profile' | 'password' | 'privacy'

  // Formulaire Profil
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
  })
  const [profileLoading, setProfileLoading] = useState(false)

  // GDPR Features
  const [exportLoading, setExportLoading] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const handleExportData = async () => {
    try {
      setExportLoading(true)
      const res = await api.get('/auth/export-data')
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(res.data, null, 2))
      const downloadAnchorNode = document.createElement('a')
      downloadAnchorNode.setAttribute("href", dataStr)
      downloadAnchorNode.setAttribute("download", "mes_donnees_myacademy.json")
      document.body.appendChild(downloadAnchorNode)
      downloadAnchorNode.click()
      downloadAnchorNode.remove()
      success('Données exportées avec succès')
    } catch (err) {
      toastError('Erreur lors de l\'exportation des données')
    } finally {
      setExportLoading(false)
    }
  }
  
  const handleDeleteAccount = async () => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer définitivement votre compte ? Cette action est irréversible.')) return
    try {
      setDeleteLoading(true)
      await api.delete('/auth/delete-account')
      success('Compte supprimé avec succès')
      window.location.href = '/'
    } catch (err) {
      toastError('Erreur lors de la suppression du compte')
    } finally {
      setDeleteLoading(false)
    }
  }

  // Formulaire Mot de passe
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [passwordLoading, setPasswordLoading] = useState(false)

  // Options Confidentialité
  const [privacyPrefs, setPrivacyPrefs] = useState({
    emailNotifs: true,
    showProfile: false,
    activityLogs: true,
  })

  // Handlers Profil
  const handleProfileSubmit = async (e) => {
    e.preventDefault()
    setProfileLoading(true)
    try {
      const { data } = await api.put('/auth/profile', profileForm)
      // Mettre à jour localStorage
      localStorage.setItem('myltaacademy_user', JSON.stringify(data.user))
      success(t('settings.profile_success'))
      window.location.reload()
    } catch (err) {
      toastError(err.response?.data?.error || t('settings.profile_error'))
    } finally {
      setProfileLoading(false)
    }
  }

  // Handlers Mot de passe
  const handlePasswordSubmit = async (e) => {
    e.preventDefault()
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      return toastError(t('settings.password_mismatch'))
    }
    if (passwordForm.newPassword.length < 8) {
      return toastError(t('settings.password_length'))
    }

    setPasswordLoading(true)
    try {
      await api.put('/auth/change-password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      })
      success(t('settings.password_success'))
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (err) {
      toastError(err.response?.data?.error || t('settings.password_error'))
    } finally {
      setPasswordLoading(false)
    }
  }

  return (
    <>
      <SEOHead title={t('settings.title')} description={t('settings.subtitle')} canonicalPath="/settings" noindex />

      <div className="min-h-screen bg-academy-surface text-neutral-900 dark:text-academy-textMain">
        <Navbar />

        <div className="pt-36 sm:pt-40 lg:pt-44 pb-16 section-container max-w-5xl">
          <div className="mb-8">
            <h1 className="font-display font-bold text-3xl text-neutral-900 dark:text-academy-textMain mb-2">{t('settings.title')}</h1>
            <p className="text-neutral-500 dark:text-academy-textMain/50 text-sm font-medium">{t('settings.subtitle')}</p>
          </div>

          <div className="flex flex-col md:flex-row gap-8">
            {/* Navigation Tabs */}
            <div className="w-full md:w-64 space-y-2 flex-shrink-0">
              {[
                { id: 'profile', label: t('settings.tab_profile'), icon: User },
                { id: 'password', label: t('settings.tab_password'), icon: Lock },
                { id: 'privacy', label: t('settings.tab_privacy'), icon: Shield },
              ].map(tObj => {
                const Icon = tObj.icon
                const isActive = activeTab === tObj.id
                return (
                  <button
                    key={tObj.id}
                    onClick={() => setActiveTab(tObj.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all text-left font-semibold
                              ${isActive
                                ? 'bg-academy-primary text-academy-onPrimary shadow-md'
                                : 'bg-white dark:bg-academy-surfaceDark border border-neutral-200 dark:border-academy-border text-neutral-700 dark:text-academy-textMain/75 hover:text-neutral-900 hover:bg-neutral-50 hover:border-neutral-300'
                              }`}
                  >
                    <Icon size={18} />
                    <span>{tObj.label}</span>
                  </button>
                )
              })}
            </div>

            {/* Content Area */}
            <div className="flex-1 bg-white dark:bg-academy-surfaceDark border border-neutral-200/80 rounded-2xl p-6 md:p-8 shadow-sm">
              {/* TAB 1: PROFIL */}
              {activeTab === 'profile' && (
                <div className="space-y-6 animate-fade-in">
                  <div className="border-b border-neutral-200 dark:border-academy-border pb-4">
                    <h2 className="font-display font-bold text-xl text-neutral-900 dark:text-academy-textMain">{t('settings.profile_title')}</h2>
                    <p className="text-neutral-500 dark:text-academy-textMain/50 text-xs mt-1">{t('settings.profile_desc')}</p>
                  </div>

                  <form onSubmit={handleProfileSubmit} className="space-y-4 max-w-lg">
                    <div>
                      <label className="text-neutral-700 dark:text-academy-textMain/75 text-xs font-semibold mb-1.5 block">{t('settings.full_name')}</label>
                      <input
                        type="text"
                        value={profileForm.name}
                        onChange={e => setProfileForm(p => ({ ...p, name: e.target.value }))}
                        className="input-academy text-sm bg-white dark:bg-academy-surfaceDark text-neutral-900 dark:text-academy-textMain border border-neutral-300 focus:border-academy-primary"
                        placeholder={t('settings.full_name_placeholder')}
                        required
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-neutral-700 dark:text-academy-textMain/75 text-xs font-semibold block">{t('settings.email')}</label>
                        <span className="text-[11px] text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-500/10 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-500/25 font-medium flex items-center gap-1">
                          <Lock size={11} /> Non modifiable
                        </span>
                      </div>
                      <input
                        type="email"
                        value={profileForm.email}
                        disabled
                        className="input-academy text-sm opacity-60 cursor-not-allowed bg-neutral-100 dark:bg-white/10 text-neutral-700 dark:text-academy-textMain/75 border border-neutral-200 dark:border-academy-border font-medium"
                      />
                      <p className="text-neutral-400 dark:text-academy-textMain/40 text-[11px] mt-1">
                        L'adresse email est liée à vos accès et ne peut pas être modifiée pour des raisons de sécurité.
                      </p>
                    </div>

                    <div>
                      <label className="text-neutral-700 dark:text-academy-textMain/75 text-xs font-semibold mb-1.5 block">{t('settings.role')}</label>
                      <input
                        type="text"
                        value={user?.role === 'ADMIN' ? t('settings.role_admin') : t('settings.role_student')}
                        disabled
                        className="input-academy text-sm opacity-60 cursor-not-allowed bg-neutral-100 dark:bg-white/10 text-neutral-700 dark:text-academy-textMain/75 border border-neutral-200 dark:border-academy-border font-medium"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={profileLoading}
                      className="btn-primary text-sm py-2.5 px-6 mt-4 disabled:opacity-50"
                    >
                      {profileLoading ? t('settings.saving') : t('settings.save')}
                    </button>
                  </form>
                </div>
              )}

              {/* TAB 2: MOT DE PASSE */}
              {activeTab === 'password' && (
                <div className="space-y-6 animate-fade-in">
                  <div className="border-b border-neutral-200 dark:border-academy-border pb-4">
                    <h2 className="font-display font-bold text-xl text-neutral-900 dark:text-academy-textMain">{t('settings.password_title')}</h2>
                    <p className="text-neutral-500 dark:text-academy-textMain/50 text-xs mt-1">{t('settings.password_desc')}</p>
                  </div>

                  <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-lg">
                    <div>
                      <label className="text-neutral-700 dark:text-academy-textMain/75 text-xs font-semibold mb-1.5 block">{t('settings.current_password')} *</label>
                      <input
                        type="password"
                        value={passwordForm.currentPassword}
                        onChange={e => setPasswordForm(p => ({ ...p, currentPassword: e.target.value }))}
                        className="input-academy text-sm bg-white dark:bg-academy-surfaceDark text-neutral-900 dark:text-academy-textMain border border-neutral-300 focus:border-academy-primary"
                        placeholder="••••••••"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-neutral-700 dark:text-academy-textMain/75 text-xs font-semibold mb-1.5 block">{t('settings.new_password')} *</label>
                      <input
                        type="password"
                        value={passwordForm.newPassword}
                        onChange={e => setPasswordForm(p => ({ ...p, newPassword: e.target.value }))}
                        className="input-academy text-sm bg-white dark:bg-academy-surfaceDark text-neutral-900 dark:text-academy-textMain border border-neutral-300 focus:border-academy-primary"
                        placeholder="••••••••"
                        required
                        minLength={8}
                      />
                    </div>

                    <div>
                      <label className="text-neutral-700 dark:text-academy-textMain/75 text-xs font-semibold mb-1.5 block">{t('settings.confirm_password')} *</label>
                      <input
                        type="password"
                        value={passwordForm.confirmPassword}
                        onChange={e => setPasswordForm(p => ({ ...p, confirmPassword: e.target.value }))}
                        className="input-academy text-sm bg-white dark:bg-academy-surfaceDark text-neutral-900 dark:text-academy-textMain border border-neutral-300 focus:border-academy-primary"
                        placeholder="••••••••"
                        required
                        minLength={8}
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={passwordLoading}
                      className="btn-primary text-sm py-2.5 px-6 mt-4 disabled:opacity-50"
                    >
                      {passwordLoading ? t('settings.changing') : t('settings.change_password')}
                    </button>
                  </form>
                </div>
              )}

              {/* TAB 3: CONFIDENTIALITÉ & NOTIFICATIONS */}
              {activeTab === 'privacy' && (
                <div className="space-y-6 animate-fade-in">
                  <div className="border-b border-neutral-200 dark:border-academy-border pb-4">
                    <h2 className="font-display font-bold text-xl text-neutral-900 dark:text-academy-textMain">{t('settings.privacy_title')}</h2>
                    <p className="text-neutral-500 dark:text-academy-textMain/50 text-xs mt-1">{t('settings.privacy_desc')}</p>
                  </div>

                  <div className="space-y-5 max-w-lg">
                    <div className="flex items-center justify-between p-4 bg-neutral-50 dark:bg-white/5 border border-neutral-200/80 rounded-xl">
                      <div>
                        <p className="text-neutral-900 dark:text-academy-textMain text-sm font-semibold">{t('settings.email_notifs')}</p>
                        <p className="text-neutral-500 dark:text-academy-textMain/50 text-xs mt-0.5">{t('settings.email_notifs_desc')}</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={privacyPrefs.emailNotifs}
                        onChange={e => setPrivacyPrefs(p => ({ ...p, emailNotifs: e.target.checked }))}
                        className="w-5 h-5 accent-academy-primary cursor-pointer"
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-neutral-50 dark:bg-white/5 border border-neutral-200/80 rounded-xl">
                      <div>
                        <p className="text-neutral-900 dark:text-academy-textMain text-sm font-semibold">{t('settings.hide_profile')}</p>
                        <p className="text-neutral-500 dark:text-academy-textMain/50 text-xs mt-0.5">{t('settings.hide_profile_desc')}</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={privacyPrefs.showProfile}
                        onChange={e => setPrivacyPrefs(p => ({ ...p, showProfile: e.target.checked }))}
                        className="w-5 h-5 accent-academy-primary cursor-pointer"
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-neutral-50 dark:bg-white/5 border border-neutral-200/80 rounded-xl">
                      <div>
                        <p className="text-neutral-900 dark:text-academy-textMain text-sm font-semibold">{t('settings.login_log')}</p>
                        <p className="text-neutral-500 dark:text-academy-textMain/50 text-xs mt-0.5">{t('settings.login_log_desc')}</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={privacyPrefs.activityLogs}
                        onChange={e => setPrivacyPrefs(p => ({ ...p, activityLogs: e.target.checked }))}
                        className="w-5 h-5 accent-academy-primary cursor-pointer"
                      />
                    </div>

                    <div className="p-5 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/25 rounded-xl flex flex-col items-start gap-4 text-xs text-amber-950 shadow-xs">
                      <div className="flex items-start gap-3">
                        <Shield className="w-5 h-5 flex-shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
                        <div>
                          <p className="font-bold text-sm text-amber-900 mb-1">{t('settings.data_protection_title')}</p>
                          <p className="text-amber-800 dark:text-amber-300 text-xs leading-relaxed">{t('settings.data_protection_desc')}</p>
                        </div>
                      </div>
                      
                      {/* Actions RGPD */}
                      <div className="flex flex-wrap items-center gap-3 mt-1 w-full pt-3 border-t border-amber-200 dark:border-amber-500/25">
                        <button
                          onClick={handleExportData}
                          disabled={exportLoading}
                          className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs rounded-lg shadow-xs transition-colors"
                        >
                          {exportLoading ? 'Exportation...' : 'Exporter mes données (JSON)'}
                        </button>
                        
                        <button
                          onClick={handleDeleteAccount}
                          disabled={deleteLoading}
                          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold text-xs rounded-lg shadow-xs transition-colors ml-auto"
                        >
                          {deleteLoading ? 'Suppression...' : 'Supprimer mon compte'}
                        </button>
                      </div>
                    </div>

                    <button
                      onClick={() => success(t('settings.prefs_success'))}
                      className="btn-primary text-sm py-2.5 px-6"
                    >
                      {t('settings.save_preferences')}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
