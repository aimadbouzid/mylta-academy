// MissionPage.jsx — Page Notre Mission (Confiance, Savoir & Motivation)
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  ShieldCheck, HeartHandshake, Award, Target, Sparkles,
  ArrowRight, CheckCircle2, BookOpen, Users, Lightbulb, TrendingUp, Compass
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

        {/* HERO SECTION DE LA MISSION */}
        <section className="relative pt-40 sm:pt-44 lg:pt-48 pb-10 lg:pb-16 overflow-hidden">
          <div className="absolute inset-0 grid-pattern opacity-40 pointer-events-none" />
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: 'radial-gradient(circle at 50% 30%, rgba(0, 180, 162, 0.15) 0%, transparent 75%)' }}
          />

          <div className="section-container relative z-10 max-w-4xl mx-auto text-center space-y-6">

            <h1 className="font-display font-black text-4xl sm:text-6xl lg:text-7xl text-academy-textMain leading-[1.1]">
              {t('mission.hero_title_1')} <br className="hidden sm:inline" />
              <span className="text-academy-primary-gradient">{t('mission.hero_title_2')}</span>
            </h1>

            <p className="text-academy-textMain/70 text-lg sm:text-xl leading-relaxed max-w-3xl mx-auto font-light">
              {missionData.subtitle}
            </p>

            <div className="pt-4 flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/courses" className="btn-primary px-8 py-4 text-base font-bold justify-center">
                {t('mission.join_adventure')}
                <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </section>

        {/* 3 PILIERS : CONFIANCE, SAVOIR & MOTIVATION */}
        <section id="confiance" className="py-10 lg:py-16 bg-academy-surfaceDark/30 border-t border-academy-border/50 relative">
          <div className="section-container">
            <div className="text-center max-w-2xl mx-auto mb-10 lg:mb-16">
              <h2 className="font-display font-black text-3xl sm:text-4xl text-academy-textMain mb-4">
                {t('mission.pillars_title')} <span className="text-academy-primary-gradient">{t('mission.pillars_highlight')}</span>
              </h2>
              <p className="text-academy-textMain/50 text-sm sm:text-base">
                {t('mission.pillars_desc')}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Carte 1 : Confiance */}
              <div className="card-academy p-8 space-y-5 border-red-500/30 hover:border-red-500/60 transition-all duration-300 relative group">
                <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 group-hover:scale-110 transition-transform">
                  <ShieldCheck size={28} />
                </div>
                <h3 className="font-display font-bold text-2xl text-academy-textMain">{t('mission.trust_title')}</h3>
                <p className="text-academy-textMain/60 text-sm leading-relaxed">
                  {t('mission.trust_desc')}
                </p>
                <ul className="space-y-2 pt-2 text-xs text-academy-textMain/70">
                  <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-red-400 flex-shrink-0" /> {t('mission.trust_point1')}</li>
                  <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-red-400 flex-shrink-0" /> {t('mission.trust_point2')}</li>
                </ul>
              </div>

              {/* Carte 2 : Savoir */}
              <div className="card-academy p-8 space-y-5 border-academy-primary/30 hover:border-academy-primary/60 transition-all duration-300 relative group">
                <div className="w-14 h-14 rounded-2xl bg-academy-primary/10 border border-academy-primary/30 flex items-center justify-center text-academy-primary group-hover:scale-110 transition-transform">
                  <Lightbulb size={28} />
                </div>
                <h3 className="font-display font-bold text-2xl text-academy-textMain">{t('mission.knowledge_title')}</h3>
                <p className="text-academy-textMain/60 text-sm leading-relaxed">
                  {t('mission.knowledge_desc')}
                </p>
                <ul className="space-y-2 pt-2 text-xs text-academy-textMain/70">
                  <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-academy-primary flex-shrink-0" /> {t('mission.knowledge_point1')}</li>
                  <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-academy-primary flex-shrink-0" /> {t('mission.knowledge_point2')}</li>
                </ul>
              </div>

              {/* Carte 3 : Motivation */}
              <div className="card-academy p-8 space-y-5 border-purple-500/30 hover:border-purple-500/60 transition-all duration-300 relative group">
                <div className="w-14 h-14 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
                  <TrendingUp size={28} />
                </div>
                <h3 className="font-display font-bold text-2xl text-academy-textMain">{t('mission.motivation_title')}</h3>
                <p className="text-academy-textMain/60 text-sm leading-relaxed">
                  {t('mission.motivation_desc')}
                </p>
                <ul className="space-y-2 pt-2 text-xs text-academy-textMain/70">
                  <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-purple-400 flex-shrink-0" /> {t('mission.motivation_point1')}</li>
                  <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-purple-400 flex-shrink-0" /> {t('mission.motivation_point2')}</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION BANNIÈRE INSPIRATION / CITATION */}
        <section className="py-20 bg-transparent border-t border-academy-border/50 relative overflow-hidden">
          <div className="section-container max-w-4xl mx-auto text-center">
            <div className="bg-gradient-to-br from-white to-academy-surfaceDark border border-academy-border p-10 sm:p-14 rounded-3xl shadow-soft-lg relative">
              <Sparkles className="w-10 h-10 text-academy-primary opacity-30 absolute top-6 left-6" />
              <blockquote className="font-display font-bold text-2xl sm:text-3xl text-academy-textMain leading-snug mb-6">
                {t('mission.quote')}
              </blockquote>
              <div className="flex items-center justify-center gap-3">
                <div className="w-10 h-10 rounded-full bg-red-500/20 border border-red-500/40 flex items-center justify-center font-bold text-red-400 text-sm">
                  MA
                </div>
                <div className="text-left">
                  <p className="font-bold text-academy-textMain text-sm">{t('mission.quote_author')}</p>
                  <p className="text-academy-textMain/40 text-xs">{t('mission.quote_role')} {new Date().getFullYear()}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CALL TO ACTION */}
        <section className="py-16 bg-academy-surfaceDark/30 border-t border-academy-border/50 text-center">
          <div className="section-container max-w-2xl mx-auto space-y-6">
            <h2 className="font-display font-bold text-3xl text-academy-textMain">
              {t('mission.cta_title')}
            </h2>
            <p className="text-academy-textMain/60 text-sm sm:text-base">
              {t('mission.cta_desc')}
            </p>
            <div className="pt-2">
              <Link to="/courses" className="btn-primary px-8 py-3.5 text-sm font-bold inline-flex items-center gap-2">
                <BookOpen size={16} /> {t('mission.cta_button')}
              </Link>
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="border-t border-academy-border py-6 bg-academy-surfaceDark/50 text-center text-xs text-academy-textMain/40">
          <p>© {new Date().getFullYear()} Mylta Academy. {t('common.all_rights')}</p>
        </footer>
      </div>
    </>
  )
}
