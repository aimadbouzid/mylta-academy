import { useState } from 'react'
import { Search, SlidersHorizontal, BookOpen, X } from 'lucide-react'
import { Link, useSearchParams } from 'react-router-dom'
import Navbar from '../components/Navbar'
import CourseCard from '../components/CourseCard'
import UpcomingCourseCard from '../components/UpcomingCourseCard'
import { useSiteSettings } from '../context/SiteSettingsContext'
import LoginModal from '../components/LoginModal'
import PaymentModal from '../components/PaymentModal'
import { LoadingGrid, ErrorState } from '../components/LoadingSkeleton'
import SEOHead from '../components/SEOHead'
import { useCourses } from '../hooks/useCourses'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../context/LanguageContext'

const CATEGORIES = ['Tous', 'Marketing', 'Tech', 'Business', 'Design', 'Finance']
const LEVELS     = ['Tous', 'Débutant', 'Intermédiaire', 'Avancé']

export default function CoursesPage() {
  const { isAuthenticated } = useAuth()
  const { t } = useLanguage()
  const [category,    setCategory]    = useState('Tous')
  const [level,       setLevel]       = useState('Tous')
  // `?search=` permet d'arriver ici depuis un lien externe ou la page 404
  // avec la recherche déjà appliquée.
  const [searchParams] = useSearchParams()
  const initialSearch = searchParams.get('search') || ''
  const [search,      setSearch]      = useState(initialSearch)
  const [searchInput, setSearchInput] = useState(initialSearch)
  const [loginOpen,   setLoginOpen]   = useState(false)
  const [payModal,    setPayModal]    = useState(null)

  const { settings } = useSiteSettings()
  const upcoming = settings?.upcomingCourses || []
  const { courses, total, loading, error, refetch } = useCourses({
    category, level, search,
  })

  const handleSearch = (e) => {
    e.preventDefault()
    setSearch(searchInput)
  }

  const clearFilters = () => {
    setCategory('Tous')
    setLevel('Tous')
    setSearch('')
    setSearchInput('')
  }

  const hasFilters = category !== 'Tous' || level !== 'Tous' || search

  const handleAccessClick = (course) => {
    if (!isAuthenticated) return setLoginOpen(true)
    setPayModal(course)
  }

  return (
    <>
      <SEOHead
        title={t('courses_page.seo_title')}
        description={t('courses_page.seo_desc')}
        canonicalPath="/courses"
      />

      <div className="min-h-screen bg-academy-surface">
        <Navbar onLoginClick={() => setLoginOpen(true)} />

        {/* Header de page */}
        <div className="pt-32 sm:pt-36 lg:pt-40 pb-2 lg:pb-8 bg-red-950/5 border-red-900/10 backdrop-blur-md border-b border-academy-border relative overflow-hidden">
          <div className="absolute inset-0"
               style={{ background: 'radial-gradient(ellipse 60% 100% at 50% 0%, rgba(169,50,50,0.05) 0%, transparent 70%)' }} />
          <div className="section-container relative">
            <div className="flex items-center gap-2 text-academy-textMain/50 font-medium text-xs sm:text-sm mb-1 lg:mb-4">
              <Link to="/" className="hover:text-academy-primary transition-colors cursor-pointer">{t('courses_page.home')}</Link>
              <span>/</span>
              <span className="text-academy-primary font-bold">{t('courses_page.formations')}</span>
            </div>
            <h1 className="font-display font-black text-2xl sm:text-4xl lg:text-5xl text-academy-textMain mb-0.5 lg:mb-2 tracking-tight">
              {t('courses_page.title_all')} <span className="text-academy-primary">{t('courses_page.title_formations')}</span>
            </h1>
            <p className="text-academy-textMain/60 font-medium text-sm sm:text-base">
              {loading ? t('courses_page.searching') : (total > 0 ? (total === 1 ? t('courses_page.found_single') : t('courses_page.found_multiple').replace('{total}', total)) : t('courses_page.found_none'))}
            </p>
          </div>
        </div>

        <div className="section-container py-3 lg:py-10">
          {/* ── Barre de recherche + filtres ── */}
          <div className="flex flex-col sm:flex-row gap-3 mb-4 lg:mb-8">
            {/* Recherche */}
            <form onSubmit={handleSearch} className="flex-1 relative">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-academy-textMain/40" />
              <input
                type="text"
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                placeholder={t('courses_page.search_placeholder')}
                className="w-full bg-white dark:bg-academy-surfaceDark border border-academy-border/60 text-academy-textMain text-sm sm:text-base rounded-2xl pl-11 pr-10 py-3.5 focus:outline-none focus:border-academy-primary focus:ring-2 focus:ring-academy-primary/20 transition-all shadow-sm"
              />
              {searchInput && (
                <button type="button" onClick={() => { setSearchInput(''); setSearch('') }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-academy-textMain/40 hover:text-academy-primary bg-red-950/5 border-red-900/10 backdrop-blur-md p-1.5 rounded-full transition-colors">
                  <X size={14} />
                </button>
              )}
            </form>

            {/* Filtre niveau */}
            <div className="relative min-w-[180px]">
              <SlidersHorizontal size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-academy-textMain/40 pointer-events-none" />
              <select
                value={level}
                onChange={e => setLevel(e.target.value)}
                className="w-full bg-white dark:bg-academy-surfaceDark border border-academy-border/60 text-academy-textMain text-sm sm:text-base font-medium rounded-2xl pl-11 pr-10 py-3.5 focus:outline-none focus:border-academy-primary focus:ring-2 focus:ring-academy-primary/20 transition-all shadow-sm appearance-none cursor-pointer"
              >
                {LEVELS.map(l => <option key={l} value={l}>{l === 'Tous' ? t('courses_page.all_levels') : t(`courses_page.levels.${l}`)}</option>)}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-academy-textMain/40">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
              </div>
            </div>
          </div>

          {/* ── Filtres catégories ── */}
          <div className="flex overflow-x-auto hide-scrollbar sm:flex-wrap gap-1.5 sm:gap-2 mb-4 lg:mb-8 pb-1 sm:pb-0">
            {CATEGORIES.map(c => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={`px-3 py-1 sm:px-5 sm:py-2 rounded-full text-[11px] sm:text-sm whitespace-nowrap font-bold transition-all duration-300
                            ${category === c
                              ? 'bg-academy-primary text-academy-onPrimary shadow-soft'
                              : 'bg-red-950/5 border-red-900/10 backdrop-blur-md border border-academy-border text-academy-textMain/70 hover:border-academy-primary/50 hover:text-academy-primary shadow-sm'
                            }`}
              >
                {t(`courses_page.categories.${c}`)}
              </button>
            ))}

            {hasFilters && (
              <button onClick={clearFilters}
                      className="flex items-center gap-1.5 px-4 py-1.5 sm:px-5 sm:py-2 rounded-full text-xs sm:text-sm whitespace-nowrap font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10
                                 border border-red-200 dark:border-red-500/25 hover:bg-red-100 transition-all shadow-sm">
                <X size={14} /> {t('courses_page.reset')}
              </button>
            )}
          </div>

          {/* ── Grille de cours ── */}
          {loading && <LoadingGrid count={6} />}

          {error && <ErrorState message={error} onRetry={refetch} />}

          {!loading && !error && courses.length === 0 && upcoming.length === 0 && (
            <div className="text-center py-20 bg-red-950/5 border-red-900/10 backdrop-blur-md rounded-[30px] border border-academy-border shadow-sm">
              <BookOpen className="w-16 h-16 text-academy-textMain/20 mx-auto mb-4" />
              <h3 className="font-display font-bold text-xl text-academy-textMain mb-2">{t('courses_page.empty')}</h3>
              <p className="text-academy-textMain/50 font-medium text-sm mb-6">{t('courses_page.try_modifying_filters')}</p>
              <button onClick={clearFilters} className="btn-outline text-sm py-2 px-5">
                {t('courses_page.see_all')}
              </button>
            </div>
          )}

          {!loading && !error && courses.length > 0 && (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 animate-fade-in">
              {courses.map(c => (
                <CourseCard key={c.id} course={c} onAccessClick={handleAccessClick} />
              ))}
            </div>
          )}

          {!loading && !error && upcoming.length > 0 && (
            <div className={courses.length > 0 ? 'mt-10' : ''}>
              <h2 className="font-display font-bold text-lg sm:text-xl mb-4">Bientôt disponibles</h2>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
                {upcoming.map(c => <UpcomingCourseCard key={c.title} course={c} />)}
              </div>
            </div>
          )}
        </div>
      </div>

      {loginOpen && <LoginModal onClose={() => setLoginOpen(false)} onSuccess={() => setLoginOpen(false)} />}
      {payModal  && <PaymentModal course={payModal} onClose={() => setPayModal(null)} />}
    </>
  )
}
