import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { GraduationCap, BookOpen, LayoutDashboard, LogOut, User, Menu, X, Bell, Settings, PlayCircle, CheckCircle2, AlertTriangle, Info, Home, Users, Target, Globe, Gift, Award, CalendarDays, Clapperboard, HelpCircle } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../context/LanguageContext'
import { useSiteSettings } from '../context/SiteSettingsContext'
import { useToast } from '../hooks/useToast'
import api from '../api/axios'

import Logo from './Logo'
import LoginModal from './LoginModal'
import TopBanner from './TopBanner'

export default function Navbar({ onLoginClick }) {
  const { user, isAuthenticated, isAdmin, isInstructor, logout } = useAuth()
  const { settings } = useSiteSettings()
  const { info } = useToast()
  const { currentLang, changeLanguage, t } = useLanguage()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [langOpen, setLangOpen] = useState(false)
  const [loginModalOpen, setLoginModalOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true)
      } else {
        setScrolled(false)
      }
    }
    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleLoginClick = () => {
    if (onLoginClick) {
      onLoginClick()
    } else {
      setLoginModalOpen(true)
    }
  }

  // Session expirée / accès refusé : ouvrir directement la connexion.
  // L'intercepteur 401 redirige vers "/?expired=true".
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('expired') === 'true' || params.get('login') === '1') {
      setLoginModalOpen(true)
      // Nettoyer l'URL pour que la modale ne se rouvre pas au rechargement
      params.delete('expired')
      params.delete('login')
      const qs = params.toString()
      window.history.replaceState({}, '', window.location.pathname + (qs ? `?${qs}` : ''))
    }
  }, [])

  const [notifOpen, setNotifOpen] = useState(false)

  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)

  const navigate = useNavigate()

  // « Questions » pointe vers la section FAQ de l'accueil. Depuis une autre
  // page, on y revient d'abord, puis on attend que la section soit montée :
  // l'accueil est chargé à la demande, elle n'existe pas immédiatement.
  const goToFaq = (e) => {
    e.preventDefault()
    setMobileOpen(false)

    const scrollToFaq = (triesLeft = 40) => {
      const el = document.getElementById('faq')
      if (el) return el.scrollIntoView({ behavior: 'smooth' })
      if (triesLeft > 0) requestAnimationFrame(() => scrollToFaq(triesLeft - 1))
    }

    if (window.location.pathname === '/') return scrollToFaq()
    navigate('/')
    scrollToFaq()
  }


  // Fetch notifications (60s polling + pause when tab is hidden)
  useEffect(() => {
    if (!isAuthenticated) return

    const fetchNotifs = async () => {
      if (document.hidden) return // Don't poll when tab is in background
      try {
        const { data } = await api.get('/auth/notifications')
        setNotifications(data.notifications || [])
        setUnreadCount(data.unreadCount || 0)
      } catch {
        // Silently handle error if unauthenticated
      }
    }

    fetchNotifs()
    const interval = setInterval(fetchNotifs, 60000) // Poll every 60s instead of 15s

    // Re-fetch immediately when user returns to tab
    const onVisibilityChange = () => {
      if (!document.hidden) fetchNotifs()
    }
    document.addEventListener('visibilitychange', onVisibilityChange)

    return () => {
      clearInterval(interval)
      document.removeEventListener('visibilitychange', onVisibilityChange)
    }
  }, [isAuthenticated])

  const handleOpenNotifs = async () => {
    setNotifOpen(prev => !prev)
    setUserMenuOpen(false)

    if (!notifOpen && unreadCount > 0) {
      try {
        await api.put('/auth/notifications/read')
        setUnreadCount(0)
      } catch {
        // Ignore error
      }
    }
  }

  const handleLogout = () => {
    logout()
    setUserMenuOpen(false)
    setNotifOpen(false)
    navigate('/')
  }

  const handleLangChange = (lang) => {
    changeLanguage(lang)
    setLangOpen(false)
  }

  const languages = [
    { code: 'fr', label: 'Français', flag: '🇫🇷' },
    { code: 'ar', label: 'العربية', flag: '🇩🇿' },
    { code: 'en', label: 'English', flag: '🇬🇧' },
  ]

  return (
    <header className="fixed top-0 left-0 right-0 z-[100] pointer-events-none flex flex-col transition-all duration-500">
      <div className="pointer-events-auto">
        <TopBanner />
      </div>

      <div className={`w-full px-2 sm:px-4 lg:px-8 pointer-events-none transition-all duration-500 ${scrolled ? 'mt-1 sm:mt-1.5' : 'mt-1 sm:mt-1.5'}`}>
        <nav className="pointer-events-auto w-full max-w-6xl mx-auto bg-white/95 md:bg-white/70 dark:bg-academy-surfaceDark/70 md:backdrop-blur-[32px] md:saturate-[1.2] border border-white/80 shadow-[0_16px_40px_-12px_rgba(0,0,0,0.1)] rounded-[20px] md:rounded-full transition-all duration-500 hover:bg-white/80 hover:shadow-[0_16px_40px_-12px_rgba(0,0,0,0.15)] relative">
          {/* Subtle inner highlight */}
          <div className="hidden md:block absolute inset-0 rounded-[20px] md:rounded-full border border-white/40 pointer-events-none mix-blend-overlay"></div>
          
          <div className="w-full flex items-center justify-between h-[52px] md:h-16 px-4 lg:px-6 gap-3 xl:gap-6 relative z-10">

            {/* Logo */}
            <Link 
              to="/" 
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} 
              className="flex items-center group shrink-0 absolute left-1/2 -translate-x-1/2 xl:static xl:translate-x-0"
            >
              <Logo size="md" />
            </Link>

            {/* Nav Links — Desktop */}
            <div className="hidden xl:flex items-center gap-0.5 shrink-0 bg-black/5 dark:bg-white/5 p-1 rounded-full border border-black/[0.03]">
              <Link to="/courses" className="px-3 py-2 whitespace-nowrap rounded-full text-[13px] font-bold text-neutral-600 dark:text-academy-textMain/60 hover:text-black hover:bg-white hover:shadow-xs transition-all flex items-center gap-1.5">
                <BookOpen size={15} /> {t('nav.courses')}
              </Link>

              <Link to="/mission" className="px-3 py-2 whitespace-nowrap rounded-full text-[13px] font-bold text-neutral-600 dark:text-academy-textMain/60 hover:text-black hover:bg-white hover:shadow-xs transition-all flex items-center gap-1.5">
                <Target size={15} /> {t('nav.mission')}
              </Link>
              <a href="/#faq" onClick={goToFaq} className="px-3 py-2 whitespace-nowrap rounded-full text-[13px] font-bold text-neutral-600 dark:text-academy-textMain/60 hover:text-black hover:bg-white hover:shadow-xs transition-all flex items-center gap-1.5">
                <HelpCircle size={15} /> Questions
              </a>
              {settings?.modules?.resourcesEnabled !== false && (
                <Link to="/resources" className="px-3 py-2 whitespace-nowrap rounded-full text-[13px] font-bold text-neutral-600 dark:text-academy-textMain/60 hover:text-black hover:bg-white hover:shadow-xs transition-all flex items-center gap-1.5">
                  <Gift size={15} /> {t('nav.resources') || "Ressources"}
                </Link>
              )}
              {settings?.coaching?.enabled !== false && (
                <Link to="/coaching" className="px-3 py-2 whitespace-nowrap rounded-full text-[13px] font-bold text-neutral-600 dark:text-academy-textMain/60 hover:text-black hover:bg-white hover:shadow-xs transition-all flex items-center gap-1.5">
                  <CalendarDays size={15} /> Coaching
                </Link>
              )}
              {settings?.inPerson?.enabled !== false && (
                <Link to="/coaching-presentiel" className="px-3 py-2 whitespace-nowrap rounded-full text-[13px] font-bold text-neutral-600 dark:text-academy-textMain/60 hover:text-black hover:bg-white hover:shadow-xs transition-all flex items-center gap-1.5">
                  <Users size={15} /> Présentiel
                </Link>
              )}
              {settings?.express?.enabled && (
                <Link to="/formation-1-jour" className="px-3 py-2 whitespace-nowrap rounded-full text-[13px] font-bold text-neutral-600 dark:text-academy-textMain/60 hover:text-black hover:bg-white hover:shadow-xs transition-all flex items-center gap-1.5">
                  <Clapperboard size={15} /> 1 jour
                </Link>
              )}
              {isAuthenticated && !isAdmin && !isInstructor && (
                <Link to="/my-courses" className="px-3 py-2 whitespace-nowrap rounded-full text-[13px] font-bold text-neutral-600 dark:text-academy-textMain/60 hover:text-black hover:bg-white hover:shadow-xs transition-all flex items-center gap-1.5">
                  <PlayCircle size={15} /> {t('nav.my_courses') || 'Mes Formations'}
                </Link>
              )}
              {!isAuthenticated && settings?.modules?.instructorEnabled !== false && (
                <Link to="/become-instructor" className="px-3 py-2 whitespace-nowrap rounded-full text-[13px] font-bold text-indigo-600 dark:text-indigo-400 hover:bg-white hover:shadow-xs transition-all flex items-center gap-1.5">
                  <Award size={15} /> {t('nav.instructor') || 'Formateur'}
                </Link>
              )}
              {isInstructor && (
                <Link to="/instructor" className="px-3 py-2 whitespace-nowrap rounded-full text-[13px] font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-sm transition-all flex items-center gap-1.5">
                  <LayoutDashboard size={15} /> Dashboard
                </Link>
              )}
              {isAdmin && (
                <Link to="/admin" className="px-3 py-2 whitespace-nowrap rounded-full text-[13px] font-bold text-academy-onPrimary bg-academy-primary hover:bg-academy-dark shadow-sm transition-all flex items-center gap-1.5">
                  <LayoutDashboard size={15} /> {t('nav.admin')}
                </Link>
              )}
            </div>

            {/* Actions — Desktop */}
            <div className="hidden lg:flex items-center gap-2 shrink-0">

              {/* Language Dropdown */}
              <div className="relative">
                <button
                  onClick={() => { setLangOpen(p => !p); setNotifOpen(false); setUserMenuOpen(false) }}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-full hover:bg-black/5 transition-all text-neutral-600 dark:text-academy-textMain/60 font-semibold text-[13px]"
                  title="Changer de langue"
                >
                  <Globe size={15} />
                  <span className="text-base leading-none">{languages.find(l => l.code === currentLang)?.flag}</span>
                </button>

                {langOpen && (
                  <div className="absolute right-0 top-full mt-3 w-40 bg-white/90 dark:bg-academy-surfaceDark/90 backdrop-blur-xl border border-neutral-200/50 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.1)] overflow-hidden animate-fade-in z-50 p-1.5">
                    {languages.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => handleLangChange(lang.code)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors text-left font-semibold ${currentLang === lang.code ? 'bg-black/5 dark:bg-white/5 text-academy-textMain' : 'text-neutral-600 dark:text-academy-textMain/60 hover:bg-black/5 dark:hover:bg-white/5 hover:text-academy-textMain'}`}
                      >
                        <span className="text-lg leading-none">{lang.flag}</span> {lang.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

            {isAuthenticated ? (
              <div className="flex items-center gap-1">

                {/* Bell Notifications Dropdown */}
                <div className="relative flex items-center">
                  <button
                    onClick={handleOpenNotifs}
                    className="w-10 h-10 flex items-center justify-center rounded-full text-neutral-600 dark:text-academy-textMain/60 hover:text-black hover:bg-black/5 transition-all relative"
                    title="Notifications"
                  >
                    <Bell size={18} strokeWidth={2.2} />
                    {unreadCount > 0 && (
                      <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full animate-pulse">
                      </span>
                    )}
                  </button>

                  {notifOpen && (
                    <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-academy-surfaceDark border border-neutral-200 dark:border-academy-border rounded-lg shadow-lg overflow-hidden animate-fade-in z-50">
                      <div className="px-4 py-3 border-b border-neutral-100 dark:border-academy-border flex items-center justify-between bg-neutral-50/50">
                        <span className="font-medium text-neutral-800 dark:text-academy-textMain/85 text-sm">{t('navbar.notifications')}</span>
                        <span className="text-neutral-500 dark:text-academy-textMain/50 text-xs px-2 py-0.5 bg-neutral-200/50 rounded text-neutral-600 dark:text-academy-textMain/60">{notifications.length}</span>
                      </div>
                      <div className="max-h-[350px] overflow-y-auto hide-scrollbar divide-y divide-neutral-100">
                        {notifications.length === 0 ? (
                          <div className="p-8 flex flex-col items-center text-center">
                            <Bell size={24} className="text-neutral-300 mb-3" />
                            <p className="text-neutral-500 dark:text-academy-textMain/50 text-sm">
                              {t('navbar.no_notifications')}
                            </p>
                          </div>
                        ) : (
                          notifications.map((n) => (
                            <div key={n.id} className={`p-4 text-left transition-colors relative ${!n.isRead ? 'bg-blue-50/30' : 'hover:bg-neutral-50'}`}>
                              {!n.isRead && (
                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500" />
                              )}
                              <div className="flex gap-3">
                                <div className={`flex-shrink-0 mt-0.5 ${
                                  n.type === 'SUCCESS' ? 'text-emerald-500' :
                                  n.type === 'WARNING' ? 'text-amber-500' :
                                  'text-blue-500'
                                }`}>
                                  {n.type === 'SUCCESS' ? <CheckCircle2 size={16} /> : n.type === 'WARNING' ? <AlertTriangle size={16} /> : <Info size={16} />}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-start justify-between gap-2 mb-1">
                                    <span className={`text-sm truncate ${!n.isRead ? 'font-medium text-neutral-900 dark:text-academy-textMain' : 'text-neutral-700 dark:text-academy-textMain/75'}`}>
                                      {n.title.replace(/[\u{1F300}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F900}-\u{1F9FF}\u{1F1E0}-\u{1F1FF}]/gu, '')}
                                    </span>
                                    <span className="text-neutral-400 dark:text-academy-textMain/40 text-[11px] whitespace-nowrap flex-shrink-0 pt-0.5">
                                      {new Date(n.createdAt).toLocaleDateString('fr-DZ')}
                                    </span>
                                  </div>
                                  <p className="text-neutral-500 dark:text-academy-textMain/50 text-xs leading-relaxed line-clamp-2">{n.message}</p>
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* User Dropdown Menu */}
                <div className="relative flex items-center shrink-0">
                  <button
                    onClick={() => { setUserMenuOpen(p => !p); setNotifOpen(false) }}
                    className="flex items-center justify-between gap-2.5 pl-2 pr-4 py-1.5 rounded-full bg-white/90 dark:bg-academy-surfaceDark/90 border border-black/10 shadow-sm hover:bg-white hover:shadow-md transition-all text-neutral-600 dark:text-academy-textMain/60 font-semibold group focus:outline-none shrink-0"
                  >
                    <div className="w-8 h-8 rounded-full bg-academy-primary flex items-center justify-center shadow-sm overflow-hidden shrink-0 relative">
                      {user?.avatar ? (
                        <img src={user.avatar} alt={user?.name || 'Avatar'} className="w-full h-full object-cover rounded-full" />
                      ) : (
                        <User size={15} strokeWidth={2.5} className="text-academy-onPrimary shrink-0" />
                      )}
                    </div>
                    <span className="text-[13px] font-bold text-academy-textMain max-w-[180px] truncate pr-1">
                      {user?.name ? (user.name.trim().split(' ').length > 1 ? `${user.name.trim().split(' ')[0]} ${user.name.trim().split(' ')[1][0].toUpperCase()}.` : user.name) : user?.email}
                    </span>
                  </button>

                  {userMenuOpen && (
                    <div className="absolute right-0 top-full mt-3 w-56 bg-white/90 dark:bg-academy-surfaceDark/90 backdrop-blur-xl border border-neutral-200/50 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.1)] overflow-hidden animate-fade-in z-50">
                      <div className="px-4 py-3 border-b border-black/5 bg-black/[0.02]">
                        <p className="text-academy-textMain text-sm font-bold truncate">{user?.name}</p>
                        <p className="text-neutral-500 dark:text-academy-textMain/50 text-xs truncate font-medium">{user?.email}</p>
                        {isAdmin && (
                          <span className="inline-block mt-2 px-2.5 py-1 bg-academy-primary text-academy-onPrimary text-[10px] font-bold rounded-full uppercase tracking-wider">
                            {t('navbar.admin')}
                          </span>
                        )}
                      </div>

                      <div className="py-1.5 px-1.5">
                        {!isAdmin && (
                          <Link to="/my-courses" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-neutral-600 dark:text-academy-textMain/60 hover:bg-black/5 hover:text-black transition-colors font-bold">
                            <PlayCircle size={15} />
                            {t('navbar.my_courses')}
                          </Link>
                        )}
                        <Link to="/settings" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-neutral-600 dark:text-academy-textMain/60 hover:bg-black/5 hover:text-black transition-colors font-bold">
                          <Settings size={15} />
                          {t('navbar.settings')}
                        </Link>
                      </div>

                      <div className="border-t border-black/5 p-1.5">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-red-600 dark:text-red-400 hover:bg-red-50 hover:text-red-700 transition-colors duration-200 text-left font-bold"
                        >
                          <LogOut size={15} />
                          {t('navbar.logout')}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 bg-black/5 dark:bg-white/5 p-1 rounded-full border border-black/[0.03]">
                <button onClick={handleLoginClick} className="px-4 py-2 rounded-full text-[13px] font-bold text-neutral-600 dark:text-academy-textMain/60 hover:text-black hover:bg-white hover:shadow-sm transition-all">
                  {t('navbar.login')}
                </button>
                <button onClick={handleLoginClick} className="px-5 py-2 rounded-full text-[13px] font-bold text-academy-onPrimary bg-academy-primary hover:bg-academy-dark shadow-md hover:shadow-lg transition-all">
                  {t('navbar.register')}
                </button>
              </div>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="xl:hidden ml-auto p-2 text-academy-textMain/70 hover:text-academy-primary transition-colors focus:outline-none focus:ring-0 active:bg-transparent"
            style={{ WebkitTapHighlightColor: 'transparent' }}
            onClick={() => setMobileOpen(p => !p)}
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

      {/* Mobile Menu — Design Solide & Épuré */}
      {mobileOpen && (
        <div className="xl:hidden absolute top-[calc(100%+8px)] left-0 right-0 z-50 pointer-events-auto">
          <div className="bg-white dark:bg-academy-surfaceDark/95 border border-black/5 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.2)] rounded-[20px] overflow-hidden">
            <div className="p-3 flex flex-col gap-1.5">
              <Link to="/" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl text-neutral-700 dark:text-academy-textMain/75 font-bold hover:bg-black/5 hover:text-black transition-colors">
                <Home size={16} /> Accueil
              </Link>
              <a href="/#faq" onClick={goToFaq} className="flex items-center gap-3 px-4 py-3 rounded-xl text-neutral-700 dark:text-academy-textMain/75 font-bold hover:bg-black/5 hover:text-black transition-colors">
                <HelpCircle size={16} /> Questions
              </a>
              <Link to="/courses" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl text-neutral-700 dark:text-academy-textMain/75 font-bold hover:bg-black/5 hover:text-black transition-colors">
                <BookOpen size={16} /> {t('nav.courses')}
              </Link>
              <Link to="/mission" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl text-neutral-700 dark:text-academy-textMain/75 font-bold hover:bg-black/5 hover:text-black transition-colors">
                <Target size={16} /> {t('nav.mission')}
              </Link>
              {settings?.modules?.resourcesEnabled !== false && (
                <Link to="/resources" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl text-neutral-700 dark:text-academy-textMain/75 font-bold hover:bg-black/5 hover:text-black transition-colors">
                  <Gift size={16} /> {t('nav.resources') || "Ressources"}
                </Link>
              )}
              {settings?.coaching?.enabled !== false && (
                <Link to="/coaching" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl text-neutral-700 dark:text-academy-textMain/75 font-bold hover:bg-black/5 hover:text-black transition-colors">
                  <CalendarDays size={16} /> Coaching en ligne
                </Link>
              )}
              {settings?.inPerson?.enabled !== false && (
                <Link to="/coaching-presentiel" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl text-neutral-700 dark:text-academy-textMain/75 font-bold hover:bg-black/5 hover:text-black transition-colors">
                  <Users size={16} /> Coaching présentiel
                </Link>
              )}
              {settings?.express?.enabled && (
                <Link to="/formation-1-jour" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl text-neutral-700 dark:text-academy-textMain/75 font-bold hover:bg-black/5 hover:text-black transition-colors">
                  <Clapperboard size={16} /> Montage vidéo en 1 jour <span className="ml-auto text-[10px] font-black uppercase rounded bg-academy-primary text-academy-onPrimary px-1.5 py-0.5">Samedi</span>
                </Link>
              )}
              {isAuthenticated && !isAdmin && !isInstructor && (
                <Link to="/my-courses" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 dark:text-red-400 font-bold bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 mt-1">
                  <PlayCircle size={16} /> {t('nav.my_courses')}
                </Link>
              )}
              {!isAuthenticated && settings?.modules?.instructorEnabled !== false && (
                <Link to="/become-instructor" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl text-indigo-600 dark:text-indigo-400 font-bold hover:bg-indigo-50 transition-colors mt-1">
                  <Award size={16} /> Devenir Formateur
                </Link>
              )}
              {isInstructor && (
                <Link to="/instructor" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl text-white font-bold bg-indigo-600 mt-1">
                  <LayoutDashboard size={16} /> Mon Dashboard
                </Link>
              )}
              {isAuthenticated && (
                <Link to="/settings" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl text-neutral-700 dark:text-academy-textMain/75 font-bold hover:bg-black/5 hover:text-black transition-colors">
                  <Settings size={16} className="text-neutral-400 dark:text-academy-textMain/40" /> Paramètres du compte
                </Link>
              )}
              {isAdmin && (
                <Link to="/admin" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl text-academy-onPrimary font-bold bg-academy-primary">
                  <LayoutDashboard size={16} /> {t('nav.admin')}
                </Link>
              )}

              {/* Mobile Language Selector */}
              <div className="px-2 py-2 border-t border-black/5">
                <p className="text-[10px] uppercase font-bold text-neutral-400 dark:text-academy-textMain/40 tracking-wider mb-2">Langue</p>
                <div className="flex gap-2">
                  {languages.map(lang => (
                    <button
                      key={lang.code}
                      onClick={() => handleLangChange(lang.code)}
                      className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border text-xs font-bold transition-colors ${currentLang === lang.code ? 'bg-academy-primary text-academy-onPrimary border-academy-primary' : 'bg-white dark:bg-academy-surfaceDark border-neutral-200 dark:border-academy-border text-neutral-600 dark:text-academy-textMain/60 hover:border-neutral-300'}`}
                    >
                      <span>{lang.flag}</span> {lang.code.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="mt-2 pt-3 border-t border-black/5 flex flex-col px-1">
                {isAuthenticated ? (
                  <button onClick={() => { handleLogout(); setMobileOpen(false) }} className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 font-bold hover:bg-red-100 transition-colors">
                    <LogOut size={16} /> Se déconnecter
                  </button>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <button onClick={() => { handleLoginClick(); setMobileOpen(false) }} className="w-full py-3 rounded-xl border-2 border-academy-border text-academy-textMain font-bold hover:bg-academy-textMain/5 transition-colors text-sm">
                      Connexion
                    </button>
                    <button onClick={() => { handleLoginClick(); setMobileOpen(false) }} className="w-full py-3 rounded-xl bg-academy-primary hover:bg-academy-dark text-academy-onPrimary font-bold shadow-md active:scale-[0.98] transition-transform text-sm">
                      S&apos;inscrire
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Auth Modal (Fallback if parent doesn't provide onLoginClick) */}
      {loginModalOpen && (
        <LoginModal
          onClose={() => setLoginModalOpen(false)}
          onSuccess={() => setLoginModalOpen(false)}
        />
      )}
      </nav>
      </div>
    </header>
  )
}
