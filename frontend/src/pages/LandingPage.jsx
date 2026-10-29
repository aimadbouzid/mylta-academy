import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ArrowRight, Star, Shield, Infinity, CreditCard,
  Trophy, Users, BookOpen, TrendingUp, ChevronRight, Sparkles, ChevronDown, HelpCircle, ExternalLink,
  Instagram, Facebook, Download
} from 'lucide-react'
import Navbar from '../components/Navbar'
import SEOHead from '../components/SEOHead'
import CourseCard from '../components/CourseCard'
import UpcomingCourseCard from '../components/UpcomingCourseCard'
import UpcomingCourseModal from '../components/UpcomingCourseModal'
import LoginModal from '../components/LoginModal'
import PaymentModal from '../components/PaymentModal'
import FormationsHub from '../components/FormationsHub'
import FormationAd from '../components/FormationAd'
import InstagramFeed from '../components/InstagramFeed'
import Galerie from '../components/Galerie'
import PresentationReel from '../components/PresentationReel'
import CamdenPartner from '../components/CamdenPartner'
import IntroVideoModal from '../components/IntroVideoModal'
import UniversalVideoPlayer from '../components/UniversalVideoPlayer'
import Logo from '../components/Logo'
import { LoadingGrid, ErrorState } from '../components/LoadingSkeleton'
import { useSiteSettings } from '../context/SiteSettingsContext'
import { useCourses } from '../hooks/useCourses'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../context/LanguageContext'
import api from '../api/axios'
import ReviewModal from '../components/ReviewModal'
import WelcomeChoice from '../components/WelcomeChoice'
import { testimonialsData } from '../data/testimonialsData'

