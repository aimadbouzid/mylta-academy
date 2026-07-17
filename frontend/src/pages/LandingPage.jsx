import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ArrowRight, Star, Shield, Infinity, CreditCard,
  Trophy, Users, BookOpen, TrendingUp, ChevronRight, Sparkles, Play, ChevronDown, HelpCircle,
  Instagram, Facebook
} from 'lucide-react'
import Navbar from '../components/Navbar'
import SEOHead from '../components/SEOHead'
import CourseCard from '../components/CourseCard'
import LoginModal from '../components/LoginModal'
import PaymentModal from '../components/PaymentModal'
import IntroVideoModal from '../components/IntroVideoModal'
import Logo from '../components/Logo'
import { LoadingGrid, ErrorState } from '../components/LoadingSkeleton'
import { useCourses } from '../hooks/useCourses'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../context/LanguageContext'
import api from '../api/axios'
import { testimonialsData } from '../data/testimonialsData'

const FEATURE_STYLES = [
  { icon: Trophy, color: 'text-academy-primary', bg: 'bg-academy-primary/10', border: 'border-academy-primary/20' },
  { icon: CreditCard, color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
  { icon: Infinity, color: 'text-purple-500', bg: 'bg-purple-500/10', border: 'border-purple-500/20' }
]

export default function LandingPage() {
  const { isAuthenticated } = useAuth()
  const { t, currentLang } = useLanguage()
  const { courses, loading, error, refetch } = useCourses({})
  const [loginOpen,   setLoginOpen]   = useState(false)
  const [payModal,    setPayModal]    = useState(null)
  const [openFaq,     setOpenFaq]     = useState(null)
  
  const landingData = t('landing_data') || {}
  const features = landingData.features || []
  const stats = landingData.stats || []
  const faqItems = landingData.faq || []
  const heroPhrases = landingData.hero_phrases || []

  const [siteSettings, setSiteSettings] = useState({
    faq: faqItems,
    hero: { phrases: heroPhrases, subtitle: '' }
  })
  const [randomTestimonials, setRandomTestimonials] = useState([])

  useEffect(() => {
    // Mélange l'ordre des témoignages aléatoirement et en prend un sous-ensemble (ex: 10)
    const shuffled = [...testimonialsData].sort(() => Math.random() - 0.5).slice(0, 10)
    setRandomTestimonials(shuffled)
  }, [])

  useEffect(() => {
    api.get('/config/site')
      .then(res => {
        if (res.data?.settings) setSiteSettings(res.data.settings)
      })
      .catch(() => {})
  }, [])

  const [introOpen,   setIntroOpen]   = useState(() => {
    return !sessionStorage.getItem('myltaacademy_intro_seen')
  })
  const featuredCourses = courses.slice(0, 3)

  const handleCloseIntro = () => {
    sessionStorage.setItem('myltaacademy_intro_seen', 'true')
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
        description="Mylta Academy — Formations pratiques en Marketing Digital, Tech et Business. Paiement par CCP et BaridiMob."
        canonicalPath="/"
      />

      <div className="min-h-screen bg-academy-surface overflow-hidden relative">
        <Navbar onLoginClick={() => setLoginOpen(true)} />

        {/* HERO SECTION */}
        <section className="relative flex items-center pt-32 sm:pt-36 lg:pt-40 pb-4 lg:pb-8 overflow-hidden">
          {/* Background grid pattern */}
          <div className="absolute inset-0 grid-pattern pointer-events-none opacity-40 z-0" />
          
          {/* Blobs de flou localisés pour l'accueil (Neutral/Blueish tones) */}
          <div className="absolute top-[5%] left-[-15%] w-[60vw] h-[60vw] rounded-full bg-blue-400/10 pointer-events-none select-none z-0 animate-pulse-slow" style={{ filter: 'blur(130px)', WebkitFilter: 'blur(130px)' }} />
          <div className="absolute bottom-[0%] right-[-15%] w-[55vw] h-[55vw] rounded-full bg-indigo-400/10 pointer-events-none select-none z-0 animate-pulse-slow" style={{ filter: 'blur(130px)', WebkitFilter: 'blur(130px)' }} />
          <div className="absolute top-[40%] right-[10%] w-[40vw] h-[40vw] rounded-full bg-gray-300/20 pointer-events-none select-none z-0 animate-pulse-slow" style={{ filter: 'blur(110px)', WebkitFilter: 'blur(110px)' }} />
          
          <div className="section-container relative z-10 flex flex-col lg:flex-row items-center gap-6 lg:gap-10">
            <div className="flex-1 text-center lg:text-left">

              {/* Titre Principal Pro */}
              <h1 className="font-display text-3xl sm:text-5xl lg:text-6xl font-black leading-[1.15] mb-4 lg:mb-6 text-academy-textMain tracking-tight">
                {landingData.hero_title ? (
                  <>
                    {landingData.hero_title.split(' ').slice(0, -1).join(' ')}{' '}
                    <span className="text-gray-900">{landingData.hero_title.split(' ').pop()}</span>
                  </>
                ) : (
                  <>Les compétences d&apos;aujourd&apos;hui, le succès de <span className="text-gray-900">demain</span></>
                )}
              </h1>

              {/* Sous-titre */}
              <p className="text-sm sm:text-base lg:text-lg text-academy-textMain/70 font-medium leading-relaxed mb-6 lg:mb-8 max-w-xl mx-auto lg:mx-0">
                {landingData.hero_subtitle || siteSettings.hero?.subtitle || "Des cours structurés, concrets et conçus par des experts. Accédez aux meilleures formations et payez facilement via CCP ou BaridiMob."}
              </p>

              {/* Boutons d'action (Design compact & glassmorphism) */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start mb-6 lg:mb-8">
                <Link to="/courses" className="inline-flex items-center justify-center gap-2 py-2.5 px-6 rounded-full bg-gradient-to-br from-gray-800 to-black hover:from-gray-700 hover:to-gray-900 border border-white/20 text-white text-sm font-bold shadow-lg shadow-gray-900/40 animate-pulse-glow transition-all active:scale-95 group relative overflow-hidden">
                  <div className="absolute top-0 bottom-0 w-[40%] bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12 animate-shine pointer-events-none" />
                  <span className="relative z-10 drop-shadow-md">{t('landing.discover_courses')}</span>
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform relative z-10" />
                </Link>
                <button
                  onClick={() => setIntroOpen(true)}
                  className="inline-flex items-center justify-center gap-2 py-2.5 px-6 rounded-full bg-white/40 hover:bg-white/70 backdrop-blur-xl border border-white/50 text-academy-textMain text-sm font-bold shadow-sm transition-all active:scale-95 group"
                >
                  <div className="bg-white rounded-full p-1 shadow-sm group-hover:scale-110 transition-transform">
                    <Play size={12} fill="currentColor" className="text-academy-primary" />
                  </div>
                  {t('landing.intro_video')}
                </button>
              </div>

              {/* Badges Mode de Paiement - Design compact & animé */}
              <div className="flex flex-col sm:flex-row items-center sm:items-start lg:items-center justify-center lg:justify-start gap-3 sm:gap-4 border-t border-academy-border pt-2 mt-2 animate-fade-up" style={{ animationDelay: '0.4s' }}>
                <p className="text-[10px] sm:text-xs text-academy-textMain/50 font-bold uppercase tracking-widest sm:mt-1">{t('landing.local_payment')}</p>
                <div className="flex items-center gap-2">
                  <div className="text-[10px] sm:text-xs text-academy-textMain flex items-center gap-1.5 font-bold bg-white border border-academy-border px-3 py-1.5 rounded-full shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
                    <CreditCard size={14} className="text-academy-primary" /> CCP
                  </div>
                  <div className="text-[10px] sm:text-xs text-academy-textMain flex items-center gap-1.5 font-bold bg-white border border-academy-border px-3 py-1.5 rounded-full shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
                    <CreditCard size={14} className="text-blue-500" /> BaridiMob
                  </div>
                  <div className="text-[10px] sm:text-xs text-academy-textMain flex items-center gap-1.5 font-bold bg-white border border-academy-border px-3 py-1.5 rounded-full shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 animate-fade-in-up" style={{ animationDelay: '0.7s' }}>
                    <CreditCard size={14} className="text-red-500" /> RedotPay
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex-1 w-full mt-3 lg:mt-0">
              <div className="flex flex-wrap justify-center lg:justify-end gap-2 sm:gap-3 max-w-lg mx-auto lg:mr-0">
                {stats.map((s, i) => (
                  <div key={s.label} className="relative w-[46%] sm:w-[47%] overflow-hidden rounded-2xl bg-red-950/5 border border-red-900/10 backdrop-blur-md shadow-sm p-3 sm:p-4 flex flex-col items-center justify-center text-center transition-all duration-300 hover:shadow-md hover:-translate-y-1 group">
                    <div className="absolute inset-0 bg-gradient-to-br from-academy-textMain/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <p className="relative z-10 font-display font-black text-xl sm:text-2xl text-academy-textMain tracking-tight drop-shadow-sm mb-0.5">{s.val}</p>
                    <p className="relative z-10 text-academy-textMain/70 text-[9px] sm:text-[10px] font-extrabold uppercase tracking-widest leading-tight">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* FORMATIONS */}
        <section className="pt-2 lg:pt-4 pb-8 lg:pb-12 border-t border-academy-border relative overflow-hidden">
          <div className="absolute top-[10%] left-[-10%] w-[45vw] h-[45vw] rounded-full bg-academy-primary/15 pointer-events-none select-none z-0" style={{ filter: 'blur(120px)', WebkitFilter: 'blur(120px)' }} />
          <div className="absolute bottom-[10%] right-[-10%] w-[40vw] h-[40vw] rounded-full bg-blue-300/20 pointer-events-none select-none z-0" style={{ filter: 'blur(100px)', WebkitFilter: 'blur(100px)' }} />
          <div className="section-container relative z-10">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
              <div>
                <h2 className="font-display font-black text-3xl sm:text-4xl text-academy-textMain tracking-tight">
                  {t('landing.our_courses')}
                </h2>
                <p className="text-academy-textMain/60 text-sm sm:text-base mt-1 font-medium">{t('landing.choose_path')}</p>
              </div>
              <Link to="/courses" className="group flex items-center gap-1.5 text-sm font-bold text-academy-textMain hover:text-academy-primary transition-colors bg-white hover:bg-red-50 px-5 py-2.5 rounded-full border border-academy-border shadow-sm w-fit">
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
          </div>
        </section>

        {/* FEATURES */}
        <section id="mission" className="pt-4 lg:pt-6 pb-12 lg:pb-16 bg-academy-surfaceDark/40 relative border-t border-academy-border overflow-hidden">
          <div className="absolute top-[20%] left-[-15%] w-[45vw] h-[45vw] rounded-full bg-purple-300/20 pointer-events-none select-none z-0" style={{ filter: 'blur(120px)', WebkitFilter: 'blur(120px)' }} />
          <div className="absolute bottom-[20%] right-[-15%] w-[45vw] h-[45vw] rounded-full bg-red-300/20 pointer-events-none select-none z-0" style={{ filter: 'blur(120px)', WebkitFilter: 'blur(120px)' }} />
          <div className="section-container relative z-10">
            <div className="text-center mb-8 lg:mb-10">
              <h2 className="font-display font-bold text-3xl text-academy-textMain mb-3">
                {t('landing.why_choose')} <span className="text-academy-primary">{t('landing.academy')}</span>
              </h2>
              <p className="text-academy-textMain/60 font-medium max-w-lg mx-auto text-sm">
                {t('landing.why_desc')}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {features.map((f, i) => {
                const style = FEATURE_STYLES[i] || FEATURE_STYLES[0]
                const Icon = style.icon
                return (
                  <div key={f.title} className="card-academy p-6 hover:-translate-y-1">
                    <div className={`w-12 h-12 rounded-2xl ${style.bg} border ${style.border} flex items-center justify-center mb-4`}>
                      <Icon className={`w-6 h-6 ${style.color}`} />
                    </div>
                    <h3 className="font-display font-bold text-lg text-academy-textMain mb-2">{f.title}</h3>
                    <p className="text-academy-textMain/70 leading-relaxed text-sm font-medium">{f.desc}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* TESTIMONIALS */}
        <section id="testimonials" className="py-12 lg:py-20 bg-academy-surfaceDark/40 border-t border-academy-border overflow-hidden relative">
          <div className="absolute top-[10%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-indigo-400/20 pointer-events-none select-none z-0" style={{ filter: 'blur(130px)', WebkitFilter: 'blur(130px)' }} />
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

            <div className="animate-marquee-track flex gap-6 px-4">
              {[...randomTestimonials, ...randomTestimonials].map((testimonial, idx) => (
                <div key={idx} className="card-academy p-6 w-[320px] sm:w-[380px] flex-shrink-0 group">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-bold text-academy-primary tracking-wide uppercase">
                      {t('landing.student_review')}
                    </span>
                    <span className="text-[10px] font-bold text-green-600 bg-green-100 px-2 py-0.5 rounded-full border border-green-200">
                      {t('landing.verified')}
                    </span>
                  </div>

                  <p className="text-academy-textMain/80 text-sm font-medium leading-relaxed mb-6 italic min-h-[60px]">
                    &quot;{testimonial.text}&quot;
                  </p>

                  <div className="pt-4 border-t border-academy-border flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-academy-primary/10 border border-academy-primary/20 flex items-center justify-center text-academy-primary font-bold text-sm">
                        {testimonial.avatar}
                      </div>
                      <div>
                        <p className="text-academy-textMain font-bold text-sm">{testimonial.name}</p>
                        <p className="text-academy-textMain/50 font-medium text-xs">{testimonial.role}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ SECTION */}
        <section className="py-12 lg:py-20 border-t border-academy-border relative overflow-hidden">
          <div className="absolute top-[20%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-academy-primary/25 pointer-events-none select-none z-0" style={{ filter: 'blur(130px)', WebkitFilter: 'blur(130px)' }} />
          <div className="section-container max-w-4xl mx-auto relative z-10">
            <div className="text-center mb-14">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-academy-primary/10 border border-academy-primary/20 mb-4">
                <HelpCircle size={15} className="text-academy-primary" />
                <span className="text-academy-primary text-sm font-bold tracking-wide uppercase">FAQ</span>
              </div>
              <h2 className="font-display font-black text-3xl sm:text-4xl text-academy-textMain mb-3">
                {t('landing.faq')} <span className="text-academy-primary">— {t('landing.faq_answers')}</span>
              </h2>
            </div>

            <div className="space-y-4">
              {faqItems.map((item, index) => {
                const isOpen = openFaq === index
                return (
                  <div key={index} className={`card-academy overflow-hidden transition-all duration-300 ${isOpen ? 'border-academy-primary shadow-soft-lg' : ''}`}>
                    <button
                      onClick={() => setOpenFaq(isOpen ? null : index)}
                      className="w-full px-6 py-5 text-left flex items-center justify-between gap-4 focus:outline-none bg-red-950/5 border-red-900/10 backdrop-blur-md"
                    >
                      <span className="font-display font-bold text-base sm:text-lg text-academy-textMain pr-2">
                        {item.question}
                      </span>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-transform duration-300 flex-shrink-0 ${
                        isOpen ? 'bg-academy-primary text-academy-textMain rotate-180' : 'bg-academy-surfaceDark text-academy-textMain/60'
                      }`}>
                        <ChevronDown size={18} />
                      </div>
                    </button>

                    {isOpen && (
                      <div className="px-6 pb-6 pt-1 text-academy-textMain/70 font-medium text-sm leading-relaxed border-t border-academy-border bg-red-950/5 border-red-900/10 backdrop-blur-md animate-fade-in">
                        {item.answer}
                      </div>
                    )}
                  </div>
                )
              })}
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
                    <div className="p-2 rounded-lg bg-white/5 border border-academy-border/50 group-hover:bg-pink-500/10 group-hover:border-pink-500/30 transition-colors">
                      <Instagram size={16} />
                    </div>
                    @mylta_academy
                  </a>
                </li>
                <li>
                  <a href="https://www.facebook.com/profile.php?id=61584816975460" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-sm text-academy-textMain/60 hover:text-blue-500 transition-colors font-medium group">
                    <div className="p-2 rounded-lg bg-white/5 border border-academy-border/50 group-hover:bg-blue-500/10 group-hover:border-blue-500/30 transition-colors">
                      <Facebook size={16} />
                    </div>
                    Mylta Academy
                  </a>
                </li>
                <li>
                  <a href="https://tiktok.com/@mylta_academy" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-sm text-academy-textMain/60 hover:text-white transition-colors font-medium group">
                    <div className="p-2 rounded-lg bg-white/5 border border-academy-border/50 group-hover:bg-white/10 group-hover:border-white/30 transition-colors">
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
                <li><a href="mailto:contact@myltaacademy.dz" className="text-sm text-academy-textMain/60 hover:text-academy-primary transition-colors font-medium">contact@myltaacademy.dz</a></li>
              </ul>
            </div>
          </div>
          
          <div className="section-container flex flex-col md:flex-row items-center justify-between gap-4 pt-8 border-t border-academy-border/60 text-xs font-medium text-academy-textMain/40">
            <p>© {new Date().getFullYear()} Mylta Academy. {t('common.all_rights')}</p>
            <div className="flex gap-6">
              <a href="#" className="hover:text-academy-textMain transition-colors">{t('landing.terms')}</a>
              <a href="#" className="hover:text-academy-textMain transition-colors">{t('landing.privacy')}</a>
            </div>
          </div>
        </footer>
      </div>

      {loginOpen  && <LoginModal   onClose={() => setLoginOpen(false)} onSuccess={() => setLoginOpen(false)} />}
      {payModal   && <PaymentModal course={payModal} onClose={() => setPayModal(null)} />}
      {introOpen  && <IntroVideoModal onClose={handleCloseIntro} />}
    </>
  )
}
