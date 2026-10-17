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

// Preuve sociale et engagements : textes propres à cette page, dans les trois langues du site.
const TRAINED = 170
const COPY = {
  fr: {
    proofLabel: 'personnes déjà formées',
    proofText: "Étudiants, entrepreneurs, salariés, parents… Ils ont commencé avec un simple smartphone et beaucoup de doutes. Aujourd'hui, ils filment, montent, créent et utilisent l'IA dans leur travail.",
    facts: [['Formés', `+${TRAINED}`], ['Méthode', '100 % pratique'], ['Matériel', 'Un smartphone']],
    promisesTitle: 'Ce que nous vous promettons',
    promises: [
      "Vous n'avez pas besoin d'être doué : vous avez besoin d'être guidé.",
      'Chaque séance se termine par un résultat concret, jamais par de la théorie seule.',
      'Votre téléphone est déjà un outil de travail : on vous apprend à vous en servir.',
      "Vous ne serez jamais seul : on répond à vos questions, même après la formation.",
    ],
    nowTitle: 'Le meilleur moment pour commencer, c’est maintenant.',
    nowText: `${TRAINED} personnes ont déjà fait le premier pas. La prochaine, c'est vous.`,
  },
  en: {
    proofLabel: 'people already trained',
    proofText: 'Students, entrepreneurs, employees, parents… They started with nothing but a smartphone and plenty of doubts. Today they film, edit, create and use AI in their work.',
    facts: [['Trained', `${TRAINED}+`], ['Method', '100% hands-on'], ['Gear', 'A smartphone']],
    promisesTitle: 'What we promise you',
    promises: [
      "You don't need to be gifted: you need to be guided.",
      'Every session ends with a concrete result, never with theory alone.',
      'Your phone is already a work tool: we teach you how to use it.',
      "You're never alone: we answer your questions, even after the training.",
    ],
    nowTitle: 'The best time to start is now.',
    nowText: `${TRAINED} people have already taken the first step. You're next.`,
  },
  ar: {
    proofLabel: 'شخصًا تكوّنوا معنا',
    proofText: 'طلبة، رواد أعمال، موظفون، أولياء… بدؤوا بهاتف ذكي فقط والكثير من التردد. اليوم يصوّرون، يمونتجون، يبدعون ويستعملون الذكاء الاصطناعي في عملهم.',
    facts: [['المتكوّنون', `+${TRAINED}`], ['الطريقة', 'تطبيقية 100٪'], ['المعدات', 'هاتف ذكي']],
    promisesTitle: 'وعدنا لكم',
    promises: [
      'لا تحتاج أن تكون موهوبًا، تحتاج فقط من يوجّهك.',
      'كل حصة تنتهي بنتيجة ملموسة، وليس بالنظري فقط.',
      'هاتفك أداة عمل حقيقية، ونحن نعلّمك كيف تستعمله.',
      'لن تكون وحدك أبدًا: نجيب عن أسئلتك حتى بعد التكوين.',
    ],
    nowTitle: 'أفضل وقت للبداية هو الآن.',
    nowText: `${TRAINED} شخصًا خطوا الخطوة الأولى. الدور عليك.`,
  },
}

export default function MissionPage() {
  const { t, currentLang } = useLanguage()
  const c = COPY[currentLang] || COPY.fr
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

        {/* PREUVE : déjà +170 personnes formées */}
        <section className="px-4 relative z-10">
          <div className="max-w-md mx-auto">
            <div className="flex items-end gap-3">
              <span className="font-display font-black text-7xl leading-none tracking-tight text-academy-textMain">+{TRAINED}</span>
              <span className="pb-2 text-sm font-bold uppercase tracking-[0.15em] text-academy-primary leading-tight">{c.proofLabel}</span>
            </div>
            <span className="block mt-2 h-1.5 w-24 bg-academy-primary" />
            <p className="mt-4 text-[15px] leading-relaxed text-academy-textMain/75">{c.proofText}</p>
            <dl className="mt-5 grid grid-cols-3 gap-px rounded-xl overflow-hidden border border-academy-border bg-academy-border">
              {c.facts.map(([k, v]) => (
                <div key={k} className="bg-white dark:bg-academy-surfaceDark px-3 py-2.5">
                  <dt className="text-[9px] font-bold uppercase tracking-[0.18em] text-academy-textMain/45">{k}</dt>
                  <dd className="font-bold text-[14px] leading-tight">{v}</dd>
                </div>
              ))}
            </dl>
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

        {/* NOS PROMESSES */}
        <section className="py-6 px-4">
          <div className="max-w-md mx-auto">
            <h2 className="font-display font-black text-2xl tracking-tight border-b-2 border-academy-textMain pb-2">{c.promisesTitle}</h2>
            <ol>
              {c.promises.map((p, i) => (
                <li key={i} className="flex gap-4 py-3.5 border-b border-academy-border">
                  <span className="font-mono text-sm font-bold text-academy-primary pt-px">{String(i + 1).padStart(2, '0')}</span>
                  <span className="text-[15px] font-semibold leading-snug">{p}</span>
                </li>
              ))}
            </ol>
            <blockquote className="mt-8 border-s-4 border-academy-primary ps-4">
              <p className="text-lg font-display font-bold leading-snug text-academy-textMain">{t('mission.quote')}</p>
              <footer className="mt-2 text-xs font-bold uppercase tracking-[0.15em] text-academy-textMain/50">{t('mission.quote_author')}</footer>
            </blockquote>
          </div>
        </section>

        {/* CALL TO ACTION ULTRA SIMPLE */}
        <section className="py-12 px-4 text-center">
          <div className="max-w-md mx-auto p-6 rounded-3xl bg-gradient-to-br from-academy-primary/10 to-transparent border border-academy-primary/20">
            <h2 className="font-display font-bold text-xl text-academy-textMain mb-2">
              {c.nowTitle}
            </h2>
            <p className="text-academy-textMain/60 text-sm mb-6">
              {c.nowText}
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
