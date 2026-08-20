// WatchCoursePage.jsx — Lecteur de cours ultra-interactif et sécurisé pour l'étudiant
import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  Play, CheckCircle, Lock, ArrowLeft, BookOpen, Clock, AlertCircle, Star,
  RotateCcw, RotateCw, ShieldAlert, PlayCircle, CreditCard, Award,
  ChevronLeft, ChevronRight, Check
} from 'lucide-react'
import Navbar from '../components/Navbar'
import SEOHead from '../components/SEOHead'
import { useToast } from '../hooks/useToast'
import { useAuth } from '../context/AuthContext'
import { useSocket } from '../context/SocketContext'
import { useLanguage } from '../context/LanguageContext'
import api from '../api/axios'
import PremiumPlayer from '../components/PremiumPlayer'
import UniversalVideoPlayer from '../components/UniversalVideoPlayer'
import StandardPlayer from '../components/StandardPlayer'
import StudentCertificate from '../components/StudentCertificate'
import LeaveReviewModal from '../components/LeaveReviewModal'
const DynamicWatermark = ({ email }) => {
  const [position, setPosition] = useState({ top: 10, left: 10 })
  const [direction, setDirection] = useState({ x: 1, y: 1 })

  useEffect(() => {
    const interval = setInterval(() => {
      setPosition(prev => {
        let newX = prev.left + (direction.x * 0.5)
        let newY = prev.top + (direction.y * 0.5)
        let newDirX = direction.x
        let newDirY = direction.y

        if (newX >= 80 || newX <= 5) newDirX *= -1
        if (newY >= 80 || newY <= 5) newDirY *= -1

        setDirection({ x: newDirX, y: newDirY })
        return { top: newY, left: newX }
      })
    }, 50)
    return () => clearInterval(interval)
  }, [direction])

  return (
    <div
      className="absolute z-20 pointer-events-none opacity-25 select-none font-medium text-[12px] text-white/80 transition-all duration-75"
      style={{ top: `${position.top}%`, left: `${position.left}%` }}
    >
      <div>MYLTA ACADEMY PROTECTED</div>
      <div>{email}</div>
    </div>
  )
}

