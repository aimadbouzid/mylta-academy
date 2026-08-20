import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  Play, CheckCircle, Clock, Star, ArrowLeft, Shield, Video,
  Award, BookOpen, Sparkles, Check, HelpCircle, GraduationCap, ShieldCheck
} from 'lucide-react'
import Navbar from '../components/Navbar'
import SEOHead from '../components/SEOHead'
import PaymentModal from '../components/PaymentModal'
import { useSiteSettings } from '../context/SiteSettingsContext'
import api from '../api/axios'
import { useLanguage } from '../context/LanguageContext'
import { useAuth } from '../context/AuthContext'

// --- Composant Compte à Rebours ---
function Countdown({ endsAt }) {
  const { t } = useLanguage()
  const [timeLeft, setTimeLeft] = useState(null)

  useEffect(() => {
    const target = new Date(endsAt).getTime()
    const update = () => {
      const now = new Date().getTime()
      const diff = target - now
      if (diff <= 0) {
        setTimeLeft({ d: 0, h: 0, m: 0, s: 0 })
        return
      }
      setTimeLeft({
        d: Math.floor(diff / (1000 * 60 * 60 * 24)),
        h: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        m: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        s: Math.floor((diff % (1000 * 60)) / 1000),
      })
    }
    update()
    const timer = setInterval(update, 1000)
    return () => clearInterval(timer)
  }, [endsAt])

  if (!timeLeft || (timeLeft.d === 0 && timeLeft.h === 0 && timeLeft.m === 0 && timeLeft.s === 0)) {
    return <div className="text-red-500 font-bold text-sm">{t('course_details.offer_expired')}</div>
  }

  return (
    <div className="flex gap-2 text-center text-xs font-bold text-academy-primary">
      <div className="bg-academy-primary/10 border border-academy-primary/20 rounded-lg p-2 min-w-[50px]"><div className="text-lg">{timeLeft.d}</div>{t('course_details.days')}</div>
      <div className="bg-academy-primary/10 border border-academy-primary/20 rounded-lg p-2 min-w-[50px]"><div className="text-lg">{timeLeft.h}</div>{t('course_details.hours')}</div>
      <div className="bg-academy-primary/10 border border-academy-primary/20 rounded-lg p-2 min-w-[50px]"><div className="text-lg">{timeLeft.m}</div>{t('course_details.minutes')}</div>
      <div className="bg-academy-primary/10 border border-academy-primary/20 rounded-lg p-2 min-w-[50px]"><div className="text-lg">{timeLeft.s}</div>{t('course_details.seconds')}</div>
    </div>
  )
}

