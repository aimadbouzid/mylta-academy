import React, { useState } from 'react'
import {
  ExternalLink, Users, BookOpen, Clock,
  TrendingUp, Code2, Briefcase, Palette, Zap, ShoppingBag, CheckCircle
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext'

// ── Styles par catégorie ──────────────────────────────────────
const CATEGORY = {
  'Marketing': { bg: 'bg-orange-100 dark:bg-orange-500/15', icon: TrendingUp, color: '#F97316' },
  'Tech':      { bg: 'bg-indigo-100 dark:bg-indigo-500/15', icon: Code2,      color: '#818CF8' },
  'Business':  { bg: 'bg-emerald-100 dark:bg-emerald-500/15', icon: Briefcase,  color: '#34D399' },
  'Design':    { bg: 'bg-fuchsia-100 dark:bg-fuchsia-500/15', icon: Palette,    color: '#E879F9' },
  'Finance':   { bg: 'bg-green-100 dark:bg-green-500/15',   icon: Zap,        color: '#4ADE80' },
  'default':   { bg: 'bg-gray-100 dark:bg-white/10',    icon: BookOpen,   color: '#9CA3AF' },
}

export default React.memo(function CourseCard({ course }) {
  const [hovered, setHovered] = useState(false)
  // Une miniature peut échouer (fichier supprimé, chemin obsolète, réseau).
  // Sans ce garde-fou, le navigateur affiche l'icône « image cassée » par-dessus
  // la carte. On retombe alors sur le visuel de catégorie, comme si aucune
  // miniature n'existait.
  const [thumbFailed, setThumbFailed] = useState(false)
  const navigate = useNavigate()
  const { t } = useLanguage()
  const cat = CATEGORY[course.category] || CATEGORY.default
  const CategoryIcon = cat.icon
  const showThumb = course.thumbnail && !thumbFailed

  return (
    <article
      className={`relative flex flex-col card-academy overflow-hidden h-full
                  cursor-pointer transition-all duration-500 group
                  ${course.hasAccess 
                    ? (hovered ? '!border-green-500 shadow-soft-lg -translate-y-2 scale-[1.03]' : '!border-green-500/30')
                    : (hovered ? '!border-academy-primary/50 shadow-soft-lg -translate-y-2 scale-[1.03]' : '')
                  }`}
      onClick={() => navigate(`/courses/${course.id}`)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* ── Thumbnail ── */}
      <div className="relative h-24 xs:h-32 sm:h-48 overflow-hidden flex-shrink-0 bg-academy-surfaceDark">
        {showThumb ? (
          <img src={course.thumbnail} alt={course.title}
               loading="lazy" decoding="async"
               onError={() => setThumbFailed(true)}
               className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
        ) : (
          <div className={`w-full h-full ${cat.bg}`}>
            {/* Icône catégorie centrée */}
            <div className="absolute inset-0 flex items-center justify-center opacity-40">
              <CategoryIcon className="w-10 h-10 sm:w-20 sm:h-20" style={{ color: cat.color }} />
            </div>
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-2 left-2 sm:top-3 sm:left-3 flex flex-wrap items-center gap-1 sm:gap-1.5 pr-8 sm:pr-12">
          {course.hasAccess && (
            <span className="px-2 py-0.5 sm:px-2.5 sm:py-1 text-[9px] sm:text-xs font-bold rounded-full bg-green-500 text-white flex items-center gap-0.5 shadow-sm">
              <CheckCircle size={10} /> <span className="hidden xs:inline">{t('course_card.acquired')}</span>
            </span>
          )}
          <span className="px-2 py-0.5 sm:px-2.5 sm:py-1 text-[9px] sm:text-xs font-bold rounded-full bg-white/80 dark:bg-academy-surfaceDark/80 backdrop-blur-sm text-academy-textMain shadow-sm">
            {course.category}
          </span>
        </div>

        {/* Durée */}
        {course.duration && (
          <span className="absolute bottom-2 right-2 sm:bottom-3 sm:right-3 flex items-center gap-1 px-2 py-0.5 sm:px-2.5 sm:py-1
                            bg-white/90 dark:bg-academy-surfaceDark/90 text-academy-textMain font-bold text-[9px] sm:text-xs rounded-full shadow-sm">
            <Clock size={10} className="text-academy-primary" />
            <span className="hidden xs:inline">{course.duration}</span>
            <span className="xs:hidden">{course.duration.split(' ')[0]}</span>
          </span>
        )}
      </div>

      {/* ── Contenu ── */}
      <div className="flex flex-col flex-1 p-3 sm:p-5">
        {/* Titre */}
        <h3 className={`font-display font-bold text-xs xs:text-sm sm:text-lg leading-snug mb-1 sm:mb-2 line-clamp-2
                        transition-colors duration-300 ${hovered ? 'text-academy-primary' : 'text-academy-textMain'}`}>
          {course.title}
        </h3>

        {/* Description */}
        <p className="hidden sm:block text-academy-textMain/70 text-sm leading-relaxed line-clamp-2 mb-4 flex-1 font-medium">
          {course.description}
        </p>

        {/* Stats */}
        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-0.5 mb-2 sm:mb-4 text-[10px] sm:text-xs font-bold text-academy-textMain/50">
          <span className="flex items-center gap-1">
            <Users size={11} className="text-academy-primary" />
            {(course.studentsCount || 0).toLocaleString('fr-DZ')}<span className="hidden sm:inline"> {t('course_card.students')}</span>
          </span>
          <span className="flex items-center gap-1">
            <BookOpen size={11} className="text-academy-primary" />
            {course.lessonsCount || 0}<span className="hidden sm:inline"> {t('course_card.lessons')}</span><span className="sm:hidden">{t('course_card.lessons_short')}</span>
          </span>
        </div>

        {/* Instructor badge */}
        {course.instructor && course.instructorId && (
          <div className="mb-2 sm:mb-3">
            <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-[9px] sm:text-[10px] font-bold border border-indigo-100 dark:border-indigo-500/20">
              <span className="w-4 h-4 rounded-full bg-indigo-500 text-white flex items-center justify-center text-[8px] font-black">
                {(course.instructor.name || '?')[0].toUpperCase()}
              </span>
              Par {course.instructor.name || 'Formateur'}
            </span>
          </div>
        )}

        {/* Divider */}
        <div className="hidden sm:block border-t border-academy-border mb-4" />

        {/* Prix + CTA */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mt-auto">
          {course.discountPrice && course.discountPrice < course.price ? (
            <div className="flex flex-col">
              <div className="flex items-center gap-1 mb-0.5">
                <span className="text-academy-textMain/40 text-[8px] sm:text-xs line-through font-bold">
                  {course.price.toLocaleString('fr-DZ')} DA
                </span>
                <span className="px-1 py-[0.5px] rounded-full bg-red-100 dark:bg-white/10 text-red-600 dark:text-white text-[8px] sm:text-[9px] font-black scale-90 origin-left">
                  -{Math.round(((course.price - course.discountPrice) / course.price) * 100)}%
                </span>
              </div>
              <div className="flex items-baseline gap-0.5">
                <span className="font-display font-black text-xs xs:text-sm sm:text-xl text-academy-textMain tracking-tight">
                  {course.discountPrice.toLocaleString('fr-DZ')}
                </span>
                <span className="text-[9px] sm:text-xs font-black text-academy-primary">DA</span>
              </div>
            </div>
          ) : (
            <div className="flex items-baseline gap-0.5">
              <span className="font-display font-black text-xs xs:text-sm sm:text-xl text-academy-textMain tracking-tight">
                {(course.price || 0).toLocaleString('fr-DZ')}
              </span>
              <span className="text-[9px] sm:text-xs font-black text-academy-primary">DA</span>
            </div>
          )}

          <button
            className={`flex items-center justify-center gap-1 px-2.5 py-1.5 sm:px-4 sm:py-2.5 rounded-lg sm:rounded-full text-[9px] sm:text-xs font-bold
                        transition-all duration-300 active:scale-95 w-full sm:w-auto shadow-sm
                        ${course.hasAccess
                          ? (hovered ? 'bg-green-600 text-white' : 'bg-green-500 text-white')
                          // Couleur de marque pleine — même structure que la
                          // variante verte ci-dessus : la couleur fonce au survol.
                          // Rouge/texte blanc en clair, blanc/texte noir en sombre :
                          // les deux tokens basculent ensemble, pas de règle `dark:`.
                          : (hovered ? 'bg-academy-dark text-academy-onPrimary' : 'bg-academy-primary text-academy-onPrimary')
                        }`}
          >
            {course.hasAccess ? (
              <>
                <BookOpen size={11} className="shrink-0" />
                <span>{t('course_card.access')}</span>
              </>
            ) : (
              <>
                <ExternalLink size={11} className="shrink-0" />
                <span className="xs:hidden">{t('course_card.details')}</span>
                <span className="hidden xs:inline sm:hidden">{t('course_card.view')}</span>
                <span className="hidden sm:inline">{t('course_card.view_program')}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </article>
  )
})
