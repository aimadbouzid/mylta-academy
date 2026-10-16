import { Lock } from 'lucide-react'

export const formatPrice = (n) => `${Number(n).toLocaleString('fr-FR')} DA`
export const discountOf = (c) => (Number(c.oldPrice) > Number(c.price) && Number(c.price) > 0
  ? Math.round((1 - c.price / c.oldPrice) * 100) : 0)

// Formation annoncée mais pas encore ouverte : prix affiché, fiche consultable,
// achat impossible tant qu'elle n'est pas en ligne.
export default function UpcomingCourseCard({ course, onDetails }) {
  const discount = discountOf(course)
  return (
    <article
      className="relative flex flex-col card-academy overflow-hidden h-full cursor-pointer transition-transform hover:-translate-y-1"
      onClick={() => onDetails?.(course)}
      aria-label={`${course.title} — bientôt disponible`}
    >
      <div className="relative h-20 sm:h-28 overflow-hidden flex-shrink-0 bg-academy-surfaceDark">
        <img src={course.image || '/logo-128.png'} alt="" loading="lazy"
             className={course.image ? 'w-full h-full object-cover' : 'absolute inset-0 m-auto h-10 w-10 sm:h-14 sm:w-14 rounded-xl object-contain'} />
        <span className="absolute top-2 left-2 px-2 py-0.5 text-[9px] sm:text-[11px] font-black uppercase tracking-wider rounded-full bg-neutral-900 text-white">
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

        {Number(course.price) > 0 && (
          <div className="mt-auto mb-2 sm:mb-3">
            {Number(course.oldPrice) > Number(course.price) && (
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] sm:text-xs text-academy-textMain/40 line-through font-semibold">{formatPrice(course.oldPrice)}</span>
                {discount > 0 && <span className="text-[9px] sm:text-[11px] font-black text-academy-textMain bg-academy-textMain/10 rounded px-1">-{discount}%</span>}
              </div>
            )}
            <span className="font-black text-sm sm:text-lg text-academy-textMain">{formatPrice(course.price)}</span>
          </div>
        )}

        <button type="button" onClick={(e) => { e.stopPropagation(); onDetails?.(course) }}
                className={`${Number(course.price) > 0 ? '' : 'mt-auto '}w-full py-2 sm:py-2.5 rounded-lg border-2 border-neutral-900 dark:border-white text-[10px] sm:text-sm font-bold text-neutral-900 dark:text-white hover:bg-neutral-900/5 dark:hover:bg-white/10 transition-colors`}>
          Détails
        </button>
      </div>
    </article>
  )
}
