import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { GraduationCap, BookOpen, LayoutDashboard, LogOut, User, Menu, X, Bell, Settings, PlayCircle, CheckCircle2, AlertTriangle, Info, Home, Users, Target, Globe, Gift } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../context/LanguageContext'
import { useToast } from '../hooks/useToast'
import api from '../api/axios'

import Logo from './Logo'
import LoginModal from './LoginModal'
import TopBanner from './TopBanner'

export default function Navbar({ onLoginClick }) {
  const { user, isAuthenticated, isAdmin, logout } = useAuth()
  const { info } = useToast()
  const { currentLang, changeLanguage, t } = useLanguage()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [langOpen, setLangOpen] = useState(false)
  const [loginModalOpen, setLoginModalOpen] = useState(false)

  const handleLoginClick = () => {
    if (onLoginClick) {
      onLoginClick()
    } else {
      setLoginModalOpen(true)
    }
  }

  const [notifOpen, setNotifOpen] = useState(false)

  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)

  const navigate = useNavigate()

  // Fetch notifications
  useEffect(() => {
    if (!isAuthenticated) return

    const fetchNotifs = async () => {
      try {
        const { data } = await api.get('/auth/notifications')
        setNotifications(data.notifications || [])
        setUnreadCount(data.unreadCount || 0)
      } catch {
        // Silently handle error if unauthenticated
      }
    }

    fetchNotifs()
    const interval = setInterval(fetchNotifs, 15000) // Poll notifications every 15s
    return () => clearInterval(interval)
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
    <header className="fixed top-0 left-0 right-0 z-[100] pointer-events-none">
      <div className="pointer-events-auto">
        <TopBanner />
      </div>
      
      <div className="w-full px-2 sm:px-4 lg:px-8 mt-2 sm:mt-5 flex justify-center pointer-events-none">
        <nav className="pointer-events-auto w-full max-w-6xl bg-white/70 backdrop-blur-[32px] saturate-[1.2] border border-white/80 shadow-[0_16px_40px_-12px_rgba(0,0,0,0.1)] rounded-[20px] md:rounded-full transition-all duration-500 hover:bg-white/80 hover:shadow-[0_16px_40px_-12px_rgba(0,0,0,0.15)] relative">
          {/* Subtle inner highlight */}
          <div className="absolute inset-0 rounded-[20px] md:rounded-full border border-white/40 pointer-events-none mix-blend-overlay"></div>
          
          <div className="flex items-center justify-between h-[52px] md:h-16 px-4 lg:px-6 gap-3 lg:gap-8 relative z-10">

            {/* Logo */}
            <Link 
              to="/" 
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} 
              className="flex items-center group shrink-0"
            >
              <div className="scale-90 md:scale-100 origin-left transition-transform">
                <Logo size="md" />
              </div>
            </Link>

            {/* Nav Links — Desktop */}
            <div className="hidden lg:flex items-center gap-1 shrink-0 bg-black/5 p-1 rounded-full border border-black/[0.03]">
              <Link to="/courses" className="px-4 py-2 rounded-full text-[13px] font-bold text-neutral-600 hover:text-black hover:bg-white hover:shadow-sm transition-all flex items-center gap-2">
                <BookOpen size={15} /> {t('nav.courses')}
              </Link>
              <Link to="/mission" className="px-4 py-2 rounded-full text-[13px] font-bold text-neutral-600 hover:text-black hover:bg-white hover:shadow-sm transition-all flex items-center gap-2">
                <Target size={15} /> {t('nav.mission')}
              </Link>
              <Link to="/resources" className="px-4 py-2 rounded-full text-[13px] font-bold text-neutral-600 hover:text-black hover:bg-white hover:shadow-sm transition-all flex items-center gap-2">
                <Gift size={15} /> {t('nav.resources') || "Ressources"}
              </Link>
              {isAuthenticated && !isAdmin && (
                <Link to="/my-courses" className="px-4 py-2 rounded-full text-[13px] font-bold text-red-600 hover:bg-white hover:shadow-sm transition-all flex items-center gap-2">
                  <GraduationCap size={15} /> {t('nav.my_courses')}
                </Link>
              )}
              {isAdmin && (
                <Link to="/admin" className="px-4 py-2 rounded-full text-[13px] font-bold text-white bg-black hover:bg-neutral-800 shadow-md transition-all flex items-center gap-2">
                  <LayoutDashboard size={15} /> {t('nav.admin')}
                </Link>
              )}
            </div>

            {/* Actions — Desktop */}
            <div className="hidden md:flex items-center gap-2 shrink-0">
              {/* Language Dropdown */}
              <div className="relative">
                <button
                  onClick={() => { setLangOpen(p => !p); setNotifOpen(false); setUserMenuOpen(false) }}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-full hover:bg-black/5 transition-all text-neutral-600 font-semibold text-[13px]"
                  title="Changer de langue"
                >
                  <Globe size={15} />
                  <span className="text-base leading-none">{languages.find(l => l.code === currentLang)?.flag}</span>
                </button>

                {langOpen && (
                  <div className="absolute right-0 top-full mt-3 w-40 bg-white/90 backdrop-blur-xl border border-neutral-200/50 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.1)] overflow-hidden animate-fade-in z-50 p-1.5">
                    {languages.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => handleLangChange(lang.code)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors text-left font-semibold ${currentLang === lang.code ? 'bg-black/5 text-black' : 'text-neutral-600 hover:bg-black/5 hover:text-black'}`}
                      >
                        <span className="text-lg leading-none">{lang.flag}</span> {lang.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

            {isAuthenticated ? (
              <div className="flex items-center gap-1.5 bg-black/5 p-1 rounded-full border border-black/[0.03]">

                {/* Bell Notifications Dropdown */}
                <div className="relative">
                  <button
                    onClick={handleOpenNotifs}
                    className="p-2 rounded-full hover:bg-white hover:shadow-sm text-neutral-600 hover:text-black transition-all relative flex items-center justify-center w-9 h-9"
                    title="Notifications"
                  >
                    <Bell size={16} />
                    {unreadCount > 0 && (
                      <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-sm">
                      </span>
                    )}
                  </button>

                  {notifOpen && (
                    <div className="absolute right-0 top-full mt-3 w-80 bg-white/90 backdrop-blur-xl border border-neutral-200/50 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.1)] overflow-hidden animate-fade-in z-50">
                      <div className="px-4 py-3 border-b border-black/5 flex items-center justify-between">
                        <span className="font-display font-bold text-black text-sm">{t('navbar.notifications')}</span>
                        <span className="text-neutral-500 text-xs px-2 py-0.5 bg-black/5 rounded-full font-semibold">{notifications.length} {t('navbar.total')}</span>
                      </div>
                      <div className="max-h-[350px] overflow-y-auto hide-scrollbar divide-y divide-black/5">
                        {notifications.length === 0 ? (
                          <div className="p-8 flex flex-col items-center text-center">
                            <div className="w-12 h-12 bg-black/5 rounded-full flex items-center justify-center mb-3">
                              <Bell size={20} className="text-neutral-400" />
                            </div>
                            <p className="text-neutral-500 text-sm font-semibold">
                              {t('navbar.no_notifications')}
                            </p>
                          </div>
                        ) : (
                          notifications.map((n) => (
                            <div key={n.id} className={`p-4 text-left transition-colors relative group ${!n.isRead ? 'bg-red-50/50' : 'hover:bg-black/5'}`}>
                              {!n.isRead && (
                                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-red-500 rounded-r-full" />
                              )}
                              <div className="flex gap-3">
                                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center mt-0.5 ${
                                  n.type === 'SUCCESS' ? 'bg-emerald-100 text-emerald-600' :
                                  n.type === 'WARNING' ? 'bg-amber-100 text-amber-600' :
                                  'bg-blue-100 text-blue-600'
                                }`}>
                                  {n.type === 'SUCCESS' ? <CheckCircle2 size={14} /> : n.type === 'WARNING' ? <AlertTriangle size={14} /> : <Info size={14} />}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-start justify-between gap-2 mb-1">
                                    <span className={`font-semibold text-sm truncate ${!n.isRead ? 'text-black' : 'text-neutral-700'}`}>{n.title}</span>
                                    <span className="text-neutral-400 text-[10px] whitespace-nowrap flex-shrink-0 pt-0.5 font-medium">
                                      {new Date(n.createdAt).toLocaleDateString('fr-DZ')}
                                    </span>
                                  </div>
                                  <p className="text-neutral-500 text-xs leading-relaxed line-clamp-2">{n.message}</p>
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
                <div className="relative">
                  <button
                    onClick={() => { setUserMenuOpen(p => !p); setNotifOpen(false) }}
                    className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full hover:bg-white hover:shadow-sm transition-all text-neutral-600 hover:text-black group"
                  >
                    <div className="w-6 h-6 rounded-full bg-black flex items-center justify-center">
                      <User size={13} className="text-white" />
                    </div>
                    <span className="text-[13px] font-bold max-w-[100px] truncate">
                      {user?.name || user?.email}
                    </span>
                  </button>

                  {userMenuOpen && (
                    <div className="absolute right-0 top-full mt-3 w-56 bg-white/90 backdrop-blur-xl border border-neutral-200/50 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.1)] overflow-hidden animate-fade-in z-50">
                      <div className="px-4 py-3 border-b border-black/5 bg-black/[0.02]">
                        <p className="text-black text-sm font-bold truncate">{user?.name}</p>
                        <p className="text-neutral-500 text-xs truncate font-medium">{user?.email}</p>
                        {isAdmin && (
                          <span className="inline-block mt-2 px-2.5 py-1 bg-black text-white text-[10px] font-bold rounded-full uppercase tracking-wider">
                            {t('navbar.admin')}
                          </span>
                        )}
                      </div>

                      <div className="py-1.5 px-1.5">
                        {!isAdmin && (
                          <Link to="/my-courses" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-neutral-600 hover:bg-black/5 hover:text-black transition-colors font-bold">
                            <PlayCircle size={15} />
                            {t('navbar.my_courses')}
                          </Link>
                        )}
                        <Link to="/settings" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-neutral-600 hover:bg-black/5 hover:text-black transition-colors font-bold">
                          <Settings size={15} />
                          {t('navbar.settings')}
                        </Link>
                      </div>

                      <div className="border-t border-black/5 p-1.5">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors duration-200 text-left font-bold"
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
              <div className="flex items-center gap-2 bg-black/5 p-1 rounded-full border border-black/[0.03]">
                <button onClick={handleLoginClick} className="px-4 py-2 rounded-full text-[13px] font-bold text-neutral-600 hover:text-black hover:bg-white hover:shadow-sm transition-all">
                  {t('navbar.login')}
                </button>
                <button onClick={handleLoginClick} className="px-5 py-2 rounded-full text-[13px] font-bold text-white bg-black hover:bg-neutral-800 shadow-md hover:shadow-lg transition-all">
                  {t('navbar.register')}
                </button>
              </div>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 text-academy-textMain/70 hover:text-academy-primary transition-colors focus:outline-none focus:ring-0 active:bg-transparent"
            style={{ WebkitTapHighlightColor: 'transparent' }}
            onClick={() => setMobileOpen(p => !p)}
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

      {/* Mobile Menu — Design Solide & Épuré */}
      {mobileOpen && (
        <div className="md:hidden absolute top-[calc(100%+8px)] left-0 right-0 z-50 animate-fade-in pointer-events-auto">
          <div className="bg-white/95 backdrop-blur-2xl border border-black/5 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.2)] rounded-[20px] overflow-hidden">
            <div className="p-3 flex flex-col gap-1.5">
              <Link to="/" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl text-neutral-700 font-bold hover:bg-black/5 hover:text-black transition-colors">
                <Home size={16} /> Accueil
              </Link>
              <Link to="/courses" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl text-neutral-700 font-bold hover:bg-black/5 hover:text-black transition-colors">
                <BookOpen size={16} /> {t('nav.courses')}
              </Link>
              <Link to="/mission" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl text-neutral-700 font-bold hover:bg-black/5 hover:text-black transition-colors">
                <Target size={16} /> {t('nav.mission')}
              </Link>
              <Link to="/resources" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl text-neutral-700 font-bold hover:bg-black/5 hover:text-black transition-colors">
                <Gift size={16} /> {t('nav.resources') || "Ressources"}
              </Link>
              {isAuthenticated && !isAdmin && (
                <Link to="/my-courses" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 font-bold bg-red-50 border border-red-100 mt-1">
                  <PlayCircle size={16} /> {t('nav.my_courses')}
                </Link>
              )}
              {isAuthenticated && (
                <Link to="/settings" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl text-neutral-700 font-bold hover:bg-black/5 hover:text-black transition-colors">
                  <Settings size={16} className="text-neutral-400" /> Paramètres du compte
                </Link>
              )}
              {isAdmin && (
                <Link to="/admin" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl text-white font-bold bg-black">
                  <LayoutDashboard size={16} /> {t('nav.admin')}
                </Link>
              )}

              {/* Mobile Language Selector */}
              <div className="px-2 py-2 mt-2 border-t border-black/5">
                <p className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider mb-2">Langue</p>
                <div className="flex gap-2">
                  {languages.map(lang => (
                    <button
                      key={lang.code}
                      onClick={() => handleLangChange(lang.code)}
                      className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border text-xs font-bold transition-colors ${currentLang === lang.code ? 'bg-black text-white border-black' : 'bg-white border-neutral-200 text-neutral-600 hover:border-neutral-300'}`}
                    >
                      <span>{lang.flag}</span> {lang.code.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="mt-2 pt-3 border-t border-black/5 flex flex-col px-1">
                {isAuthenticated ? (
                  <button onClick={() => { handleLogout(); setMobileOpen(false) }} className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-red-50 text-red-600 font-bold hover:bg-red-100 transition-colors">
                    <LogOut size={16} /> Se déconnecter
                  </button>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <button onClick={() => { handleLoginClick(); setMobileOpen(false) }} className="w-full py-3 rounded-xl border-2 border-black/10 text-black font-bold hover:bg-black/5 transition-colors text-sm">
                      Connexion
                    </button>
                    <button onClick={() => { handleLoginClick(); setMobileOpen(false) }} className="w-full py-3 rounded-xl bg-black text-white font-bold shadow-md active:scale-[0.98] transition-transform text-sm">
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
