import { Check } from 'lucide-react'

// Suivi des étapes d'une réservation : ronds reliés, coche sur les étapes faites.
// Les étapes déjà passées restent cliquables pour revenir en arrière.
export default function StepIndicator({ steps, current, onGo }) {
  return (
    <ol className="flex items-start mb-6" aria-label={`Étape ${current + 1} sur ${steps.length}`}>
      {steps.map((label, i) => {
        const done = i < current
        const active = i === current
        return (
          <li key={label} className="flex-1 flex flex-col items-center relative">
            {i > 0 && (
              <span className="absolute top-[15px] right-1/2 w-full h-[2px] bg-academy-border" aria-hidden="true">
                <span className={`block h-full bg-academy-textMain transition-[width] duration-500 ${i <= current ? 'w-full' : 'w-0'}`} />
              </span>
            )}
            <button
              type="button"
              disabled={!done}
              onClick={() => onGo(i)}
              aria-current={active ? 'step' : undefined}
              className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center text-[13px] font-black transition-colors
                ${done ? 'bg-academy-textMain text-academy-surface hover:opacity-80'
                  : active ? 'bg-academy-primary text-academy-onPrimary ring-4 ring-academy-primary/15'
                  : 'bg-white border-2 border-academy-border text-academy-textMain/40'}`}
            >
              {done ? <Check size={15} strokeWidth={3} /> : i + 1}
            </button>
            <span className={`mt-1.5 text-[11px] sm:text-xs font-bold text-center leading-tight ${active ? 'text-academy-textMain' : done ? 'text-academy-textMain/70' : 'text-academy-textMain/40'}`}>
              {label}
            </span>
          </li>
        )
      })}
    </ol>
  )
}
