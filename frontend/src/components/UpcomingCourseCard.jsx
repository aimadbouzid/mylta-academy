import { Lock } from 'lucide-react'


// Formation annoncée mais pas encore ouverte : fiche consultable, accès fermé
// tant qu'elle n'est pas en ligne.
export default function UpcomingCourseCard({ course, onDetails }) {
  return (
    <article
      className="relative flex flex-col card-academy overflow-hidden h-full cursor-pointer transition-transform hover:-translate-y-1"
      onClick={() => onDetails?.(course)}
      aria-label={`${course.title} — bientôt disponible`}
    >
      <div className="relative h-20 sm:h-28 overflow-hidden flex-shrink-0 bg-academy-surfaceDark">
        <img src={course.image || '/logo-128.png'} alt="" loading="lazy"
             className={course.image ? 'w-full h-full object-cover' : 'absolute inset-0 m-auto h-10 w-10 sm:h-14 sm:w-14 rounded-xl object-contain'} />
        <span className="absolute top-2 left-2 px-2 py-0.5 text-[9px] sm:text-[11px] font-black uppercase tracking-wider rounded-full bg-neutral-700 text-white">
          Bientôt
        </span>
        {course.category && (
          <span className="absolute top-2 right-2 px-2 py-0.5 text-[9px] sm:text-[11px] font-bold rounded-full bg-white text-neutral-700">
            {course.category}
          </span>
        )}
        <span className="absolute bottom-2 right-2 w-6 h-6 rounded-full bg-white border border-neutral-300 flex items-center justify-center text-neutral-900">
          <Lock className="w-3 h-3" />
        </span>
      </div>

      <div className="flex flex-col flex-1 p-3 sm:p-4">
        <h3 className="font-display font-bold text-xs xs:text-sm sm:text-base leading-snug mb-1 sm:mb-2 line-clamp-2 text-academy-textMain">
          {course.title}
        </h3>
        {course.description && (
          <p className="hidden sm:block text-academy-textMain/70 text-sm leading-relaxed line-clamp-2 mb-4 flex-1 font-medium">
            {course.description}
          </p>
        )}

        {/* Plus de prix : les formations s'ouvrent par le club, pas à l'achat. */}

        <button type="button" onClick={(e) => { e.stopPropagation(); onDetails?.(course) }}
                className={`mt-auto w-full py-1.5 sm:py-2 rounded-lg border border-neutral-500 dark:border-white/60 text-[10px] sm:text-xs font-semibold text-neutral-700 dark:text-white hover:bg-neutral-900/5 dark:hover:bg-white/10 transition-colors`}>
          Détails
        </button>
      </div>
    </article>
  )
}
