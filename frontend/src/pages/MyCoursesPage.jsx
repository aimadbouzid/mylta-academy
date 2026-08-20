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

// Miniature d'une formation, avec repli si l'image ne se charge pas
// (fichier supprimé, chemin obsolète, réseau). Composant à part car chaque
// carte de la liste a besoin de son propre état d'erreur.
function CourseThumb({ thumbnail, title }) {
  const [failed, setFailed] = useState(false)

  if (!thumbnail || failed) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-slate-100 dark:bg-white/10">
        <BookOpen className="w-10 h-10 text-slate-300" />
      </div>
    )
  }

  return (
    <img
      src={thumbnail}
      alt={title}
      loading="lazy"
      onError={() => setFailed(true)}
      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
    />
  )
}
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
        title={t('my_courses.title')}
        description={t('my_courses.subtitle')}
        canonicalPath="/my-courses"
        noindex
      />

      <div className="min-h-screen bg-academy-surface text-academy-textMain flex flex-col">
        <Navbar />

        <main className="flex-1 pt-32 sm:pt-36 lg:pt-40 pb-8 lg:pb-16 section-container max-w-7xl mx-auto w-full space-y-4 md:space-y-6 lg:space-y-8">


          <div className="flex flex-col mb-8 animate-fade-in">
            <h1 className="font-display font-bold text-3xl sm:text-4xl text-academy-textMain tracking-tight">
              Mes Formations
            </h1>
            <p className="text-academy-textMain/60 mt-2 text-sm max-w-xl">
              Retrouvez toutes vos formations débloquées ci-dessous. Reprenez votre apprentissage là où vous l'avez laissé.
            </p>
          </div>

          {loading && <LoadingGrid count={4} />}
          {error && <ErrorState message={error} onRetry={fetchMyCourses} />}


          {!loading && !error && courses.length === 0 && (
            <div className="text-center py-20 bg-white/60 dark:bg-academy-surfaceDark/60 backdrop-blur-md border border-slate-200/50 shadow-sm rounded-3xl p-8 max-w-2xl mx-auto space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-white/10 flex items-center justify-center text-slate-400 dark:text-academy-textMain/40 mx-auto mb-2">
                <BookOpen size={32} />
              </div>
              <h3 className="font-display font-bold text-2xl text-slate-800 dark:text-academy-textMain/85">Aucune formation</h3>
              <p className="text-slate-500 dark:text-academy-textMain/50 text-sm leading-relaxed max-w-md mx-auto">
                Vous n'avez pas encore débloqué de formation. Découvrez notre catalogue pour commencer.
              </p>
              <div className="pt-4">
                <Link to="/courses" className="bg-slate-900 hover:bg-slate-800 text-white text-[13px] font-bold py-3 px-8 rounded-full shadow-lg shadow-slate-900/20 transition-all flex items-center gap-2 mx-auto w-max">
                  Découvrir le catalogue <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          )}

          {!loading && !error && courses.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {courses.map(course => (
                <div key={course.id} className="bg-white dark:bg-academy-surfaceDark rounded-3xl border border-slate-100/60 shadow-[0_4px_24px_rgb(0,0,0,0.02)] hover:shadow-[0_12px_40px_rgb(0,0,0,0.06)] hover:-translate-y-1.5 flex flex-col overflow-hidden group transition-all duration-300">
                  {/* Miniature */}
                  <div className="relative h-48 bg-slate-50 dark:bg-white/5 overflow-hidden">
                    <CourseThumb thumbnail={course.thumbnail} title={course.title} />
                    
                    <div className="absolute top-4 left-4 px-3 py-1.5 bg-white/95 dark:bg-academy-surfaceDark/95 backdrop-blur-md text-slate-800 dark:text-academy-textMain/85 text-[11px] rounded-full flex items-center gap-1.5 font-bold shadow-sm">
                      <CheckCircle2 size={14} className="text-emerald-500" />
                      Accès à vie
                    </div>
                  </div>

                  {/* Détails du cours */}
                  <div className="p-6 flex flex-col flex-1">
                    <div className="mb-6">
                      <h3 className="font-display font-bold text-lg text-slate-900 dark:text-academy-textMain mb-2 line-clamp-2 leading-snug group-hover:text-blue-600 transition-colors">
                        {course.title}
                      </h3>
                      <p className="text-slate-500 dark:text-academy-textMain/50 text-sm line-clamp-2 leading-relaxed">
                        {course.description}
                      </p>
                    </div>

                    <div className="mt-auto space-y-4">
                      {/* Barre de Progression Visuelle */}
                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-500 dark:text-academy-textMain/50 font-medium">Progression</span>
                          <span className="text-slate-900 dark:text-academy-textMain font-bold">{course.progressPercent || 0}%</span>
                        </div>
                        <div className="w-full bg-slate-100/80 rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all duration-700 ease-out"
                            style={{ width: `${course.progressPercent || 0}%` }}
                          />
                        </div>
                      </div>

                      <button
                        onClick={() => navigate(`/watch/${course.id}`)}
                        className="bg-slate-900 hover:bg-slate-800 text-white rounded-2xl py-3.5 px-4 w-full font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-[0_4px_15px_rgb(15,23,42,0.1)] hover:shadow-[0_8px_25px_rgb(15,23,42,0.2)]"
                      >
                        <Play size={16} fill="currentColor" />
                        {course.progressPercent > 0 ? 'Continuer le cours' : 'Commencer'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}


        </main>
      </div>
    </>
  )
}