const FEATURE_STYLES = [
  { icon: Trophy, color: 'text-academy-primary', bg: 'bg-academy-primary/10', border: 'border-academy-primary/20' },
  { icon: CreditCard, color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
  { icon: Infinity, color: 'text-purple-500', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
  { icon: Shield, color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' }
]

export default function LandingPage() {
  const { isAuthenticated } = useAuth()
  const { t, currentLang } = useLanguage()
  const { courses, loading, error, refetch } = useCourses({})
  const [loginOpen,   setLoginOpen]   = useState(false)
  const [payModal,    setPayModal]    = useState(null)
  const [openFaq,     setOpenFaq]     = useState(null)
  const [upcomingOpen, setUpcomingOpen] = useState(null)
  
  const landingData = t('landing_data') || {}
  const features = landingData.features || []
  const faqItems = landingData.faq || []
  const heroPhrases = landingData.hero_phrases || []

  const [siteSettings, setSiteSettings] = useState({
    faq: faqItems,
    hero: { phrases: heroPhrases, subtitle: '' }
  })
  const [randomTestimonials, setRandomTestimonials] = useState([])
  const [siteReviews, setSiteReviews] = useState([]) // avis laissés par les visiteurs
  const [reviewOpen, setReviewOpen] = useState(false)
  const [reviewThanks, setReviewThanks] = useState(false)
  useEffect(() => {
    api.get('/reviews').then(({ data }) => setSiteReviews(data.reviews || [])).catch(() => {})
  }, [])
  const allReviews = [
    ...siteReviews.map(r => ({ name: r.fullName, role: r.role, text: r.text, avatar: r.fullName.charAt(0).toUpperCase(), visitor: true })),
    ...randomTestimonials,
  ]

  useEffect(() => {
    // Mélange l'ordre des témoignages aléatoirement et en prend un sous-ensemble (ex: 10)
    const shuffled = [...testimonialsData].sort(() => Math.random() - 0.5).slice(0, 10)
    setRandomTestimonials(shuffled)
  }, [])

  // Réglages issus du contexte partagé plutôt qu'un second appel /config/site
  const { settings: sharedSettings } = useSiteSettings()
  useEffect(() => {
    if (sharedSettings) setSiteSettings(sharedSettings)
  }, [sharedSettings])

  const [introOpen,   setIntroOpen]   = useState(false)
  const featuredCourses = courses.slice(0, 3)

  const handleCloseIntro = () => {
    setIntroOpen(false)
  }

  const handleAccessClick = (course) => {
    if (!isAuthenticated) return setLoginOpen(true)
    setPayModal(course)
  }

  return (
    <>
      <SEOHead
        title="Formation Premium en Algérie"
        description="Formation IA & Montage Vidéo, les 12, 13 et 14 novembre à Béjaïa. Filmer, monter et utiliser l'IA sur smartphone. 3 jours en présentiel, 10 places."
        canonicalPath="/"
        ogImage="/og-formation.png"
      />

      <div className="min-h-screen bg-academy-surface overflow-hidden relative">
        <Navbar onLoginClick={() => setLoginOpen(true)} />

        {/* HERO SECTION */}
        <section className="relative flex items-center pt-32 sm:pt-36 lg:pt-40 pb-4 lg:pb-8 overflow-hidden">
          {/* Background grid pattern */}
          <div className="absolute inset-0 grid-pattern pointer-events-none opacity-40 z-0" />
          
          {/* Blobs de flou localisés pour l'accueil (Neutral/Blueish tones).
              En thème sombre leur opacité est fortement réduite : ces teintes
              pastel, pensées pour un fond clair, voilaient le noir de gris. */}
          <div className="absolute top-[5%] left-[-15%] w-[60vw] h-[60vw] rounded-full bg-blue-400/10 dark:bg-blue-400/[0.04] pointer-events-none select-none z-0 animate-pulse-slow" style={{ filter: 'blur(130px)', WebkitFilter: 'blur(130px)' }} />
          <div className="absolute bottom-[0%] right-[-15%] w-[55vw] h-[55vw] rounded-full bg-indigo-400/10 dark:bg-indigo-400/[0.04] pointer-events-none select-none z-0 animate-pulse-slow" style={{ filter: 'blur(130px)', WebkitFilter: 'blur(130px)' }} />
          <div className="absolute top-[40%] right-[10%] w-[40vw] h-[40vw] rounded-full bg-gray-300/20 dark:bg-gray-300/[0.03] pointer-events-none select-none z-0 animate-pulse-slow" style={{ filter: 'blur(110px)', WebkitFilter: 'blur(110px)' }} />
          
          <div className="section-container relative z-10 flex flex-col lg:flex-row items-center gap-6 lg:gap-10">
            <div className="flex-1 text-center lg:text-left">

              {/* Titre Principal Pro */}
              <h1 className="font-display text-[26px] sm:text-5xl lg:text-6xl font-black leading-[1.15] mb-3 lg:mb-6 text-academy-textMain tracking-tight">
                {landingData.hero_title ? (
                  <>
                    {landingData.hero_title.split(' ').slice(0, -1).join(' ')}{' '}
                    <span className="text-gray-900 dark:text-academy-textMain">{landingData.hero_title.split(' ').pop()}</span>
                  </>
                ) : (
                  <>Les compétences d&apos;aujourd&apos;hui, le succès de <span className="text-gray-900 dark:text-academy-textMain">demain</span></>
                )}
              </h1>

              {/* Sous-titre */}
              <p className="text-sm sm:text-base lg:text-lg text-academy-textMain/70 font-medium leading-snug sm:leading-relaxed mb-4 lg:mb-8 max-w-xl mx-auto lg:mx-0">
                {landingData.hero_subtitle || siteSettings.hero?.subtitle || "L'IA, la vidéo et le web, en pratique. En ligne ou à Béjaïa."}
              </p>

              {/* Boutons d'action — volontairement sobres : pas de dégradé,
                  de halo ni de reflet animé, qui donnaient un rendu générique. */}
              <div className="flex flex-row gap-3 justify-center lg:justify-start mb-4 lg:mb-8">
                <Link
                  to="/courses"
                  className="group inline-flex items-center justify-center gap-1.5 py-2 px-4 rounded-md bg-academy-textMain text-academy-surface text-[13px] font-semibold hover:opacity-90 transition-opacity"
                >
                  {t('landing.discover_courses')}
                  <ArrowRight size={14} className="opacity-60 group-hover:translate-x-0.5 transition-transform" />
                </Link>
                <a
                  href="/guide-aimad-bouzidi.pdf"
                  download
                  className="inline-flex items-center justify-center gap-1.5 py-2 px-4 rounded-md border border-academy-border text-academy-textMain text-[13px] font-semibold hover:bg-academy-textMain/[0.04] transition-colors"
                >
                  <Download size={14} className="opacity-60" />
                  {t('landing.download_guide')}
                </a>
              </div>

              {/* Moyens de paiement : simple mention en ligne.
                  Doit refléter les moyens réellement acceptés (cf. sous-titre
                  et PaymentModal) : Edahabia et CIB passent par Chargily. */}
              <div className="hidden sm:flex flex-wrap items-center justify-center lg:justify-start gap-x-3 gap-y-1.5 sm:border-t sm:border-academy-border sm:pt-4 sm:mt-2">
                <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-academy-textMain/45">
                  <CreditCard size={14} />
                  {t('landing.local_payment')}
                </span>
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-1">
                  {['Edahabia', 'CIB', 'CCP', 'BaridiMob', 'RedotPay'].map(label => (
                    <span
                      key={label}
                      className="rounded-md border border-academy-border bg-academy-textMain/[0.04] px-2 py-0.5 sm:px-2.5 sm:py-1 text-[11px] sm:text-[13px] font-semibold text-academy-textMain/85"
                    >
                      {label}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="flex-1 w-full mt-4 lg:mt-0">
              {/* Lecteur de présentation intégré au hero : visible et lisible
                  directement, à côté du texte. Le flou est un halo décoratif
                  POSÉ DERRIÈRE (même procédé que les blobs du hero), pas un
                  flou du fond du lecteur lui-même.
                  Affichage conditionnel : tant que les réglages ne sont pas
                  chargés on n'affiche rien, plutôt que l'état vide du lecteur
                  (dont le texte s'adresse à l'admin, pas au visiteur). */}
              <div className="relative max-w-xl mx-auto lg:mr-0">
                <div className="absolute -inset-8 rounded-full bg-academy-primary/20 dark:bg-academy-primary/[0.07] pointer-events-none select-none z-0" style={{ filter: 'blur(60px)', WebkitFilter: 'blur(60px)' }} />
                {siteSettings.inPerson?.enabled ? (
                  <div className="relative z-10"><PresentationReel /></div>
                ) : /^\/[^/].*\.(mp4|webm)$/i.test(siteSettings.introVideoUrl || '') ? (
                  <video
                    src={siteSettings.introVideoUrl}
                    poster={siteSettings.introVideoUrl.replace(/\.(mp4|webm)$/i, '-poster.jpg')}
                    autoPlay muted loop playsInline
                    aria-label="Vidéo de présentation Mylta Academy"
                    className="relative z-10 w-full aspect-video rounded-2xl shadow-soft-lg bg-black object-cover"
                  />
                ) : siteSettings.introVideoUrl && (
                  <div className="relative z-10">
                    <UniversalVideoPlayer
                      url={siteSettings.introVideoUrl}
                      title="Vidéo de présentation Mylta Academy"
                      facade
                    />
                    {/* Repli : si le lecteur tiers ne charge pas (bloqueur de pub,
                        navigateur intégré Instagram/TikTok, réseau filtré), le
                        cadre reste noir et la vidéo est alors inaccessible
                        depuis la page. Ce lien donne toujours une porte de sortie. */}
                    <a
                      href={siteSettings.introVideoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-academy-textMain/55 hover:text-academy-primary transition-colors"
                    >
                      <ExternalLink size={13} />
                      {t('landing.watch_video')}
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        <FormationAd inPerson={siteSettings.inPerson} />

        {siteSettings.contest?.enabled && !(siteSettings.contest.endDate && siteSettings.contest.endDate < new Date().toISOString().slice(0, 10)) && (
          <section className="section-container pt-4">
            <Link to="/concours" className="group relative flex max-w-3xl lg:max-w-none mx-auto bg-white border border-academy-border rounded-xl overflow-hidden hover:border-academy-textMain/30 transition-colors">
              {/* Talon de ticket */}
              <span className="shrink-0 flex items-center px-1.5 sm:px-2 bg-academy-primary text-academy-onPrimary">
                <span className="[writing-mode:vertical-rl] rotate-180 text-[8px] font-bold uppercase tracking-[0.12em]">Concours</span>
              </span>
              <span className="border-l-2 border-dashed border-academy-border" />
              <span className="flex-1 min-w-0 flex items-center justify-between gap-3 px-4 py-3.5">
                <span className="min-w-0">
                  <span className="block font-display font-black text-sm sm:text-base leading-tight text-academy-textMain">{siteSettings.contest.title}</span>
                  <span className="block text-xs text-academy-textMain/55 mt-0.5">Présentiel ou en ligne · tirage au sort</span>
                </span>
                <span className="shrink-0 inline-flex items-center gap-1.5 btn-glow [--glow:rgb(200_40_40_/_0.55)] rounded-lg bg-academy-primary text-academy-onPrimary px-3 py-1.5 text-[13px] font-bold group-hover:opacity-90 transition-opacity">Participer <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" /></span>
              </span>
            </Link>
          </section>
        )}

        {/* Formations gratuites au club scientifique de l'université de Béjaïa :
            un seul lien à partager au club, qui mène à l'inscription.
            Masqué tant que « Bandeau université » est coupé dans les réglages. */}
        {siteSettings.modules?.clubBannerEnabled === true && (
        <section className="section-container pt-4">
          <Link to="/club" className="group relative flex max-w-3xl lg:max-w-none mx-auto bg-white border border-academy-border rounded-xl overflow-hidden hover:border-academy-textMain/30 transition-colors">
            <span className="shrink-0 flex items-center px-1.5 sm:px-2 bg-academy-textMain text-academy-surface">
              <span className="[writing-mode:vertical-rl] rotate-180 text-[8px] font-bold uppercase tracking-[0.12em]">Gratuit</span>
            </span>
            <span className="flex-1 min-w-0 flex items-center justify-between gap-3 px-4 py-3.5">
              <span className="min-w-0">
                <span className="block font-display font-black text-sm sm:text-base leading-tight text-academy-textMain">Formations gratuites à l'université de Béjaïa</span>
                <span className="block text-xs text-academy-textMain/55 mt-0.5">Club scientifique · Targa Ouzemmour</span>
              </span>
              <span className="shrink-0 inline-flex items-center gap-1.5 btn-glow [--glow:rgb(30_64_175_/_0.45)] rounded-lg bg-academy-textMain text-academy-surface px-3 py-1.5 text-[13px] font-bold group-hover:opacity-90 transition-opacity">M'inscrire <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" /></span>
            </span>
          </Link>
        </section>
        )}

        {/* Le présentiel a déjà son annonce en tête : ici, seulement les autres formules. */}
        <FormationsHub coaching={siteSettings.coaching} express={siteSettings.express} />

        <Galerie />

        <InstagramFeed instagram={siteSettings.instagram} />

        <CamdenPartner />

        {/* FORMATIONS */}
        <section className="pt-2 lg:pt-4 pb-8 lg:pb-12 border-t border-academy-border relative overflow-hidden">
          <div className="absolute top-[10%] left-[-10%] w-[45vw] h-[45vw] rounded-full bg-academy-primary/15 dark:bg-academy-primary/[0.06] pointer-events-none select-none z-0" style={{ filter: 'blur(120px)', WebkitFilter: 'blur(120px)' }} />
          <div className="absolute bottom-[10%] right-[-10%] w-[40vw] h-[40vw] rounded-full bg-blue-300/20 dark:bg-blue-300/[0.05] pointer-events-none select-none z-0" style={{ filter: 'blur(100px)', WebkitFilter: 'blur(100px)' }} />
          <div className="section-container relative z-10">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
              <div>
                <h2 className="font-display font-black text-3xl sm:text-4xl text-academy-textMain tracking-tight">
                  {t('landing.our_courses')}
                </h2>
              </div>
              <Link to="/courses" className="group flex items-center gap-1.5 text-sm font-bold text-academy-textMain hover:text-academy-primary transition-colors bg-white dark:bg-academy-surfaceDark hover:bg-red-50 px-5 py-2.5 rounded-full border border-academy-border shadow-sm w-fit">
                {t('landing.view_all')} <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {loading && <LoadingGrid count={3} />}
            {error && <ErrorState message={error} onRetry={refetch} />}
            {!loading && !error && (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
                {featuredCourses.map(c => (
                  <CourseCard key={c.id} course={c} onAccessClick={handleAccessClick} />
                ))}
              </div>
            )}
            {(siteSettings.upcomingCourses || []).length > 0 && (
              <div className={featuredCourses.length ? 'mt-8' : ''}>
                <h3 className="font-display font-bold text-lg sm:text-xl text-academy-textMain mb-3">Bientôt disponibles</h3>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                  {siteSettings.upcomingCourses.map(c => (
                    <UpcomingCourseCard key={c.id || c.title} course={c} onDetails={setUpcomingOpen} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* FEATURES */}
        <section id="mission" className="pt-4 lg:pt-6 pb-10 lg:pb-12 bg-academy-surfaceDark/40 relative border-t border-academy-border overflow-hidden">
          <div className="absolute top-[20%] left-[-15%] w-[45vw] h-[45vw] rounded-full bg-purple-300/20 dark:bg-purple-300/[0.05] pointer-events-none select-none z-0" style={{ filter: 'blur(120px)', WebkitFilter: 'blur(120px)' }} />
          <div className="absolute bottom-[20%] right-[-15%] w-[45vw] h-[45vw] rounded-full bg-red-300/20 dark:bg-red-300/[0.05] pointer-events-none select-none z-0" style={{ filter: 'blur(120px)', WebkitFilter: 'blur(120px)' }} />
          <div className="section-container relative z-10">
            <div className="text-center mb-6">
              <h2 className="font-display font-bold text-2xl text-academy-textMain mb-2">
                {t('landing.why_choose')} <span className="text-academy-primary">{t('landing.academy')}</span>
              </h2>
              <p className="text-academy-textMain/60 font-medium max-w-lg mx-auto text-sm">
                {t('landing.why_desc')}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 lg:gap-4 max-w-4xl mx-auto">
              {features.map((f, i) => {
                const style = FEATURE_STYLES[i] || FEATURE_STYLES[0]
                const Icon = style.icon
                return (
                  <div key={f.title} className="card-academy p-3.5 flex items-center gap-3 md:flex-col md:items-start md:gap-2">
                    <div className={`w-9 h-9 shrink-0 rounded-xl ${style.bg} border ${style.border} flex items-center justify-center`}>
                      <Icon className={`w-[18px] h-[18px] ${style.color}`} />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-display font-bold text-[15px] text-academy-textMain leading-tight">{f.title}</h3>
                      <p className="text-academy-textMain/60 text-xs font-medium leading-snug mt-0.5">{f.desc}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* TESTIMONIALS */}
        <section id="testimonials" className="py-8 lg:py-12 bg-academy-surfaceDark/40 border-t border-academy-border overflow-hidden relative">
          <div className="absolute top-[10%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-indigo-400/20 dark:bg-indigo-400/[0.05] pointer-events-none select-none z-0" style={{ filter: 'blur(130px)', WebkitFilter: 'blur(130px)' }} />
          <div className="section-container text-center mb-12 relative z-10">
            <h2 className="font-display font-black text-3xl sm:text-4xl text-academy-textMain mb-3">
              {t('landing.students_reviews')} <span className="text-academy-primary">{t('landing.students')}</span>
            </h2>
            <p className="text-academy-textMain/60 font-medium text-sm max-w-md mx-auto">
              {t('landing.reviews_desc')}
            </p>
          </div>

          <div className="relative w-full overflow-hidden py-4">
            <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-24 sm:w-40 bg-gradient-to-r from-academy-surfaceDark to-transparent z-10" />
            <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-24 sm:w-40 bg-gradient-to-l from-academy-surfaceDark to-transparent z-10" />

            <div className="animate-marquee-track flex gap-3 px-4">
              {[...allReviews, ...allReviews].map((testimonial, idx) => (
                <div key={idx} className="card-academy p-3 w-[210px] sm:w-[260px] flex-shrink-0 group">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[9px] font-bold text-academy-primary tracking-wide uppercase">
                      {t('landing.student_review')}
                    </span>
                    {!testimonial.visitor && (
                      <span className="text-[8px] font-bold text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-500/15 px-1.5 py-0.5 rounded-full border border-green-200 dark:border-green-500/25">
                        {t('landing.verified')}
                      </span>
                    )}
                  </div>

                  <p className="text-academy-textMain/80 text-[11px] font-medium leading-snug mb-3 italic">
                    &quot;{testimonial.text}&quot;
                  </p>

                  <div className="pt-2.5 border-t border-academy-border flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-academy-primary/10 border border-academy-primary/20 flex items-center justify-center text-academy-primary font-bold text-[11px]">
                        {testimonial.avatar}
                      </div>
                      <div>
                        <p className="text-academy-textMain font-bold text-xs">{testimonial.name}</p>
                        <p className="text-academy-textMain/50 font-medium text-[10px]">{testimonial.role}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="section-container relative z-10 text-center mt-4">
            {reviewThanks
              ? <p className="text-sm font-bold text-emerald-700">Merci ! Votre avis est publié.</p>
              : <button type="button" onClick={() => isAuthenticated ? setReviewOpen(true) : setLoginOpen(true)}
                        className="text-sm font-bold border-b-2 border-academy-textMain hover:text-academy-primary hover:border-academy-primary">
                  Laisser un avis
                </button>}
          </div>
          {reviewOpen && (
            <ReviewModal onClose={() => setReviewOpen(false)}
                         onPublished={(r) => { if (r.id) setSiteReviews(rs => [r, ...rs]); setReviewOpen(false); setReviewThanks(true) }} />
          )}
        </section>

        {/* FAQ SECTION */}
        <section id="faq" className="scroll-mt-28 py-8 lg:py-12 border-t border-academy-border relative overflow-hidden">
          <div className="absolute top-[20%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-academy-primary/25 dark:bg-academy-primary/[0.08] pointer-events-none select-none z-0" style={{ filter: 'blur(130px)', WebkitFilter: 'blur(130px)' }} />
          <div className="section-container relative z-10">
            <div className="max-w-2xl mx-auto">
            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-academy-primary/10 border border-academy-primary/20 mb-3">
                <HelpCircle size={13} className="text-academy-primary" />
                <span className="text-academy-primary text-xs font-bold tracking-wide uppercase">FAQ</span>
              </div>
              <h2 className="font-display font-bold text-xl sm:text-2xl text-academy-textMain">
                {t('landing.faq')} <span className="text-academy-primary">— {t('landing.faq_answers')}</span>
              </h2>
            </div>

            <div className="space-y-2">
              {faqItems.map((item, index) => {
                const isOpen = openFaq === index
                return (
                  <div key={index} className={`card-academy overflow-hidden transition-all duration-300 ${isOpen ? 'border-academy-primary shadow-soft-lg' : ''}`}>
                    <button
                      onClick={() => setOpenFaq(isOpen ? null : index)}
                      className="w-full px-4 py-3 text-left flex items-center justify-between gap-3 focus:outline-none bg-red-950/5 border-red-900/10 backdrop-blur-md"
                    >
                      <span className="font-display font-bold text-sm sm:text-[15px] text-academy-textMain pr-1 leading-snug">
                        {item.question}
                      </span>
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center transition-transform duration-300 flex-shrink-0 ${
                        isOpen ? 'bg-academy-primary text-academy-onPrimary rotate-180' : 'bg-academy-surfaceDark text-academy-textMain/60'
                      }`}>
                        <ChevronDown size={15} />
                      </div>
                    </button>

                    {isOpen && (
                      <div className="px-4 pb-4 pt-2 text-academy-textMain/70 font-medium text-[13px] leading-relaxed border-t border-academy-border bg-red-950/5 border-red-900/10 backdrop-blur-md animate-fade-in">
                        {item.answer}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="border-t border-academy-border pt-16 pb-8 bg-academy-surfaceDark/50">
          <div className="section-container grid grid-cols-1 md:grid-cols-3 gap-10 mb-12">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Logo size="md" />
              </div>
              <p className="text-sm font-medium text-academy-textMain/60 max-w-sm leading-relaxed">
                {t('landing.footer_desc')}
              </p>
            </div>
            
            <div>
              <h4 className="font-display font-bold text-academy-textMain mb-5 uppercase tracking-wider text-sm">{t('landing.follow_us')}</h4>
              <ul className="space-y-4">
                <li>
                  <a href="https://instagram.com/mylta_academy" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-sm text-academy-textMain/60 hover:text-pink-500 transition-colors font-medium group">
                    <div className="p-2 rounded-lg bg-white/5 dark:bg-academy-surfaceDark/5 border border-academy-border/50 group-hover:bg-pink-500/10 group-hover:border-pink-500/30 transition-colors">
                      <Instagram size={16} />
                    </div>
                    @mylta_academy
                  </a>
                </li>
                <li>
                  <a href="https://www.facebook.com/profile.php?id=61584816975460" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-sm text-academy-textMain/60 hover:text-blue-500 transition-colors font-medium group">
                    <div className="p-2 rounded-lg bg-white/5 dark:bg-academy-surfaceDark/5 border border-academy-border/50 group-hover:bg-blue-500/10 group-hover:border-blue-500/30 transition-colors">
                      <Facebook size={16} />
                    </div>
                    Mylta Academy
                  </a>
                </li>
                <li>
                  <a href="https://tiktok.com/@mylta_academy" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-sm text-academy-textMain/60 hover:text-white transition-colors font-medium group">
                    <div className="p-2 rounded-lg bg-white/5 dark:bg-academy-surfaceDark/5 border border-academy-border/50 group-hover:bg-white/10 group-hover:border-white/30 transition-colors">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                        <path d="M19.589 6.686a4.793 4.793 0 0 1-3.97-5.824 2.864 2.864 0 0 0-1.467.247c-.506.241-.951.621-1.284 1.094-.334.472-.544 1.018-.607 1.574V15.42a4.4 4.4 0 0 1-1.391 3.23 4.407 4.407 0 0 1-3.149 1.258 4.408 4.408 0 0 1-3.23-1.392 4.408 4.408 0 0 1-1.258-3.148 4.4 4.4 0 0 1 1.391-3.231 4.408 4.408 0 0 1 3.149-1.258c.196 0 .391.013.585.039v3.029a1.365 1.365 0 0 0-.585-.13c-.361 0-.707.143-.962.398a1.36 1.36 0 0 0-.398.963c0 .36.143.707.398.962a1.36 1.36 0 0 0 .962.398c.36 0 .707-.143.962-.398a1.36 1.36 0 0 0 .398-.962V.203h3.04a7.87 7.87 0 0 0 4.394 5.258v3.08a4.846 4.846 0 0 1-1.977-.855v-1.001z"/>
                      </svg>
                    </div>
                    @mylta_academy
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-display font-bold text-academy-textMain mb-5 uppercase tracking-wider text-sm">{t('landing.info')}</h4>
              <ul className="space-y-4">
                <li><Link to="/courses" className="text-sm text-academy-textMain/60 hover:text-academy-primary transition-colors font-medium">{t('landing.catalog')}</Link></li>
                <li><button onClick={() => setIntroOpen(true)} className="text-sm text-academy-textMain/60 hover:text-academy-primary transition-colors font-medium">{t('landing.intro_video')}</button></li>
                <li><a href="https://wa.me/213795103743" target="_blank" rel="noopener noreferrer" className="text-sm text-academy-textMain/60 hover:text-academy-primary transition-colors font-medium">Contact WhatsApp</a></li>
              </ul>
            </div>
          </div>
          
          <div className="section-container flex flex-col md:flex-row items-center justify-between gap-4 pt-8 border-t border-academy-border/60 text-xs font-medium text-academy-textMain/40">
            <p>© {new Date().getFullYear()} Mylta Academy. {t('common.all_rights')}</p>
            <div className="flex gap-6">
              <Link to="/terms" className="hover:text-academy-textMain transition-colors">{t('landing.terms')}</Link>
              <Link to="/privacy" className="hover:text-academy-textMain transition-colors">{t('landing.privacy')}</Link>
            </div>
          </div>
        </footer>
      </div>

      <WelcomeChoice />
      {loginOpen  && <LoginModal   onClose={() => setLoginOpen(false)} onSuccess={() => setLoginOpen(false)} />}
      {upcomingOpen && <UpcomingCourseModal course={upcomingOpen} onClose={() => setUpcomingOpen(null)} />}
      {payModal   && <PaymentModal course={payModal} onClose={() => setPayModal(null)} />}
      {introOpen  && <IntroVideoModal onClose={handleCloseIntro} />}
    </>
  )
}
