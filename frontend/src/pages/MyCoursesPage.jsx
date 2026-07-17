// MyCoursesPage.jsx — Dashboard Étudiant Complet, Élégant et Intuitif
import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Play, BookOpen, Clock, CheckCircle2, Award, TrendingUp,
  Sparkles, Shield, Compass, HelpCircle, ArrowRight, Zap, GraduationCap
} from 'lucide-react'
import Navbar from '../components/Navbar'
import SEOHead from '../components/SEOHead'
import { LoadingGrid, ErrorState } from '../components/LoadingSkeleton'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../context/LanguageContext'
import api from '../api/axios'

export default function MyCoursesPage() {
  const { user, checkAuth } = useAuth()
  const { t } = useLanguage()
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('in-progress') // 'in-progress' | 'all' | 'guide'
  const navigate = useNavigate()

  const fetchMyCourses = async () => {
    setLoading(true)
    setError(null)
    try {
      const { data } = await api.get('/auth/my-courses')
      setCourses(data.courses || [])
    } catch (err) {
      setError(err.response?.data?.error || t('my_courses.fetch_error'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMyCourses()
    checkAuth().catch(() => {})
  }, [])

  // Calcul des statistiques globales du dashboard
  const totalCourses = courses.length
  const totalLessonsCount = courses.reduce((acc, c) => acc + (c.lessons?.length || 0), 0)
  const completedLessonsCount = courses.reduce((acc, c) => acc + (c.completedCount || 0), 0)
  const avgProgress = totalCourses > 0
    ? Math.round(courses.reduce((acc, c) => acc + (c.progressPercent || 0), 0) / totalCourses)
    : 0

  // Trouver la formation la plus pertinente pour "Reprendre rapidement"
  const recentCourse = courses.length > 0 ? (courses.find(c => c.progressPercent < 100) || courses[0]) : null

  const inProgressCourses = courses.filter(c => (c.progressPercent || 0) < 100)

  return (
    <>
      <SEOHead
        title={t('my_courses.title') + " — Mylta Academy"}
        description={t('my_courses.subtitle')}
        canonicalPath="/my-courses"
      />

      <div className="min-h-screen bg-academy-surface text-academy-textMain flex flex-col">
        <Navbar />

        <main className="flex-1 pt-28 lg:pt-28 pb-8 lg:pb-16 section-container max-w-7xl mx-auto w-full space-y-6 lg:space-y-8">

          {/* BANNIÈRE DE BIENVENUE REPENSSÉE (Design Épuré & Premium) */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-academy-border/60 animate-fade-in">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-1.5 text-academy-primary/80 text-[11px] font-bold uppercase tracking-widest font-mono">
                <GraduationCap size={14} /> {t('my_courses.title')}
              </div>
              <h1 className="font-display font-bold text-3xl sm:text-4xl text-academy-textMain tracking-tight">
                {t('my_courses.hello')} <span className="text-transparent bg-clip-text bg-gradient-to-r from-academy-primary to-red-400">{user?.name?.split(' ')[0] || t('my_courses.student')}</span> <span className="text-2xl animate-wave inline-block origin-bottom-right">👋</span>
              </h1>
              <p className="text-academy-textMain/50 text-sm max-w-lg leading-relaxed">
                {t('my_courses.subtitle')}
              </p>
            </div>

            {recentCourse && (
              <div className="relative group cursor-pointer" onClick={() => navigate(`/watch/${recentCourse.id}`)}>
                {/* Effet de lueur au survol */}
                <div className="absolute -inset-0.5 bg-gradient-to-r from-academy-primary/30 to-red-500/30 rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-500" />
                
                <div className="relative flex items-center gap-4 bg-academy-surfaceDark/80 backdrop-blur-xl border border-academy-border hover:border-academy-primary/30 transition-colors p-4 rounded-2xl md:min-w-[320px] shadow-soft">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-academy-primary to-red-500 flex items-center justify-center text-white flex-shrink-0 shadow-inner">
                    <Play size={18} fill="currentColor" className="ml-0.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-1">
                      <p className="text-academy-textMain/40 text-[10px] font-bold uppercase tracking-wider font-mono">{t('my_courses.quick_resume')}</p>
                      <p className="text-academy-primary text-[10px] font-mono font-bold">{recentCourse.progressPercent || 0}%</p>
                    </div>
                    <p className="text-academy-textMain font-semibold text-sm truncate group-hover:text-academy-primary transition-colors">
                      {recentCourse.title}
                    </p>
                    <div className="w-full bg-black/40 rounded-full h-1 mt-2 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-academy-primary to-red-400 h-full rounded-full transition-all duration-700 ease-out"
                        style={{ width: `${recentCourse.progressPercent || 0}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* INDICATEURS DE PERFORMANCE / METRICS */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 animate-fade-up">
            <div className="bg-white/50 border border-academy-border/60 p-3 rounded-2xl shadow-sm flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500 flex-shrink-0">
                <BookOpen size={14} />
              </div>
              <div className="flex flex-col justify-center">
                <p className="font-display font-bold text-lg text-academy-textMain leading-tight">{totalCourses}</p>
                <p className="text-academy-textMain/50 text-[10px] font-medium leading-tight">{t('my_courses.unlocked_courses')}</p>
              </div>
            </div>

            <div className="bg-white/50 border border-academy-border/60 p-3 rounded-2xl shadow-sm flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 flex-shrink-0">
                <CheckCircle2 size={14} />
              </div>
              <div className="flex flex-col justify-center">
                <p className="font-display font-bold text-lg text-academy-textMain leading-tight">{completedLessonsCount} / {totalLessonsCount}</p>
                <p className="text-academy-textMain/50 text-[10px] font-medium leading-tight">{t('my_courses.lessons_completed')}</p>
              </div>
            </div>

            <div className="bg-white/50 border border-academy-border/60 p-3 rounded-2xl shadow-sm flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-academy-primary/10 border border-academy-primary/20 flex items-center justify-center text-academy-primary flex-shrink-0">
                <TrendingUp size={14} />
              </div>
              <div className="flex flex-col justify-center">
                <p className="font-display font-bold text-lg text-academy-primary leading-tight">{avgProgress}%</p>
                <p className="text-academy-textMain/50 text-[10px] font-medium leading-tight">{t('my_courses.global_progress')}</p>
              </div>
            </div>

            <div className="bg-white/50 border border-academy-border/60 p-3 rounded-2xl shadow-sm flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-500 flex-shrink-0">
                <Award size={14} />
              </div>
              <div className="flex flex-col justify-center">
                <p className="font-display font-bold text-lg text-academy-textMain leading-tight">{courses.filter(c => c.progressPercent === 100).length}</p>
                <p className="text-academy-textMain/50 text-[10px] font-medium leading-tight">{t('my_courses.certificates')}</p>
              </div>
            </div>
          </div>

          {/* SYSTEME DE PARRAINAGE (Referral System Widget) */}
          {user && (
            <div className="bg-gradient-to-br from-indigo-900/10 via-academy-surfaceDark/80 to-academy-surfaceDark border border-academy-border/60 hover:border-academy-primary/20 transition-all p-5 sm:p-6 rounded-3xl shadow-soft animate-fade-up relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-academy-primary/5 to-transparent rounded-full blur-3xl pointer-events-none" />
              
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                <div className="space-y-2.5 max-w-xl">
                  <span className="inline-flex items-center gap-1 bg-academy-primary/10 border border-academy-primary/20 text-academy-primary text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full">
                    <Sparkles size={12} /> Programme de Parrainage
                  </span>
                  <h2 className="font-display font-bold text-lg sm:text-xl text-academy-textMain">
                    Invitez des amis et obtenez des formations gratuites !
                  </h2>
                  <p className="text-academy-textMain/50 text-xs sm:text-sm leading-relaxed font-medium">
                    Partagez votre lien de parrainage unique. Dès que 3 de vos amis achètent une formation sur Mylta Academy, vous obtenez un crédit de formation 100% gratuite.
                  </p>
                  
                  {/* Referral link copying input */}
                  <div className="flex items-center gap-2 mt-4 max-w-md bg-white border border-academy-border/60 rounded-xl p-1.5 shadow-inner">
                    <input
                      type="text"
                      readOnly
                      value={`${window.location.origin}/register?ref=${user.referralCode || ''}`}
                      className="bg-transparent border-none text-academy-textMain text-xs rounded-lg px-2 py-1.5 focus:outline-none flex-1 font-mono select-all overflow-ellipsis"
                    />
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(`${window.location.origin}/register?ref=${user.referralCode || ''}`)
                        alert("Lien de parrainage copié !")
                      }}
                      className="bg-academy-primary hover:bg-academy-primary/90 text-white text-[11px] font-bold rounded-lg px-4 py-2 transition-all shrink-0 shadow-sm"
                    >
                      Copier
                    </button>
                  </div>
                </div>

                {/* Referral progress metrics */}
                <div className="flex flex-col items-center justify-center p-4 bg-white border border-academy-border/30 rounded-2xl md:min-w-[220px] shadow-soft shrink-0 text-center">
                  <div className="text-xs font-bold text-academy-textMain/60 uppercase tracking-wider mb-2">Filleuls payés</div>
                  
                  <div className="flex items-baseline gap-1 mb-1">
                    <span className="text-4xl font-display font-black text-academy-primary">{user.referralCount || 0}</span>
                    <span className="text-xl text-academy-textMain/30 font-bold">/</span>
                    <span className="text-xl text-academy-textMain/60 font-bold">3</span>
                  </div>

                  {/* Circular or linear mini-progress bar */}
                  <div className="w-full bg-academy-surfaceDark rounded-full h-1.5 overflow-hidden border border-academy-border/50 mb-3">
                    <div
                      className="bg-gradient-to-r from-academy-primary to-green-500 h-1.5 rounded-full transition-all duration-500"
                      style={{ width: `${((user.referralCount || 0) / 3) * 100}%` }}
                    />
                  </div>

                  <p className="text-[10px] text-academy-textMain/50 font-bold">
                    {user.referralCount === 0 
                      ? "3 personnes restantes"
                      : `${3 - (user.referralCount || 0)} personne${3 - (user.referralCount || 0) > 1 ? 's' : ''} restante${3 - (user.referralCount || 0) > 1 ? 's' : ''}`
                    }
                  </p>

                  {user.freeCoursesEarned > 0 && (
                    <div className="mt-4 pt-3 border-t border-academy-border/40 w-full text-center">
                      <div className="text-[11px] font-black text-green-600 bg-green-50 border border-green-200 rounded-lg py-1 px-2 flex items-center justify-center gap-1.5 animate-pulse">
                        <Award size={14} /> {user.freeCoursesEarned} cours gratuit{user.freeCoursesEarned > 1 ? 's' : ''} disponible{user.freeCoursesEarned > 1 ? 's' : ''} !
                      </div>
                      <Link to="/courses" className="text-[10px] text-academy-primary hover:underline font-bold block mt-2">
                        Utiliser mes crédits maintenant →
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* BARRE D'ONGLETS INTUITIVE */}
          <div className="flex items-center border-b border-academy-border/60">
            <div className="flex gap-6 overflow-x-auto">
              <button
                onClick={() => setActiveTab('in-progress')}
                className={`py-3 text-[11px] uppercase tracking-wider font-bold transition-all flex items-center gap-1.5 whitespace-nowrap border-b-2 ${
                  activeTab === 'in-progress'
                    ? 'text-academy-primary border-academy-primary'
                    : 'text-academy-textMain/50 border-transparent hover:text-academy-textMain'
                }`}
              >
                <Zap size={14} /> {t('my_courses.tab_in_progress')} ({inProgressCourses.length})
              </button>
              <button
                onClick={() => setActiveTab('all')}
                className={`py-3 text-[11px] uppercase tracking-wider font-bold transition-all flex items-center gap-1.5 whitespace-nowrap border-b-2 ${
                  activeTab === 'all'
                    ? 'text-academy-primary border-academy-primary'
                    : 'text-academy-textMain/50 border-transparent hover:text-academy-textMain'
                }`}
              >
                <BookOpen size={14} /> {t('my_courses.tab_all')} ({totalCourses})
              </button>
              <button
                onClick={() => setActiveTab('guide')}
                className={`py-3 text-[11px] uppercase tracking-wider font-bold transition-all flex items-center gap-1.5 whitespace-nowrap border-b-2 ${
                  activeTab === 'guide'
                    ? 'text-red-400 border-red-400'
                    : 'text-academy-textMain/50 border-transparent hover:text-academy-textMain'
                }`}
              >
                <HelpCircle size={14} /> {t('my_courses.tab_support')}
              </button>
            </div>
          </div>

          {/* CONTENU DU DASHBOARD */}
          {loading && <LoadingGrid count={3} />}
          {error && <ErrorState message={error} onRetry={fetchMyCourses} />}

          {!loading && !error && courses.length === 0 && (
            <div className="text-center py-16 bg-red-950/5 border-red-900/10 backdrop-blur-md border border-academy-border rounded-3xl p-8 max-w-2xl mx-auto space-y-4">
              <div className="w-16 h-16 rounded-full bg-academy-primary/10 border border-academy-primary/30 flex items-center justify-center text-academy-primary mx-auto">
                <BookOpen size={32} />
              </div>
              <h3 className="font-display font-bold text-2xl text-academy-textMain">{t('my_courses.empty_title')}</h3>
              <p className="text-academy-textMain/60 text-sm leading-relaxed max-w-md mx-auto">
                {t('my_courses.empty_desc')}
              </p>
              <div className="pt-2">
                <Link to="/courses" className="btn-primary text-sm py-3 px-8">
                  {t('my_courses.discover_catalog')}
                </Link>
              </div>
            </div>
          )}

          {/* LISTE DES COURS EN COURS OU TOUS */}
          {!loading && !error && courses.length > 0 && activeTab !== 'guide' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {(activeTab === 'in-progress' ? (inProgressCourses.length > 0 ? inProgressCourses : courses) : courses).map(course => (
                <div key={course.id} className="bg-white dark:bg-academy-surfaceDark rounded-[16px] border border-academy-border/60 flex flex-col overflow-hidden group hover:border-academy-primary/40 transition-all duration-300 shadow-sm">
                  {/* Miniature avec Badge Accès */}
                  <div className="relative h-32 bg-academy-surfaceDark overflow-hidden">
                    {course.thumbnail ? (
                      <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-white to-academy-surfaceDark">
                        <BookOpen className="w-10 h-10 text-academy-primary/30" />
                      </div>
                    )}
                    <div className="absolute top-2 left-2 px-2 py-0.5 bg-red-950/80 border border-red-500/40 text-red-400 text-[9px] rounded-full backdrop-blur-md flex items-center gap-1 font-bold uppercase tracking-wider">
                      <CheckCircle2 size={10} />
                      {t('my_courses.lifetime_access')}
                    </div>
                    {course.progressPercent === 100 && (
                      <div className="absolute top-2 right-2 px-2 py-0.5 bg-purple-950/80 border border-purple-500/40 text-purple-300 text-[9px] rounded-full backdrop-blur-md flex items-center gap-1 font-bold uppercase tracking-wider">
                        <Award size={10} /> {t('my_courses.completed')}
                      </div>
                    )}
                  </div>

                  {/* Détails du cours */}
                  <div className="p-4 flex flex-col flex-1 space-y-3">
                    <div>
                      <h3 className="font-display font-bold text-sm text-academy-textMain mb-1 line-clamp-1 group-hover:text-academy-primary transition-colors">
                        {course.title}
                      </h3>
                      <p className="text-academy-textMain/50 text-[10px] line-clamp-2 leading-tight">
                        {course.description}
                      </p>
                    </div>

                    {/* Barre de Progression Visuelle */}
                    <div className="space-y-1 pt-1">
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="text-academy-textMain/60 font-medium">{t('my_courses.progress')}</span>
                        <span className="text-academy-primary font-mono font-bold">{course.progressPercent || 0}%</span>
                      </div>
                      <div className="w-full bg-academy-surfaceDark rounded-full h-1.5 overflow-hidden border border-academy-border/50">
                        <div
                          className="bg-gradient-to-r from-academy-primary to-red-400 h-1.5 rounded-full transition-all duration-500"
                          style={{ width: `${course.progressPercent || 0}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-academy-textMain/40 pt-2 border-t border-academy-border/60">
                      <span className="flex items-center gap-1 font-mono">
                        <BookOpen size={10} /> {course.lessons?.length || 0} {t('my_courses.lessons_count')}
                      </span>
                      {course.duration && (
                        <span className="flex items-center gap-1 font-mono">
                          <Clock size={10} /> {course.duration}
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => navigate(`/watch/${course.id}`)}
                      className="btn-primary justify-center text-xs py-2 w-full font-bold mt-auto shadow-none"
                    >
                      <Play size={14} fill="currentColor" />
                      {course.progressPercent > 0 ? t('my_courses.resume') : t('my_courses.start')}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ONGLET GUIDE ÉTUDIANT & SUPPORT */}
          {activeTab === 'guide' && (
            <div className="card-academy p-8 space-y-6 max-w-3xl mx-auto border-red-500/30 animate-fade-in">
              <div className="flex items-center gap-3 border-b border-academy-border pb-4">
                <div className="w-10 h-10 rounded-xl bg-red-500/15 border border-red-500/30 flex items-center justify-center text-red-400 font-bold">
                  <HelpCircle size={20} />
                </div>
                <div>
                  <h2 className="font-display font-bold text-xl text-academy-textMain">{t('my_courses.guide_title')}</h2>
                  <p className="text-academy-textMain/40 text-xs">{t('my_courses.guide_desc')}</p>
                </div>
              </div>

              <div className="space-y-4 text-sm text-academy-textMain/70 leading-relaxed">
                <div className="bg-academy-surfaceDark p-4 rounded-xl border border-academy-border space-y-1">
                  <h4 className="font-bold text-academy-textMain text-base flex items-center gap-2">
                    <Sparkles size={16} className="text-academy-primary" /> {t('my_courses.guide_q1')}
                  </h4>
                  <p>{t('my_courses.guide_a1')}</p>
                </div>

                <div className="bg-academy-surfaceDark p-4 rounded-xl border border-academy-border space-y-1">
                  <h4 className="font-bold text-academy-textMain text-base flex items-center gap-2">
                    <Shield size={16} className="text-red-400" /> {t('my_courses.guide_q2')}
                  </h4>
                  <p>{t('my_courses.guide_a2')}</p>
                </div>

                <div className="bg-academy-surfaceDark p-4 rounded-xl border border-academy-border space-y-1">
                  <h4 className="font-bold text-academy-textMain text-base flex items-center gap-2">
                    <HelpCircle size={16} className="text-purple-400" /> {t('my_courses.guide_q3')}
                  </h4>
                  <p>{t('my_courses.guide_a3')}</p>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>
    </>
  )
}
