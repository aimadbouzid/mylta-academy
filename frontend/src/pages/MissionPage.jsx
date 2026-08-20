// MissionPage.jsx — Page Notre Mission (Minimaliste, Direct au but, Format Mobile)
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  ShieldCheck, ArrowRight, CheckCircle2, BookOpen, Lightbulb, TrendingUp
} from 'lucide-react'
import Navbar from '../components/Navbar'
import SEOHead from '../components/SEOHead'
import api from '../api/axios'
import { useLanguage } from '../context/LanguageContext'

export default function MissionPage() {
  const { t } = useLanguage()
  const [missionData, setMissionData] = useState({
    title: t('mission.hero_title_1') + " " + t('mission.hero_title_2'),
    subtitle: t('mission.pillars_desc'),
  })

  useEffect(() => {
    api.get('/config/mission')
      .then(res => {
        if (res.data?.mission) setMissionData(res.data.mission)
      })
      .catch(() => {})
  }, [])

  return (
    <>
      <SEOHead
        title={t('mission.seo_title')}
        description={t('mission.seo_desc')}
        canonicalPath="/mission"
      />

      <div className="min-h-screen bg-transparent text-academy-textMain flex flex-col">
        <Navbar />

        {/* HERO SECTION DE LA MISSION - OPTIMISÉ MOBILE */}
        <section className="relative pt-32 sm:pt-40 pb-12 overflow-hidden text-center px-4">
          <div className="absolute inset-0 grid-pattern opacity-30 pointer-events-none" />
          <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(circle at 50% 30%, rgba(0, 180, 162, 0.15) 0%, transparent 75%)' }} />

          <div className="relative z-10 max-w-2xl mx-auto space-y-6">
            <h1 className="font-display font-black text-4xl sm:text-5xl lg:text-6xl text-academy-textMain leading-[1.1]">
              {t('mission.hero_title_1')} <br />
              <span className="text-academy-primary-gradient">{t('mission.hero_title_2')}</span>
            </h1>

            <p className="text-academy-textMain/70 text-base sm:text-lg max-w-lg mx-auto font-light">
              {missionData.subtitle}
            </p>

            <div className="pt-4 flex flex-col gap-3 justify-center max-w-xs mx-auto">
              <Link to="/courses" className="btn-primary w-full py-4 text-sm font-bold justify-center rounded-xl">
                {t('mission.join_adventure')}
                <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </section>

        {/* LES 3 PILIERS EN VERSION ULTRA COURTE POUR MOBILE */}
        <section className="py-8 px-4 relative z-10">
          <div className="max-w-md mx-auto space-y-4">
            
            {/* Confiance */}
            <div className="flex items-start gap-4 p-5 rounded-2xl bg-academy-surfaceDark/40 border border-red-500/20 backdrop-blur-sm">
              <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center text-red-500 flex-shrink-0">
                <ShieldCheck size={24} />
              </div>
              <div>
                <h3 className="font-bold text-lg text-academy-textMain mb-2">{t('mission.trust_title')}</h3>
                <ul className="space-y-1.5 text-sm text-academy-textMain/60">
                  <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-red-500 flex-shrink-0" /> {t('mission.trust_point1')}</li>
                  <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-red-500 flex-shrink-0" /> {t('mission.trust_point2')}</li>
                </ul>
              </div>
            </div>

            {/* Savoir */}
            <div className="flex items-start gap-4 p-5 rounded-2xl bg-academy-surfaceDark/40 border border-academy-primary/20 backdrop-blur-sm">
              <div className="w-12 h-12 rounded-xl bg-academy-primary/10 flex items-center justify-center text-academy-primary flex-shrink-0">
                <Lightbulb size={24} />
              </div>
              <div>
                <h3 className="font-bold text-lg text-academy-textMain mb-2">{t('mission.knowledge_title')}</h3>
                <ul className="space-y-1.5 text-sm text-academy-textMain/60">
                  <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-academy-primary flex-shrink-0" /> {t('mission.knowledge_point1')}</li>
                  <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-academy-primary flex-shrink-0" /> {t('mission.knowledge_point2')}</li>
                </ul>
              </div>
            </div>

            {/* Motivation */}
            <div className="flex items-start gap-4 p-5 rounded-2xl bg-academy-surfaceDark/40 border border-purple-500/20 backdrop-blur-sm">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500 flex-shrink-0">
                <TrendingUp size={24} />
              </div>
              <div>
                <h3 className="font-bold text-lg text-academy-textMain mb-2">{t('mission.motivation_title')}</h3>
                <ul className="space-y-1.5 text-sm text-academy-textMain/60">
                  <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-purple-500 flex-shrink-0" /> {t('mission.motivation_point1')}</li>
                  <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-purple-500 flex-shrink-0" /> {t('mission.motivation_point2')}</li>
                </ul>
              </div>
            </div>

          </div>
        </section>

        {/* CALL TO ACTION ULTRA SIMPLE */}
        <section className="py-12 px-4 text-center">
          <div className="max-w-md mx-auto p-6 rounded-3xl bg-gradient-to-br from-academy-primary/10 to-transparent border border-academy-primary/20">
            <h2 className="font-display font-bold text-xl text-academy-textMain mb-2">
              {t('mission.cta_title')}
            </h2>
            <p className="text-academy-textMain/60 text-sm mb-6">
              {t('mission.cta_desc')}
            </p>
            <Link to="/courses" className="btn-primary w-full py-4 text-sm font-bold inline-flex justify-center items-center gap-2 rounded-xl">
              <BookOpen size={18} /> {t('mission.cta_button')}
            </Link>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="py-6 text-center text-xs text-academy-textMain/40">
          <p>© {new Date().getFullYear()} Mylta Academy. {t('mission.footer')}</p>
        </footer>
      </div>
    </>
  )
}