export default function CourseDetails() {
  const { t } = useLanguage()
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, checkAuth } = useAuth()
  const [course, setCourse] = useState(null)
  const [loading, setLoading] = useState(true)
  // Repli si la miniature ne se charge pas (fichier absent, chemin obsolète)
  const [thumbFailed, setThumbFailed] = useState(false)
  const [showPayment, setShowPayment] = useState(false)
  const [unlocking, setUnlocking] = useState(false)

  const handleUnlockFree = async () => {
    setUnlocking(true)
    try {
      await api.post('/payments/unlock-free', { courseId: course.id })
      // Refresh course access and user credits
      const { data } = await api.get(`/courses/${id}`)
      setCourse(data)
      await checkAuth()
    } catch (err) {
      console.error(err)
    } finally {
      setUnlocking(false)
    }
  }
  const [learningPoints, setLearningPoints] = useState([
    "Maîtrise complète des concepts théoriques et pratiques du domaine.",
    "Études de cas réelles et exercices concrètement applicables.",
    "Utilisation des outils professionnels les plus demandés du marché.",
    "Accès à l'attestation de réussite nominative Mylta Academy."
  ])

  // Réglages issus du contexte partagé plutôt qu'un second appel /config/site
  const { settings: sharedSettings } = useSiteSettings()
  useEffect(() => {
    if (sharedSettings?.learningPoints) setLearningPoints(sharedSettings.learningPoints)
  }, [sharedSettings])

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const { data } = await api.get(`/courses/${id}`)
        setCourse(data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchCourse()
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen bg-academy-surface text-academy-textMain flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-2 border-academy-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-academy-textMain/50 text-sm font-medium">{t('course_details.loading')}</p>
        </div>
      </div>
    )
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-academy-surface text-academy-textMain flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <h2 className="font-display font-bold text-2xl mb-2 text-red-500">{t('course_details.not_found_title')}</h2>
          <p className="text-academy-textMain/50 font-medium text-sm mb-6 max-w-md">{t('course_details.not_found_desc')}</p>
          <Link to="/courses" className="btn-primary text-sm py-2.5 px-6">
            {t('course_details.back_to_courses')}
          </Link>
        </div>
      </div>
    )
  }

  const isDiscountActive = course.discountPrice && course.discountPrice < course.price;

  return (
    <>
      <SEOHead
        title={`${course.title} — Mylta Academy`}
        description={course.description}
        canonicalPath={`/courses/${id}`}
        ogType="product"
        // Sans miniature, on retombe sur l'image sociale par défaut plutôt que
        // de fabriquer une URL se terminant par "undefined".
        ogImage={
          course.thumbnail
            ? (course.thumbnail.startsWith('http')
                ? course.thumbnail
                : `${import.meta.env.VITE_API_URL || 'https://api.myltaacademy.com'}${course.thumbnail}`)
            : undefined
        }
        // Données réelles → JSON-LD `Course` avec prix et note (rich snippets)
        course={{
          title: course.title,
          description: course.description,
          price: isDiscountActive ? course.discountPrice : course.price,
          rating: course.rating,
          reviewsCount: course.reviews?.length || 0,
        }}
      />

      <div className="min-h-screen bg-academy-surface text-academy-textMain flex flex-col">
        <Navbar />

        <div className="pt-32 sm:pt-36 lg:pt-40 pb-32 lg:pb-24 flex-1 relative">
          {showPayment && <PaymentModal course={course} onClose={() => setShowPayment(false)} />}

          {/* Sticky Bottom Bar for Mobile */}
          {!course.hasAccess && (
            <div className="fixed bottom-0 left-0 right-0 z-50 px-5 py-4 bg-red-950/20 border-red-900/20 backdrop-blur-2xl border-t border-academy-border/50 lg:hidden flex items-center justify-between shadow-[0_-10px_40px_rgba(0,0,0,0.08)]" style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}>
              <div className="flex flex-col">
                 <div className="text-academy-textMain/50 text-[10px] uppercase font-black tracking-widest mb-1">{t('course_details.unique_price')}</div>
                 {isDiscountActive ? (
                   <div className="flex items-center gap-2.5">
                     <span className="text-2xl sm:text-3xl font-display font-black text-academy-textMain leading-none tracking-tighter">
                       {course.discountPrice.toLocaleString('fr-DZ')} <span className="text-sm sm:text-base font-bold text-academy-primary">DA</span>
                     </span>
                     <div className="flex flex-col items-start -mt-0.5">
                       <span className="text-[10px] text-academy-textMain/40 line-through font-bold leading-none">{course.price.toLocaleString('fr-DZ')} DA</span>
                       <span className="text-[9px] font-black text-red-500 uppercase mt-0.5 bg-red-50 dark:bg-red-500/10 px-1 rounded-sm">{t('course_details.promo')}</span>
                     </div>
                   </div>
                 ) : (
                   <div className="flex items-baseline gap-1">
                     <span className="text-2xl sm:text-3xl font-display font-black text-academy-textMain leading-none tracking-tighter">{(course.price || 0).toLocaleString('fr-DZ')}</span>
                     <span className="text-sm font-bold text-academy-primary">DA</span>
                   </div>
                 )}
              </div>
              <div className="flex gap-2">
                {user && user.freeCoursesEarned > 0 && (
                  <button onClick={handleUnlockFree} disabled={unlocking} className="bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3.5 px-4 text-xs font-bold rounded-2xl shadow-md active:scale-95 transition-all">
                    {unlocking ? '...' : `Gratuit (${user.freeCoursesEarned})`}
                  </button>
                )}
                <button onClick={() => setShowPayment(true)} className="btn-primary py-3.5 px-5 text-xs shadow-soft-lg active:scale-95 transition-transform flex-shrink-0">
                  {t('course_details.join')}
                </button>
              </div>
            </div>
          )}

          <div className="container mx-auto px-4 sm:px-6 max-w-6xl">
            <button onClick={() => navigate(-1)} className="inline-flex items-center gap-2 text-academy-textMain/60 hover:text-academy-primary font-medium transition-colors mb-6 lg:mb-8 text-sm">
              <ArrowLeft size={16} /> {t('course_details.back')}
            </button>

            {/* Mobile Header Image */}
            <div className="lg:hidden w-full h-56 sm:h-72 rounded-2xl overflow-hidden mb-6 relative border border-academy-border shadow-soft">
              {course.thumbnail && !thumbFailed ? (
                <img src={course.thumbnail} alt={course.title}
                     onError={() => setThumbFailed(true)}
                     className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-academy-surfaceDark flex items-center justify-center">
                  <GraduationCap size={56} className="text-academy-primary/20" />
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-10">
              {/* Main Info */}
              <div className="lg:col-span-2 space-y-6 lg:space-y-8 order-2 lg:order-1">
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="px-3 py-1 bg-academy-primary/10 border border-academy-primary/20 text-academy-primary text-xs font-bold rounded-full uppercase tracking-wider">
                      {course.category}
                    </span>
                    <span className="px-3 py-1 bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/25 text-blue-600 dark:text-blue-400 text-xs font-bold rounded-full uppercase tracking-wider">
                      {t('course_details.level')} {course.level}
                    </span>
                  </div>
                  <h1 className="font-display font-black text-3xl sm:text-5xl text-academy-textMain mb-4 leading-tight tracking-tight">
                    {course.title}
                  </h1>
                  <p className="text-academy-textMain/70 text-base sm:text-lg leading-relaxed font-medium">
                    {course.description}
                  </p>
                </div>

                {/* Statistiques Clés */}
                <div className="flex flex-wrap items-center gap-6 py-6 border-y border-academy-border">
                  <div className="flex items-center gap-2 text-academy-textMain/70 text-sm font-bold">
                    <Video size={18} className="text-blue-500" />
                    <span>{course.lessonsCount} {t('course_details.hd_lessons')}</span>
                  </div>
                  <div className="w-px h-8 bg-academy-border hidden sm:block" />
                  <div className="flex items-center gap-2 text-academy-textMain/70 text-sm font-bold">
                    <Clock size={18} className="text-academy-primary" />
                    <span>{course.duration || t('course_details.at_your_pace')}</span>
                  </div>
                  <div className="w-px h-8 bg-academy-border hidden sm:block" />
                  <div className="flex items-center gap-2 text-academy-textMain/70 text-sm font-bold">
                    <Star size={18} className="text-yellow-500 fill-yellow-500" />
                    <span>{course.ratingAvg ? course.ratingAvg.toFixed(1) : '5.0'} / 5</span>
                  </div>
                </div>

                {/* CE QUE VOUS ALLEZ APPRENDRE */}
                <div className="card-academy p-6 sm:p-8 space-y-4">
                  <h3 className="font-display font-bold text-xl text-academy-textMain flex items-center gap-2">
                    <Sparkles className="text-academy-primary" size={20} /> {t('course_details.what_you_learn')}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 text-sm text-academy-textMain/80 font-medium">
                    {learningPoints.map((pt, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        <Check className="text-green-500 flex-shrink-0 mt-0.5" size={18} />
                        <span>{pt}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* SYLLABUS / PROGRAMME DÉTAILLÉ */}
                {course.showSyllabus || course.hasAccess ? (
                  <div className="space-y-6 pt-2">
                    <div className="flex items-center justify-between">
                      <h2 className="font-display font-bold text-2xl text-academy-textMain">{t('course_details.program_title')}</h2>
                      <span className="text-academy-textMain/50 text-xs font-bold">{course.lessons?.length || 0} {t('course_details.video_modules')}</span>
                    </div>
                    <div className="bg-red-950/5 border-red-900/10 backdrop-blur-md border border-academy-border rounded-[20px] overflow-hidden shadow-soft">
                      {course.lessons?.length > 0 ? (
                        course.lessons.map((lesson, idx) => (
                          <div key={lesson.id} className="flex items-start gap-4 p-5 border-b border-academy-border hover:bg-academy-surfaceDark transition-colors last:border-0">
                            <div className="w-8 h-8 rounded-full bg-academy-primary/10 text-academy-primary border border-academy-primary/20 flex items-center justify-center font-bold text-sm shrink-0">
                              {idx + 1}
                            </div>
                            <div className="flex-1">
                              <h4 className="text-academy-textMain font-bold text-base mb-1">{lesson.title}</h4>
                              {lesson.description && <p className="text-academy-textMain/60 font-medium text-xs leading-relaxed">{lesson.description}</p>}
                            </div>
                            <div className="ml-auto flex items-center gap-2 text-academy-textMain/50 text-xs font-bold whitespace-nowrap pt-1">
                              {lesson.duration ? <><Clock size={14} className="text-blue-500" /> {lesson.duration}</> : <><Play size={14} className="text-academy-primary" /> {t('course_details.video')}</>}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-8 text-center text-academy-textMain/50 font-medium text-sm">{t('course_details.program_updating')}</div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="bg-red-950/5 border-red-900/10 backdrop-blur-md border border-academy-border rounded-[20px] p-6 text-center space-y-3 shadow-soft">
                    <Shield className="mx-auto text-academy-primary" size={32} />
                    <h3 className="text-academy-textMain font-bold text-base">{t('course_details.program_locked_title')}</h3>
                    <p className="text-academy-textMain/60 font-medium text-sm max-w-md mx-auto">{t('course_details.program_locked_desc')}</p>
                  </div>
                )}
              </div>

              {/* STICKY SIDEBAR D'ACHAT OU D'ACCÈS */}
              <div className="relative order-1 lg:order-none mb-4 lg:mb-0">
                <div className="sticky top-28 bg-red-950/5 border-red-900/10 backdrop-blur-md border border-academy-border rounded-[30px] overflow-hidden shadow-soft-lg space-y-0">
                  <div className="relative h-52 bg-academy-surfaceDark overflow-hidden hidden lg:block">
                    {course.thumbnail ? (
                      <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-academy-surfaceDark flex items-center justify-center">
                        <GraduationCap size={56} className="text-academy-primary/20" />
                      </div>
                    )}
                  </div>

                  <div className="p-6 space-y-6">
                    {course.hasAccess ? (
                      <div className="space-y-4">
                        {/* Un admin voit tout : le dire clairement plutôt que de
                            prétendre qu'il a acheté la formation. */}
                        {course.accessReason === 'ADMIN' ? (
                          <div className="bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/25 p-4 rounded-2xl text-center space-y-1">
                            <p className="text-blue-700 dark:text-blue-300 font-bold text-sm flex items-center justify-center gap-1.5">
                              <ShieldCheck size={16} /> {t('course_details.admin_access')}
                            </p>
                            <p className="text-blue-700/70 font-medium text-xs">{t('course_details.admin_access_hint')}</p>
                          </div>
                        ) : (
                          <div className="bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/25 p-4 rounded-2xl text-center space-y-1">
                            <p className="text-green-600 dark:text-green-400 font-bold text-sm flex items-center justify-center gap-1.5">
                              <CheckCircle size={16} /> {t('course_details.access_granted')}
                            </p>
                            <p className="text-green-600/70 font-medium text-xs">{t('course_details.already_owned')}</p>
                          </div>
                        )}
                        <button
                          onClick={() => navigate(`/watch/${course.id}`)}
                          className="w-full btn-primary py-4 text-base justify-center font-bold flex items-center gap-2"
                        >
                          <Play size={18} fill="currentColor" /> {t('course_details.access_lessons')}
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="mb-6 bg-white dark:bg-academy-surfaceDark border border-academy-border/60 rounded-3xl p-6 sm:p-8 text-center shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden group">
                           {/* Effet lumineux d'arrière-plan */}
                           <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-red-500/10 to-transparent rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none transition-transform duration-700 group-hover:scale-110"></div>
                           <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-red-500/5 to-transparent rounded-full blur-3xl -ml-16 -mb-16 pointer-events-none transition-transform duration-700 group-hover:scale-110"></div>
                           
                           <span className="inline-block px-4 py-1.5 bg-academy-surfaceDark/50 text-academy-textMain/60 text-[10px] font-black tracking-[0.2em] uppercase rounded-full mb-6 border border-academy-border/50">
                             {t('course_details.access_price')}
                           </span>
                           
                           {isDiscountActive ? (
                             <div className="flex flex-col items-center justify-center gap-3">
                               <div className="flex items-center gap-3">
                                 <span className="px-3 py-1 rounded-xl bg-gradient-to-r from-red-500 to-red-600 text-white text-[11px] font-black tracking-wider shadow-[0_4px_12px_rgba(239,68,68,0.3)] uppercase">
                                   {t('course_details.promo')} -{Math.round(((course.price - course.discountPrice) / course.price) * 100)}%
                                 </span>
                                 <span className="text-base text-academy-textMain/40 line-through font-bold decoration-2">
                                   {course.price.toLocaleString('fr-DZ')} DA
                                 </span>
                               </div>
                               <div className="flex items-baseline gap-1.5 relative">
                                 <span className="text-5xl sm:text-6xl font-display font-black tracking-tighter text-academy-textMain leading-none drop-shadow-sm">
                                   {course.discountPrice.toLocaleString('fr-DZ')}
                                 </span>
                                 <span className="text-lg font-black text-academy-primary pt-2">DA</span>
                               </div>
                             </div>
                           ) : (
                             <div className="flex items-baseline justify-center gap-1.5 relative">
                               <span className="text-5xl sm:text-6xl font-display font-black tracking-tighter text-academy-textMain leading-none drop-shadow-sm">
                                 {(course.price || 0).toLocaleString('fr-DZ')}
                               </span>
                               <span className="text-lg font-black text-academy-primary pt-2">DA</span>
                             </div>
                           )}
                        </div>

                        {user && user.freeCoursesEarned > 0 && (
                          <button
                            onClick={handleUnlockFree}
                            disabled={unlocking}
                            className="w-full relative overflow-hidden group bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white py-4 px-6 rounded-2xl text-base font-bold flex items-center justify-center gap-2 transition-all duration-300 shadow-md hover:shadow-lg hover:-translate-y-0.5 active:scale-[0.98] mb-3 disabled:opacity-50"
                          >
                            <Award size={18} />
                            {unlocking ? 'Déblocage...' : `Débloquer gratuitement (${user.freeCoursesEarned} ${user.freeCoursesEarned > 1 ? 'crédits' : 'crédit'})`}
                          </button>
                        )}

                        <button
                          onClick={() => setShowPayment(true)}
                          className="w-full relative overflow-hidden group bg-academy-textMain hover:bg-black text-white py-4.5 px-6 rounded-2xl text-base font-bold flex items-center justify-center gap-2 transition-all duration-300 shadow-[0_8px_20px_rgba(0,0,0,0.1)] hover:shadow-[0_12px_25px_rgba(0,0,0,0.15)] hover:-translate-y-0.5 active:scale-[0.98]"
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                          <Sparkles size={18} />
                          {t('course_details.buy_course')}
                        </button>
                      </>
                    )}

                    <ul className="space-y-3 pt-4 border-t border-academy-border text-xs font-medium text-academy-textMain/70">
                      <li className="flex items-center gap-3">
                        <CheckCircle size={16} className="text-green-500 flex-shrink-0" /> {t('course_details.lifetime_access')}
                      </li>
                      <li className="flex items-center gap-3">
                        <CheckCircle size={16} className="text-green-500 flex-shrink-0" /> {t('course_details.updates_included')}
                      </li>
                      <li className="flex items-center gap-3">
                        <CheckCircle size={16} className="text-green-500 flex-shrink-0" /> {t('course_details.support_included')}
                      </li>
                      <li className="flex items-center gap-3">
                        <CheckCircle size={16} className="text-green-500 flex-shrink-0" /> {t('course_details.certificate')}
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