export default function WatchCoursePage() {
  const { courseId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { t } = useLanguage()
  const { success, error: toastError } = useToast()

  const [course, setCourse] = useState(null)
  const [activeLesson, setActiveLesson] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showCertificate, setShowCertificate] = useState(false)
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [useAlternativePlayer, setUseAlternativePlayer] = useState(false)

  const [videoBlobUrl, setVideoBlobUrl] = useState(null)
  const [videoLoading, setVideoLoading] = useState(false)
  const [videoError, setVideoError] = useState(null)
  const [isVideoBuffering, setIsVideoBuffering] = useState(false)
  const [progress, setProgress] = useState(new Set())
  const [userRating, setUserRating] = useState(0)
  const [reviewComment, setReviewComment] = useState('')

  // Double-tap & Keyboard jump indicators state
  const videoRef = useRef(null)
  const lastClickTimeRef = useRef({ time: 0, x: 0 })

  // Anti-screenshot / security blur state
  const [isBlackout, setIsBlackout] = useState(false)



  // Fetch course detail
  useEffect(() => {
    const fetchCourseDetails = async () => {
      setLoading(true)
      setError(null)
      try {
        const { data } = await api.get(`/courses/${courseId}`)
        setCourse(data)
        if (data.lessons && data.lessons.length > 0) {
          const lastLessonId = localStorage.getItem(`mylta_last_lesson_${courseId}`)
          const savedLesson = lastLessonId ? data.lessons.find(l => l.id === parseInt(lastLessonId, 10)) : null
          setActiveLesson(savedLesson || data.lessons[0])
        }
        if (data.userProgress) {
          setProgress(new Set(data.userProgress))
        }

      } catch (err) {
        setError(err.response?.data?.error || t('watch.load_error'))
      } finally {
        setLoading(false)
      }
    }
    fetchCourseDetails()
  }, [courseId])

  // Save active lesson to localStorage
  useEffect(() => {
    if (activeLesson) {
      localStorage.setItem(`mylta_last_lesson_${courseId}`, activeLesson.id)
    }
  }, [activeLesson, courseId])



  // Real-time synchronization
  const { socket } = useSocket()
  useEffect(() => {
    if (!socket) return

    const handleSyncProgress = (data) => {
      if (data.courseId === parseInt(courseId, 10)) {
        setProgress((prev) => {
          const newSet = new Set(prev)
          if (data.isCompleted) newSet.add(data.lessonId)
          else newSet.delete(data.lessonId)
          return newSet
        })
      }
    }

    socket.on('SYNC_PROGRESS', handleSyncProgress)
    return () => {
      socket.off('SYNC_PROGRESS', handleSyncProgress)
    }
  }, [socket, courseId])

  // Use ephemeral HMAC video token
  useEffect(() => {
    if (!activeLesson) return

    let cancelled = false
    setVideoLoading(true)
    setVideoError(null)
    setIsVideoBuffering(true)

    const isExternal = !!activeLesson.externalVideoUrl
    if (isExternal) {
      setVideoLoading(false)
      setIsVideoBuffering(false)
      return () => { cancelled = true }
    }

    const loadVideo = async () => {
      try {
        const { data } = await api.post(`/video/token/${activeLesson.id}`)
        if (cancelled) return

        // Passe par le proxy Vite en dev comme en prod : pas de port codé en dur
        setVideoBlobUrl(`/api/video/${activeLesson.id}?vtoken=${data.videoToken}`)
        setVideoLoading(false)
      } catch (err) {
        if (cancelled) return
        setVideoError(err.response?.data?.error || t('watch.video_error'))
        setVideoLoading(false)
        setIsVideoBuffering(false)
      }
    }

    loadVideo()

    return () => {
      cancelled = true
      setVideoBlobUrl(null)
      setUseAlternativePlayer(false)
    }
  }, [activeLesson])

  // Anti-screenshot / Anti-recording handlers (Visibility API)
  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden) setIsBlackout(true)
      else setIsBlackout(false)
    }

    document.addEventListener('visibilitychange', handleVisibility)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibility)
    }
  }, [])

  const toggleLessonProgress = async (lessonId, e) => {
    e.stopPropagation()
    const isCompleted = !progress.has(lessonId)
    const newSet = new Set(progress)
    if (isCompleted) newSet.add(lessonId)
    else newSet.delete(lessonId)
    setProgress(newSet)

    try {
      await api.post(`/courses/${courseId}/progress`, { lessonId, isCompleted })
    } catch {
      toastError(t('watch.save_progress_error'))
      const revertSet = new Set(newSet)
      if (isCompleted) revertSet.delete(lessonId)
      else revertSet.add(lessonId)
      setProgress(revertSet)
    }
  }

  const handleVideoEnded = async () => {
    if (!progress.has(activeLesson.id)) {
      const newSet = new Set(progress)
      newSet.add(activeLesson.id)
      setProgress(newSet)
      try {
        await api.post(`/courses/${courseId}/progress`, { lessonId: activeLesson.id, isCompleted: true })
      } catch (err) {}
    }

    if (course && course.lessons) {
      const currentIndex = course.lessons.findIndex(l => l.id === activeLesson.id)
      if (currentIndex >= 0 && currentIndex < course.lessons.length - 1) {
        const nextLesson = course.lessons[currentIndex + 1]
        success(`${t('watch.auto_next')} ${nextLesson.title}`)
        setActiveLesson(nextLesson)
      } else {
        success(t('watch.course_completed'))
      }
    }
  }

  const handleRateCourse = async () => {
    if (userRating === 0) return toastError(t('watch.select_rating'))
    try {
      await api.post(`/courses/${courseId}/rate`, { rating: userRating, comment: reviewComment })
      success(t('watch.thanks_review'))
    } catch {
      toastError(t('watch.review_error'))
    }
  }

  // Handle Video Time Saving
  const handleTimeUpdate = useCallback((currentTime) => {
    if (!activeLesson) return
    // Reduce writes by checking rounded value
    const floored = Math.floor(currentTime)
    if (floored > 0 && floored % 2 === 0) {
      localStorage.setItem(`mylta_video_progress_${courseId}_${activeLesson.id}`, currentTime)
    }
  }, [activeLesson, courseId])

  const handleLoadedMetadata = useCallback((player) => {
    if (!activeLesson) return
    const savedTime = localStorage.getItem(`mylta_video_progress_${courseId}_${activeLesson.id}`)
    // Prevent seeking to the very end immediately
    if (savedTime && parseFloat(savedTime) > 0 && player.duration > parseFloat(savedTime) + 2) {
      player.currentTime = parseFloat(savedTime)
    }
  }, [activeLesson, courseId])

  // Navigation séquentielle entre leçons
  const lessons = course?.lessons || []
  const activeIndex = activeLesson ? lessons.findIndex(l => l.id === activeLesson.id) : -1
  const prevLesson = activeIndex > 0 ? lessons[activeIndex - 1] : null
  const nextLesson = activeIndex >= 0 && activeIndex < lessons.length - 1 ? lessons[activeIndex + 1] : null
  const completionPercent = lessons.length > 0 ? Math.round((progress.size / lessons.length) * 100) : 0

  // Verrou séquentiel & Remboursement
  const isLessonLocked = (lesson) => {
    if (!course?.lessons) return false
    const firstLesson = course.lessons[0]
    if (lesson.id === firstLesson.id) return false
    
    const lessonIndex = course.lessons.findIndex(l => l.id === lesson.id)
    if (lessonIndex > 0) {
      const prevLesson = course.lessons[lessonIndex - 1]
      if (!progress.has(prevLesson.id)) return true
    }
    return false
  }



  if (loading) {
    return (
      <div className="min-h-screen bg-academy-surface text-academy-textMain flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-2 border-academy-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-academy-textMain/50 text-sm">{t('watch.loading_workspace')}</p>
        </div>
      </div>
    )
  }

  if (error || !course) {
    return (
      <div className="min-h-screen bg-academy-surface text-academy-textMain flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <AlertCircle className="w-16 h-16 text-red-400 mb-4" />
          <h2 className="font-display font-bold text-2xl mb-2">{t('watch.access_restricted')}</h2>
          <p className="text-academy-textMain/50 text-sm max-w-md mb-6">
            {error || t('watch.buy_to_watch')}
          </p>
          <Link to="/courses" className="btn-primary text-sm py-2.5 px-6">
            {t('watch.back_to_catalog')}
          </Link>
        </div>
      </div>
    )
  }

  return (
    <>
      <SEOHead title={`Visionner: ${course.title}`} description="Espace de visionnage sécurisé Mylta Academy" canonicalPath={`/watch/${courseId}`} noindex />

      <div className="h-[100dvh] bg-academy-surface text-academy-textMain flex flex-col select-none overflow-hidden">
        {/* Header : retour, titre du cours, progression globale */}
        <header className="h-16 flex-shrink-0 border-b border-academy-border bg-white dark:bg-academy-surfaceDark flex items-center px-4 sm:px-6 justify-between gap-4 z-50">
          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            <button onClick={() => navigate('/my-courses')} className="flex items-center gap-2 text-academy-textMain/60 hover:text-academy-textMain text-sm font-medium transition-colors flex-shrink-0">
              <ArrowLeft size={16} />
              <span className="hidden sm:inline">{t('watch.my_courses')}</span>
            </button>
            <div className="h-4 w-px bg-academy-border flex-shrink-0" />
            <h1 className="font-display font-bold text-academy-textMain text-sm sm:text-base truncate">
              {course.title}
            </h1>
          </div>

          {/* Pastille de progression */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="hidden sm:flex items-center gap-2 text-xs font-bold text-academy-textMain/50">
              <span>{progress.size}/{lessons.length}</span>
              <span className="text-academy-textMain/30">{t('watch.completed_lessons')}</span>
            </div>
            <div className="relative w-9 h-9 flex-shrink-0" title={`${completionPercent}%`}>
              <svg className="w-9 h-9 -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="15" fill="none" stroke="var(--clr-border)" strokeWidth="3" />
                <circle
                  cx="18" cy="18" r="15" fill="none" stroke="var(--clr-primary)" strokeWidth="3"
                  strokeLinecap="round"
                  strokeDasharray={`${(completionPercent / 100) * 94.25} 94.25`}
                  className="transition-all duration-500"
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-academy-primary">
                {completionPercent}
              </span>
            </div>
          </div>
        </header>

        {/* Main Content (Player + Lessons List) */}
        <div className="flex-1 min-h-0 flex flex-col lg:flex-row bg-academy-surface overflow-hidden">
          {/* Left / Top: Video Player Area */}
          <div className="flex-1 min-h-0 flex flex-col overflow-y-auto lg:overflow-hidden hide-scrollbar relative z-10">
            {/* Zone Vidéo Sombre — occupe la hauteur disponible sans bande noire inutile */}
            <div className="w-full bg-[#0a0a0a] flex items-center justify-center flex-shrink-0 lg:flex-1 lg:min-h-0 p-0 lg:p-5">
              <div
                onContextMenu={(e) => e.preventDefault()}
                className="w-full max-w-6xl aspect-video lg:max-h-full bg-black lg:rounded-xl overflow-hidden relative lg:shadow-2xl flex items-center justify-center group lg:ring-1 lg:ring-white/10"
              >
                {/* Overlay Anti-capture quand l'écran perd le focus */}
                {isBlackout && (
                  <div className="absolute inset-0 bg-black z-50 flex flex-col items-center justify-center p-6 text-center pointer-events-auto">
                    <ShieldAlert className="w-16 h-16 text-academy-primary mb-3 animate-pulse" />
                    <p className="font-display font-bold text-white text-lg">{t('watch.protected_content')}</p>
                    <p className="text-white/50 text-xs mt-1">{t('watch.playback_paused')}</p>
                  </div>
                )}

                {/* Watermark Filigrane Anti-piratage (Dynamique & Aléatoire) */}
                <DynamicWatermark email={user?.email || t('watch.certified_student')} />

                {videoError ? (
                  <div className="p-6 text-center max-w-md z-50">
                    <Lock className="w-12 h-12 text-academy-primary mx-auto mb-3" />
                    <p className="font-semibold text-white text-sm mb-1">{t('watch.playback_unavailable') || 'Lecture non disponible'}</p>
                    <p className="text-white/50 text-xs mb-5">{videoError}</p>
                    <button 
                      onClick={() => {
                        setVideoError(null);
                        setUseAlternativePlayer(true);
                      }}
                      className="bg-academy-primary/20 hover:bg-academy-primary/30 text-academy-primary font-bold py-2 px-4 rounded-xl text-xs transition-colors"
                    >
                      Essayer le lecteur secondaire
                    </button>
                  </div>
                ) : activeLesson?.externalVideoUrl ? (
                  <UniversalVideoPlayer 
                    key={activeLesson.id}
                    url={activeLesson.externalVideoUrl} 
                    className="w-full h-full border-0 lg:rounded-2xl shadow-none"
                    initialTime={parseFloat(localStorage.getItem(`mylta_video_progress_${courseId}_${activeLesson.id}`)) || 0}
                    onTimeUpdate={(target) => handleTimeUpdate(target.currentTime)}
                  />
                ) : videoBlobUrl || videoLoading ? (
                  <>
                    {useAlternativePlayer ? (
                      <StandardPlayer
                        key={activeLesson.id + '-alt'}
                        url={videoBlobUrl}
                        onEnded={handleVideoEnded}
                        onTimeUpdate={handleTimeUpdate}
                        initialTime={parseFloat(localStorage.getItem(`mylta_video_progress_${courseId}_${activeLesson.id}`)) || 0}
                      />
                    ) : (
                      <PremiumPlayer
                        key={activeLesson.id}
                        videoUrl={videoBlobUrl}
                        onEnded={handleVideoEnded}
                        onTimeUpdate={handleTimeUpdate}
                        initialTime={parseFloat(localStorage.getItem(`mylta_video_progress_${courseId}_${activeLesson.id}`)) || 0}
                        onError={(e) => {
                          console.error('Video Player Error:', e)
                          setVideoError(t('watch.network_error') || 'Erreur de lecture vidéo. Le flux réseau a été interrompu.')
                        }}
                      />
                    )}
                  </>
                ) : (
                  <p className="text-white/40 text-sm">{t('watch.select_lesson')}</p>
                )}
              </div>
            </div>

            {/* Infos leçon courante + navigation */}
            {activeLesson && (
              <div className="flex-shrink-0 bg-white dark:bg-academy-surfaceDark border-t border-academy-border lg:max-h-[42%] lg:overflow-y-auto hide-scrollbar">
                <div className="max-w-6xl mx-auto w-full px-5 py-4 sm:px-7 sm:py-5">
                  {/* Ligne méta + action */}
                  <div className="flex items-center justify-between gap-4 mb-2.5 flex-wrap">
                    <div className="flex items-center gap-2 text-xs font-bold text-academy-textMain/50">
                      <span className="text-academy-primary">
                        {t('watch.lesson')} {activeLesson.order}
                      </span>
                      <span className="text-academy-textMain/25">/</span>
                      <span>{lessons.length}</span>
                      {activeLesson.duration && (
                        <>
                          <span className="text-academy-textMain/25">·</span>
                          <span className="inline-flex items-center gap-1">
                            <Clock size={12} /> {activeLesson.duration}
                          </span>
                        </>
                      )}
                    </div>

                    <button
                      onClick={(e) => toggleLessonProgress(activeLesson.id, e)}
                      className={`inline-flex items-center gap-2 text-xs font-bold px-3.5 py-2 rounded-xl border transition-all
                        ${progress.has(activeLesson.id)
                          ? 'bg-green-50 dark:bg-green-500/10 border-green-300 text-green-700 dark:text-green-300 hover:bg-green-100'
                          : 'bg-academy-surface border-academy-border text-academy-textMain/70 hover:border-academy-primary/50 hover:text-academy-primary'
                        }`}
                    >
                      {progress.has(activeLesson.id)
                        ? <><Check size={14} strokeWidth={3} /> {t('watch.lesson_done')}</>
                        : <><CheckCircle size={14} /> {t('watch.mark_done')}</>
                      }
                    </button>
                  </div>

                  {/* Titre */}
                  <h2 className="font-display font-black text-xl sm:text-2xl text-academy-textMain tracking-tight leading-snug">
                    {activeLesson.title}
                  </h2>

                  {activeLesson.description && (
                    <p className="text-academy-textMain/60 text-sm leading-relaxed mt-1.5">
                      {activeLesson.description}
                    </p>
                  )}

                  {/* Navigation précédent / suivant */}
                  <div className="flex items-center justify-between gap-3 mt-4 pt-4 border-t border-academy-border">
                    <button
                      onClick={() => prevLesson && setActiveLesson(prevLesson)}
                      disabled={!prevLesson}
                      className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-academy-textMain/70 hover:text-academy-primary
                                 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:text-academy-textMain/70 transition-colors min-w-0"
                    >
                      <ChevronLeft size={18} className="flex-shrink-0" />
                      <span className="truncate">{t('watch.prev_lesson')}</span>
                    </button>

                    <button
                      onClick={() => {
                        if (!nextLesson) return
                        if (isLessonLocked(nextLesson)) {
                          toastError(t('watch.finish_previous'))
                          return
                        }
                        setActiveLesson(nextLesson)
                      }}
                      disabled={!nextLesson}
                      className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold px-4 py-2.5 rounded-xl bg-academy-primary text-academy-onPrimary
                                 hover:bg-academy-dark disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-academy-primary
                                 transition-all shadow-sm min-w-0"
                    >
                      <span className="truncate">{t('watch.next_lesson')}</span>
                      {nextLesson && isLessonLocked(nextLesson)
                        ? <Lock size={15} className="flex-shrink-0" />
                        : <ChevronRight size={18} className="flex-shrink-0" />
                      }
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Sidebar: Lessons List */}
          <div className="flex-shrink-0 lg:flex-none w-full lg:w-[360px] bg-white dark:bg-academy-surfaceDark border-t lg:border-t-0 lg:border-l border-academy-border flex flex-col z-20 overflow-hidden relative">
            <div className="px-5 py-4 border-b border-academy-border flex-shrink-0">
              <div className="flex items-center justify-between gap-3 mb-3">
                <h3 className="font-display font-black text-academy-textMain text-sm flex items-center gap-2 uppercase tracking-wide">
                  <BookOpen size={15} className="text-academy-primary" />
                  {t('watch.course_program')}
                </h3>
                <span className="text-xs font-black text-academy-primary tabular-nums">
                  {completionPercent}%
                </span>
              </div>

              {/* Barre de progression */}
              <div className="w-full bg-academy-border/60 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-academy-primary h-1.5 rounded-full transition-all duration-500"
                  style={{ width: `${completionPercent}%` }}
                />
              </div>

              {progress.size === lessons.length && lessons.length > 0 && (
                <button
                  onClick={() => setShowReviewModal(true)}
                  className="mt-4 w-full bg-yellow-400 hover:bg-yellow-300 text-black font-bold py-2.5 px-4 text-sm rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm"
                >
                  <Star size={16} className="fill-black" /> {t('watch.rate_course')}
                </button>
              )}
            </div>

            <div className="flex-1 overflow-y-auto p-2.5 space-y-1 hide-scrollbar bg-white dark:bg-academy-surfaceDark max-h-[38vh] lg:max-h-none">
              {lessons.map((lesson) => {
                const isActive = activeLesson?.id === lesson.id
                const isCompleted = progress.has(lesson.id)
                const isLocked = isLessonLocked(lesson)
                return (
                  <button
                    key={lesson.id}
                    onClick={() => {
                      if (isLocked) {
                        toastError(t('watch.finish_previous'))
                        return
                      }
                      setActiveLesson(lesson)
                    }}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all duration-200 border-l-[3px]
                              ${isActive
                                ? 'bg-academy-primary/[0.06] border-l-academy-primary'
                                : isLocked
                                  ? 'border-l-transparent cursor-not-allowed'
                                  : 'border-l-transparent hover:bg-academy-surface'
                              }`}
                  >
                    {/* Pastille : coche si terminé, sinon numéro */}
                    <div
                      onClick={(e) => !isLocked && toggleLessonProgress(lesson.id, e)}
                      className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-[11px] font-black transition-all duration-200 border-2
                        ${isCompleted
                          ? 'bg-green-500 border-green-500 text-white cursor-pointer'
                          : isLocked
                            ? 'border-academy-border text-academy-textMain/30'
                            : isActive
                              ? 'border-academy-primary text-academy-primary cursor-pointer'
                              : 'border-academy-border text-academy-textMain/40 hover:border-academy-primary/60 cursor-pointer'
                        }`}
                    >
                      {isCompleted ? <Check size={14} strokeWidth={3.5} /> : lesson.order}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className={`text-[13px] font-bold leading-snug line-clamp-2 ${
                        isActive ? 'text-academy-primary' : isLocked ? 'text-academy-textMain/40' : 'text-academy-textMain'
                      }`}>
                        {lesson.title}
                      </p>
                      {lesson.duration && (
                        <p className={`text-[11px] mt-0.5 flex items-center gap-1 font-medium ${
                          isActive ? 'text-academy-primary/60' : 'text-academy-textMain/40'
                        }`}>
                          <Clock size={11} /> {lesson.duration}
                        </p>
                      )}
                    </div>

                    {isLocked ? (
                      <Lock size={14} className="text-academy-textMain/30 flex-shrink-0" />
                    ) : isActive ? (
                      <Play size={14} className="text-academy-primary flex-shrink-0" fill="currentColor" />
                    ) : null}
                  </button>
                )
              })}
            </div>


          </div>
        </div>
      </div>

      {showCertificate && (
        <StudentCertificate 
          studentName={user?.name || 'Étudiant'} 
          courseName={course?.title || 'Formation'} 
          onClose={() => setShowCertificate(false)} 
        />
      )}

      {showReviewModal && (
        <LeaveReviewModal 
          courseId={courseId} 
          courseName={course?.title || 'Formation'} 
          onClose={() => setShowReviewModal(false)} 
        />
      )}
    </>
  )
}
