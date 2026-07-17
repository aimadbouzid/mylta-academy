// WatchCoursePage.jsx — Lecteur de cours ultra-interactif et sécurisé pour l'étudiant
import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  Play, CheckCircle, Lock, ArrowLeft, BookOpen, Clock, AlertCircle, Star,
  RotateCcw, RotateCw, ShieldAlert, PlayCircle
} from 'lucide-react'
import Navbar from '../components/Navbar'
import SEOHead from '../components/SEOHead'
import { useToast } from '../hooks/useToast'
import { useAuth } from '../context/AuthContext'
import { useSocket } from '../context/SocketContext'
import { useLanguage } from '../context/LanguageContext'
import api from '../api/axios'
import PremiumPlayer from '../components/PremiumPlayer'


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

    const loadVideo = async () => {
      try {
        const { data } = await api.post(`/video/token/${activeLesson.id}`)
        if (cancelled) return

        const isDev = import.meta.env.DEV
        const baseUrl = isDev ? 'http://localhost:3000/api' : '/api'
        setVideoBlobUrl(`${baseUrl}/video/${activeLesson.id}?vtoken=${data.videoToken}`)
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
    }
  }, [activeLesson])

  // Anti-screenshot / Anti-recording handlers (Visibility API & Focus)
  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden) setIsBlackout(true)
      else setIsBlackout(false)
    }
    const handleBlur = () => setIsBlackout(true)
    const handleFocus = () => setIsBlackout(false)

    document.addEventListener('visibilitychange', handleVisibility)
    window.addEventListener('blur', handleBlur)
    window.addEventListener('focus', handleFocus)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibility)
      window.removeEventListener('blur', handleBlur)
      window.removeEventListener('focus', handleFocus)
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

  const handleVideoEnded = () => {
    if (!progress.has(activeLesson.id)) {
      const newSet = new Set(progress)
      newSet.add(activeLesson.id)
      setProgress(newSet)
      api.post(`/courses/${courseId}/progress`, { lessonId: activeLesson.id, isCompleted: true }).catch(() => {})
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
          <p className="text-academy-textMain/50 text-sm max-w-md mb-6">{error || t('watch.buy_to_watch')}</p>
          <Link to="/courses" className="btn-primary text-sm py-2.5 px-6">
            {t('watch.back_to_catalog')}
          </Link>
        </div>
      </div>
    )
  }

  return (
    <>
      <SEOHead title={`Visionner: ${course.title}`} description="Espace de visionnage sécurisé Mylta Academy" canonicalPath={`/watch/${courseId}`} />

      <div className="h-[100dvh] bg-academy-surface text-academy-textMain flex flex-col select-none overflow-hidden">
        {/* Header simple avec retour */}
        <header className="h-16 flex-shrink-0 border-b border-academy-border bg-academy-surfaceDark flex items-center px-6 justify-between z-50">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/my-courses')} className="flex items-center gap-2 text-academy-textMain/60 hover:text-academy-textMain text-sm transition-colors">
              <ArrowLeft size={16} />
              <span className="hidden sm:inline">{t('watch.my_courses')}</span>
            </button>
            <div className="h-4 w-px bg-academy-border" />
            <h1 className="font-display font-bold text-academy-textMain text-base truncate max-w-md sm:max-w-xl">
              {course.title}
            </h1>
          </div>
        </header>

        {/* Main Content (Player + Lessons List) */}
        <div className="flex-1 flex flex-col lg:flex-row bg-academy-surface overflow-hidden">
          {/* Left / Top: Video Player Area */}
          <div className="flex-none lg:flex-1 flex flex-col overflow-y-auto hide-scrollbar lg:border-none pb-4 lg:pb-0 relative z-10">
            {/* Zone Vidéo Sombre */}
            <div className="w-full bg-[#0a0a0a] border-b border-academy-border/30 p-0 lg:p-8 flex flex-col justify-center flex-shrink-0">
              <div
                onContextMenu={(e) => e.preventDefault()}
                className="max-w-5xl mx-auto w-full aspect-video bg-black lg:rounded-2xl overflow-hidden relative lg:shadow-2xl flex items-center justify-center group lg:ring-1 lg:ring-white/10"
              >
                {/* Overlay Anti-capture quand l'écran perd le focus */}
                {isBlackout && (
                  <div className="absolute inset-0 bg-black z-50 flex flex-col items-center justify-center p-6 text-center pointer-events-auto">
                    <ShieldAlert className="w-16 h-16 text-academy-primary mb-3 animate-pulse" />
                    <p className="font-display font-bold text-white text-lg">{t('watch.protected_content')}</p>
                    <p className="text-white/50 text-xs mt-1">{t('watch.playback_paused')}</p>
                  </div>
                )}

                {/* Watermark Filigrane Anti-piratage */}
                <div className="absolute top-4 right-4 z-20 pointer-events-none opacity-25 select-none text-right font-mono text-[10px] text-white/80">
                  <div>MYLTA ACADEMY PROTECTED</div>
                  <div>{user?.email || t('watch.certified_student')}</div>
                </div>

                {videoError ? (
                  <div className="p-6 text-center max-w-md">
                    <Lock className="w-12 h-12 text-academy-primary mx-auto mb-3" />
                    <p className="font-semibold text-white text-sm mb-1">{t('watch.playback_unavailable')}</p>
                    <p className="text-white/50 text-xs">{videoError}</p>
                  </div>
                ) : videoBlobUrl || videoLoading ? (
                  <>
                    <PremiumPlayer
                      videoUrl={videoBlobUrl}
                      onEnded={handleVideoEnded}
                      onTimeUpdate={handleTimeUpdate}
                      onLoadedMetadata={handleLoadedMetadata}
                      onError={(e) => {
                        console.error('Video Player Error:', e)
                        setVideoError(t('watch.network_error'))
                      }}
                    />
                  </>
                ) : (
                  <p className="text-white/40 text-sm">{t('watch.select_lesson')}</p>
                )}
              </div>
            </div>

            {/* Current Lesson Info */}
            {activeLesson && (
              <div className="max-w-4xl mx-auto w-full mt-6 flex flex-col gap-3 px-1">
                <div className="flex items-center justify-between">
                  <h2 className="font-display font-black text-2xl sm:text-3xl text-academy-textMain tracking-tight">
                    <span className="text-academy-primary mr-2">{t('watch.lesson')} {activeLesson.order}:</span> 
                    {activeLesson.title}
                  </h2>
                </div>
                {activeLesson.description && (
                  <p className="text-academy-textMain/70 text-sm sm:text-base leading-relaxed">{activeLesson.description}</p>
                )}
                {activeLesson.duration && (
                  <div className="mt-2">
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold font-mono bg-academy-textMain/5 text-academy-textMain/70 px-3 py-1.5 rounded-lg border border-academy-border">
                      <Clock size={14} /> {activeLesson.duration}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Sidebar: Lessons List */}
          <div className="flex-1 lg:flex-none w-full lg:w-[400px] bg-white dark:bg-academy-surface border-t lg:border-t-0 lg:border-l border-academy-border flex flex-col shadow-soft-xl z-20 overflow-hidden relative">
            <div className="p-6 border-b border-academy-border bg-academy-surfaceDark/30 flex-shrink-0">
              <h3 className="font-display font-black text-academy-textMain text-lg flex items-center gap-2.5 mb-4">
                <div className="w-8 h-8 rounded-lg bg-academy-primary/10 flex items-center justify-center">
                  <BookOpen size={16} className="text-academy-primary" />
                </div>
                {t('watch.course_program')}
              </h3>

              {/* Progress bar */}
              <div className="flex justify-between text-xs font-bold text-academy-textMain/50 mb-2">
                <span>{t('watch.progress')}</span>
                <span className="font-mono text-academy-primary">{progress.size} / {course.lessons?.length || 0}</span>
              </div>
              <div className="w-full bg-academy-border/50 rounded-full h-2 overflow-hidden">
                <div className="bg-gradient-to-r from-academy-primary to-red-400 h-2 rounded-full transition-all duration-500" style={{ width: `${course.lessons?.length > 0 ? (progress.size / course.lessons.length) * 100 : 0}%` }} />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2 hide-scrollbar bg-academy-surface">
              {course.lessons?.map((lesson) => {
                const isActive = activeLesson?.id === lesson.id
                const isCompleted = progress.has(lesson.id)
                return (
                  <button
                    key={lesson.id}
                    onClick={() => setActiveLesson(lesson)}
                    className={`w-full flex items-center gap-4 p-3.5 rounded-2xl text-left transition-all duration-300 border
                              ${isActive
                                ? 'bg-white dark:bg-academy-surfaceDark border-academy-primary/40 shadow-md ring-1 ring-academy-primary/20 scale-[1.02]'
                                : 'bg-transparent border-transparent hover:bg-academy-border/30'
                              }`}
                  >
                    <div onClick={(e) => toggleLessonProgress(lesson.id, e)} className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 cursor-pointer transition-all duration-300 border-2
                                  ${isCompleted ? 'bg-green-500 border-green-500 text-white shadow-inner' : isActive ? 'border-academy-primary/50 text-transparent' : 'border-academy-border hover:border-academy-primary/50 text-transparent'}`}>
                      <CheckCircle size={14} className={isCompleted ? 'text-white' : 'opacity-0'} strokeWidth={3} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-bold truncate ${isActive ? 'text-academy-primary' : 'text-academy-textMain'}`}>
                        {lesson.order}. {lesson.title}
                      </p>
                      {lesson.duration && (
                        <p className={`text-[11px] mt-1 flex items-center gap-1.5 font-mono font-medium ${isActive ? 'text-academy-textMain/70' : 'text-academy-textMain/40'}`}>
                          <Clock size={12} /> {lesson.duration}
                        </p>
                      )}
                    </div>
                    {isActive ? (
                       <div className="w-8 h-8 rounded-full bg-academy-primary/10 flex items-center justify-center">
                         <Play size={14} className="text-academy-primary flex-shrink-0 ml-0.5" fill="currentColor" />
                       </div>
                    ) : null}
                  </button>
                )
              })}
            </div>


          </div>
        </div>
      </div>
    </>
  )
}
