import { useEffect, useState } from 'react'
import { useLanguage } from '../context/LanguageContext'

// Programme détaillé de la formation, jour par jour, avec choix de la langue.
// Le programme vient des réglages (admin) et existe en français, anglais et arabe ;
// le sélecteur ne change que ce bloc, pas la langue de tout le site.

const LANGS = [
  { id: 'fr', label: 'Français' },
  { id: 'en', label: 'English' },
  { id: 'ar', label: 'العربية' },
]

const UI = {
  fr: { title: 'Le programme', subtitle: '3 jours, tout sur smartphone', goal: 'Objectif', modules: 'points' },
  en: { title: 'The programme', subtitle: '3 days, all on your smartphone', goal: 'Goal', modules: 'topics' },
  ar: { title: 'البرنامج', subtitle: '3 أيام، كل شيء على الهاتف', goal: 'الهدف', modules: 'نقطة' },
}

export default function Curriculum({ curriculum }) {
  const { currentLang } = useLanguage()
  const [lang, setLang] = useState(currentLang)
  const [openDay, setOpenDay] = useState(0)

  // La langue du site reste le point de départ : si le visiteur la change, le programme suit.
  useEffect(() => { setLang(currentLang) }, [currentLang])

  const days = curriculum?.[lang] || curriculum?.fr || []
  if (!days.length) return null
  const ui = UI[lang] || UI.fr
  const rtl = lang === 'ar'
  const total = days.reduce((n, d) => n + (d.items?.length || 0), 0)

  return (
    <section dir={rtl ? 'rtl' : 'ltr'} className={rtl ? 'text-right' : ''}>
      <div className="flex flex-wrap items-end justify-between gap-2 border-b-2 border-academy-textMain pb-2">
        <div>
          <h2 className="font-display font-black text-xl leading-tight">{ui.title}</h2>
          <p className="text-[12px] text-academy-textMain/55">{ui.subtitle} · {total} {ui.modules}</p>
        </div>
        <div className="flex gap-1" dir="ltr">
          {LANGS.map(l => (
            <button key={l.id} type="button" onClick={() => setLang(l.id)}
                    aria-pressed={lang === l.id}
                    className={`px-2.5 py-1 rounded-full text-[11px] font-bold border transition-colors ${
                      lang === l.id ? 'bg-academy-textMain text-academy-surface border-academy-textMain'
                                    : 'border-academy-border text-academy-textMain/60 hover:border-academy-textMain/40'}`}>
              {l.label}
            </button>
          ))}
        </div>
      </div>

      <div className="divide-y divide-academy-border">
        {days.map((d, i) => {
          const open = openDay === i
          return (
            <div key={i}>
              <button type="button" onClick={() => setOpenDay(open ? -1 : i)} aria-expanded={open}
                      className={`w-full py-3 flex items-start gap-3 ${rtl ? 'text-right' : 'text-left'}`}>
                <span className="shrink-0 w-11 pt-0.5">
                  <span className="block font-display font-black text-2xl leading-none text-academy-primary">{i + 1}</span>
                  <span className="block text-[9px] font-bold uppercase tracking-[0.12em] text-academy-textMain/45">{d.day}</span>
                </span>
                <span className="flex-1 min-w-0">
                  <span className="block font-bold text-[15px] leading-snug">{d.title}</span>
                  <span className="block text-[12px] text-academy-textMain/55 mt-0.5">
                    {open ? d.goal : `${d.items?.length || 0} ${ui.modules}`}
                  </span>
                </span>
                <span aria-hidden="true" className={`shrink-0 mt-1 text-academy-textMain/40 transition-transform ${open ? 'rotate-45' : ''}`}>+</span>
              </button>
              {open && (
                <ul className="pb-4 ps-14 space-y-1.5">
                  {(d.items || []).map((it, j) => (
                    <li key={j} className="flex gap-2.5 text-[13.5px] leading-snug">
                      <span className="shrink-0 font-mono text-[10px] text-academy-primary pt-1">{String(j + 1).padStart(2, '0')}</span>
                      <span className="font-medium">{it}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}
