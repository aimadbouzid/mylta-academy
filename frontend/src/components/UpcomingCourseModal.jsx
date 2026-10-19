import { useEffect } from 'react'
import { X, Check, MessageCircle } from 'lucide-react'
import { useSiteSettings } from '../context/SiteSettingsContext'

// Fiche d'une formation à venir : contenu détaillé + être prévenu sur WhatsApp.
export default function UpcomingCourseModal({ course, onClose }) {
  const { settings } = useSiteSettings()
  const whatsappNumber = settings?.coaching?.whatsappNumber

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = overflow }
  }, [onClose])

  if (!course) return null
  const notifyUrl = whatsappNumber
    ? `https://wa.me/${whatsappNumber.replace(/\D/g, '')}?text=${encodeURIComponent(`Bonjour Mylta Academy, je souhaite être prévenu(e) dès que la formation « ${course.title} » sera disponible.`)}`
    : null
  const chips = [course.category, course.level, course.duration].filter(Boolean)

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label={course.title}>
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full max-w-sm max-h-[80vh] overflow-y-auto bg-white rounded-2xl shadow-xl">
        <div className="relative h-16 bg-academy-surfaceDark flex items-center justify-center">
          <span className="absolute top-2.5 left-2.5 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider rounded-full bg-neutral-900 text-white">Bientôt</span>
          <button type="button" onClick={onClose} aria-label="Fermer"
                  className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white text-academy-textMain flex items-center justify-center shadow-sm">
            <X size={15} />
          </button>
          <img src={course.image || '/logo-128.png'} alt="" className="h-10 w-10 rounded-lg object-contain" />
        </div>

        <div className="p-4 space-y-3.5 text-[13px]">
          <div>
            {chips.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-1.5">
                {chips.map(c => <span key={c} className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-academy-surface text-academy-textMain/70">{c}</span>)}
              </div>
            )}
            <h2 className="font-display font-black text-base leading-tight">{course.title}</h2>
            {course.description && <p className="mt-1.5 text-academy-textMain/70 leading-relaxed">{course.description}</p>}
          </div>

          {/* Plus de prix de lancement : l'accès viendra du club. */}

          {(course.program || []).length > 0 && (
            <div>
              <h3 className="font-bold text-sm mb-1.5">Au programme</h3>
              <ol className="space-y-1.5">
                {course.program.map((p, i) => (
                  <li key={i} className="flex items-baseline gap-2 border-b border-academy-border pb-1.5">
                    <span className="text-[10px] font-black text-academy-textMain/50 tabular-nums">{String(i + 1).padStart(2, '0')}</span>
                    <span className="text-xs font-semibold leading-snug">{p}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {(course.included || []).length > 0 && (
            <div>
              <h3 className="font-bold text-sm mb-1.5">Inclus</h3>
              <ul className="space-y-1">
                {course.included.map((x, i) => (
                  <li key={i} className="flex gap-1.5 text-xs"><Check size={14} className="text-emerald-600 shrink-0 mt-0.5" /> {x}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="space-y-2 pt-0.5">
            <button type="button" disabled className="w-full py-2.5 rounded-lg bg-academy-surface text-academy-textMain/50 text-xs font-bold cursor-not-allowed">
              Bientôt disponible
            </button>
            {notifyUrl && (
              <a href={notifyUrl} target="_blank" rel="noopener noreferrer"
                 className="w-full inline-flex items-center justify-center gap-1.5 bg-[#25D366] hover:bg-[#1ebe5a] text-white text-xs font-bold py-2.5 rounded-lg transition-colors">
                <MessageCircle size={15} /> Me prévenir sur WhatsApp
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
