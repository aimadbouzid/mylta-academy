import { Lock } from 'lucide-react'

// Formation annoncée mais pas encore ouverte : visible, non cliquable.
export default function UpcomingCourseCard({ course }) {
  return (
    <article className="relative flex flex-col card-academy overflow-hidden h-full select-none" aria-label={`${course.title} — bientôt disponible`}>
      <div className="relative h-24 xs:h-32 sm:h-48 overflow-hidden flex-shrink-0 bg-gradient-to-br from-[#2a0a0a] via-[#5c0d0d] to-[#8b0000]">
        <span className="absolute top-2 left-2 sm:top-3 sm:left-3 px-2 py-0.5 sm:px-2.5 sm:py-1 text-[9px] sm:text-xs font-black uppercase tracking-wider rounded-full bg-white text-[#8b0000]">
          Bientôt
        </span>
        {course.category && (
          <span className="absolute top-2 right-2 sm:top-3 sm:right-3 px-2 py-0.5 sm:px-2.5 sm:py-1 text-[9px] sm:text-xs font-bold rounded-full bg-white/15 text-white">
            {course.category}
          </span>
        )}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="w-9 h-9 sm:w-12 sm:h-12 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white">
            <Lock className="w-4 h-4 sm:w-5 sm:h-5" />
          </span>
        </div>
      </div>

      <div className="flex flex-col flex-1 p-3 sm:p-5">
        <h3 className="font-display font-bold text-xs xs:text-sm sm:text-lg leading-snug mb-1 sm:mb-2 line-clamp-2 text-academy-textMain">
          {course.title}
        </h3>
        {course.description && (
          <p className="hidden sm:block text-academy-textMain/70 text-sm leading-relaxed line-clamp-2 mb-4 flex-1 font-medium">
            {course.description}
          </p>
        )}
        <button type="button" disabled
                className="mt-auto w-full py-2 sm:py-2.5 rounded-lg border border-academy-border text-[10px] sm:text-sm font-bold text-academy-textMain/50 cursor-not-allowed">
          Bientôt disponible
        </button>
      </div>
    </article>
  )
}
